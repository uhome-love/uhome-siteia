# Análise completa — Google Ads + Site (últimos 30 dias)

## 1. Resultado atual (Google Ads, conta 104-122-6095)

| Campanha | Gasto | Cliques | CTR | CPC médio | Leads | Parcela de exibição | Perdida por verba |
|---|---|---|---|---|---|---|---|
| Natal Chave de Ouro | R$ 125 | 66 | 14,3% | R$ 1,90 | 0 | 61% | 34% |
| Investimento em Studios | R$ 75 | 21 | 10,9% | R$ 3,55 | 0 | 56% | 19% |
| Imóveis do Site | R$ 93 | 88 | 6,6% | R$ 1,06 | 1 | 10% | 89% |
| **Total** | **R$ 293** | **175** | | | **1** | | |

Leitura:
- Os anúncios atraem bem (CTR de 7% a 14% é ótimo para imóveis). O problema não é o clique, é o que acontece depois: 175 visitas viraram 1 lead e 3 cliques no WhatsApp.
- "Clique no WhatsApp" está como conversão secundária: o Google não usa esse sinal para otimizar, e é justamente o caminho que o cliente mais usa.
- "Visita agendada" e "Visita realizada (CRM)" estão com zero — o retorno do CRM para o Google ainda não alimenta a otimização.
- Termos pesquisados no Natal: muitos cliques em nomes de outros empreendimentos (Open Arvoredo, Golden Lake, Casa Tua, Essence, Connect João Wallig, Boa Vista Country Club). Precisa confirmar se são produtos da campanha; se não forem, é verba indo para quem procura outra coisa.
- "Imóveis do Site" ainda pega "até 200 mil", "casas a venda em poa", "quinto andar" — termos de baixa qualidade, contra a regra de leads qualificados.
- Studios tem CPC alto (R$ 3,55) e perde 24% por posição; termos como "house flipping" não são compradores.

## 2. Ações recomendadas no Google Ads (cada uma com aprovação)

1. Promover "Clique no WhatsApp" para conversão principal (com valor menor que o lead de formulário), para o Google otimizar pelo contato real.
2. Revisar os termos do Natal: manter só os produtos da campanha; negativar nomes de empreendimentos de terceiros que não vendemos.
3. Negativas adicionais em "Imóveis do Site": "200 mil", "quinto andar", "barato", "house flipping" (Studios), mantendo a regra de não atrair MCMV/baixo preço.
4. Conferir o envio de "Visita realizada" do CRM para o Google (hoje zero) — diagnóstico antes de mexer em lance.
5. Verba: não mexer agora. Só faz sentido redistribuir depois de existir um custo por lead real medido (hoje 1 lead não dá base).

## 3. Site — conversão, experiência e qualidade

Diagnóstico a fazer (leitura, sem mudar nada) e melhorias propostas:
- **Funil das páginas de anúncio** (/em-foco/:slug, /campanha/natal-chave-de-ouro): medir com os dados de comportamento já gravados (lead_events, whatsapp_clicks) onde as pessoas param: rolagem, abertura de fotos, início do formulário, clique no WhatsApp.
- **Celular primeiro**: conferir velocidade de carregamento e tamanho das imagens no topo (a maior parte do tráfego pago é celular); botão de WhatsApp e "Quero as condições" sempre visíveis.
- **Formulário mais curto**: nome + WhatsApp apenas; e-mail opcional. Botão de WhatsApp como alternativa ao lado.
- **Prova e confiança no topo**: nota 4,9 do Google, CRECI, "atendimento em minutos".
- **Coerência anúncio → página**: cada anúncio leva para a página do produto pesquisado (não para a vitrine geral), com o mesmo texto da oferta.
- **LIA**: abrir sugestão contextual após ~30s na página do produto, oferecendo valores e plantas no WhatsApp.
- **Qualidade do lead**: cruzar leads/cliques do anúncio com o resultado no CRM (atendido, visita, descarte) para saber quais termos trazem gente boa.

## 4. Ordem de execução

1. Ajustes no Google Ads (itens 2.1 a 2.3) — rápido, com cartão de aprovação.
2. Diagnóstico do funil no site com os dados reais (relatório em chat).
3. Melhorias de página priorizadas pelo diagnóstico (formulário, topo, velocidade).
4. Revisar em 14 dias com dados comparáveis antes de qualquer mudança de verba.

## Detalhes técnicos
- Dados de anúncios lidos via relatório de campanhas, conversões e termos de pesquisa (30 dias).
- Funil do site: consultas em lead_events, whatsapp_clicks, public_leads filtrando gclid/utm_source=google.
- Mudanças no Ads via lote único de alterações, sem tocar em lances, anúncios ou verbas.
