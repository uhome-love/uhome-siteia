# Verificação completa: Google Analytics, Tag do Google e conversões

## O que já conferi no código
- O site carrega dois sistemas do Google ao mesmo tempo:
  1. **Gerenciador de Tags antigo (GTM-5838J9Z)** — dentro dele há uma tag de Ads de outra conta (AW-601637386).
  2. **Tag do Google nova**, com Analytics + a conta de Ads "Site Uhome" (AW-18567893155) e as 3 conversões: Lead site, Visita agendada e WhatsApp.
- As conversões disparam em: formulários de contato, modal de WhatsApp, botão fixo do imóvel, página de studios e LIA (contato e visita).
- O código de identificação do Analytics não aparece no ambiente de teste — preciso confirmar se ele chega no site publicado. Se não chegar, nem o Analytics nem as conversões novas funcionam.

## O que vou verificar (ponta a ponta)
1. **Site publicado (uhome.com.br)**: abrir no celular e no computador como um visitante real e registrar o que é enviado ao Google ao abrir a página, navegar, clicar no WhatsApp e falar com a LIA. Confirmar que cada conversão vai uma única vez para a conta certa.
2. **Google Analytics**: ler os relatórios da conta para ver se visitas e eventos (contato, WhatsApp) estão chegando nos últimos dias.
3. **Google Ads**: conferir o status das 3 conversões (ativas, recebendo sinais ou "sem conversões recentes") e se a tag está marcada como verificada.
4. **Contagem duplicada**: confirmar se o Gerenciador de Tags antigo também manda conversão para a conta antiga ao mesmo tempo.
5. **Origem do anúncio**: confirmar que o identificador do clique no anúncio é guardado e chega ao CRM (já validado no teste anterior).

## O que vou entregar
Um relatório simples com: o que está OK, o que está quebrado e o que corrigir, em ordem de prioridade. Correções só depois da sua aprovação, por exemplo:
- garantir que o código do Analytics esteja no site publicado;
- desligar a tag de Ads antiga no Gerenciador de Tags, se você confirmar que aquela conta não é mais usada.

## Limites
- O site publicado já bloqueou meu acesso automático antes; se acontecer de novo, peço que você abra uma página e clique no WhatsApp enquanto eu leio os dados no Analytics e no Ads.
- Para ler o Analytics, pode aparecer um cartão pedindo para conectar sua conta do Google Analytics.
- O conteúdo interno do Gerenciador de Tags antigo eu não consigo editar daqui; se precisar mudar algo nele, passo o passo a passo.

## Detalhes técnicos
- `initGA4()` em `src/main.tsx` só roda se `VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY` existir e fora de localhost/preview; `config` do AW vem junto. Checar o bundle publicado pelo ID `G-`.
- Playwright em uhome.com.br interceptando `google-analytics.com/g/collect` e `googleadservices.com/pagead/conversion` / `googleads.g.doubleclick.net`.
- GA4 Data API `runReport` (eventName, últimos 7 dias); Google Ads `conversion_action` + `metrics.all_conversions` via search.
