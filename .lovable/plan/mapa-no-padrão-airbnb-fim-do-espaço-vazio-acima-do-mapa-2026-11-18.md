# Mapa no padrão Airbnb + fim do espaço vazio acima do mapa

## Parte 1 — Corrigir o espaço entre as categorias e o mapa (já)
- No computador, a faixa "Área do mapa / Limpar filtros" sai da largura toda e vai para dentro da coluna da lista, logo acima do título.
- O mapa passa a começar colado logo abaixo da linha de categorias, como no Airbnb, ocupando toda a altura da tela.
- No celular nada muda (chips continuam no topo da lista).

## Parte 2 — Estudar o mapa do Airbnb na prática
Vou abrir o airbnb.com.br num navegador automático (computador 1440 px e celular 390 px) e usar o mapa de verdade, gravando capturas e medidas de cada passo:
- Arrastar, dar zoom, "Pesquisar ao mover o mapa", botão "Pesquisar nesta área".
- Pinos: formato, sombra, cor ao passar o mouse, cor de visto, pino selecionado, agrupamento.
- Card do pino: tamanho, fotos com setas, favorito, fechar, posição em relação ao pino e às bordas.
- Ligação lista e mapa: passar o mouse no card acende o pino e vice-versa.
- Filtros com o mapa aberto: como o mapa reenquadra, o que acontece com 0 resultados, contador.
- Celular: gaveta (alturas, arrasto, botão "Mapa"), card do pino embaixo da tela.
- Animações e tempos (zoom, abertura do card, troca de pinos), carregamento.

Observação honesta: o código interno do Airbnb é fechado e comprimido; não dá para copiá-lo. O que consigo é ver e medir tudo que aparece na tela (tamanhos, cores, sombras, tempos, comportamento) e reproduzir com a mesma qualidade no nosso mapa, com a nossa marca (azul Uhome, Montserrat). O Airbnb pode bloquear navegadores automáticos; se isso acontecer, aviso e uso capturas públicas.

## Parte 3 — Relatório comparativo e ajustes
- Tabela "Airbnb x Uhome" com cada detalhe, marcando o que já está igual e o que falta.
- Aplico as diferenças no nosso mapa em seguida, por prioridade (pinos e card primeiro, depois gaveta, depois animações), testando em 360/390/430 px e no computador.

## Detalhes técnicos
- `SearchExperience.tsx`: renderizar `appliedChips` dentro de `main.search-list` no desktop (mantendo `.search-mobile-chips` no celular); `.search-map` sticky com `top` = altura navbar + faixa de categorias e `height: calc(100dvh - top)`.
- Estudo via Playwright em /tmp/browser/airbnb com screenshots, `getComputedStyle` dos pinos/card e registro de requisições do mapa (sem gravar nada no projeto).
