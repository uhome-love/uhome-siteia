# Mapa, abertura do imóvel, título e calendário — padrão Airbnb

## O que foi encontrado no código
- Os pins do mapa só são pedidos para a área visível atual. Ao buscar "Capão", o mapa continua em Porto Alegre e não se move até a cidade buscada (não há enquadramento automático na página de busca nova).
- "Buscar nessa região" só muda os pins; a lista de imóveis e o total não mudam. No celular o botão nem está ligado.
- A cada aproximação o mapa refaz o pedido e fica um instante sem dados — por isso os pins "somem" ao dar zoom.

## 1. Mapa refeito ponta a ponta
- Ao buscar cidade/bairro/rua: o mapa voa até os imóveis encontrados (Capão, Canoas, Serra etc.).
- Pins nunca somem: mantém os anteriores enquanto chegam os novos, sem piscar; agrupamentos suaves até o zoom de rua.
- "Buscar nessa região": filtra a lista, os cards e o total pela área do mapa, com chip "Área do mapa" para remover; também no celular.
- Opção "Atualizar ao mover o mapa" (como Airbnb), ligada por padrão no computador.
- Etiqueta de preço branca; selecionada em grafite; vista em cinza; mini card com fotos ao tocar.
- Celular: gaveta arrastável com total certo da área.
- Movimento leve: sem recarregar o mapa inteiro em cada filtro, pedidos antigos cancelados.

## 2. Abrir imóvel sem atraso
- Pré-carregar a página de detalhes e os dados do imóvel quando o mouse passa ou o dedo toca no card; mostrar a primeira foto já conhecida imediatamente.

## 3. Título do imóvel com respiro
- Mais espaço entre topo, título e fotos (cerca de 24–32 px), título ~26 px no computador e ~22 px no celular, como Airbnb.

## 4. Calendário de visita
- Trocar os botões de dia por um calendário mensal bonito (dois meses no computador, um no celular), dias passados desativados, dia escolhido em azul Uhome com transição suave, depois horários em chips e resumo da visita. Mesmo envio de agendamento de hoje (nada muda no CRM).

## 5. Botão Filtros da Home
- Na Home, o botão "Filtros" abre o painel completo de filtros em vez da busca; ao aplicar, leva aos resultados já filtrados.

## 6. Página do imóvel: local e comodidades
- Celular: mostrar bairro e cidade uma vez só (sem repetir no título, subtítulo e breadcrumb), conferido em 360, 390 e 430 px e no computador.
- Comodidades: exibir as cadastradas no anúncio (lista normalizada do imóvel + diferenciais), com ícones em duas colunas e "Mostrar todas"; conferir com imóveis reais do banco.

## 7. Validação antes de entregar
Teste no navegador (computador e celular): Filtros da Home abrindo o painel; buscar Capão e Canoas e ver o mapa ir até lá; dar zoom e arrastar sem pins sumirem; "Buscar nessa região" mudando lista e total; mini card, etiqueta cinza e gaveta; tempo de abertura do imóvel; título; escolher dia e horário no calendário. Sem enviar lead de teste. Só aviso como pronto com tudo isso conferido.

## Detalhes técnicos
- `SearchExperience.tsx`: `placeholderData: keepPreviousData` nos pins; `bounds` de busca separado do `bounds` de visualização e aplicado em `buscarSite` da lista/contagem; `fitToPins` quando houver cidade/bairro/q; ligar `onBoundsSearch` no celular.
- `SearchMap.tsx`: `setData` incremental sem recriar camadas, debounce de moveend, flag de movimento programático, toggle de auto-busca, `clusterMaxZoom` revisado.
- `CatalogCard`: prefetch de rota (lazyRetry) e do serviço de detalhe no hover/touchstart.
- Calendário: componente shadcn `Calendar` estilizado em `AgendamentoVisita.tsx`/`FocoVisitCard.tsx` mantendo `submitLead`/`agendamentos`.
- Worker não é alterado.
