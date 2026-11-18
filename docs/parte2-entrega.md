# Parte 2 — páginas em-foco

## Aplicado
- Todos os produtos usam galeria desktop 1+4 e carrossel 4:3 mobile com contador/compartilhar/salvar; material em tela cheia com Radix, teclado, swipe, legenda, retorno de foco e CTA de visita.
- Título baseado na ficha, nome/construtora, situação da obra e campanha; números, destaques, descrição, plantas, comodidades, obra, mapa oficial e Google Maps por endereço, FAQ e produtos do mesmo tipo/faixa aproximada.
- Card desktop sticky com cinco dias sem domingo, próximo sábado selecionado, manhã/tarde. Datas por dia de São Paulo. Modal compartilhado com planta/dia/período, telefone, financiamento ou assunto.
- WhatsApp mobile preserva waUrl, target, aria-label e trackProdutoWhatsApp. Lia mobile oculta sobre barra de ação, continua na navegação inferior. Cookies acima da barra.
- Favoritos de produtos guardados localmente e exibidos em Favoritos; não muda favoritos de imóveis.

## Funções implantadas
- site-dobra: molde foco-v2 gerado a partir do app; selecionado apenas por site-v2. site-v1 segue usando o molde anterior e demais páginas continuam usando seus modelos atuais. Seed do produto evita nova espera por dados. CSS da troca permanece inline. Worker não mudou.
- ssr-render: mesmo helper de título usado pelo app, foto de capa direta e FAQ JSON-LD. Verificado HTTP 200 e capa dos três produtos.
- Ajuste pré-publicação: classificação pela oferta principal em tipo/segmento, incluindo lotes, sobrados, casas, studios, apartamentos e coberturas. Essence: Lotes em condomínio clube no São José. Dez prévias e páginas conferidas com nome · título | Uhome, sem slogan. Override opcional em ficha.titulo_manual (apenas o título descritivo, sem nome/marca); vazio usa cálculo automático. site-dobra redeployada pelo helper, site-v1 verificado intacto.

## Conferido
- Arvoredo, Bosque e Orygem em 390/1440; todos os outros produtos abrem.
- Tela pronta real injetada na prévia: root no topo, um h1 visível, sem rolagem lateral, sem erros; teclado/legenda, foco no abridor e planta escolhida no formulário.
- 23 testes passaram; persistência e confirmação testadas com transportes simulados, nenhuma submissão válida em produção.
- Local não simulado: LCP Arvoredo 0,696 s/Bosque 0,156 s/Orygem 0,140 s; CLS 0,026/0,040/0,060. Não substituem Lighthouse oficial; meta 2,5 s depende de publicação e medição brasileira.

## Limitações e publicação
- Publicar o app para ativar site-v2. Central realiza pedidos de teste e medição oficial.
- Gancho vem dos dados reais disponíveis; não há campo específico de gancho por anúncio no catálogo atual. Vídeo aparece apenas quando um vídeo real existir na mídia do produto. Mapa oficial mantém os pontos do material; mapa navegável usa endereço, sem inventar coordenadas de pontos próximos.
- Algumas tipologias não têm preço associado inequívoco ou planta específica: ficam sob consulta, sem aplicar preço de outra unidade.