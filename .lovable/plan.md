# Mapa igual ao Airbnb + teste de todos os botões + preparar anúncios do Google

## Parte 1 — Mapa no padrão Airbnb
- **Preços em vez de bolinhas com números:** cada imóvel aparece como preço branco. Onde os preços se sobrepõem, os que não cabem viram um pontinho pequeno, sem números de agrupamento. Ao aproximar o mapa, os pontinhos viram preços.
- **Destaques do preço:** ao passar o mouse num card da lista, o preço daquele imóvel fica escuro, um pouco maior e por cima dos outros. O preço tocado fica escuro e o preço de imóvel já visto fica cinza.
- **Card do preço:** fotos com setas e pontinhos, coração de favorito e um "X" para fechar. Preço, quartos, área, bairro e selo, com cantos de 16 px e sombra suave. No celular, o card aparece fixo embaixo da tela, acima da lista, como no Airbnb.
- **Botões do mapa:** os botões + e − ficam juntos num bloco branco arredondado com sombra. Entra também um botão para abrir o mapa em tela cheia no computador, escondendo a lista.
- **Busca ao mover:** fica sempre ligada, com o título "na área do mapa" e uma barra fina de carregamento no topo do mapa enquanto atualiza.
- **Celular:** a gaveta passa a ter três posições (mapa inteiro, metade, lista). Um botão "Mapa" flutuante fica na lista, com transições suaves.
- Teste em 360, 390 e 430 px e no computador, com capturas comparando com o Airbnb.

## Parte 2 — Testar todos os botões do site
- Percorro com um navegador automático a página inicial, a busca, a página do imóvel, Lançamentos, Em Foco, Favoritos, as páginas de bairro e cidade, Anunciar e o rodapé. Faço isso no celular e no computador.
- Clico em cada botão e link e confiro:
  - se abre a página certa;
  - se aparece algum erro na tela;
  - se algum link está quebrado;
  - se os botões de WhatsApp abrem.
- Sem enviar formulários de verdade: os contatos de teste ficam bloqueados, como já é a regra do site.
- Corrijo o que falhar e entrego uma lista do que foi testado.

## Parte 3 — Preparar os anúncios do Google
- Levanto as campanhas e anúncios atuais no Google Ads e listo quais páginas cada anúncio abre.
- Monto uma proposta com textos, páginas de destino e imagens para o visual novo, seguindo as regras já combinadas: sem citar Minha Casa Minha Vida, preço baixo ou FGTS, e só venda.
- Nenhum anúncio é alterado sem a sua aprovação.

## Detalhes técnicos
- `SearchMap.tsx`: remover as camadas `clusters`/`cluster-count`. Usar `cluster:false` com `symbol-sort-key` por preço, `icon-allow-overlap:false` e uma camada de pontinhos (`circle`) que aparece por baixo dos preços. Estado `feature-state` para destaque e visto. O card no celular vira uma folha fixa embaixo.
- Teste de botões com Playwright: um script que rastreia os links de cada página e registra status, erros da página e destino. Os envios de formulário ficam interceptados.
- Google Ads: leitura pelas ferramentas de Google Ads. As mudanças só entram depois da sua aprovação.
