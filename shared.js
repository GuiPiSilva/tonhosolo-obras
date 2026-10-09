(function(){
 const defaults=window.TONHOSOLO_DEFAULTS||{};
 const t=(s,max=500)=>String(s??'').slice(0,max);
 const strFields=['brand','handle','eyebrow','heroTitle','heroHighlight','description','bio','logo','accent','background','whatsapp','instagram','location','email','seoTitle','seoDescription'];
 function normalize(obj){
   const x={...structuredClone(defaults)};
   if(!obj||typeof obj!=='object')return x;
   strFields.forEach(k=>{if(typeof obj[k]==='string')x[k]=t(obj[k],k==='logo'?400000:2500)});
   if(!/^#[0-9a-f]{6}$/i.test(x.accent))x.accent=defaults.accent;
   if(!/^#[0-9a-f]{6}$/i.test(x.background))x.background=defaults.background;
   if(Array.isArray(obj.services))x.services=obj.services.slice(0,8).filter(v=>v&&typeof v==='object').map(v=>({title:t(v.title,70),description:t(v.description,150)}));
   if(Array.isArray(obj.links))x.links=obj.links.slice(0,32).filter(v=>v&&typeof v==='object').map((v,i)=>({id:t(v.id||'link-'+i,72),title:t(v.title,75),subtitle:t(v.subtitle,110),url:t(v.url,1500),icon:t(v.icon,40),featured:!!v.featured,visible:v.visible!==false}));
   return x;
 }
 function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function safeUrl(value){const raw=t(value,1500).trim();if(/^#[a-z][\w-]*$/i.test(raw))return raw;try{const parsed=new URL(raw);return ['https:','http:','mailto:','tel:'].includes(parsed.protocol)?parsed.href:'';}catch{return '';}}
 function whatsappLink(raw){const d=String(raw||'').replace(/\D/g,'');if(d.length<10||d.length>15)return '';return 'https://wa.me/'+(d.length<=11?'55'+d:d);}
 function resolveUrl(link,cfg){if(!link)return '';if(link.url?.trim())return safeUrl(link.url);if(link.icon==='whatsapp'&&cfg.whatsapp)return whatsappLink(cfg.whatsapp);if(link.icon==='instagram'&&cfg.instagram)return safeUrl(cfg.instagram.startsWith('@')?'https://instagram.com/'+cfg.instagram.slice(1):cfg.instagram);if(link.icon==='map-pin'&&cfg.location)return safeUrl(cfg.location);if(link.icon==='mail'&&cfg.email)return safeUrl('mailto:'+cfg.email);return '';}
 function cssLogo(s){return s.startsWith('data:image/')||s.startsWith('https://')||s.startsWith('http://')||/^\.\/assets\/[\w.-]+$/.test(s)?s:'./assets/logo-tonhosolo.png';}
 async function connectFirebase(){const c=window.TONHOSOLO_FIREBASE;if(!c?.apiKey||!c?.projectId||!c?.appId)return null;
   const root='https://www.gstatic.com/firebasejs/10.14.1/';
   const [app,store,auth]=await Promise.all([import(root+'firebase-app.js'),import(root+'firebase-firestore.js'),import(root+'firebase-auth.js')]);
   const instance=app.getApps().length?app.getApp():app.initializeApp(c);
   return {store,auth,db:store.getFirestore(instance),authorization:auth.getAuth(instance),id:window.TONHOSOLO_SITE_ID||'tonhosolo'};
 }
 window.TS={normalize,esc,safeUrl,whatsappLink,resolveUrl,cssLogo,connectFirebase};
})();
