# Busca completa ao abrir, cidade sem diferença de maiúsculas, mapa validado e destaque arredondado

## 1. Busca abre com todos os imóveis da primeira página
- Hoje a tela pronta entrega 4 imóveis para aparecer rápido, e o app fica com esses 4 até a pessoa rolar.
- Mudança: os 4 continuam aparecendo na hora (sem perder velocidade), e logo em seguida a lista completa da primeira página (40) carrega sozinha, sem pular a tela nem trocar as fotos já visíveis.

## 2. Cidade ignora maiúsculas e acentos
- "Xangri-lá", "xangri-la" e "Xangri-Lá" passam a trazer os mesmos 61 imóveis. Vale para todas as cidades e para a contagem.
- Validação: para Porto Alegre, Canoas, Capão da Canoa e Xangri-lá, o total do título = imóveis listados = contagem do mapa, em todas as grafias.

## 3. Destaque do card arredondado
- O contorno azul ao passar o mouse (ou ao destacar pelo mapa) vira arredondado, acompanhando o canto do card, com a sombra também arredondada.

## 4. Mapa validado ponta a ponta (desktop e celular 360/390/430)
- Abrir já enquadrado na cidade/bairro buscado; sem pins sumindo ao aproximar/afastar.
- Grupos (números) abrem aproximando; preços com pílula legível; pin do imóvel com mouse por cima do card fica escuro.
- Toque/clique no preço abre mini card com fotos deslizáveis, selo e "Ver imóvel"; clicar fora fecha; nunca fica escondido pela gaveta ou pelo topo (abre para baixo quando o preço está perto do topo).
- "Buscar ao mover" e "Buscar nessa região" atualizam lista e total; chip "Área do mapa" remove.
- Imóvel já visto fica em cinza.
- Celular: gaveta recolhe/meia/lista; aviso de cookies não cobre a gaveta.
- Corrigir tudo o que falhar e registrar capturas de cada ponto.

## Detalhes técnicos
- `SearchExperience.tsx`: `initialDataUpdatedAt: 0` na consulta principal para refazer logo após o molde de 4 cards (mantendo `keepPreviousData`).
- Migration em `busca_site`: trocar `c.cidade = p->>'cidade'` por `busca_normalizar(c.cidade) = busca_normalizar(p->>'cidade')` (e o mesmo nas listas de cidades e na contagem da categoria Canoas).
- CSS `.catalog-card-active`: trocar `outline` por `box-shadow` com `border-radius` do card.
- `SearchMap.tsx`: mini card inverte para baixo quando não há espaço acima; aviso de cookies sobe acima da gaveta no mapa móvel.
- Teste automático para a normalização de cidade.
