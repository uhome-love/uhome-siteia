# Home no celular: primeira tela pronta (passo 3)

## Evolução no celular (laboratório, maior elemento)
10,0 s → 5,4 s → 4,6 s. Pulo da página 0,03 (bom). No computador: 1,1 s (bom, nada a fazer agora).

O que sobra no celular:
- A foto chega em ~0,9 s, mas só aparece ~1 s depois, porque o card só é desenhado quando todo o código do site termina de carregar.
- 260 KB de código não usado na primeira tela.

## O que vou fazer
1. Primeira tela pronta da Home nova (como a busca já tem): o servidor manda pronto no HTML o topo do celular, "Você e seu novo lar.", a pílula de busca, os ícones 3D e o 1º card de "Novos no site" com a foto. Atualizada a cada 3 min junto com o que já existe.
2. Gerada a partir da Home real renderizada, para ficar idêntica; a troca para a Home de verdade acontece no mesmo quadro, sem piscar e sem pular (mesmo mecanismo da busca).
3. Só no celular (até 1023 px) e só para quem tem a versão nova do site; versões antigas descartam a prévia sozinhas.
4. Sem a tela de abertura por cima (já resolvido na rodada anterior).
5. Conferir com Playwright em 390 px: foto visível antes do código principal, sem piscar, sem pulo; tocar na pílula e nos ícones funciona logo após a troca. Depois você publica e mede.

## Fora do escopo
- Cortar os 260 KB de código não usado (rodada separada, mexe no início de todo o site).
- Visual da Home não muda.

## Detalhes técnicos
- `site-dobra`: `calcularHome` gera `preV3` para lar-1 com `data-uh-alvo=".home-fileira .catalog-photo img"` e `data-uh-max="1023"`, foto via `fotoCardApp`; protegido por `meta uh-home-layout=lar-1` (o script `lar` passa a remover só o molde antigo).
- Molde extraído do DOM renderizado em 390 px (`moldes-home-v1.ts`), placeholders para título/preço/foto/bairro.
- App: `HomeVitrine` já usa `__UH_HOME_NOVOS__`; garantir mesma URL/dimensões da foto do 1º card.
- Deploy `site-dobra` + teste de paridade (molde × card do app).
