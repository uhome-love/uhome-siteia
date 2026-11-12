# Saber o que cada cliente faz no site e mandar ao CRM

## Resposta curta
Sim, dá. O site já anota cada imóvel visto, cada busca e cada clique no WhatsApp (nos últimos 30 dias: 144 mil imóveis vistos, 36 mil buscas). O problema: **nenhum desses registros está ligado a uma pessoa**. O site nunca guarda quem é o visitante depois que ele deixa nome e telefone, então hoje o CRM não recebe nada útil.

## Como vai funcionar
1. **Reconhecer a pessoa** — assim que alguém deixa nome e WhatsApp (formulário, LIA, agendamento, alerta de busca, login ou link de vitrine/WhatsApp do corretor), o navegador passa a lembrar dela.
2. **Juntar o passado** — tudo o que ela fez antes de se identificar naquele aparelho (imóveis vistos, buscas, cliques) passa a ser dela também.
3. **Link que identifica** — os links enviados pelo CRM (vitrine, nutrição no WhatsApp) levam um código do lead. Quem já é lead, ativo, em descarte ou inativo, é reconhecido ao clicar, mesmo sem preencher nada de novo.
4. **Mandar ao CRM** — cada visita de uma pessoa reconhecida vira uma linha do tempo no lead: imóveis vistos, buscas, favoritos, simulador, WhatsApp, conversa com a LIA. Os eventos são agrupados por visita, sem encher o CRM com cada clique.
5. **Avisar quando um lead parado volta** — se um lead em descarte ou inativo volta e vê imóveis, o CRM recebe um alerta "lead voltou ao site", com os imóveis de interesse, para reativar.
6. **Resumo de interesse** — no lead, um resumo automático: bairros, faixa de preço e tipo de imóvel que mais olhou.

## Como ligar o site aos leads de forma inteligente
Usamos 4 caminhos ao mesmo tempo, do mais certeiro ao mais amplo:
1. **Link com código do lead** (o mais forte) — toda mensagem que o corretor ou o CRM manda (vitrine, WhatsApp, nutrição) leva um código único do lead. Clicou, o site já sabe quem é, em qualquer aparelho.
2. **Contato informado no site** — nome e WhatsApp deixados no formulário, na LIA, no agendamento ou no login ligam aquele aparelho ao lead que já existe no CRM (busca pelo telefone), em vez de criar um lead novo.
3. **Histórico anterior** — o que a pessoa fez antes de se identificar naquele aparelho entra junto no lead.
4. **Anúncio do Google** — o código do clique no anúncio liga a visita ao lead, e depois o resultado (visita, venda) volta ao Google para ele trazer gente parecida.

O que o corretor ganha:
- **Linha do tempo no lead:** "ontem viu 3 vezes o Open Bosque, simulou entrada, buscou 3 quartos no Petrópolis".
- **Temperatura automática:** voltou várias vezes, viu o mesmo imóvel, simulou ou clicou no WhatsApp = lead esquentando.
- **Alerta na hora:** lead do corretor, ou em descarte/inativo, voltou ao site agora → aviso para ligar com o imóvel certo na mão.
- **Sugestão de abordagem:** o CRM mostra os imóveis mais vistos e parecidos para mandar como vitrine.

## Limites honestos
- Só reconhece quem já se identificou **naquele aparelho e navegador**, ou quem chegou por um link do CRM. Se a pessoa trocar do celular para o computador sem clicar num link nosso, ela aparece como visitante novo.
- Se apagar os dados do navegador, deixa de ser reconhecida até se identificar de novo.
- Rastrear pessoas identificadas exige avisar no site (política de privacidade). Vale confirmar com quem cuida da LGPD de vocês.

## Teste
Simular um lead do CRM clicando num link de vitrine, navegando por 3 imóveis e uma busca; conferir a linha do tempo e o alerta no CRM; depois apagar o teste.

## Detalhes técnicos
- `src/lib/session.ts`: criar `setLeadIdentity()` e chamá-lo em todos os pontos de captura (formulários, LiaChat após registrar contato, agendamento, buscas salvas, auth, `?lid=` na URL).
- Ao identificar: `lead_events` ganha coluna `lead_id`/telefone; função no backend vincula eventos anteriores do mesmo `visitor_id`.
- Corrigir o envio ao CRM: hoje `postToCRM` manda tudo sem identidade; passar a enviar só eventos de pessoa reconhecida, agrupados por sessão, via função do site com segredo (não direto do navegador).
- CRM (projeto Uhome Sales): receber a linha do tempo, status do lead (ativo/descarte/inativo) e criar o alerta de retorno — parte feita com um prompt para colar no projeto do CRM.
- Links do CRM passam a incluir um código do lead não adivinhável (não o telefone).
