# Rastreamento completo em todo lead enviado ao CRM

Objetivo: todo contato do site chega ao CRM dizendo de onde a pessoa veio (primeira visita), em que página e em qual botão/formulário converteu. Nenhum campo atual é removido.

## O que muda

1. **Guardar a primeira visita** (no aparelho da pessoa, na chegada):
   - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
   - `gclid`, `gbraid`, `wbraid`, `fbclid` (hoje só as páginas de Studios pegam esses códigos)
   - `referrer` (vazio vira `""` = acesso direto)
   - `landing_url` (endereço completo da primeira página)
   - Regra: grava só na primeira visita; se a pessoa voltar depois por um anúncio e ainda não tiver código de clique, completa os que faltam sem apagar a origem.

2. **Em cada envio**, acrescentar:
   - `pagina_url`: endereço completo da página atual
   - `origem_componente`: mantém o atual (exit_intent, floating_whatsapp, detalhe_sidebar, hero_form…)
   - `formulario`: nome legível (ex.: "Pop-up de saída", "Formulário do topo"), gerado a partir do `origem_componente`, com opção de cada formulário informar o seu
   - `device`: "mobile" | "tablet" | "desktop"

3. **Todos os pontos que geram lead** passam a mandar esses dados: formulários gerais, alerta de busca, cadastro inicial, Studios, agendamento de visita, clique no WhatsApp e LIA (que recebe a origem do navegador).

4. **Envio ao CRM**: o `record` repassado ao CRM inclui todos os campos acima, além dos que já vão.

## Detalhes técnicos

- Banco: adicionar em `public_leads` (e `agendamentos`/cliques de WhatsApp, se faltarem) as colunas `pagina_url`, `formulario`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `landing_url` (texto, opcionais). `utm_*`, `referrer`, `device`, `landing_page` já existem e continuam.
- `src/lib/session.ts`: `captureUtm` passa a capturar click IDs e `landing_url` completa; `referrer` salvo como `""` quando vazio; `getTrackingData()` devolve tudo. Função `getLeadTracking(origem_componente, formulario?)` centraliza o bloco a anexar.
- `src/services/leads.ts`, `Search.tsx`, `Onboarding.tsx`, `features/investir-studios/lead.ts`, agendamento e clique WhatsApp usam `getLeadTracking`.
- `lia-chat`: aceitar o rastreamento enviado pelo widget e gravar nas mesmas colunas.
- `sync-to-crm`: incluir os novos campos no `record`/payload enviado ao CRM sem tirar nada; manter também nas observações.
- Teste em `src/test/` para: primeira visita não é sobrescrita, click IDs capturados, referrer vazio vira `""`, device classificado.
- Validação: enviar um lead de teste com `?utm_source=google&gclid=teste`, conferir a linha e o que foi ao CRM, depois apagar só esse teste.

## Contexto extra para a tela do lead no CRM

Hoje a tela mostra "Fonte: Não informada" mesmo quando dá para saber. Passa a ir também, dentro de `contexto` (o CRM já escreve isso no histórico):

- **Fonte legível** sempre preenchida: "Google Ads — Natal Chave de Ouro", "Google orgânico", "Instagram", "Acesso direto", "Link do corretor" (calculada da UTM, código de clique e referrer).
- **Palavra pesquisada no Google** (`utm_term`) quando vier do anúncio.
- **Data da primeira visita** e **quantas visitas** a pessoa já fez.
- **Tempo no site** na visita atual.
- **Imóveis vistos** (últimos 5, com nome e link) e **favoritados**.
- **Buscas feitas** (filtros resumidos, últimas 3).
- **Conversou com a LIA?** sim/não.
- **Cliente que voltou**: se esse telefone já enviou contato antes.

Sugestão para o CRM (fora deste projeto): na caixa "Veio do site", mostrar Campanha, Palavra pesquisada, 1ª visita, Nº de visitas e Imóveis vistos.
