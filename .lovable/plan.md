# Mapa limpo como o do Airbnb

## O que a comparação mostrou
| Detalhe | Airbnb | Nosso hoje |
|---|---|---|
| Quantos imóveis no mapa | Só os da página que está na lista (cerca de 18 a 40) | Todos os 2.000 de uma vez, um mar de bolinhas |
| Pontinhos | Poucos, em forma de pílula pequena e branca, só onde dois preços se encostam | Centenas de círculos sobrepostos |
| Preços | Fonte maior, mais espaço entre eles, sombra suave | Menores e apertados |
| Fundo do mapa | Claro e calmo: cinza-claro, verde e azul suaves, poucas estradas coloridas | Estradas laranja e amarelas fortes, muitos rótulos |
| Botões | Ampliar no canto, e + e − num bloco branco arredondado | Só + e − |
| Barra "Desenhar área / Buscar ao mover" | Não existe: a busca ao mover fica sempre ligada | Barra fixa embaixo, tapando os preços |

## O que vou mudar
1. **O mapa mostra só os imóveis carregados na lista**, como no Airbnb. Ao rolar a lista e carregar mais, os preços novos aparecem no mapa. Ao arrastar o mapa, a lista e o mapa se atualizam juntos.
2. **Pontinho em forma de pílula pequena**, só para os imóveis cujo preço não cabe sem encostar em outro. Ao aproximar, ele vira preço.
3. **Preços maiores** (14 px, negrito), com mais respiro entre eles e sombra suave. Ficam escuros ao passar o mouse e cinza quando o imóvel já foi visto.
4. **Fundo do mapa claro**, no estilo do Airbnb: estradas em cinza, água azul-clara, parques verde-claros e só os nomes de bairros e cidades.
5. **Botão de ampliar** no canto: no computador esconde a lista e o mapa ocupa a tela; clicando de novo, volta. Os botões + e − ficam no mesmo estilo branco arredondado.
6. **Barra "Desenhar área / Buscar ao mover" sai da frente:** a busca ao mover fica sempre ligada. "Desenhar área" vira um botão pequeno no canto, junto dos outros.
7. Comparação lado a lado com o Airbnb em Porto Alegre e no Litoral, no computador e no celular (360, 390 e 430 px).

Depois disso sigo o plano anterior: testar todos os botões do site e preparar os anúncios do Google.

## Detalhes técnicos
- `SearchExperience`: passar ao `SearchMap` os `rows` visíveis da lista (no lugar da consulta `busca-site-pins` com limite 2000), mantendo o enquadramento só na primeira carga e a busca por área.
- `SearchMap`: a camada `clusters` vira um `symbol` com uma imagem de mini-pílula (`pin-dot`), desenhada sob `imoveis-pins` com `icon-allow-overlap`. Os preços usam `text-size` 14, `icon-padding` 8 e `symbol-sort-key` pela ordem da lista.
- Estilo do mapa: `mapbox://styles/mapbox/light-v11`, com cores ajustadas via `setPaintProperty` (água, parques, estradas) e rótulos de pontos de interesse escondidos.
- O controle de tela cheia é um botão próprio que alterna a classe `search-mapa-cheio` no container (lista com `display:none` e mapa com 100% de largura), seguido de `map.resize()`.
