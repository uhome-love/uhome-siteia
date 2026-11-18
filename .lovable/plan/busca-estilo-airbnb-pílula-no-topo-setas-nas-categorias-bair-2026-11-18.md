# Busca estilo Airbnb: pílula no topo, setas nas categorias, bairros em ícone e testes

## 1. Filtro no lugar de "Imóveis · Lançamentos · Investir"
- No computador, a barra do topo segue o Airbnb: logo à esquerda, pílula de busca (Onde · Tipo · Quartos · Valor + Buscar) no centro, Lia, favoritos e Entrar à direita.
- "Imóveis · Lançamentos · Investir" saem do centro. Ficam como links pequenos dentro do menu, para não sumir o acesso.
- A segunda linha com a pílula, abaixo das categorias, deixa de existir. O botão "Filtros" vai para o fim da faixa de categorias, como no Airbnb.
- Ao rolar, a pílula encolhe para a versão curta. Clicar nela volta a abrir o painel do campo.
- No celular nada muda: continua uma pílula só, que abre a busca em tela cheia.

## 2. Categorias 3D com seta lateral
- Seta redonda à direita, com sombra e esfumado na borda, sempre que houver categorias fora da tela. A seta da esquerda aparece depois de avançar.
- Cada clique avança uma página de ícones. A seta passa a depender da largura da tela, não do tipo de mouse, porque hoje ela some em alguns navegadores.
- No celular a faixa rola com o dedo, sem setas.

## 3. Bairros só com ícone
- Sai a ilustração de cena dos 16 cartões, porque ela não mostra o bairro como ele é.
- Cada cartão vira um bloco claro e compacto: um ícone 3D pequeno de localização no estilo Uhome, nome do bairro, número de imóveis e o preço "a partir de".
- Usamos um único ícone leve para todos os bairros (menos de 15 KB). As 6 ilustrações atuais saem da Home.

## 4. Testes no celular (390 px) e no computador (1296 px)
- Categorias: setas aparecem, avançam e voltam. No celular, a faixa rola com o dedo.
- Pílula ao rolar: encolhe sem a página pular e abre o campo certo ao clicar.
- Faixa de preço: arrastar as duas pontas, digitar os valores e conferir se o número do botão "Mostrar N" bate com o título dos resultados.
- Mapa: etiqueta cinza no imóvel visto, mini card com fotos ao clicar no preço e gaveta arrastável no celular nas três alturas.
- Tudo o que falhar é corrigido nesta rodada, com prints de cada resultado.

## Detalhes técnicos
- `Navbar.tsx`: na rota de busca em desktop (≥1024px), renderizar `PilulaBusca` no centro no lugar das abas; abas vão para o menu; estado compacto aproveita o `rolou` atual.
- `SearchExperience.tsx`: remover `search-pilula-linha` no desktop; botão Filtros ao lado de `FaixaRolavel`.
- `index.css`: trocar `@media (hover:none)` das `.faixa-seta` por `max-width:1023px`; `FaixaRolavel` avança `clientWidth` por clique.
- Bairros: novo `public/categorias/bairro.webp` (112px); componente do cartão de bairro passa a layout de ícone + texto; `src/data/bairros.ts` deixa de depender de imagem; remover as ilustrações não usadas.
- site-dobra só é ajustada se o molde da busca depender da barra do topo, mantendo a tela pronta igual ao app. Worker intocado.
- Validação com Playwright 390×844 e 1296×841, com toque emulado na gaveta.
