

## Relatório de Teste End-to-End — Uhome

### Bugs Encontrados

#### 1. CRÍTICO: Tela de Fallback HTML aparece entre navegações (intermitente)
**Reprodução:** Home → Busca → Clica imóvel → Clica "Voltar" → Às vezes mostra HTML estático de SEO (títulos e links crus) em vez do app React.
**Causa raiz:** O `<div id="root">` contém HTML estático de SEO. Em cenários onde o React desmonta e remonta (ex: erro no Suspense durante lazy loading da rota, HMR, ou timing de `navigate(-1)`), o fallback fica exposto. O `ErrorBoundary` não detecta isso porque não é um crash de JavaScript — é uma falha silenciosa do Suspense/lazy.
**Correção:**
- No `src/main.tsx`, limpar o conteúdo estático do `#root` antes de montar o React: `document.getElementById("root")!.innerHTML = "";` antes de `createRoot(...).render(...)`.
- Isso elimina 100% a possibilidade de o HTML estático aparecer depois que o React monta.

#### 2. MÉDIO: "0 imóveis" flash ao voltar para /busca
**Reprodução:** Busca → Imóvel → Voltar → Mostra "0 imóveis" com skeletons por ~1-2s antes de carregar.
**Causa raiz:** O `queryFilters` inclui `limit: PAGE_SIZE * (page + 1)` e `page` no Zustand pode ser diferente do cache original. A chave de cache muda, invalidando o `placeholderData`.
**Correção:** Usar `placeholderData: keepPreviousData` do React Query (já parcialmente implementado), mas também considerar estabilizar a query key para não variar com `page` (o page já é 0 ao voltar graças ao `setFilter` resetar page).

#### 3. MENOR: countActive() duplica contagem de "tipo"
**Localização:** `src/components/SearchFiltersPanel.tsx`, linha 199.
```typescript
if (f.tipo) c++;
if (f.tipo) c++;  // duplicado!
```
**Correção:** Remover a linha duplicada.

### Pontos Positivos (funcionando bem)
- Filtro de Fase funciona em desktop e mobile (seleção, badge, contagem, pins do mapa)
- "Limpar" reseta corretamente todos os filtros
- Mobile filter sheet (drawer) renderiza corretamente com todas seções
- Badges nos cards (Novidade, Em obras, Lançamento, Novo, Destaque) aparecem corretamente
- Mapa carrega pins com clustering
- Ordenação funciona (Mais recentes, Menor preço, etc.)
- Fotos reais em todos os cards (nenhum placeholder genérico visível)
- Favoritos funcionam (coração preenchido)
- Property detail carrega bem (galeria, formulário de lead, breadcrumbs)

### Melhorias Sugeridas para Nível QuintoAndar

#### 1. Eliminar flash de "0 imóveis" ao navegar
Na volta da página de detalhe, mostrar os dados do cache imediatamente em vez de piscar "0". Manter o `total` do Zustand como fallback enquanto React Query recarrega.

#### 2. Skeleton → Transição suave
Em vez de mostrar 6 skeleton cards enquanto carrega, manter os cards anteriores com um indicador de loading sutil (barra de progresso no topo ou opacity fade).

#### 3. Scroll position restore
O Zustand salva `scrollY`, mas não está restaurando ao voltar. Implementar `window.scrollTo(0, scrollY)` após os dados carregarem.

#### 4. Preço no mapa
Os pins do mapa mostram clusters numerados mas sem indicação de preço individual. Pins com preço (como no QuintoAndar) aumentariam muito a usabilidade.

### Plano de Implementação (3 correções)

**Arquivo 1: `src/main.tsx`** — Limpar HTML estático antes do React montar
```typescript
const root = document.getElementById("root")!;
root.innerHTML = ""; // Remove SEO fallback
createRoot(root).render(...)
```

**Arquivo 2: `src/components/SearchFiltersPanel.tsx`** — Remover duplicação em `countActive()`
Deletar a segunda `if (f.tipo) c++;` na linha 199.

**Arquivo 3: `src/pages/Search.tsx`** — Mostrar total do cache/Zustand enquanto carrega
Usar o `total` anterior como placeholder em vez de "0 imóveis" durante a transição.

