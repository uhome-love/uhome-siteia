# Nova imagem da prévia do WhatsApp

Usar a arte enviada ("Você e seu novo lar.", com busca e categorias) como imagem da prévia dos links da Uhome.

## O que farei
1. Ajustar a arte para o tamanho da prévia (1200x630), sem cortar o logo, o título nem as categorias, e deixá-la leve para o WhatsApp mostrar.
2. Trocar a imagem atual por essa na home e nas páginas sem foto própria (imóveis e empreendimentos continuam com a foto de cada um).
3. Publicar a parte que monta as prévias dos links; a home passa a mostrar a imagem depois que você publicar o site.

## Detalhes técnicos
- Redimensionar 1731x909 para 1200x630 (proporção quase igual, sem corte visível), JPEG ~q85, salvo em `public/og-uhome-2026b.jpg` (nome novo para furar o cache do WhatsApp).
- Atualizar `og:image`/`twitter:image` em `index.html` e `OG_DEFAULT` em `supabase/functions/ssr-render/index.ts`; publicar `ssr-render`.
