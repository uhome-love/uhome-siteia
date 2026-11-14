# Máquina de leads Uhome: Google Ads, Meta Ads, conversão e Google orgânico

Objetivo: mais contatos **qualificados** de compra em Porto Alegre e Canoas, sem aumentar a verba até a estrutura converter. Regras que continuam valendo: nada de Minha Casa Minha Vida, preço baixo, FGTS, aluguel, coberturas ou "alto padrão".

## O que os sites que mais captam contatos têm em comum
Comparei com Foxter, Auxiliadora Predial e Crédito Real (Semrush, 14/11). Eles ganham tráfego com páginas de bairro, de condomínio e de empreendimento. Os pontos em comum desses sites, que são a minha análise, sem garantia de resultado:
1. Uma página para cada empreendimento e para cada bairro, com fotos, preço "a partir de" e planta.
2. Contato sempre à vista no celular: botão fixo de WhatsApp e "Receber tabela".
3. Formulário curto (nome e WhatsApp) e resposta rápida do corretor.
4. Prova de confiança: anos de mercado, avaliações e construtoras parceiras.
5. Motivo para agir agora: condição por tempo limitado e unidades disponíveis.
6. Retorno a quem visitou e saiu, por anúncio de lembrete.

## Etapa 1 — Página que converte (base de tudo, foco no celular)
- Barra fixa no rodapé do celular nas páginas de imóvel, do Natal, dos Studios e da busca: "Receber tabela" e WhatsApp.
- Selo da oferta de Natal com a contagem até 18/12 no topo.
- Formulário de 2 campos. Depois do envio, 2 perguntas rápidas: "quando pensa em comprar?" e "como pretende pagar?". Essas respostas chegam ao CRM e separam o lead quente.
- Nota 4,9 do Google, 68 avaliações e as construtoras parceiras perto do formulário.
- Capa de cada um dos 10 imóveis escolhida a dedo. **Imagens que vou te pedir:** arte da oferta de Natal em pé (1080x1350), quadrada (1080x1080) e larga (1200x628), e 1 foto de capa para cada imóvel com capa fraca (te passo a lista).
- Teste completo no celular: anúncio, página, LIA, formulário, Fila do CEO e conversão no Google.

## Etapa 2 — Google Ads qualificado
- **Conversões:** só contam como principais o formulário, o contato pela LIA com telefone e a visita agendada. O clique no WhatsApp fica secundário. A "Visita realizada (CRM)" entra quando o CRM enviar os dados.
- **Lead quente:** a resposta "compra em até 6 meses" ganha valor maior, para o Google buscar mais gente assim.
- **Buscas:** revisão semanal dos termos, com bloqueio dos ruins (aluguel, barato, Caixa, leilão, emprego, corretor vaga, Viva Real, OLX).
- **Anúncios:** um por imóvel, com o nome do imóvel no título. Fazer rodízio e pausar os fracos a cada 2 semanas.
- **Studios:** redistribuir verba de grupos sem contato, sem subir o total.
- **Recursos do anúncio:** formulário e ligação direto no anúncio, além dos links e destaques que já existem.
- **Lance:** com 15 a 20 contatos, trocar "mais cliques" por "mais contatos". Só depois disso falar em aumentar a verba.
- **Lembrete:** lista de quem visitou sem deixar contato, usada na pesquisa do Google.

## Etapa 3 — Meta Ads (Facebook e Instagram)
**Minha opinião:** vale a pena, mas não como campanha de "tráfego". O tráfego do Meta traz muito clique barato e pouca gente pronta para comprar, o mesmo problema que você já teve. O melhor é:
- **Campanha de cadastros** levando à página do imóvel, otimizada para quem envia o formulário, e não para quem só clica.
- **Lembrete** para quem visitou o site ou viu a página do Natal e não deixou contato. Costuma ser o público mais barato e mais quente.
- Público: Porto Alegre e Canoas, a partir de 28 anos, sem segmentações de baixa renda. Anúncios com vídeo e foto reais dos imóveis e a oferta de Natal.
- Verba inicial pequena, sugestão de R$ 30 por dia, só depois da Etapa 1 pronta.
- **O que falta:** a conta do Meta ainda não está ligada ao projeto. A instalação da medição do Meta (pixel e envio pelo servidor) entra nesta etapa.

## Etapa 4 — Google orgânico (SEO)
- **Páginas de empreendimento:** cada imóvel da campanha com página otimizada para "nome + bairro" e "nome + construtora". São as buscas que já mostraram procura (Open Bosque, Golden Lake, Orygem, Boa Vista Country Club).
- **Páginas de bairro com intenção de compra:** "apartamento à venda no Passo d'Areia", "na Rio Branco", "no Petrópolis", "em Canoas", com imóveis reais, preços e perguntas frequentes.
- **Páginas de construtora:** Cyrela, Melnick, Multiplan e outras com imóveis no site.
- **Blog com foco em comprador:** guias de bairro, "como comprar na planta", "documentos para comprar". Sem textos genéricos.
- **Perfil da empresa no Google:** responder as 15 avaliações em aberto (textos para você aprovar), uma publicação por semana e pedir avaliação a cada cliente que comprar.
- **Técnico:** acompanhar no Search Console as páginas que aparecem mas recebem poucos cliques e melhorar título e descrição delas.

## Etapa 5 — Atender rápido e medir
- O corretor recebe o lead com o histórico no site e a temperatura. Meta: responder em menos de 5 minutos.
- Painel semanal: contatos, custo por contato, visitas e vendas por origem (Google Ads, Meta, orgânico).
- A cada 2 semanas: manter o que funciona, cortar o que não funciona.

## Ordem e decisões suas
1. Etapa 1 agora, enquanto você monta as imagens.
2. Etapa 2 em seguida, sem mudar a verba.
3. Etapa 3 só com sua aprovação: ligar a conta do Meta e aprovar a verba.
4. Etapa 4 aos poucos, começando pelas páginas dos empreendimentos do Natal.

## Detalhes técnicos
- Barra fixa, selo e perguntas depois do envio em `ProdutoFocoPage.tsx`, `EmpreendimentoLeadForm` e nas páginas de Studios e da busca. As respostas vão para os campos de qualificação já enviados ao CRM pelos gatilhos atuais.
- Google Ads na conta 104-122-6095 via mutate. Valor da conversão diferenciado para leads quentes. Formulário no anúncio pelo recurso de lead form.
- Meta: `meta_ads--setup_account`, pixel e envio pelo servidor numa função de backend com deduplicação, respeitando o consentimento.
- SEO: novas rotas no padrão `-/*`, JSON-LD por `jsonld.ts`, entrada no sitemap e prévia de link pelo `ssr-render`.
