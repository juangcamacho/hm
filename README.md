# Site institucional HidrauMeister

Página institucional da HidrauMeister Peças e Serviços para Bombas de Concreto (Limeira-SP), feita em HTML, CSS e JavaScript puros, sem frameworks e sem etapa de build. Pronta para o GitHub Pages.

## Estrutura

```
├── index.html                 página principal (o GitHub Pages abre este arquivo)
├── assets/
│   ├── css/
│   │   ├── base.css           variáveis da marca (cores, fontes), reset, tipografia, animações
│   │   ├── layout.css         cabeçalho, estrutura das seções e rodapé
│   │   ├── components.css     botões, botão flutuante do WhatsApp, lightbox
│   │   ├── sections.css       estilos de cada seção, na ordem em que aparecem no HTML
│   │   └── responsive.css     ajustes para tablet e celular
│   ├── js/
│   │   └── main.js            interações; configuração (WhatsApp, e-mail) no topo do arquivo
│   └── img/
│       ├── marca/             logo e favicon
│       ├── bombas/            bombas fabricadas
│       ├── pecas/             catálogo de peças
│       ├── servicos/          fotos de reformas e manutenção
│       └── institucional/     imagem da seção "A empresa"
├── tools/
│   └── build-standalone.py    gera uma versão de arquivo único (opcional)
├── .nojekyll                  faz o GitHub Pages servir os arquivos como estão
├── .gitignore                 deixa fora do repositório a pasta referencias/ e a pasta dist/
└── referencias/               material original da empresa (fica só no computador)
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie o conteúdo desta pasta (a `referencias/` fica de fora pelo `.gitignore`).
2. No repositório, vá em **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**, selecione a branch `main` e a pasta `/ (root)`, e salve.
4. Em alguns minutos o site fica disponível em `https://<seu-usuario>.github.io/<nome-do-repositorio>/`.

Todos os caminhos do site são relativos, então ele funciona tanto nesse endereço quanto em um domínio próprio.

## Visualizar no computador

Abra `index.html` no navegador, a partir desta pasta (ele precisa da pasta `assets` ao lado).

Para mandar o site para alguém como um arquivo só, rode `python tools/build-standalone.py` (precisa de Python 3). Ele gera `dist/HidrauMeister.html` com tudo embutido.

## Como editar

- **Cores e fontes:** variáveis no início de `assets/css/base.css` (`--blue`, `--dark` etc.).
- **WhatsApp e e-mail do formulário:** objeto `CONFIG` no topo de `assets/js/main.js`. Os números que aparecem no texto da página ficam no `index.html`.
- **Nova peça no catálogo:** salve a foto em `assets/img/pecas/` e copie um bloco `<figure class="part">` no `index.html`. O atributo `data-cat` define o filtro: `desgaste`, `tubos`, `hidraulica` ou `vedacao`.
- **Ordem dos CSS:** os arquivos são carregados na ordem base → layout → componentes → seções → responsivo. O responsivo precisa ser o último.

O site carrega uma única coisa externa: as fontes do Google Fonts.
