# Busca: pílula no lugar do menu, setas nas categorias, bairros 3D e validação do mapa

## 1. Pílula de busca no topo, no lugar de "Imóveis · Lançamentos · Investir"
- No computador, a barra do topo fica igual ao Airbnb: logo à esquerda, a pílula (Onde · Tipo · Quartos · Valor + Buscar) no centro e Lia, favoritos e Entrar à direita.
- "Imóveis · Lançamentos · Investir" viram abas pequenas logo acima da pílula, como "Acomodações · Experiências" no Airbnb. Ao rolar a página, as abas somem e a pílula encolhe para "Qualquer lugar · Qualquer tipo · Qualquer valor" na mesma linha do logo.
- A segunda linha com a pílula some, e o botão "Filtros" fica ao lado das categorias, à direita, como no Airbnb.
- No celular continua a busca em pílula única, que abre em tela cheia.

## 2. Seta à direita nas categorias 3D
- A seta redonda com sombra fica sempre visível no computador quando há mais categorias fora da tela, com esfumado na borda. Um clique avança uma "página" de ícones; a seta da esquerda aparece depois do primeiro avanço.
- Hoje a seta não aparece em alguns navegadores (regra de "sem mouse"); passa a depender da largura da tela, não do tipo de ponteiro.
- No celular a faixa rola com o dedo, sem seta.

## 3. Bairros restantes em 3D
- Refazer as 10 imagens que ainda usam fotos de banco (Tristeza, Ipanema, Centro Histórico, Cidade Baixa, Bom Fim, Cristal, Boa Vista, Sarandi, Partenon e o último da lista) no mesmo estilo 3D das 6 já feitas.
- WebP com largura de 800 px e no máximo 60 KB cada, carregadas só perto da tela.

## 4. Testes no navegador, celular (390 px) e computador (1296 px), com ajustes
- Setas das categorias: aparecem, avançam e voltam.
- Pílula ao rolar: encolhe sem pulo de layout e volta a abrir ao clicar.
- Faixa de preço: arrastar as duas pontas, digitar valores e conferir se o número de imóveis do botão bate com o resultado.
- Mapa: etiqueta cinza em imóvel já visto, mini card com fotos que passam ao tocar no preço, e gaveta no celular arrastada entre as três alturas.
- Corrigir qualquer falha ou travada encontrada e mostrar os prints.

## Detalhes técnicos
- `Navbar.tsx`: na rota de busca no computador, renderizar `PilulaBusca` no centro em vez do nav central; abas de seção acima; estado compacto via o scroll já existente.
- `SearchExperience.tsx`: remover `search-pilula-linha` no desktop; botão Filtros ao lado da `FaixaRolavel` de categorias.
- `FaixaRolavel` CSS: trocar `@media (hover:none)` por `max-width:1023px`.
- Imagens novas em `public/images/*.webp`, com `src/data/bairros.ts` atualizado.
- Playwright com toque emulado para a gaveta; site-dobra inalterada, a não ser que o molde da busca dependa do nav (aí atualizar o molde v3 na mesma rodada).
