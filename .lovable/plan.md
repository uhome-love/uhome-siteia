

## Auditoria SEO Completa — Uhome vs QuintaAndar

### Estado Atual: O que já está bom ✓

1. **SSR Universal** via Edge Function `ssr-render` — todas as páginas servem HTML semântico para crawlers
2. **JSON-LD estruturado** em todas as rotas (RealEstateListing, FAQPage, BreadcrumbList, Organization, WebSite, LocalBusiness, AggregateOffer, Product)
3. **Sitemap dinâmico** com 29.500+ URLs, validação de soft 404, paginação de imóveis
4. **Canonical tags** corretas com normalização de rotas de corretor (`/c/:slug`)
5. **robots.txt** bem configurado com Disallow para admin/onboarding
6. **Footer SEO** com blocos de texto e links internos densos (padrão Bridge)
7. **Breadcrumbs** em todas as páginas de imóvel, bairro e blog
8. **OG/Twitter tags** dinâmicas por página
9. **Fontes lazy-loaded** via `requestIdleCallback`
10. **GTM deferred** — carregado 1.5s após `load` no SPA shell

---

### Problemas Encontrados e Melhorias

#### 1. CRÍTICO — Performance (Core Web Vitals)

**a) Falta de font-display: swap no CSS**
As fontes `@fontsource` são importadas via CSS dinâmico, mas o CSS do fontsource já inclui `font-display: swap`. Verificar se o `index.css` define o fallback corretamente para evitar FOIT.

**b) Falta de `fetchpriority="high"` na imagem LCP**
O hero preload no `index.html` usa `fetchpriority="high"` ✓, mas o componente `HeroSection.tsx` que renderiza a imagem de fundo provavelmente usa CSS `background-image` que não respeita `fetchpriority`. Trocar para `<img>` com `fetchpriority="high"`.

**c) Mapbox carregado quando não visível**
O chunk mapbox-gl já está isolado ✓, mas o `PropertyMap` deveria usar `IntersectionObserver` para carregar apenas quando visível.

**d) Falta de `content-visibility: auto`**
Seções below-fold (FAQ, Footer SEO, SimilarProperties) podem usar `content-visibility: auto` para reduzir trabalho de layout.

#### 2. CRÍTICO — Descrição no Google (problema reportado antes)

**Arquivo**: `supabase/functions/ssr-render/index.ts` (renderImovel)
- A `meta description` do imóvel usa `desc` construído programaticamente, que é bom
- Mas o `bodyHtml` inclui a descrição do imóvel diretamente. Se a descrição tem HTML/códigos do Jetimob, eles aparecem no snippet do Google
- **Fix**: sanitizar a descrição no SSR removendo tags HTML, códigos internos e caracteres especiais antes de inserir no body e na meta description

#### 3. ALTO — Falta de `<link rel="preload">` para fonte crítica

O site usa system font stack no primeiro render (bom), mas quando as fontes carregam há CLS. Adicionar `font-display: optional` ou preload da fonte principal.

#### 4. ALTO — Imagens sem `width`/`height` causam CLS

`SearchPropertyCard` e `PropertyDetail` renderizam imagens sem `width`/`height` explícitos em muitos casos, causando layout shift quando carregam.

#### 5. ALTO — Falta de `hreflang` 

O site é pt-BR único, mas adicionar `<link rel="alternate" hreflang="pt-BR">` e `hreflang="x-default"` melhora a sinalização para o Google.

#### 6. MÉDIO — SSR: meta description sanitização

No `ssr-render/index.ts`, a descrição do imóvel (`row.descricao`) pode conter HTML e códigos Jetimob. Precisa de uma função `stripHtml(text)` para limpar antes de usar em `<meta description>` e body.

#### 7. MÉDIO — Falta de Cache Headers no SPA Shell

O `index.html` servido pelo Lovable hosting não tem `Cache-Control` otimizado. O SSR tem `s-maxage=3600` ✓, mas as assets estáticas devem ter cache longo (já têm hash no nome ✓).

#### 8. MÉDIO — Sitemap: falta de `<lastmod>` dinâmico real

O sitemap usa `today` como lastmod para tudo. Imóveis devem usar `atualizado_em` do banco para lastmod mais preciso, melhorando crawl budget.

#### 9. BAIXO — Falta de `<link rel="preload">` para API crítica

A primeira chamada Supabase (contagem de imóveis no hero) bloqueia o render da contagem. Considerar preload via `<link rel="preload" as="fetch">`.

#### 10. BAIXO — Structured Data: falta AggregateRating

QuintaAndar usa `AggregateRating` nos imóveis. Uhome pode adicionar rating baseado em visualizações/favoritos como proxy de popularidade.

---

### Plano de Implementação (prioridade)

**Fase 1 — Sanitização de descrições no SSR** (impacto imediato no Google)
- Criar função `stripHtml()` no `ssr-render/index.ts`
- Aplicar em `renderImovel()` na meta description e bodyHtml
- Limitar a 160 chars na meta description

**Fase 2 — Core Web Vitals**
- Adicionar `width`/`height` nas imagens de `SearchPropertyCard` e `FotoImovel`
- Adicionar `content-visibility: auto` em seções below-fold via CSS
- Converter hero background-image para `<img>` com `fetchpriority="high"`
- Adicionar `hreflang` no `index.html` e no SSR

**Fase 3 — Sitemap & Indexação**
- Usar `atualizado_em` como `<lastmod>` real nos imóveis do sitemap
- Adicionar `<changefreq>` diferenciado (daily para busca, weekly para bairros, monthly para blog)

**Fase 4 — Structured Data avançado**
- Adicionar `AggregateRating` nos imóveis baseado em views
- Adicionar `offers.itemCondition` (NewCondition/UsedCondition) baseado no tipo
- Adicionar `numberOfRooms` e `floorSize` nos schemas de SEO landing pages

### Arquivos afetados
- `supabase/functions/ssr-render/index.ts` — sanitização + hreflang
- `index.html` — hreflang + preload otimizado
- `src/components/FotoImovel.tsx` — width/height defaults
- `src/components/SearchPropertyCard.tsx` — dimensões de imagem
- `src/components/HeroSection.tsx` — img ao invés de bg-image
- `src/index.css` — content-visibility
- `supabase/functions/dynamic-sitemap/index.ts` — lastmod real

