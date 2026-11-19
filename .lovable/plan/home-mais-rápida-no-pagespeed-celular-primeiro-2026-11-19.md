# Home mais rápida no PageSpeed (celular primeiro)

## O que o relatório mostra (celular)
- Nota de laboratório 64. Visitantes reais: LCP 3,8s, INP 178ms, CLS 0,09 (no limite).
- A maior imagem é a foto do 1º card de "Novos no site". Ela só começa a baixar 2,3s depois da página chegar, porque o card só aparece depois do JavaScript montar a Home (a Home nova ainda não tem a "primeira tela pronta" no HTML, como a busca já tem).
- O bloco "Novos no site" empurra a página quando aparece (CLS 0,10).
- O CSS principal ainda aparece bloqueando a pintura (~660ms).
- 100 KB de fotos de perfil do Google nos depoimentos (120px exibidas em 36px), logo de 192px exibido em 36px, avatar da Lia 256px em 52px, ícones 3D 112px em 28px.
- 260 KB de JavaScript não usado na primeira tela.

## O que vou fazer
1. Foto principal descoberta cedo: a Home passa a ter a primeira tela pronta no HTML (mesmo esquema da busca), com a foto do 1º card já no HTML e pré-carregada; ou, se a primeira tela pronta for arriscada, um pré-carregamento dessa foto feito antes do React (como `buscaCedo` faz na busca).
2. Fim do pulo do "Novos no site": espaço reservado com a altura final dos cards antes de os dados chegarem.
3. CSS: confirmar por que o arquivo principal ainda conta como bloqueante e corrigir sem causar piscada.
4. Imagens pequenas: logo em versão 72px WebP; avatar da Lia 104px; ícones 3D 56px; fotos dos depoimentos pedidas ao Google em 72px (parâmetro de tamanho) e carregadas só perto da tela; foto dos cards da Home no tamanho exibido (≈360px no celular).
5. JavaScript: identificar o que a Home carrega sem usar na primeira tela e adiar.
6. Medir de novo (laboratório + visitantes reais) e comparar com: nota 64, LCP 3,8s, CLS 0,09.

## Fora do escopo
- Visual da Home não muda. Busca, páginas de produto e anúncios ficam como estão.

## Detalhes técnicos
- LCP: `<img fetchpriority=high>` do HomeVitrine card 0 via wsrv; resource load delay 2.300ms. Seguir regra de molde (uh-home-layout lar-1, site-dobra) ou preload inicial em main antes do bundle.
- CLS: `.home-conteudo` seção "Novos no site" — min-height/skeleton com proporção 768x691.
- `index-*.css` listado em render-blocking: checar plugin `cssAssincrono` no build publicado.
- `lh3.googleusercontent.com` → sufixo `=s72-c`.
- Testes: vitest existentes + Playwright 390px para conferir sem pulo e foto cedo.
