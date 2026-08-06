# Corrigir a sincronização Jetimob → Site (e reflexo no CRM)

## Diagnóstico (verificado no banco agora)

- A última sincronização completa registrada foi em **03/08 às 06:00** e ela **parou na página 200 de ~226** (o Jetimob informou 22.576 imóveis). Nenhuma execução foi concluída até o fim.
- A execução de **hoje (06/08, 06:00)** atualizou apenas ~600 imóveis (6 páginas) e morreu **sem registrar nada no log** — a corrente de chamadas encadeadas quebrou logo no início.
- Consequência 1 (**imóveis fantasmas**): **9.228 imóveis** continuam com status "disponível" no site sem terem sido tocados pela sincronização desde 03/08. A rotina que desativa imóveis que saíram do Jetimob **nunca roda**: o último imóvel marcado como inativo é de **22/04**.
- Consequência 2 (**imóveis faltando**): como o processo nunca chega nas últimas páginas, imóveis novos cadastrados no Jetimob não entram no site (apenas **38 imóveis novos** desde 01/08).

Duas falhas de código explicam isso:

1. **Encadeamento frágil**: cada bloco dispara o próximo por um `fetch` "dispare e esqueça". Se essa chamada se perde (timeout, cold start, limite de execução), a sincronização morre no meio e **ninguém percebe nem retoma**.
2. **Trava de segurança sempre bloqueia a limpeza**: a comparação usa o total do bloco atual (1.000) contra o total geral do Jetimob (22.576). Como 1.000 é menos de 50% de 22.576, a desativação é **sempre pulada**, mesmo quando a sincronização chega ao fim.

## O que vou fazer

### 1. Tornar a sincronização retomável e auto-recuperável
- Criar uma tabela de estado (`sync_state`) com: página atual, total esperado, início da execução, quantidade processada e status (`rodando`, `concluida`, `travada`).
- Cada execução processa um bloco de páginas, grava o progresso e agenda a próxima. Se um bloco falhar, o **agendador retoma exatamente de onde parou** em vez de recomeçar ou desistir.
- Agendamento a cada poucos minutos verificando o estado: se há execução "rodando" e parada há mais de X minutos, ela é retomada automaticamente; se não há execução pendente, inicia a diária.

### 2. Corrigir a trava de segurança da desativação
- Passar a comparar o **acumulado da execução inteira** (guardado no `sync_state`) contra o total do Jetimob, e não o bloco isolado.
- Só desativar quando a execução chegou na última página **e** trouxe pelo menos 90% do total informado pelo Jetimob.
- Desativação registrada em log, com contagem, para auditoria.

### 3. Limpeza dos 9.228 imóveis desatualizados
- Fazer uma sincronização completa manual agora, do início ao fim.
- Ao terminar, desativar todo imóvel de origem Jetimob "disponível" que não foi tocado por essa execução — resolvendo os imóveis já vendidos/retirados que ainda aparecem no site.

### 4. Visibilidade para não repetir o problema
- Ampliar a tela de administração de sincronização com: data/hora da última execução concluída, página atual, total esperado x processado, quantos foram desativados e alerta visual quando a última execução completa tiver mais de 24 h.

### 5. Reflexo no CRM
- O CRM lê os imóveis a partir do banco do site; com o site completo e atualizado, os imóveis faltantes aparecem. Após a sincronização completa, confiro a contagem final por status e por cidade e reporto os números.

## Detalhes técnicos

- Migração: tabela `public.sync_state` (uma linha por execução: `id`, `iniciado_em`, `pagina_atual`, `paginas_totais`, `total_processado`, `total_esperado`, `status`, `atualizado_em`), com GRANT apenas para `service_role`, RLS habilitado e leitura para administradores.
- `supabase/functions/sync-jetimob/index.ts`: substituir o encadeamento cego por leitura/gravação de `sync_state`; manter upsert por `jetimob_id` em lotes de 50; corrigir `safeToDeactivate` para usar `total_processado` acumulado com razão de 0,9.
- Nova função agendada (`sync-jetimob-watchdog`) chamada por `pg_cron`, que dispara o próximo bloco ou retoma execução travada. O agendamento usa `net.http_post` e será criado via inserção direta (contém URL e chave do projeto), não por migração versionada.
- Nenhuma mudança nas telas públicas de busca/detalhe; risco de indisponibilidade é nulo, pois todas as alterações são no processo em segundo plano mais uma seção informativa em `src/pages/admin/AdminSync.tsx`.
