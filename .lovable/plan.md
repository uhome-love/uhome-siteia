

## Plano de Melhorias — Velocidade, Loading, Scroll e Preços nos Pins

### Análise do Estado Atual

O mapa já mostra preços nos pins individuais (implementado via `preco_label` no GeoJSON + `text-field: ["get", "preco_label"]` no layer `imoveis-pins`). O problema é que com `icon-allow-overlap: false`, muitos pins ficam ocultos em zoom médio, mostrando apenas clusters numéricos. A experiência de preço no pin já existe — precisa ser mais visível.

O scroll restoration salva `scrollY` no Zustand mas a restauração no `useEffect` depende de `loading` e `imoveis.length` — condições que podem não estar prontas no momento certo.

O loading mostra 6 skeleton cards abruptos em vez de manter o conteúdo anterior com indicador sutil.

---

### Melhoria 1: Transição suave no loading (eliminar skeletons abruptos)

**Arquivo:** `src/pages/Search.tsx`

Em vez de trocar entre skeletons e cards, manter os cards anteriores visíveis com opacity reduzida + barra de progresso fina no topo da coluna de cards.

- Quando `isFetching && !isLoading` (refetch com dados em cache): mostrar barra de progresso animada no topo + opacity 0.6 nos cards
- Quando `isLoading` (primeira carga, sem cache): manter skeletons (inevitável)
- Usar `isFetching` do `useImoveisQuery` que já é exposto

**Mudança concreta:**
- Adicionar `isFetching` ao destructure de `useImoveisQuery`
- Envolver a grid em `<div style={{ opacity: isFetching && !loading ? 0.5 : 1, transition: 'opacity 200ms' }}>`
- Adicionar barra de progresso indeterminada (`<div className="h-0.5 bg-primary animate-pulse">`) quando `isFetching && !loading`

---

### Melhoria 2: Scroll position restore confiável

**Arquivo:** `src/pages/Search.tsx`

O `useEffect` atual restaura scroll apenas no mount, mas os dados podem não estar prontos. Corrigir para restaurar após os dados carregarem:

- Usar um `ref` (`scrollRestoredRef`) para garantir que restaura apenas uma vez
- Disparar `window.scrollTo(0, scrollY)` quando `!loading && imoveis.length > 0 && !scrollRestoredRef.current`
- Adicionar `scrollY` e `loading` como dependências

---

### Melhoria 3: Pins com preço mais visíveis no mapa

**Arquivo:** `src/components/SearchMap.tsx`

Os pins já mostram preço, mas o `icon-allow-overlap: false` + `text-allow-overlap: false` esconde a maioria. Ajustar para mostrar mais pins simultaneamente:

- Reduzir `icon-padding` de 4 para 2
- Reduzir `clusterRadius` de 52 para 40 (desagrupa mais cedo)
- Reduzir `clusterMaxZoom` de 13 para 12 (mostra pins individuais antes)
- Aumentar `text-size` de 12 para 11 (pills menores = menos colisão)
- Reduzir o tamanho da pill image de 80x28 para 72x26

---

### Melhoria 4: Prefetch do próximo batch

**Arquivo:** `src/pages/Search.tsx`

Quando o usuário está perto do final da lista (sentinel visível), prefetch o próximo batch em background antes do clique em "Ver mais":

- No `ProgressiveGrid`, quando `visibleCount` se aproxima de `imoveis.length` (resta < BATCH), disparar `loadMore` preemptivamente via `IntersectionObserver` com `rootMargin: "800px"`

---

### Melhoria 5: Lazy loading de fotos no card com placeholder blur

**Arquivo:** `src/components/FotoImovel.tsx`

Verificar se já tem placeholder de baixa qualidade. Se não, adicionar `bg-muted` como background enquanto a imagem carrega, evitando layout shift e dando feedback visual instantâneo.

---

### Arquivos afetados

1. `src/pages/Search.tsx` — transição suave + scroll restore + prefetch
2. `src/components/SearchMap.tsx` — pins mais visíveis (3 constantes)
3. `src/hooks/useImoveisQuery.ts` — expor `isFetching` (já expõe)

### Resultado esperado
- Zero flash de "0 imóveis" ou skeletons abruptos ao navegar
- Scroll volta exatamente onde o usuário estava
- Mais pins com preço visíveis no mapa em zoom médio
- Carregamento antecipado do próximo batch

