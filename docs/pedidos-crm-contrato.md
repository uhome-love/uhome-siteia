# Pedidos do site — 18/11/2026

`dados_site.pedidos` é um array acumulado. Cada elemento tem estas chaves:

```json
{
  "id": "UUID persistido do pedido",
  "tipo": "visita",
  "dia": "2026-11-21",
  "periodo": "tarde",
  "planta": null,
  "assunto": null,
  "empreendimento": "Open Bosque",
  "pagina": "https://uhome.com.br/em-foco/open-bosque",
  "horario": "2026-11-18T00:36:00.000Z",
  "financiamento": "Ainda não sei"
}
```

- `tipo`: `visita | informacoes | whatsapp`. Campos não aplicáveis são `null`.
- `horario`: instante do pedido em ISO 8601 UTC; `dia` é a data da visita, não o instante de envio.
- UUID é gerado uma vez ao gravar o pedido; novos formulários também fornecem UUID estável durante tentativas. Reenvios não geram novos IDs.
- Último pedido em `dados_site.pedido` e `contexto.pedido`; histórico em `contexto.pedidos` e `dados_site.pedidos`.
- Primeira origem preservada em `primeira_origem` e colunas originais; última em `ultima_origem`. Classificação: corretor > IDs de clique > utm_source > orgânico.
- Visitas carregam atribuição em suas colunas e no contexto. O envio principal do lead continua pelos gatilhos; visita em-foco não cria outro lead.
- WhatsApp identificado usa o UUID do evento aceito, sem gerar contato para clique anônimo.
- O CRM deve criar uma nota por ID novo e acrescentar `dados_site jsonb` a `public.leads` (ainda ausente na conferência somente de esquema em 18/11). O site já tenta salvar ali; até a coluna existir, mantém envio ao funil e pendências para leads sem funil.
- Retentativas no tick existente (~10 min); não altera agenda nem Worker. Falhas permanecem pendentes até sucesso. A rotina pode reenviar pendências antigas; não foram criados pedidos de teste.
- Publicar app para UUID no formulário e vínculo de visitante no agendamento. Funções e mudanças de banco são compatíveis com o app anterior.