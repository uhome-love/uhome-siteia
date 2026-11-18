# Mapa no padrão Airbnb, teste de todos os botões e anúncios do Google

## Parte 1: o que falta no mapa
1. **Pontinhos em forma de pílula pequena**, iguais aos do Airbnb, no lugar das bolinhas redondas. Ao tocar num pontinho, o mapa aproxima até aparecer o preço.
2. **Destaque ao passar o mouse num card da lista:** o preço dele no mapa fica escuro, um pouco maior e vai para a frente. O preço tocado continua escuro, e o de imóvel já visto fica cinza.
3. **Card do preço:** fotos com setas e pontinhos, coração para salvar, X para fechar, cantos de 16 px e sombra suave. No celular ele fica preso na parte de baixo da tela, como no Airbnb.
4. **Barra fina de carregamento** no topo do mapa enquanto a busca atualiza depois de arrastar.
5. **Celular:** a gaveta passa a ter três posições (mapa inteiro, metade e lista), com o botão "Mapa" flutuante na lista. O mapa fica com o mesmo fundo claro e os mesmos botões do computador.
6. **Tela de carregamento da Home** com o novo espaçamento da busca, para a página não pular ao abrir.
7. **Testes** em 360, 390, 430 e 1440 px, em Porto Alegre e no Litoral: arrastar, aproximar, ampliar, tocar no preço, salvar e voltar à lista.

## Parte 2: testar todos os botões do site
- Percorrer automaticamente, no computador e no celular: Home, busca, imóvel, Lançamentos, Em Foco, campanha, Favoritos, cidade e bairro, Anunciar, Sobre, Condomínios, menu e rodapé.
- Para cada botão e link, confirmar se abre a página certa, se não dá erro e se o WhatsApp abre com a mensagem certa.
- Os formulários são abertos e conferidos, mas não enviados, para não criar contatos falsos no CRM.
- Tudo o que falhar é corrigido, e entrego uma lista com o que foi testado.

## Parte 3: anúncios do Google para o visual novo
- Ler a conta do Google Ads: campanhas, anúncios, textos, páginas de destino e imagens atuais. Só leitura, nada é alterado.
- Conferir se cada página de destino ainda abre e combina com o anúncio.
- Montar uma proposta com textos novos, páginas de destino (Home, busca filtrada, imóvel, Em Foco) e imagens no visual novo, seguindo as regras: sem MCMV, preço baixo ou FGTS, e só venda.
- Mostrar a proposta para aprovação. Nenhum anúncio é alterado sem o seu ok.

## Detalhes técnicos
- `SearchMap`: imagem `pin-dot` (mini pílula) numa camada `symbol` sob `imoveis-pins`. `setFilter` da camada de destaque passa a responder ao `hoveredId` da lista. O mini card é refeito com `FotosCard`, `SalvarNaPasta` e um botão de fechar, e no celular usa `fixed bottom`. A barra de progresso aparece quando `isFetching` vem da busca.
- `GavetaMapa`: alturas de encaixe 15%, 50% e 92%.
- Molde da Home no `site-dobra`: mesmo padding (12 px embaixo do topo, 80 px na fileira de categorias).
- Crawler Playwright em `/tmp/browser/botoes`, rodado por página para caber no limite de tempo, com saída em JSON resumido.
- Google Ads: só `google_ads--search` (GAQL). Mudanças apenas via `google_ads--mutate` depois da aprovação.
