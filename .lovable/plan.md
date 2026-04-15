

## Diagnóstico

**Causa raiz confirmada:** Os arquivos `src/pages/Collection.tsx` e `src/pages/PortoAlegrePilar.tsx` **não existem no disco**. Foram criados pelo menos 4 vezes em sessões anteriores mas nunca persistiram. O `lazyPages.ts` importa ambos de forma **eager** (linhas 2-3), causando falha imediata do Vite.

## Plano

### 1. Criar `src/pages/Collection.tsx`
Página "Uhome Collection" — curadoria premium de imóveis com `destaque: true`:
- Fetch via `fetchImoveis({ destaque: true })`
- Filtros client-side por Tipo e Bairro
- Header: "Imóveis Selecionados" (azul) + "Uhome Collection" com ícone Gem
- Grid de `SearchPropertyCard`
- SEO: canonical, JSON-LD, meta tags

### 2. Criar `src/pages/PortoAlegrePilar.tsx`
Hub SEO `/imoveis-porto-alegre`:
- Estatísticas (total imóveis, bairros, preço médio)
- Grid de bairros com links SEO
- Atalhos por tipo de imóvel
- Listagem com load more / scroll infinito
- JSON-LD CollectionPage + AggregateOffer

### 3. Atualizar browserslist
```
npx update-browserslist-db@latest
```

### 4. Validar build
```
npm run build && npm run build:dev
```

### Notas
- `lazyPages.ts` permanece inalterado — o problema é a ausência dos arquivos, não a config de imports
- `AppRoutes.tsx` permanece inalterado
- Ambas as páginas seguem o padrão de `TipoImovel.tsx` (Navbar, Footer, SearchPropertyCard, fetchImoveis, useCanonical, setJsonLd)

