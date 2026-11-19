# Fotos do card deslizando com o dedo, igual ao Airbnb

## O que acontece hoje
- O card só troca de foto quando o celular avisa que o dedo terminou o gesto. No iPhone esse aviso muitas vezes se perde, porque a foto fica dentro de um link e o Safari trata o toque como clique ou como arraste da imagem. Por isso deslizar não faz nada.
- Mesmo quando funciona, a foto troca de uma vez, sem acompanhar o dedo. No Airbnb a foto anda junto com o dedo e para encaixada na próxima.

## O que muda
- **Busca e mapa (lista vertical):** as fotos do card viram uma fileira que desliza com o dedo, encaixando foto por foto, como no Airbnb. Os pontinhos acompanham a foto atual. Rolar a página para cima e para baixo continua normal.
- **Tocar na foto** abre o imóvel, como hoje. Deslizar nunca abre o imóvel sem querer.
- **Computador:** continuam as setas ao passar o mouse, agora com a foto deslizando suave.
- **Faixas da Home (que já andam para o lado):** o dedo continua movendo a faixa, e as fotos trocam pelas setinhas, como no Airbnb. Assim não brigam dois movimentos para o lado.
- **Velocidade:** a 1ª foto continua igual e aparece na hora. As outras 4 são pedidas quando o card chega perto da tela e baixam em tamanho leve.

## Teste
- Celular em 360, 390 e 430 px: deslizar troca a foto, os pontinhos acompanham, o toque abre o imóvel e rolar a lista continua funcionando.
- Simulo o toque real com o dedo, não só clique do mouse.
- Computador em 1440 px: setas e mini card do mapa.
- O deslizar no iPhone de verdade fica para você conferir depois de publicar.

## Detalhes técnicos
- `FotosCard`: trocar a lógica de pointerdown/pointerup por um trilho `overflow-x:auto` + `scroll-snap-type:x mandatory` (`scroll-snap-stop:always`), com a 1ª foto original (children) como primeiro slide e as extras em `<img loading="lazy">`. O índice sai de `scrollLeft/clientWidth` (onscroll + rAF). As setas usam `scrollBy` com `behavior:'smooth'`.
- Imagens com `draggable={false}` e `-webkit-user-drag:none`, sem `-webkit-touch-callout`; o link envolve o trilho, então o toque abre o imóvel e um arraste horizontal não gera clique.
- Dentro de `.home-trilho`/`.gaveta-trilho`: trilho com `overflow-x:hidden` (só setas), para não disputar o arraste com a faixa.
- Esconder a barra de rolagem; manter `aspect` atual (sem pulo de layout).
- Teste unitário para o cálculo do índice a partir do scroll.
