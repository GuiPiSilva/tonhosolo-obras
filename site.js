(function(){
 const $=id=>document.getElementById(id),I=window.TSIcons,util=window.TS;
 let state=util.normalize(window.TONHOSOLO_DEFAULTS);const preview=new URLSearchParams(location.search).get('preview')==='1';
 let noticeTimeout;
 const toast=(s)=>{const el=$('toast');el.textContent=s;el.classList.add('show');clearTimeout(noticeTimeout);noticeTimeout=setTimeout(()=>el.classList.remove('show'),3500);};
 function render(data){
   state=util.normalize(data);
   document.documentElement.style.setProperty('--gold',state.accent);
   document.documentElement.style.setProperty('--bg',state.background);
   $('eyebrow').textContent=state.eyebrow;
   const whole=state.heroTitle||'Seu projeto merece uma obra à altura.';
   const highlighted=state.heroHighlight;
   const at=highlighted?whole.toLowerCase().lastIndexOf(highlighted.toLowerCase()):-1;
   $('hero-title').innerHTML=at>=0?`${util.esc(whole.slice(0,at))}<em>${util.esc(whole.slice(at,at+highlighted.length))}</em>${util.esc(whole.slice(at+highlighted.length))}`:util.esc(whole);
   $('hero-description').textContent=state.description;
   $('about-description').textContent=state.description;
   $('brand-logo').src=util.cssLogo(state.logo);$('brand-logo').alt='Logotipo '+state.brand;
   $('profile-brand').textContent=state.brand;$('profile-handle').textContent=state.handle;
   $('profile-bio').textContent=state.bio;
   document.title=state.seoTitle||state.brand;
   document.querySelector('meta[name="description"]').content=state.seoDescription||state.bio;
   document.querySelector('meta[property="og:title"]').content=document.title;
   document.querySelector('meta[property="og:description"]').content=state.seoDescription||state.bio;
   $('year').textContent=new Date().getFullYear();
   const visible=state.links.filter(l=>l.visible);
   $('link-count').textContent=String(visible.length).padStart(2,'0')+' LINKS';
   $('profile-links').innerHTML=visible.map(l=>{
     const url=util.resolveUrl(l,state),icon=I.svg(l.icon),right=I.svg('arrow-up-right','action-right');
     const classes='action-link'+(l.featured?' featured':'')+(url?'':' is-disabled');
     const inner=`<span class="action-icon">${icon}</span><span class="action-copy"><span class="action-title">${util.esc(l.title||'Acessar link')}</span><span class="action-sub">${util.esc(url?l.subtitle:(l.subtitle?'Em breve • '+l.subtitle:'Em breve'))}</span></span>${right}`;
     return url?`<a class="${classes}" href="${util.esc(url)}" ${url.startsWith('#')?'':'target="_blank" rel="noopener noreferrer"'}>${inner}</a>`:`<button class="${classes}" type="button" data-missing="true" aria-label="${util.esc(l.title)} ainda não disponível">${inner}</button>`;
   }).join('')||'<div class="contact-empty">Novos links serão adicionados em breve.</div>';
   const symbols=['hard-hat','hammer','paintbrush','building','shield-check','star'];
   $('services-grid').innerHTML=state.services.map((s,i)=>`<article class="service-card"><div class="service-top"><span class="service-num">SERVIÇO ${String(i+1).padStart(2,'0')}</span><span class="service-symbol">${I.svg(symbols[i%symbols.length])}</span></div><h3>${util.esc(s.title)}</h3><p>${util.esc(s.description)}</p></article>`).join('')||'<p>Serviços em atualização.</p>';
   const opts=[];let wa=util.whatsappLink(state.whatsapp),inst=state.instagram?(state.instagram.startsWith('@')?util.safeUrl('https://instagram.com/'+state.instagram.substring(1)):util.safeUrl(state.instagram)):'';
   if(wa)opts.push(['whatsapp',wa,'Conversar pelo WhatsApp']);
   if(inst)opts.push(['instagram',inst,'Acompanhar no Instagram']);
   if(util.safeUrl(state.email?'mailto:'+state.email:''))opts.push(['mail','mailto:'+state.email,'Enviar um e-mail']);
   if(util.safeUrl(state.location))opts.push(['map-pin',state.location,'Ver localização']);
   $('contact-options').innerHTML=opts.length?opts.map(([icon,url,label])=>`<a class="contact-option" href="${util.esc(util.safeUrl(url))}" target="_blank" rel="noopener noreferrer">${I.svg(icon)}${util.esc(label)}<span>↗</span></a>`).join(''):'<div class="contact-empty">Os canais de atendimento serão exibidos aqui assim que forem cadastrados pela Tonhosolo.</div>';
 }
 $('profile-links').addEventListener('click',e=>{if(e.target.closest('[data-missing]'))toast('Esse canal ainda não foi configurado.');});
 $('share-btn').innerHTML=I.svg('share');
 $('share-btn').addEventListener('click',async()=>{const url=location.href.split('?')[0].split('#')[0];try{if(navigator.share){await navigator.share({title:state.brand,url});}else if(navigator.clipboard){await navigator.clipboard.writeText(url);toast('Link da página copiado!');}else toast('Copie o endereço desta página para compartilhar.');}catch(e){if(e.name!=='AbortError')toast('Não foi possível compartilhar agora.');}});
 $('brand-logo').addEventListener('error',()=>{$('brand-logo').src='./assets/logo-tonhosolo.png';},{once:true});
 render(state);
 if(preview){window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='TONHOSOLO_PREVIEW')return;render(e.data.payload);});parent.postMessage({type:'TONHOSOLO_PREVIEW_READY'},location.origin);}
 else if(window.TONHOSOLO_FIREBASE){util.connectFirebase().then(f=>{if(!f)return;const doc=f.store.doc(f.db,'sitePages',f.id);f.store.onSnapshot(doc,snap=>{if(snap.exists()&&snap.data().content)render(snap.data().content);},err=>{console.warn('Leitura da configuração indisponível:',err.code||err.message);});}).catch(err=>console.warn('Firebase indisponível, usando configuração publicada:',err.message));}
})();
