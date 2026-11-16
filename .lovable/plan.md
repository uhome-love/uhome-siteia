# Contato novo de quem já está no CRM: só acrescentar, não redistribuir

## Como está hoje
Todo contato do site sem link de corretor passa pela "Fila do CEO": o envio ao CRM apaga o corretor, põe o aceite em "pendente de distribuição", o motivo em "fila_ceo_site" e zera as datas de distribuição e aceite. Isso acontece mesmo quando a pessoa já tem um corretor trabalhando com ela no CRM, e ele perde a lead.

## O que muda
Antes de mexer na lead do CRM, o envio olha como ela está agora.

1. **A pessoa já está no CRM com corretor ativo** (mesmo telefone ou e-mail, com corretor, e não descartada nem arquivada):
   - Não muda corretor, etapa, situação do aceite, motivo da pendência nem datas de distribuição e aceite.
   - Não usa "fila_ceo_site".
   - Só acrescenta os dados novos: página, formulário, origem (UTMs, gclid etc.) e o que a pessoa fez no site. Esses dados entram no histórico e nas observações, somados ao que já tinha, sem apagar nada.
   - No agendamento de visita, também não troca a etapa da lead. A visita pedida vai só como informação nova.
   - O CRM decide o que fazer.
2. **A pessoa não tem corretor, foi descartada ou está arquivada:** continua indo para a Fila do CEO, como hoje.
3. **Pessoa nova:** continua como hoje (Fila do CEO, ou o corretor do link).
4. **Contato vindo por link de corretor:** continua indo para o corretor do link, mas se a pessoa já tiver outro corretor ativo no CRM, também não troca.

## Validação
- Testes automáticos com as regras acima: lead com corretor ativo fica igual e só ganha dados; sem corretor, descartada ou arquivada vai para a Fila do CEO.
- Teste real: enviar um contato "TESTE" com o telefone de uma lead de teste que já tenha corretor e conferir no CRM que corretor, etapa e aceite ficaram iguais e que os dados novos apareceram. Depois apagar o teste.
- O alerta por e-mail ao Lucas continua saindo para todo contato novo.

## Detalhes técnicos
- Arquivo: função `sync-to-crm` (`moverParaFilaCEO`, `handleLead`, `handleAgendamento`).
- Primeiro passo: ler no CRM os campos reais de `pipeline_leads` que indicam descartado/arquivado e etapa, e como o CRM liga uma lead nova a uma pessoa existente (telefone/e-mail), para não supor nomes de colunas.
- Nova função pura `decidirDistribuicao(estadoAtual)` → `'fila_ceo' | 'so_acrescentar'`, testada isoladamente.
- Em "so_acrescentar": patch só com `dados_site` (mesclado ao existente) e `observacoes` acrescentadas no topo, limitadas a 8000 caracteres; sem `status`, `corretor_id`, `aceite_status`, `motivo_pendencia`, `distribuido_em`, `aceito_em`.
- Atualizar a regra correspondente em `AGENTS.md`.
