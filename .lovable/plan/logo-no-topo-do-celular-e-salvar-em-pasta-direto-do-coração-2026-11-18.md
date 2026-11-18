# Logo no topo do celular e salvar em pasta direto do coração

## 1. Logo "U" no topo do celular
- O ícone redondo do "U" da Uhome fica à esquerda da busca, no topo de todas as páginas do celular. Ele tem 40 px e área de toque de 44 px.
- Tocar no ícone leva para a Home. A busca encolhe um pouco para caber, e o botão de filtros continua à direita.
- No computador nada muda, porque o logo já aparece ali.
- Confiro se a tela pronta da busca no celular (a que aparece antes do site carregar) precisa do mesmo ícone, para a página não pular quando o site terminar de carregar.

## 2. Salvar em pasta, bonito e fluido
Hoje, ao tocar no coração, aparece um aviso com "Escolher pasta" que leva para outra página. Lá, criar pasta abre a caixinha cinza do navegador.

Fica assim:
- Ao tocar no coração, o imóvel é salvo, e um painel sobe de baixo no celular ou aparece ao lado do coração no computador. Nele aparecem a foto pequena do imóvel e "Salvo em Favoritos".
- Abaixo vem a lista das suas pastas, cada uma com a miniatura da capa e o número de imóveis. Tocar marca ou desmarca a pasta, com um sinal de ✓ animado.
- **"+ Criar nova pasta"** abre, no próprio painel, um campo com sugestões rápidas: "Para visitar", "Favoritos da família", "Investimento" e "Praia". Também dá para digitar um nome. Ao tocar em "Criar", a pasta aparece na lista já marcada, com animação suave.
- O painel fecha sozinho depois de escolher, ou ao tocar fora. Ele não sai da página e não interrompe a navegação.
- Na página de Favoritos, a caixinha cinza do navegador sai e entra o mesmo campo bonito de criar pasta. Isso vale para "Nova pasta" e para "Escolher pasta".

## 3. Testes no celular (390 px) e no computador (1440 px)
- Logo: tocar no "U" volta para a Home a partir da busca, de um imóvel e dos Favoritos.
- Coração: salvar dois imóveis, criar uma pasta no painel, colocar o segundo imóvel numa pasta já existente e conferir as duas pastas na página de Favoritos.
- Desmarcar o coração tira o imóvel das pastas.
- Prints de cada etapa nos dois tamanhos. O que estiver feio ou travando é corrigido nesta rodada.

## Detalhes técnicos
- `Navbar.tsx`: em `.uhs-mobile-search-row`, um `Link` com `UhomeLogo` em modo ícone (`aria-label="Uhome, página inicial"`). CSS com tokens existentes.
- Novo `src/components/favoritos/SalvarNaPasta.tsx`: Drawer (vaul) no celular e Popover no computador, aberto por evento global `uhome:salvo-favorito` disparado em `useFavoritos.ts`. Esse evento substitui o toast com link; as funções de `favoritosPastas.ts` continuam sendo usadas.
- Componente `CriarPastaInline` reaproveitado em `Favoritos.tsx`, no lugar de `window.prompt`.
- Animações com transform e opacity, e respeito a `prefers-reduced-motion`.
- Teste em vitest para criar e marcar pasta pelo painel. site-dobra só é ajustada se o molde do celular incluir a barra do topo; o Worker não é tocado.
