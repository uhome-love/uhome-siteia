# Celular: faixas que deslizam, fotos, filtros de tipo e preço

## O que está errado
1. **Bairros sobem e descem ao arrastar:** cada card de bairro entra com uma animação de baixo para cima quando aparece. Ao arrastar para o lado, os próximos cards vão entrando e "pulam". O card também é cortado embaixo, porque a faixa não deixa espaço para a sombra.
2. **Faixas de imóveis não deslizam (Novos no site, Até R$ 700 mil...):** a foto ocupa quase todo o card e está configurada para pegar o arraste lateral, para trocar de foto. Assim a faixa não desliza.
3. **Prévia de fotos não troca:** no primeiro toque as fotos extras ainda não chegaram, então o arraste não faz nada.
4. **Só um tipo nos filtros:** o painel aceita um tipo por vez.
5. **Preço:** no celular, a bolinha do valor máximo não responde.
6. **Bela Vista "a partir de R$ 175":** um valor errado entra no "a partir de".

## O que vou fazer (padrão Airbnb)
- **Faixas da Home (bairros e imóveis):**
  - deslizam livres com o dedo, encaixando card a card, sem pulos e sem cortes;
  - a animação de entrada some na faixa.
- **Prévia de fotos dentro das faixas da Home:**
  - setas pequenas na foto (tocar troca a foto) e pontinhos;
  - o arraste lateral fica para a faixa, como no Airbnb.
- **Prévia de fotos na busca (lista vertical):**
  - arrastar troca as fotos;
  - as fotos começam a carregar quando o card aparece, então o primeiro arraste já funciona.
- **Filtro de tipo:**
  - escolher vários tipos ao mesmo tempo (ex.: apartamento + cobertura);
  - os números se somam e o chip mostra "Apartamento, Cobertura".
- **Preço:** as duas bolinhas se arrastam no celular e no computador. O valor máximo também pode ser puxado para baixo.
- **"A partir de" dos bairros:** ignora valores irreais (abaixo de R$ 50 mil).

## Validação (celular 360/390/430 e computador 1440)
- **Home:**
  - arrastar cada faixa;
  - trocar fotos pelas setas;
  - tocar em cada categoria, bairro e "Ver todos".
- **Busca:**
  - abrir os filtros e testar cada seção: onde, tipo (vários), preço com as duas bolinhas, quartos, área, etapa, comodidades;
  - conferir que a contagem do botão "Mostrar" bate com o resultado;
  - limpar filtros e testar cada chip;
  - ordenar;
  - "Mostrar mais".
- **Mapa e página do imóvel:** abrir pela lista, voltar, salvar nos favoritos.
- Corrijo o que falhar e mostro as fotos de cada tela.

## Detalhes técnicos
- `FeaturedNeighborhoods`:
  - tirar o `whileInView` com `y` dos itens da faixa no celular;
  - `py-2` na faixa para a sombra;
  - `aPartir` com `preco >= 50000`.
- `.fotos-card`:
  - `touch-action: pan-y` e o swipe só na busca vertical, via prop `arrastar`;
  - nas faixas (`.home-trilho`), `touch-action: auto`, só setas e pontos.
- `FotosCard`: pré-carregar com IntersectionObserver; no `pointerup` com fotos ainda carregando, aguardar a promise e avançar.
- `SearchFilterDialog` tipo:
  - `draft.tipo` vira uma lista separada por vírgula (toggle);
  - conferir que `busca_site` aceita lista em `tipo`; se não aceitar, migration para `= ANY(string_to_array(...))`.
- Slider: testar o thumb máximo com toque no Playwright. Prováveis ajustes:
  - área de toque de 44 px;
  - remover o `margin` negativo que corta a borda;
  - `minStepsBetweenThumbs` sem prender o máximo.
