const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('admin/admin.js', 'utf8');
const data = new Map();

function boot() {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        id, dataset: {}, value: '', textContent: '', innerHTML: '',
        classList: { add() {}, remove() {}, toggle() {} },
        handlers: {},
        addEventListener(name, handler) { this.handlers[name] = handler; },
        querySelector() { return { textContent: '' }; },
        click() {}
      });
    }
    return elements.get(id);
  }
  element('site-preview').contentWindow = { postMessage() {} };
  const tabs = ['links', 'conteudo', 'aparencia', 'contato', 'configuracoes']
    .map(name => ({ dataset: { tab: name }, classList: { toggle() {} }, addEventListener() {} }));

  const defaults = {
    brand: 'Tonhosolo', logo: './assets/logo-tonhosolo.png',
    accent: '#d9ab6d', background: '#0b0b0d',
    links: [{ id: 'test', title: 'Original', subtitle: '', url: '', icon: 'link', visible: true, featured: false }],
    services: []
  };
  const normalize = cfg => JSON.parse(JSON.stringify(cfg));
  const window = {
    TONHOSOLO_DEFAULTS: defaults,
    TONHOSOLO_FIREBASE: null,
    TS: { normalize, esc: x => String(x ?? ''), connectFirebase: async () => null },
    TSIcons: { svg: () => '<svg></svg>' },
    addEventListener() {}
  };
  const storage = {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key)
  };
  vm.runInNewContext(source, {
    window, document: { getElementById: element, querySelectorAll: () => tabs },
    localStorage: storage, location: { origin: 'https://example.org' },
    console, setTimeout: () => 0, confirm: () => true
  }, { filename: 'admin/admin.js' });
  return { element, storage };
}

const key = 'tonhosolo.admin.draft.v1';
let app = boot();
assert.equal(app.storage.getItem(key), null, 'Abrir o painel não deve salvar um rascunho antigo');

const urlInput = { dataset: { link: 'url', i: '0' }, type: 'text', value: 'https://example.org/orcamento' };
app.element('edit-content').handlers.input({ target: urlInput });
app.element('edit-content').handlers.change({ target: urlInput });
let draft = JSON.parse(app.storage.getItem(key));
assert.equal(draft.links[0].url, 'https://example.org/orcamento',
  'Ao sair do campo, a URL não pode virar false');

const checkbox = { dataset: { link: 'visible', i: '0' }, type: 'checkbox', checked: false };
app.element('edit-content').handlers.input({ target: checkbox });
draft = JSON.parse(app.storage.getItem(key));
assert.equal(draft.links[0].visible, false, 'O toggle deve ser salvo');

app = boot();
assert.equal(JSON.parse(app.storage.getItem(key)).links[0].url, 'https://example.org/orcamento');
assert.match(app.element('edit-content').innerHTML, /https:\/\/example.org\/orcamento/,
  'Reabrir o painel deve restaurar a URL digitada');

console.log('Admin: campos, checkbox e rascunhos locais OK');
