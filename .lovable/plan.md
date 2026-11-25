# Incluir o corretor Roni no site

O Roni Klusener já está cadastrado e ativo (veio do CRM). Ele não aparece na vitrine de corretores só porque ainda não tem a foto oficial do site.

## O que farei
1. Usar a foto enviada como foto oficial dele, no mesmo formato das fotos dos outros corretores (versão grande + versão leve para o cartão).
2. Gravar essa foto no cadastro dele, de forma que a sincronização com o CRM não a troque.
3. Conferir no navegador (celular e computador): Roni na vitrine de corretores e o link pessoal dele (/c/roni-klusener) mostrando cartão e WhatsApp.

## Detalhes técnicos
- Asset via lovable-assets (`corretor-v2-roni-klusener.webp` e `-card.webp`), mapeado em `src/data/miniaturas.json`.
- `update profiles set foto_url=<url __l5e>` para id 3bbb114b-...; a sync preserva fotos `__l5e/`.
- Depois, o site precisa ser publicado por você para a foto aparecer no ar.
