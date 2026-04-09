

## Corrigir link do imóvel no WhatsApp (URL do Supabase → uhome.com.br)

### Problema
O lead recebe no WhatsApp o link técnico do backend (`huigglwvvzuwwyqvpmec.supabase.co/functions/v1/ssr-render?path=...`) em vez do link correto `https://uhome.com.br/imovel/...`.

### Causa
O arquivo `src/pages/PropertyDetail.tsx` (linha 2 e 220) usa `getShareUrl(slug)` que retorna a URL do SSR. É possível que a versão em produção do `whatsapp.ts` também ainda use a versão antiga.

### Correção

**Arquivo: `src/pages/PropertyDetail.tsx`**
- Linha 2: trocar `import { getShareUrl }` por `import { getImovelUrl }` de `@/utils/shareUrl`
- Linha 220: trocar `getShareUrl(slug)` por `getImovelUrl(slug)`

Isso garante que tanto o botão "Compartilhar" quanto as mensagens do WhatsApp usem `uhome.com.br/imovel/...`.

**Verificação**: confirmar que `src/lib/whatsapp.ts` já usa `getImovelUrl` (código atual mostra que sim).

### Também: corrigir erro de build

Recriar `src/pages/PortoAlegrePilar.tsx` que está ausente e causa o erro `TS2307` no build.

