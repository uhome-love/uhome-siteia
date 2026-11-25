# Incluir Roni e Patricia no site

Os dois já estão cadastrados e ativos (vieram do CRM): **Roni Klusener** e **Patricia Villanova**. Eles não aparecem na vitrine de corretores só porque ainda não têm a foto oficial do site.

## O que farei
1. Usar as fotos enviadas como fotos oficiais, no mesmo formato dos outros corretores (versão grande + versão leve para o cartão).
2. Gravar as fotos no cadastro de cada um, de forma que a sincronização com o CRM não as troque.
3. Conferir no navegador (celular e computador): os dois na vitrine de corretores e os links pessoais (/c/roni-klusener e /c/patricia-villanova) mostrando cartão e WhatsApp.

## Detalhes técnicos
- Assets via lovable-assets (`corretor-v2-<slug>.webp` e `-card.webp`), mapeados em `src/data/miniaturas.json`.
- `update profiles set foto_url=<url __l5e>` para ids 3bbb114b-... (Roni) e fbd7e6b5-... (Patricia); a sync preserva fotos `__l5e/`.
- Depois, o site precisa ser publicado por você para as fotos aparecerem no ar.
