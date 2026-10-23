# Tonhosolo Obras — landing page e painel admin

Site estático pronto para Vercel. O logotipo enviado está em `assets/logo-tonhosolo.png`.

## Testar
Abra `index.html` em um servidor local, ex.: `python -m http.server 8000`, e visite `http://localhost:8000/`. O editor está em `/admin/`.

## Personalização sem Firebase
Em `/admin/` edite links, ícones, textos, cores, serviços e canais de contato. A prévia é imediata. Clique em **Baixar atualização** para obter `defaults.js`, substitua o arquivo na raiz do projeto e faça novo deploy. **Sem Firebase, o rascunho fica salvo apenas neste navegador** (via localStorage). Isso não publica mudanças para os visitantes: exporte o arquivo e faça novo deploy. O painel em modo local é um editor público de testes, não uma área protegida: não coloque dados privados nele.

## Publicação ao vivo via Firebase
1. Crie um projeto Firebase, ative Firestore e **Authentication > Email/senha**.
2. Em `firebase-config.js`, substitua `null` pelo objeto de configuração do app Web Firebase (`apiKey`, `authDomain`, `projectId`, `appId`). Não use segredos de servidor.
3. Aplique as regras `firestore.rules` no Console do Firebase, revisando regras existentes para evitar sobrescrever outras coleções de um projeto compartilhado.
4. Cadastre o usuário administrador no Firebase Authentication. Copie seu UID e crie manualmente no Firestore o documento `siteAdmins/SEU_UID` contendo `enabled: true` (booleano). Crie esse documento somente pelo Console administrativo ou backend confiável.
5. Publique o site. Faça login pelo endereço `/admin/`; edite e clique **Publicar alterações**. A página pública receberá as configurações do Firestore. O acesso administrativo e as gravações são protegidos por regras do Firestore.

**Nota de segurança:** A leitura pública de `sitePages/tonhosolo` é intencional, para que os links apareçam para visitantes. Não salve dados pessoais privados nessa configuração. As regras são específicas dessa página; confirme compatibilidade antes de aplicá-las a um projeto com outras aplicações.

## Estrutura
- `index.html` / `style.css` / `site.js` — página pública
- `admin/index.html` / `admin/style.css` / `admin/admin.js` — painel
- `defaults.js` — dados iniciais exportáveis
- `firebase-config.js` / `firestore.rules` — integração opcional

Os links oficiais da empresa precisam ser preenchidos pelo administrador; o modelo não inventa números de telefone nem URLs de redes sociais.

## Diagnóstico do painel
- Se a URL `/admin/` pedir autenticação da **Vercel**, confira a configuração de **Deployment Protection** no projeto Vercel. Essa proteção é independente do login do Firebase. Nunca desative a proteção apenas para expor um painel com dados sensíveis.
- Se o painel abrir com **Modo local** e o botão **Exportar página**, o arquivo `firebase-config.js` ainda não contém os dados públicos do projeto Firebase. Nesse modo, é possível editar, manter um rascunho no próprio navegador e exportar `defaults.js`, mas não publicar online diretamente.
- Para ativar **Publicar alterações**, configure Firebase Web, Authentication, Firestore, as regras e o documento `siteAdmins/{uid}` como indicado acima. Nunca inclua senhas ou chaves de serviço no repositório.
- Depois de uma atualização do site, recarregue `/admin/`. Se uma edição antiga continuar aparecendo, use **Configurações → Restaurar padrão** (isso apaga o rascunho do navegador em modo local).
- Verificação automatizada: execute `node --check admin/admin.js && node tests/admin-regression.cjs`.
