

## Diagnóstico e Correção da Sync Jetimob

### Problemas encontrados

1. **Cron job sincroniza apenas 5 páginas (500 imóveis) por dia** — O job diário envia `body := '{}'`, que usa os defaults `start_page=1, max_pages=5`. Com 24.832 imóveis (~249 páginas), ele nunca passa da página 5. Imóveis novos nas páginas 6+ nunca chegam ao site.

2. **Sem auto-chain** — O body não inclui `auto_chain: true`, então mesmo com o mecanismo de encadeamento já implementado no código, ele nunca é ativado.

3. **Imóveis removidos da Jetimob ficam "disponivel" para sempre** — Se um imóvel é vendido/removido na Jetimob, ele nunca é marcado como inativo no banco. A sync só faz upsert dos que existem, mas nunca desativa os que sumiram.

4. **Sem log de sync** — A tabela `sync_log` existe mas a função nunca grava nela, dificultando diagnóstico.

### Plano de correção

**1. Atualizar a Edge Function `sync-jetimob`**

- Após uma sync completa (quando `auto_chain` percorreu todas as páginas), marcar como `inativo` todos os imóveis com `origem = 'jetimob'` cujo `updated_at` é anterior ao início da sync (ou seja, não foram tocados pelo upsert).
- Gravar um registro na tabela `sync_log` ao final de cada chunk com contadores (inseridos, atualizados, erros, total).
- Adicionar um parâmetro `sync_started_at` que é propagado ao longo da cadeia para saber o horário de início da sync completa.

**2. Atualizar o cron job**

- Alterar o body do job para `{"start_page": 1, "max_pages": 10, "auto_chain": true}` — cada chunk processa 10 páginas (1000 imóveis) e automaticamente dispara o próximo chunk, até cobrir todas as páginas.
- Isso garante sync completa diária (os ~250 páginas serão processadas em ~25 chamadas encadeadas).

**3. Fluxo da sync completa**

```text
Cron 06:00 UTC → chunk 1 (p1-10) → auto-chain → chunk 2 (p11-20) → ... → chunk 25 (p241-250) → FIM
                                                                                                    ↓
                                                                              Marcar imoveis não tocados como "inativo"
                                                                              Gravar sync_log com resumo
```

### Arquivos afetados
- `supabase/functions/sync-jetimob/index.ts` — adicionar desativação de imóveis ausentes, logging em sync_log, propagação de `sync_started_at`
- Atualizar cron job via SQL insert tool (não migration) para passar `auto_chain: true` e `max_pages: 10`

### Resultado esperado
- Sync completa diária cobrindo todos os imóveis da Jetimob
- Imóveis removidos/vendidos na Jetimob automaticamente desativados no site
- Logs de sync visíveis no admin para diagnóstico

