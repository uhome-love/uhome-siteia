# Busca e mapa no padrão Airbnb: validação final e acabamento

## 1. Validação dos filtros com combinações reais (antes de publicar)
- Rodar cerca de 60 combinações reais (cidade + bairro + tipo + preço + quartos + vagas + área + etapa + comodidades, rua + filtros, garden + pátio, pet + piscina etc.).
- Para cada uma, comparar três números: o botão "Mostrar N" do painel, o total no título da página de resultados e a contagem direta no banco. Conferir também, um por um, se cada imóvel listado cumpre a regra.
- Corrigir qualquer diferença encontrada e mandar o relatório final com cada combinação.

## 2. Buscar sem filtro
- Apertar **Buscar** com a pílula vazia abre todos os imóveis (todas as cidades, todos os tipos), sem cidade nem filtros escondidos aplicados.

## 2b. Faixa de preço no padrão Airbnb
- Histograma com barras finas e arredondadas: as barras dentro da faixa ficam escuras e as de fora cinza-claro, mudando enquanto a pessoa arrasta.
- Pontas brancas redondas (32 px) com sombra suave, que crescem levemente ao segurar. A linha escura fica só entre as duas pontas, e a ponta ativa fica acima da outra.
- Arraste fluido no dedo e no mouse. Passos menores até R$ 1 mi (R$ 10 mil) e maiores acima disso, para ajustar com precisão onde há mais imóveis.
- Campos "Mínimo" e "Máximo" em cápsulas, que se atualizam ao vivo e aceitam digitação. O máximo no fim da faixa mostra "R$ 3 mi+".
- Contagem "Mostrar N imóveis" atualizando enquanto a pessoa arrasta, sem travar.
- Teclado: setas movem a ponta, e Home/End levam ao início ou ao fim.

## 3. Pílula que encolhe ao rolar e setas nas categorias
- **Computador:** ao rolar a página, a pílula grande vira uma pílula compacta no topo ("Qualquer lugar · Qualquer tipo · Qualquer valor"). Clicar nela abre de novo a pílula grande no campo escolhido. A transição é suave, sem a página pular.
- **Celular:** a barra de busca do topo fica fixa e mais baixa ao rolar. As categorias somem com suavidade e voltam ao subir.
- **Faixa de categorias:** setas redondas à esquerda e à direita aparecem só quando há mais ícones para ver, com um esfumado na borda. No celular a faixa continua rolando com o dedo.

## 4. Mapa
- **Já vistos:** a etiqueta de preço fica cinza para imóveis que a pessoa já abriu.
- **Mini card:** tocar ou clicar no preço abre um card com fotos que passam (setas e pontinhos), preço, quartos, área e bairro, com botão de favorito. Clicar fora fecha o card.
- **Gaveta no celular:** o mapa fica atrás e a lista sobe numa gaveta que se arrasta com o dedo em três alturas (só o título "N imóveis", metade da tela, lista inteira). A lista e o mapa mostram os mesmos imóveis.
- Hover no card do computador escurece a etiqueta no mapa (já existe, vou reconferir).

## 5. Imagens dos bairros no estilo 3D
- As 6 fotos de bairros em desenho (Moinhos, Petrópolis, Bela Vista, Auxiliadora, Três Figueiras, Menino Deus) e as 5 fotos de banco de imagens serão refeitas no mesmo estilo 3D dos ícones de categoria: miniatura 3D suave, cores da Uhome e um marco de cada bairro (Parcão, Germânia, PUCRS, Iguatemi, orla do Guaíba).
- Versões leves (WebP) para não pesar a Home.
- O texto dos cartões continua o mesmo.

## 6. Revisão completa no padrão Airbnb
Percorrer etapa por etapa no computador (1440) e no celular (390): Home → pílula → cada campo → resultados → mapa → card com fotos → página do imóvel → favoritos. Ajustar espaçamentos, sombras, cantos, estados de foco e carregamento, e animações onde destoarem. Mandar os prints de antes e depois.

## Detalhes técnicos
- `PilulaBusca`: `aplicar` sem filtros limpa `cidade` e qualquer valor herdado. Modo compacto via IntersectionObserver na pílula + classe no header, `transform`/`opacity` apenas (sem CLS).
- Categorias: setas com `scrollBy`, visibilidade por `scroll` + ResizeObserver.
- Mapa: `visto` vem do `imoveis_vistos`. O popup passa a abrir no clique ou toque do pin (hoje é só hover) e usa `FotosCard`. A gaveta usa pointer events com três alturas fixas e `touch-action` controlado.
- Imagens: `lovable image generate`, convertidas para WebP card/original em `public/images/`, mantendo os nomes de arquivo para não quebrar a tela pronta.
- Slider: escala não linear (mapeamento valor↔posição), barras do histograma ligadas à mesma escala, `requestAnimationFrame` no arraste.
- Validação: script com combinações → busca_site × SQL direto × Playwright (botão vs título).
