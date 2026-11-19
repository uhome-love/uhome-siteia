# Busca e Home: tirar a tela de abertura da frente da foto pronta

## O que os relatórios novos mostram (celular)
- Home: maior elemento 10,0 s → 5,4 s; pulo 0,03 → 0; agora a foto chega cedo (espera 0,18 s), mas fica 1,1 s pronta sem aparecer.
- Busca: foto baixa em 0,3 s, mas fica 2,1 s pronta sem aparecer; maior elemento de laboratório 14,2 s.
- Computador: Home 1,1 s e busca 1,3 s (bons). Busca no computador tem 636 ms de travamento (TBT).

## Causa
A tela de abertura (logo Uhome com barrinha) aparece por cima de tudo 0,3 s depois de abrir e só sai quando todo o código do site termina de carregar. A primeira tela pronta, que já tem a foto, fica escondida atrás dela esse tempo todo.

## O que vou fazer
1. Quando a página chega com a primeira tela pronta (busca, Home e páginas de produto), a tela de abertura não aparece.
2. Essa primeira tela fica invisível só até o visual do site (arquivo de estilos, ~36 KB) carregar, e então aparece com a foto — sem esperar o resto do código. Evita mostrar a página sem estilo.
3. Sem primeira tela pronta, tudo continua como hoje (tela de abertura).
4. Conferir com Playwright em 390 px: foto visível antes do código principal, sem piscar e sem pular; depois publicar e você mede de novo.

## Fora do escopo (próxima rodada, se quiser)
- Travamento de 636 ms na busca do computador e os ~260 KB de código não usado.

## Detalhes técnicos
- `index.html`, script de parser após `#root`: se `#uh-pre` existir, `#uh-splash` recebe `display:none` e `#uh-pre` fica `visibility:hidden` até `link[data-uh-css]` disparar load/error (ou já ter `sheet`), com limite de 2,5 s.
- `main.tsx` continua removendo o splash; nenhuma mudança na troca pre→app.
