# Análise do Google Ads (últimos 14 dias) e próximos passos

## Como está hoje
| Campanha | Impressões | Cliques | Taxa de clique | Custo/clique | Gasto | Contatos |
|---|---|---|---|---|---|---|
| Natal Chave de Ouro | 337 | 40 | 11,9% | R$ 2,37 | R$ 94,70 | 0 |
| Investimento em Studios | 127 | 12 | 9,4% | R$ 3,31 | R$ 39,75 | 0 |
| Imóveis do Site | 763 | 54 | 7,1% | R$ 1,15 | R$ 61,87 | 1 |
| **Total** | **1.227** | **106** | **8,6%** | **R$ 1,85** | **R$ 196,32** | **1** |

## O que está bom
- Taxa de clique alta (8–12%): os anúncios por imóvel estão funcionando.
- Quem clica no Natal busca o nome do imóvel (Open Arvoredo, Golden Lake, Casa Tua, Boa Vista). É o público certo.
- Custo por clique baixo no Site (R$ 1,15).

## O que está ruim
1. **1 contato em 106 cliques (0,9%).** Para imóveis, o esperado é de 3% a 8%. A maior parte dos cliques veio antes das melhorias na página e na LIA. Ainda preciso confirmar se elas já foram publicadas.
2. **O Site perde 89% das buscas porque a verba acaba cedo.** Ele mostra o anúncio em só 10% das buscas.
3. **O Natal perde 30% das buscas por verba.** O Studios perde 23% por verba e 24% por pagar pouco por clique.
4. **Buscas ruins ainda passam:** "casas à venda em porto alegre até 200 mil", "quinto andar porto alegre comprar" e "house flipping".
5. **Grupos sem resultado:** Skyglass e Orygem tiveram impressões e nenhum clique. O Open Bosque teve 49 impressões e só 3 cliques.
6. **Studios:** 12 cliques a R$ 3,31 e nenhum contato. Parte das buscas não é de studio, como "skyglass moinhos".

## Plano
1. **Confirmar o caminho do contato.** Testar no celular o site publicado, do anúncio ao formulário, à LIA e ao CRM, e conferir se o Google registra o contato. Se o site não estiver publicado, publicar antes.
2. **Bloquear buscas ruins:** "até 200 mil", "200 mil", "quinto andar", "house" e "flipping" no Studios, além de "endereço", "vaga" e "planta baixa pdf". Com sua aprovação.
3. **Ajustar os grupos fracos.** Reescrever os anúncios do Open Bosque, do Skyglass e do Orygem com nome, bairro e oferta de Natal. No Studios, separar as buscas de investimento das buscas de nome de prédio.
4. **Extensões de ligação e de formulário** nas 3 campanhas. São mais formas de contato direto no anúncio.
5. **Mandar de volta ao Google os contatos que viraram visita.** O CRM avisa o Google, que passa a buscar pessoas parecidas com quem visitou.
6. **Verba:** não vou mexer sem um número seu. Preciso saber quanto vale para você um contato bom.
7. **Nova leitura em 7 dias**, comparando com estes números.

## Detalhes técnicos
- Números de LAST_14_DAYS. A parcela de impressões perdida vem de search_budget_lost_impression_share e search_rank_lost_impression_share.
- Negativas e anúncios entram por google_ads mutate, com cartão de aprovação. As extensões de ligação e de formulário usam assets ligados à campanha.
- O envio de visitas ao Google usa o gclid guardado no lead (já chega ao CRM) e o upload de conversões offline.
