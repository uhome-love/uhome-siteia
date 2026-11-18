# Busca mais leve, faixa de preço azul e site mais rápido

## Minha avaliação do print
A busca no topo é o caminho certo, mas ficou grande. Três pontos pesam:
- **Busca do topo alta demais.** Na página de resultados, o Airbnb usa uma pílula de uma linha só, com cerca de 48 px. A nossa tem duas linhas (rótulo e valor), e isso empurra tudo para baixo.
- **Categorias altas.** Os ícones e os nomes ocupam quase 140 px. No Airbnb essa faixa é mais baixa e discreta.
- **Cards enormes.** Em telas largas ficam 2 cards por linha, com foto de mais de 500 px. O Airbnb mostra 3 cards menores ao lado do mapa.

Não proponho voltar ao que era antes, e sim manter o novo formato mais compacto.

## 1. Topo compacto nos resultados
- A busca do topo vira uma linha só: "Porto Alegre · Qualquer tipo · Qualquer valor" e a lupa azul, com cerca de 48 px.
- Clicar em uma parte abre a busca completa, já no campo clicado.
- A faixa de categorias fica mais baixa: ícone de 28 px, nome menor, cerca de 76 px de altura.
- A seta lateral e o botão Filtros continuam no mesmo lugar.
- Cards: 3 por linha a partir de 1280 px, 2 em telas menores, com foto um pouco menos alta.
- Na Home, a busca grande continua como está.

## 2. Faixa de preço azul, padrão Airbnb, com movimento
- As barras dentro da faixa escolhida ficam azul Uhome e as de fora, cinza claro. A linha entre as pontas também fica azul.
- As barras passam a ter a mesma largura e ficam mais finas. Hoje o começo tem barras largas e o fim barras estreitas, o que parece irregular.
- Movimento: ao arrastar, as barras mudam de cor com transição suave e a ponta cresce levemente. Os números de Mínimo e Máximo acompanham o arraste.
- As pontas ficam brancas, com sombra e borda fina.

## 3. Site liso e rápido
- **Fotos dos cards:** a próxima foto do slider carrega assim que o mouse passa sobre o card ou o dedo toca nele, então ela aparece na hora ao avançar. A troca usa um deslize suave.
- **Rolagem:** conferir travadas na lista, no mapa e na faixa de categorias, e corrigir o que aparecer na medição.
- **Medição:** desempenho em celular e computador na Home, na busca e na página do imóvel, mais os dados reais dos visitantes. Metas: foto principal em até 2,5 s, a tela não pular (CLS abaixo de 0,1) e resposta ao toque em até 200 ms.

## 4. Testes pendentes no celular e no computador
- Setas das categorias, busca compacta ao rolar e faixa de preço: arrastar, digitar e conferir se o número de "Mostrar N" bate com o resultado.
- Mapa: etiqueta cinza nos imóveis já vistos, mini card com fotos ao clicar no preço e gaveta arrastável no celular.
- Bairros: conferir os cartões com ícone no computador.
- Corrigir tudo o que falhar, com prints.

## Detalhes técnicos
- `Navbar.tsx`: nas páginas de busca, usar a pílula curta `.pilula-compacta` (já existe), que dispara `uhome:pilula-abrir`. O painel de campo ancora abaixo do topo. `PilulaBusca` não é mais montada no topo.
- CSS: `.search-categories` com min-height de cerca de 76 px e ícone de 28 px. A grade de cards usa `grid-template-columns: repeat(3, 1fr)` a partir de 1280 px.
- Faixa de preço em `SearchFilterDialog.tsx`: histograma com caixas de largura igual na escala do controle; cor `hsl(var(--primary))` dentro da faixa e `--muted` fora; `transition: background-color .2s, height .2s`.
- `FotosCard`: pré-carregar a foto seguinte com `new Image()` em pointerenter e touchstart, e a anterior depois de avançar; transição com `transform` para usar a GPU.
- Medição: Playwright com rede limitada, PerformanceObserver para LCP, CLS e tarefas longas, mais a consulta de `web_vitals`. site-dobra só muda se o molde depender do topo; o Worker não é tocado.
