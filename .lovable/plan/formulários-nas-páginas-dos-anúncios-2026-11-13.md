# Formulários nas páginas dos anúncios

## Situação hoje
| Página do anúncio | Campanha | Formulário? |
|---|---|---|
| Página de cada imóvel do Natal | Natal | Sim: no topo (celular, logo após as condições) e no fim. Botão principal leva ao formulário. |
| Investir em Studios | Studios | Sim, mas só no fim da página (depois do simulador). |
| Busca de Porto Alegre | Imóveis do Site | **Não.** Só fotos, WhatsApp e LIA. É a campanha com mais verba (R$ 30/dia) e não tem onde deixar nome e telefone. |

## O que vou fazer
1. **Busca (prioridade):** um cartão "Não achou o ideal? Um especialista te manda opções" no meio da lista (depois do 6º imóvel) e uma barra fixa discreta no celular "Receber opções no WhatsApp". Pede só nome e WhatsApp, com bairro/faixa já preenchidos pelos filtros. Aparece só para quem chega do Google Ads ou rola a lista.
2. **Studios:** botão "Receber a conta do studio" logo no início e uma barra fixa no celular que leva ao formulário já existente.
3. **Natal:** manter como está; só adicionar a barra fixa no celular com "Receber tabela" ao lado do WhatsApp.
4. Todos os novos contatos seguem o mesmo caminho de hoje: vão para a Fila do CEO no CRM com a campanha, a palavra buscada e o histórico do site, e contam como conversão no Google Ads.
5. Testar no celular cada formulário até chegar ao CRM e apagar os testes.

## Detalhes técnicos
- Reutilizar `EmpreendimentoLeadForm` (já grava em `public_leads`, chama `setLeadIdentity` e dispara a conversão).
- Detectar visitante de anúncio pelo gclid/UTM já salvo no first-touch.
- Sem novas tabelas; sem mudanças no CRM.
