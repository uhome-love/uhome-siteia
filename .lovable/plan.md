# Fotos do card passando com o dedo também no iPhone

## O que vi
- No motor do Safari, o card monta as 5 fotos lado a lado e a fileira consegue andar. Nada fica por cima da foto bloqueando o toque.
- No Chrome com toque simulado, o deslize funciona. No seu iPhone continua travado na 1ª foto. Então o iPhone não está tratando o arraste para o lado como rolagem da fileira, e só confiar no deslize natural do navegador não basta.

## O que muda
- **Deslize garantido no iPhone:** o card passa a acompanhar o próprio dedo. Ao arrastar para o lado mais de um pouquinho, a foto anda junto. Ao soltar, encaixa na próxima ou na anterior, conforme o lado e a força do gesto.
- **Rolar a lista continua normal:** se o gesto for mais para cima ou para baixo, o card não mexe e a página rola.
- **Toque continua abrindo o imóvel.** Depois de um deslize, o toque final não abre a página sem querer.
- **Pontinhos** acompanham a foto atual. No computador, as setas continuam iguais.
- **Faixas da Home** ficam como estão: o dedo move a faixa e as setinhas trocam a foto.

## Teste
- Motor do Safari em iPhone 13 e no Chrome celular, com gestos de dedo simulados: arrastar para a esquerda e para a direita, arrastar na vertical (a lista deve rolar) e tocar (deve abrir o imóvel).
- Testes do projeto e um teste novo para a regra "arraste mais para o lado que para baixo = trocar foto".
- Depois, peço para você conferir no iPhone de verdade. Antes, feche e abra a prévia de novo, para não pegar a versão antiga guardada.

## Detalhes técnicos
- Em `FotosCard`, adicionar listeners nativos `touchstart`/`touchmove`/`touchend` no trilho. O `touchmove` não é passivo, para poder chamar `preventDefault` só após travar o eixo horizontal (|dx| > 8 e |dx| > |dy|). Assim o iOS não toma o gesto para a rolagem da página.
- Durante o arraste: `scrollLeft = base - dx` com `scroll-snap-type` desligado temporariamente (`data-arrastando`). No `touchend`: decidir o índice por distância (> 20% da largura) ou velocidade, `scrollTo({behavior:'smooth'})` e religar o snap.
- Marcar `bloqueia` para cancelar o clique do link depois de um arraste.
- Função pura `decidirFoto(dx, dy, largura, vel, i, total)` em `fotosIndice.ts`, com teste.
- Desligado dentro de `.home-trilho`/`.gaveta-trilho`.
