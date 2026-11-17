# Prévia: imagem direta nas páginas de campanha

## O que muda
- Nas páginas /em-foco/, /campanha/ e studios, a imagem da prévia passa a usar o endereço direto da arte (ex.: uhome.com.br/__l5e/assets-v1/...), sem o wsrv.nl.
- Nessas imagens, a prévia informa tamanho 1200 x 628.
- No imóvel (fotos de fora), continua pelo wsrv.nl com 1200 x 630, como hoje.

## Detalhes técnicos
- `ssr-render/index.ts`, `ogImageUrl()`: se a URL for do próprio site (uhome.com.br, www, ou caminho `/__l5e/assets-v1/`), devolver a URL direta (absoluta em https://uhome.com.br) e marcar como 1200x628; senão manter wsrv.nl.
- `html()`: og:image:width/height vindos desse resultado; og:image:type image/jpeg pela extensão.
- Publicar a função e conferir com chamada direta que /em-foco/open-bosque, /em-foco/orygem..., /em-foco/open-arvoredo, /campanha e studios saem com a URL direta e 1200x628, e o imóvel segue com wsrv.nl.
