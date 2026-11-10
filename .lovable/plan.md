# Uhome: máquina de leads (LIA + Google Ads + Google orgânico)

Trabalho em 4 etapas. Cada etapa é entregue e testada antes da próxima. Busca, mapa, sincronização e páginas de Natal continuam funcionando.

## Etapa 1 — LIA no lugar do WhatsApp
- O botão flutuante passa a ser a **LIA**, com o rosto do avatar oficial enviado (recorte redondo) e o texto "Fale com a LIA".
- As imagens enviadas da LIA (avatar oficial e cenas: agendou, qualifica, qualidade, futuro etc.) são usadas na abertura da conversa, numa faixa "Conheça a LIA" na Home e nas páginas para Google Ads. Todas otimizadas para carregar rápido.
- Ao abrir: uma conversa no próprio site com a LIA, além do botão "Continuar no WhatsApp", que abre o WhatsApp oficial da LIA com a mensagem e o imóvel já preenchidos.
- A LIA recebe o contexto completo: página, imóvel (código, preço, bairro), campanha, corretor do link, origem do anúncio (UTM/gclid) e buscas feitas.
- A LIA do site usa o **mesmo cérebro do CRM** enviado: mesmas regras (nunca inventar número, nunca prometer aprovação de financiamento, uma pergunta por vez, sem formatação), mesmo fluxo (entrada → atendendo → qualificado → corretor) e as fichas dos 20 produtos.
- Missão igual à do WhatsApp: levar a pessoa a escolher **um dia e um turno** para conhecer o imóvel e passar ao corretor com resumo.
- Qualifica renda, entrada, FGTS, prazo e uso; se a pessoa pedir um humano, passa ao corretor na hora; se pedir para parar, encerra.
- A conversa e o resumo entram no CRM como lead qualificado, com todo o histórico.
- **A LIA conhece todos os imóveis do site**: busca no catálogo real (bairro, preço, quartos, código) e sugere opções com link, foto e preço, sem inventar nada.
- **Conhece o Natal Chave de Ouro**: os 10 empreendimentos, condições, prazos de entrega e diferenciais da Uhome (curadoria, avaliação 4,9 no Google, corretores especialistas).
- **Tom humano e foco em conversão**: conversa curta e calorosa, sempre termina com uma pergunta e conduz para demonstrar interesse ou marcar visita.
- **Visita agendada já cria a visita no CRM**, pronta com data, turno, imóvel/produto de interesse e o resumo da conversa — vale para a LIA e para o botão "Agendar visita".
- **Todo lead vindo do site entra na fila CEO** do CRM (conversa da LIA, formulários e botões), com contexto completo: páginas vistas, imóveis e produtos abertos, buscas e filtros, campanha, corretor do link, origem do anúncio e o resumo da LIA.
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

- Todo lead de anúncio chega ao CRM qualificado e com contexto: campanha, palavra buscada, anúncio clicado, página e conversa com a LIA.

## Etapa 4 — Google orgânico (meta: liderar buscas de imobiliária e imóveis no RS)
- Pesquisa das buscas mais importantes ("imobiliária Porto Alegre", "apartamento à venda + bairro", lançamentos) e dos concorrentes que aparecem hoje.
- Ninguém consegue garantir a 1ª posição no Google; o plano faz tudo que mais pesa para chegar lá e acompanha a evolução mês a mês.
- Revisão de títulos, descrições, dados estruturados e mapa do site.
- Páginas por bairro e faixa de preço com conteúdo real.
- Velocidade: primeira foto prioritária, fotos leves no celular.
- Conectar o Google Search Console para acompanhar resultados.

## Qualidade geral (em todas as etapas)
- Revisão de velocidade, beleza, organização e funcionamento em computador e celular, página por página, sem quebrar busca, mapa, sincronização e Natal.

## O que preciso de você
- Preferência: a conversa do site roda **dentro do CRM** (o site só repassa as mensagens), para a LIA ser uma só. Se o CRM ainda não aceitar conversas vindas do site, preparo um texto pronto para você colar lá.
- O número do WhatsApp oficial da LIA.
- Autorizar a conexão da conta do Google Ads na Etapa 3.

## Detalhes técnicos
- Chat no site via edge function `lia-chat` no site que repassa para o hub da LIA no CRM (autenticada com `CRM_BRIDGE_TOKEN`); se o CRM não tiver endpoint, prompt para criá-lo no projeto CRM.
- Contexto do lead reaproveita o first-touch de UTM no localStorage e o radar de intenção; leads continuam indo ao CRM só por triggers do banco.
- Conversões: eventos GTM + importação de conversões offline pelo gclid.
- Testes: contexto enviado à LIA, deduplicação de lead e captura do gclid.
