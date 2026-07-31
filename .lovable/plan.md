# Diagnóstico + Plano: Mapa ultrafluido e design de alto padrão

## Diagnóstico do estado atual

**Mapa (`src/components/SearchMap.tsx`, 876 linhas)**
- Clustering nativo do Mapbox já existe (`cluster: true`, `clusterMaxZoom: 12`, `clusterRadius: 40`), com camadas de cluster, contagem e pins.
- `moveend` dispara busca de pins com debounce de 800 ms; há um `programmaticMoveRef` para evitar o loop de zoom.
- Gargalos: arquivo monolítico com estado de mapa, desenho de polígono, popup e busca misturados; `setData` roda em `requestAnimationFrame` sem diffing (recria a FeatureCollection inteira a cada atualização); `fitBounds` de 800 ms compete com o debounce; sem `maxZoom`/`minZoom` coerentes nem `renderWorldCopies:false`; popup criado por evento em vez de reutilizado.
- Sem hover-link mapa↔lista (destacar o card ao passar o mouse no pin e vice-versa), que é o que dá sensação de fluidez no QuintoAndar.

**Design system (`src/index.css`, `tailwind.config.ts`)**
- Tokens semânticos existem, mas a paleta é dominada por um azul saturado (`235 93% 67%`) usado em botões, chips, sombras e bordas — leitura "SaaS", não "alto padrão".
- Sombras hardcoded em rgba azul (`shadow-card`, `hover-lift`) fora do sistema de tokens.
- Escala tipográfica em px fixo, sem variação responsiva; densidade de espaçamento apertada nos cards e na barra de filtros.
- Microinterações limitadas a `scale(0.97)`; sem transições de elevação/skeleton coerentes.

**Arquitetura de informação (`src/pages/Search.tsx`, 1137 linhas)**
- Split view já existe (lista scrollável + mapa à direita, `lg:h-screen`), mobile alterna lista/mapa em fullscreen.
- Gargalos: página gigante acumulando filtros, paginação, modal de alerta e mapa; sem largura ajustável do split; no mobile falta o padrão "peek" (bottom sheet de cards sobre o mapa).

---

## Fase 1 — Fluidez do mapa (maior impacto percebido)
1. Extrair `SearchMap` em módulos: `useMapInstance`, `useMapPins`, `useDrawPolygon`, `MapPopup`. Sem mudança de comportamento.
2. Atualização de pins com diffing por id + `setData` direto (sem rAF duplo), evitando repaint completo quando o conjunto não muda.
3. Ajustar timings: debounce de bounds 350–450 ms, `easeTo`/`fitBounds` com curva única e `duration` menor; cancelar busca em voo ao iniciar novo movimento.
4. Refinar clustering: `clusterRadius` responsivo (50 no mobile), `clusterMaxZoom` 13, transição de raio/cor por `interpolate` no zoom.
5. Popup único reutilizado + `queryRenderedFeatures` com `throttle`; cursor e hover states via feature-state (sem re-render React).
6. Hover-link bidirecional lista↔mapa via feature-state.

## Fase 2 — Design system de alto padrão
1. Nova paleta neutra: base off-white/grafite, azul rebaixado para acento pontual, tokens de superfície (`--surface`, `--surface-elevated`) e bordas mais suaves.
2. Sombras tokenizadas (`--shadow-sm/md/lg`) em cinza neutro, substituindo as rgba azuis.
3. Escala tipográfica fluida com `clamp()`, tracking negativo em títulos, altura de linha mais generosa no corpo. Mantém Plus Jakarta Sans.
4. Cards de imóvel: mais respiro interno, hierarquia preço > endereço > atributos, foto com transição suave, badges discretos, elevação no hover.
5. Microinterações: transições de 150–250 ms padronizadas, skeletons coerentes com a nova superfície, estados de foco acessíveis.

## Fase 3 — Arquitetura de informação
1. Desktop: split ajustável (lista 58% / mapa 42% por padrão), barra de filtros fixa com hierarquia visual reduzida, contador de resultados fixo no topo da lista.
2. Mobile: substituir o toggle fullscreen por bottom sheet arrastável de cards sobre o mapa (peek → meio → full), mantendo o comportamento atual como fallback.
3. Fatiar `Search.tsx` em `SearchHeader`, `SearchResultsPanel`, `SearchMapPanel`, `AlertModal` para reduzir re-renders e facilitar manutenção.

## Detalhes técnicos
- Nada de mudança em RPC, filtros, URL sync ou regras de negócio; `get_map_pins` e `fetchImoveis` permanecem intactos.
- Paginação "Ver mais" e o teste de regressão `search-ver-mais.test.tsx` continuam válidos; rodar a suíte a cada fase.
- Validação por fase com Playwright em mobile (390×844) e desktop (1536×864): listagem, mapa, desenho de área, detalhe.
- Cada fase é entregável independente e pode ir ao ar isolada.

## Ordem sugerida
Fase 1 → validar → Fase 2 → validar → Fase 3. Posso começar pela Fase 1 ou pela Fase 2 se o visual for prioridade.
