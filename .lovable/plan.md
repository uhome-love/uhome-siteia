

## Estrategia para Dominar o Google em Porto Alegre — Mercado Imobiliario

### Diagnostico atual

O site ja tem uma base solida: SSR via Edge Function, 29.500+ URLs no sitemap, JSON-LD estruturado, blog automatizado e landing pages dinamicas. Porem, comparado com lideres como Bridge Imoveis, ha gaps criticos que impedem o topo.

---

### GAP 1 — SSR incompleto (maior problema)

**Problema:** O SSR atual so roda para bots (via `BOT_UA_RE`). O Google usa "mobile-first indexing" e frequentemente renderiza como usuario normal. Quando o Googlebot nao se identifica como bot, recebe o `index.html` vazio (sem conteudo no `<body>`) — apenas `<div id="root"></div>`. Isso significa que o Google depende de renderizar o JavaScript para ver o conteudo, o que prejudica indexacao.

**Evidencia:** O `index.html` nao tem NENHUM conteudo semantico no body. As metatags da home sao estaticas e ok, mas paginas internas (busca, bairros, imoveis) dependem 100% de JS.

**Correcao:**
- Configurar o Cloudflare Worker (ou Vercel Edge) para SEMPRE servir o SSR para TODAS as requisicoes de paginas HTML (nao apenas bots)
- Alternativa: no minimo, expandir o `BOT_UA_RE` para incluir todos os user-agents que o Google usa, inclusive os que nao dizem "Googlebot"
- O SSR ja esta completo — so precisa ser ativado para todos

### GAP 2 — Paginas de bairro limitadas a 15 bairros

**Problema:** O `ssr-render` tem apenas 15 bairros hardcoded no `BAIRROS` object. Porto Alegre tem 80+ bairros. Se o site tem imoveis em 60 bairros, 45 deles nao tem SSR adequado — a pagina `/bairros/partenon` gera 404 no SSR mesmo tendo imoveis.

**Correcao:**
- Substituir o objeto `BAIRROS` hardcoded por uma query ao banco na funcao `renderBairro`
- Usar a tabela `bairro_descricoes` que ja existe para puxar dados dinamicamente
- Isso sozinho pode adicionar 40-50 paginas indexaveis com conteudo rico

### GAP 3 — Falta de paginas de conteudo "long-form" por bairro

**Problema:** Cada pagina de bairro tem descricao curta. Os concorrentes tem 1500-3000 palavras por bairro com secoes: historia, infraestrutura, escolas, transporte, perfil dos moradores, tendencias de preco. O Google favorece conteudo aprofundado (E-E-A-T).

**Correcao:**
- Expandir as descricoes de bairro via IA (similar ao auto-blog) com secoes estruturadas
- Adicionar dados reais: preco medio, variacao 12 meses, numero de imoveis por tipo
- Renderizar tudo no SSR com headings H2/H3 semanticos

### GAP 4 — Internal linking insuficiente

**Problema:** As paginas de imovel individual nao linkam para outros imoveis do mesmo bairro/tipo. O Google usa links internos para entender hierarquia e relevancia.

**Correcao:**
- No SSR de `/imovel/:slug`, adicionar bloco "Imoveis similares" com 4-6 links
- Cada pagina de bairro deve linkar para sub-paginas (apartamentos neste bairro, casas neste bairro)
- Ja existe parcialmente no client-side mas nao no SSR

### GAP 5 — Core Web Vitals

**Problema:** O GTM carrega com delay de 1.5s o que e bom, mas o hero carrega 3 imagens (mobile/tablet/desktop) via preload, e o Framer Motion ainda esta em varios componentes below-fold, aumentando o bundle.

**Correcao (ja parcialmente feita):**
- Continuar removendo Framer Motion das secoes below-fold (fase 3 do plano anterior)
- Adicionar `fetchpriority="low"` para imagens de bairros/imoveis abaixo da dobra
- Comprimir o bundle JS — verificar se ha code splitting adequado

### GAP 6 — Schema markup incompleto

**Problema:** Falta `AggregateOffer` nas paginas de bairro (preco minimo/maximo), falta `Review`/`AggregateRating` (se tiver avaliacoes), e as paginas de imovel nao tem `Product` schema (que o Google usa para "Popular products").

**Correcao:**
- Adicionar `AggregateOffer` no SSR de bairros e landing pages
- Adicionar `@type: Product` com `offers` nas paginas de imovel (Rich Results para imoveis)

### GAP 7 — Falta de pagina de "Porto Alegre" como hub central

**Problema:** Nao existe uma pagina `/imoveis-porto-alegre` ou `/porto-alegre` que funcione como pagina-pilar (pillar page) linkando para todos os tipos, bairros e faixas de preco. Isso e fundamental para ranquear para "imoveis porto alegre" (keyword principal).

**Correcao:**
- Criar pagina pilar `/imoveis-porto-alegre` com:
  - Estatisticas do mercado (total imoveis, preco medio, bairros mais buscados)
  - Links para todas as categorias (apartamentos, casas, coberturas)
  - Links para todos os bairros ativos
  - Links para faixas de preco
  - FAQ expandido
  - Conteudo de 2000+ palavras
- Adicionar no SSR e sitemap

---

### PLANO DE IMPLEMENTACAO (prioridade de impacto)

**Prioridade 1 — SSR para todos (maior ROI)**
1. Expandir SSR para servir HTML renderizado para TODAS as requisicoes, nao apenas bots
2. Dinamizar bairros no SSR (remover hardcode de 15 bairros)

**Prioridade 2 — Pagina pilar + internal linking**
3. Criar pagina `/imoveis-porto-alegre` como hub central
4. Adicionar "imoveis similares" no SSR de paginas de imovel
5. Adicionar links cruzados tipo→bairro no SSR de cada pagina

**Prioridade 3 — Conteudo E-E-A-T**
6. Gerar descricoes longas (1500+ palavras) para os 20 bairros com mais imoveis
7. Adicionar dados reais de mercado (preco medio, tendencia) nas paginas de bairro

**Prioridade 4 — Schema e CWV**
8. Adicionar AggregateOffer schema em bairros e landing pages
9. Remover Framer Motion restante dos componentes below-fold
10. Otimizar imagens com lazy loading consistente

### Arquivos modificados
- `supabase/functions/ssr-render/index.ts` (SSR dinamico, bairros do DB, internal linking, schemas)
- `src/App.tsx` (nova rota `/imoveis-porto-alegre`)
- Nova pagina `src/pages/PortoAlegrePilar.tsx`
- `scripts/generate-sitemaps.mjs` (adicionar pagina pilar)
- `supabase/functions/dynamic-sitemap/index.ts` (idem)
- `src/components/SimilarProperties.tsx` (verificar se renderiza no SSR)

