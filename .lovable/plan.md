# Uhome: máquina de leads (LIA + Google Ads + Google orgânico)

Trabalho em 4 etapas. Cada etapa é entregue e testada antes da próxima. Busca, mapa, sincronização e páginas de Natal continuam funcionando.

## Etapa 1 — LIA no lugar do WhatsApp
- O botão flutuante passa a ser a **LIA**, com foto/avatar e o texto "Fale com a LIA".
- Ao abrir: uma conversa no próprio site com a LIA, além do botão "Continuar no WhatsApp", que abre o WhatsApp oficial da LIA com a mensagem e o imóvel já preenchidos.
- A LIA recebe o contexto completo: página, imóvel (código, preço, bairro), campanha, corretor do link, origem do anúncio (UTM/gclid) e buscas feitas.
- A LIA qualifica o lead no CRM (orçamento, região, prazo, financiamento), com todo o histórico da conversa.
- Em links personalizados de corretor, o contato continua indo para o corretor.
- Vale para todas as páginas: Home, busca, imóvel, Natal e produtos.

## Etapa 2 — Conversão em todo o site
- Contatos com contexto: cada botão ("Agendar visita", "Consultar condições", "Quanto vale meu imóvel") entrega ao CRM de onde veio o lead.
- Formulários curtos (nome + WhatsApp), com confirmação clara e sem duplicar leads.
- Prova de confiança perto dos botões: nota do Google, corretores com foto, CRECI.
- Revisão no celular: um único botão de contato visível por vez, sem nada se sobrepondo.

## Etapa 3 — Pronto para Google Ads
- Medição completa: cada lead (formulário, conversa com a LIA, WhatsApp) é registrado como conversão no Google Ads, guardando o gclid de quem clicou no anúncio.
- Páginas de destino para anúncios: rápidas, sem distrações, com contato direto (ex.: lançamentos em Porto Alegre, Natal Chave de Ouro, apartamentos por bairro).
- Pesquisa de palavras-chave em Porto Alegre, Litoral e Serra, só de compra.
- Primeira campanha criada **pausada**, para você aprovar antes de gastar.

## Etapa 4 — Google orgânico
- Revisão de títulos, descrições, dados estruturados e mapa do site.
- Páginas por bairro e faixa de preço com conteúdo real.
- Velocidade: primeira foto prioritária, fotos leves no celular.
- Conectar o Google Search Console para acompanhar resultados.

## O que preciso de você
- No CRM: confirmar como a LIA recebe conversas de fora (o hub da LIA tem uma entrada para o site?). Vou ler o projeto do CRM e, se faltar, preparo um texto pronto para você colar lá.
- O número do WhatsApp oficial da LIA.
- Autorizar a conexão da conta do Google Ads na Etapa 3.

## Detalhes técnicos
- Chat no site via edge function `lia-chat` no site que repassa para o hub da LIA no CRM (autenticada com `CRM_BRIDGE_TOKEN`); se o CRM não tiver endpoint, prompt para criá-lo no projeto CRM.
- Contexto do lead reaproveita o first-touch de UTM no localStorage e o radar de intenção; leads continuam indo ao CRM só por triggers do banco.
- Conversões: eventos GTM + importação de conversões offline pelo gclid.
- Testes: contexto enviado à LIA, deduplicação de lead e captura do gclid.
