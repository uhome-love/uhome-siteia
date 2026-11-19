# Busca: título, mapa, mais imóveis na abertura + custo por lead

## 1. Título da busca (sem cidade escolhida)
- Hoje a busca sem filtro diz "Mais de 1.000 imóveis à venda em Porto Alegre", mas mostra também Canoas, Gravataí etc.
- Novo título, no estilo do Airbnb: **"Mais de mil imóveis"**, menor e sem cidade. Quando a pessoa escolhe uma cidade, ele continua com a cidade ("312 imóveis em Canoas"). Com tipo: "435 studios em Porto Alegre".
- Fonte menor (cerca de 20 px no computador e 18 px no celular), semibold e não extra-negrito.
- "Nenhum imóvel" e a contagem da área do mapa seguem a mesma regra.

## 2. Mapa mais rápido
- O mapa só começa a baixar depois que a lista aparece, e por isso demora.
- Ele vai passar a baixar em segundo plano logo depois que as primeiras fotos aparecem, no computador e quando o celular está parado. Assim, quando a pessoa olha ou toca em "Mostrar mapa", ele já está pronto.
- Os pinos aproveitam os dados que a lista já trouxe, sem esperar uma segunda busca.
- Enquanto carrega, aparece um mapa-fantasma claro com a forma da região, e não um círculo girando.

## 3. Mais imóveis ao abrir
- Hoje abrem 4 imóveis e o resto vem ao rolar. Isso foi feito para acelerar o celular.
- No computador vão abrir **12 imóveis** de uma vez, com as 4 primeiras fotos com prioridade e as outras logo em seguida. No celular abrem **6**, o suficiente para encher a tela e mais um pouco. Ao rolar, vêm 12 por vez, antes de a pessoa chegar ao fim.

## 4. Qualidade (PageSpeed)
- Não consigo abrir os relatórios do PageSpeed por aqui. Vou medir pelos visitantes reais (LCP, INP e CLS do celular e do computador) antes e depois dessas mudanças, e conferir que as fotos e o mapa extras não pioram a primeira tela.

## 5. Custo por lead de R$ 30 a R$ 40
- Vou guardar como regra: **o lead pode custar no máximo R$ 30–40.** Hoje está em cerca de R$ 207, e Studios está sem nenhum.
- Por isso não aumento verba. Os grupos novos por ícone já foram criados.
- Quando a conta tiver pelo menos 15 leads em 30 dias, trocar a estratégia de "mais cliques" para **"custo por lead alvo" de R$ 35**. Antes disso, o Google não tem dados suficientes e a troca derruba a entrega.
- O valor de cada conversão (formulário R$ 50, visita R$ 100) continua o mesmo, porque ele serve para medir e não muda o custo.

## Detalhes técnicos
- `tituloBuscaComTotal(count, cidade?)`: sem cidade, retorna "Mais de mil imóveis" ou "N imóveis", sem "à venda em". Atualizar os testes de homeVitrine e comTipo. `comTipo` continua trocando "imóveis" pelo tipo.
- `SearchExperience`: lote inicial pela largura da tela (12 a partir de 1024 px, 6 abaixo), lote do scroll 12, rootMargin 1200px. `FotoCatalogo` com prioridade alta nas 4 primeiras.
- Mapa: `import('@/components/SearchMap')` + pré-carregar mapbox-gl em `requestIdleCallback` após o LCP. Fallback com a classe `.mapa-fantasma`.
- Memória: custo máximo por lead R$ 30–40.
