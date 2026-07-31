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

## Fase 1 (prioridade) — Mapa nível Airbnb: fluidez, pins e carregamento

**Pins com identidade (o que mais diferencia o Airbnb)**
1. Trocar os pins de círculo por "price pills": preço abreviado (R$ 1,2M) em pílula branca com sombra suave, renderizada como `symbol layer` do Mapbox (texto + ícone de fundo SDF) — continua GPU-accelerated, sem marcador DOM, sem perda de FPS com milhares de pins.
2. Estados por `feature-state`: hover eleva a pílula e escurece o fundo, "visualizado" fica cinza, selecionado fica preto/primário. Zero re-render React.
3. `symbol-sort-key` por preço e `text-allow-overlap: false` para descolagem automática das pílulas em zoom baixo, evitando poluição visual.
4. Clusters redesenhados: círculo branco com contagem, raio interpolado por zoom, `clusterMaxZoom` 13 e `clusterRadius` responsivo (50 no mobile).

**Fluidez de movimento**
5. Timings unificados: debounce de bounds 350 ms (hoje 800 ms), `easeTo`/`fitBounds` com uma única curva e duração menor; requisição em voo cancelada via `AbortController` ao iniciar novo movimento.
6. `setData` direto com diffing por id (hoje há rAF duplo recriando a FeatureCollection inteira a cada atualização) — atualiza só quando o conjunto muda.
7. Popup/card único reutilizado em vez de criado por evento; `queryRenderedFeatures` com throttle.
8. Hover-link bidirecional lista↔mapa via `feature-state` (passar o mouse no card destaca o pin e vice-versa).

**Carregamento**
9. Estilo do mapa mais leve e limpo (Mapbox Light/custom com POIs reduzidos), `renderWorldCopies: false`, `fadeDuration` menor, `maxZoom`/`minZoom` coerentes com a cobertura RS.
10. Preload do estilo + primeira leva de pins em paralelo com a lista; skeleton do mapa com placeholder estático em vez de spinner.
11. Cache de pins por bounds/filtros em memória (já existe parcialmente) com invalidação por chave de filtro, evitando refetch ao voltar do detalhe.

**Organização**
12. Extrair `SearchMap.tsx` (876 linhas) em `useMapInstance`, `useMapPins`, `useDrawPolygon`, `MapPricePin`, `MapPopupCard`. Comportamento de desenho de área, filtros e URL sync inalterados.

## Fase 2 — Design system de alto padrão
1. Nova paleta neutra: base off-white/grafite, azul rebaixado para acento pontual, tokens de superfície (`--surface`, `--surface-elevated`) e bordas mais suaves.
2. Sombras tokenizadas (`--shadow-sm/md/lg`) em cinza neutro, substituindo as rgba azuis.
3. Escala tipográfica fluida com `clamp()`, tracking negativo em títulos, altura de linha mais generosa no corpo. Mantém Plus Jakarta Sans.
4. Cards de imóvel: mais respiro interno, hierarquia preço > endereço > atributos, foto com transição suave, badges discretos, elevação no hover.
5. Microinterações padronizadas em 150–250 ms, skeletons coerentes, estados de foco acessíveis.

## Fase 3 — Arquitetura de informação
1. Desktop: split ajustável (lista 58% / mapa 42%), barra de filtros fixa com hierarquia reduzida, contador de resultados fixo no topo da lista.
2. Mobile: bottom sheet arrastável de cards sobre o mapa (peek → meio → full) no lugar do toggle fullscreen, mantendo o comportamento atual como fallback.
3. Fatiar `Search.tsx` (1137 linhas) em `SearchHeader`, `SearchResultsPanel`, `SearchMapPanel`, `AlertModal`.

## Detalhes técnicos
- Nada de mudança em RPC, filtros, URL sync ou regras de negócio; `get_map_pins` e `fetchImoveis` permanecem intactos.
- As price pills precisam do preço no payload de pins — `get_map_pins` já retorna preço, então não há mudança de banco.
- Paginação "Ver mais" e o teste `search-ver-mais.test.tsx` continuam válidos; rodar a suíte a cada fase.
- Validação com Playwright em mobile (390×844) e desktop (1536×864): pan/zoom contínuo, desenho de área, clique em pin, volta do detalhe.
- Cada fase é entregável independente e pode ir ao ar isolada; o site permanece no ar durante todas.

## Ordem sugerida
Fase 1 (mapa) → validar → Fase 2 → validar → Fase 3.

