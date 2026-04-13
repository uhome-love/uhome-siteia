

## Diagnóstico

**Causa raiz**: Os arquivos `src/pages/Collection.tsx` e `src/pages/PortoAlegrePilar.tsx` **não existem no disco**. Todas as tentativas anteriores de criá-los não persistiram no sistema de arquivos. O `lazyPages.ts` faz importação **eager** (linhas 5-6), o que causa falha imediata do Vite.

## Plano de correção definitiva

### Passo 1 — Criar `src/pages/Collection.tsx`
Página da Uhome Collection com:
- Fetch de imóveis com `destaque: true`
- Filtros client-side por Tipo e Bairro
- SEO (meta tags, JSON-LD, canonical)
- Header com "Imóveis Selecionados" + "Uhome Collection"
- Grid de `SearchPropertyCard` + `LeadFormInline`

### Passo 2 — Criar `src/pages/PortoAlegrePilar.tsx`
Página pilar de Porto Alegre com:
- Fetch geral de imóveis de Porto Alegre com paginação
- Estatísticas (total, bairros, preço médio)
- Links rápidos para páginas de tipo
- Bairros em destaque com links SEO
- Grid de propriedades + load more

### Passo 3 — Validar build
Rodar `npx vite build --mode development` e `npx vite build` para confirmar que ambos passam sem erro.

### Detalhes técnicos
- Ambos os arquivos seguem o padrão existente em `TipoImovel.tsx` (imports de Navbar, Footer, SearchPropertyCard, fetchImoveis, setJsonLd, useCanonical, etc.)
- As importações eager em `lazyPages.ts` (linhas 5-6) permanecem como estão — o problema é apenas a ausência dos arquivos

