# Celular nível Airbnb: topo, filtros e revisão completa

## 1. Tirar de vez Imóveis / Lançamentos / Investir do topo
- No celular e tablet as abas deixam de existir (hoje só ficam escondidas, e o print mostra que ainda aparecem no site publicado).
- O topo fica igual ao Airbnb: logo, pílula "Onde vai ser seu novo lar?" e botão de filtros.
- Lançamentos e Investir continuam acessíveis pelos ícones de categoria e pelo menu.
- Depois de aprovar, será preciso **publicar** para sumir no uhome.com.br.

## 2. Filtro abre na hora, sem trocar de página
- Hoje o botão de filtros na Home leva para a busca e só depois abre o painel.
- Novo: o painel de filtros abre por cima da Home, como no Airbnb (folha que sobe de baixo, cantos arredondados, X no topo).
- Embaixo: "Limpar tudo" e botão "Mostrar N imóveis" com a contagem real; só ao tocar nele vai para a busca já filtrada.
- Mesmo comportamento na pílula "Onde vai ser seu novo lar?": abre a busca em etapas (Onde? / Tipo / Preço) por cima da página, com buscas recentes e cidades sugeridas.

## 3. Acabamento dos filtros no padrão Airbnb
- Título "Filtros" fixo no topo ao rolar, seções separadas por linha fina.
- "Recomendado para você" com 3 cartões grandes com ícone 3D (ex.: Lançamentos, Com vaga, Pronto para morar).
- Quartos, banheiros e vagas com botões − / + redondos.
- Preço com histograma azul Uhome, duas bolinhas grandes e caixas "Mínimo / Máximo".
- Comodidades em pílulas com ícone e "Mostrar mais".

## 4. Revisão ponta a ponta (360, 390, 430 e 1440 px)
- Home, busca, todos os filtros (cada um aplicado e conferido na contagem), mapa, página do imóvel, Natal, Em Foco, Favoritos.
- Todo botão e link clicado; corrijo o que falhar.
- No final, relatório do que passou, do que corrigi e do que não dá para testar aqui (ex.: comportamento exclusivo do iPhone, envio real de lead).

## Detalhes técnicos
- Navbar: remover o bloco `uhs-mobile-tabs` abaixo de 1024px no JSX (não só CSS).
- Botão de filtros e pílula fora da busca: abrir `SearchFilterDialog` / busca em etapas localmente como Sheet (bottom, rounded-t-3xl); contagem via `busca_site`; "Mostrar" navega para `/busca?...` com os filtros.
- Remover dependência de `?filtros=1` como fluxo principal (mantido só como compatibilidade de link).
- Testes Playwright por largura; testes unitários existentes rodados ao final.
