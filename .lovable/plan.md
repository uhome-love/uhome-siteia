# Velocidade no celular: LCP real abaixo de 2,5 s, sem mudar nada visível

Ponto de partida (seu teste da home, 17/11 00:20): celular nota 61, LCP 9,7 s no teste e 3,6 s com visitantes reais; computador 89.

## O que já confirmei no código
- **Tags em dobro:** a página inicial já liga o GTM (GTM-5838J9Z) e o Google Ads (AW-18567893155). Depois, o código do site liga o GA4 e configura o mesmo Google Ads de novo. Se o GTM também tiver a tag do Ads dentro, isso explica as 3 cargas.
- **Fontes:** o site baixa 8 arquivos de fonte separados: Plus Jakarta em 5 pesos, Montserrat em 2 e DM Mono em 1. Hoje eles entram depois da primeira tela, e o texto muda de fonte quando chegam.

## Ordem de correção

1. **Tags do Google, um caminho só (gtag)**
   - Antes de mexer, abro o conteúdo público do GTM para ver o que ele carrega (Ads, GA4, outros pixels).
   - Fica um único gtag.js com GA4 + Ads, carregado depois da primeira pintura. O GTM sai se só repetir essas tags. Se tiver outra coisa útil, como o pixel da Meta, eu paro e te pergunto antes.
   - As conversões (lead R$ 50, visita R$ 100, WhatsApp secundário) e o gclid continuam iguais. Ponho uma fila para que conversões feitas antes de a tag carregar não se percam.
   - Confiro pelas requisições: cada tag carrega uma vez e cada conversão dispara uma vez.
2. **Fontes:** máximo de 3 pesos da Plus Jakarta (400, 600, 700), em woff2 servido pelo próprio site, dentro do CSS principal. Uso font-display: swap e pré-carrego os 2 pesos da primeira tela. O 500 e o 800 passam para o peso mais próximo, uma diferença quase invisível. Montserrat (Natal) e DM Mono carregam só nas páginas que usam essas fontes.
3. **Imagens:** WebP no tamanho do aparelho (srcset/sizes), largura e altura em todas, lazy fora da primeira tela e fetchpriority="high" só na imagem principal. A imagem de fundo da home fica num componente pronto para receber a foto real.
4. **JavaScript:** LIA, mapa, galeria e simulador passam a carregar sob demanda. O splash de entrada deixa de segurar a pintura.
5. **Acessibilidade:** corrijo os ARIA proibidos e os contrastes que o PageSpeed apontar, sem mudar as cores da marca de forma visível.

## Medição antes e depois
- O PageSpeed bloqueou as medições daqui por limite. Para entregar o antes e o depois das 4 páginas, preciso de uma de duas coisas: uma chave gratuita do PageSpeed, ou você mede as 4 páginas antes de eu publicar e de novo depois.
- Entrego também a lista de requisições das tags do Google depois da mudança.
- O LCP com visitantes reais só se atualiza ao longo de cerca de 28 dias. Eu acompanho pelos dados de velocidade que o próprio site registra.

## Detalhes técnicos
- Arquivos: index.html (scripts GTM e AW), src/lib/gtag.ts (initGA4 com fila), src/main.tsx (fontes), src/index.css (@font-face com woff2 local em /public/fonts), componentes do hero e das imagens, React.lazy nos módulos pesados.
- Sem manualChunks (regra do projeto).
