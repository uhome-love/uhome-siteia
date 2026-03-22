import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface TestResult {
  nome: string
  status: 'ok' | 'erro' | 'aviso'
  mensagem: string
  detalhe?: string
  duracao?: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const results: TestResult[] = []

  async function run(nome: string, mensagem: string, fn: () => Promise<Omit<TestResult, 'nome' | 'mensagem'>>) {
    const t = Date.now()
    try {
      const r = await fn()
      results.push({ nome, mensagem, ...r, duracao: Date.now() - t })
    } catch (e: any) {
      results.push({ nome, mensagem, status: 'erro', detalhe: e.message, duracao: Date.now() - t })
    }
  }

  // 1. Conexão
  await run('site_conexao', 'Conexão Supabase', async () => {
    const { error } = await supabase.from('profiles').select('id').limit(1)
    return { status: error ? 'erro' : 'ok', detalhe: error ? error.message : 'OK' }
  })

  // 2. Colunas profiles
  await run('site_tabela_profiles', 'Colunas profiles', async () => {
    const { error } = await supabase.from('profiles').select('uhomesales_id, slug_ref, sincronizado_em').limit(1)
    return { status: error ? 'erro' : 'ok', detalhe: error ? error.message : 'OK' }
  })

  // 3. Colunas public_leads
  await run('site_tabela_leads', 'Colunas public_leads', async () => {
    const { error } = await supabase.from('public_leads').select('uhomesales_lead_id, corretor_ref_id, corretor_ref_slug, origem_ref').limit(1)
    return { status: error ? 'erro' : 'ok', detalhe: error ? error.message : 'OK' }
  })

  // 4. sync_log
  await run('site_tabela_sync_log', 'Tabela sync_log', async () => {
    const { count, error } = await supabase.from('sync_log').select('*', { count: 'exact', head: true })
    return { status: error ? 'erro' : 'ok', detalhe: error ? error.message : `${count ?? 0} registros` }
  })

  // 5. corretor_visitas
  await run('site_tabela_visitas', 'Tabela corretor_visitas', async () => {
    const { count, error } = await supabase.from('corretor_visitas').select('*', { count: 'exact', head: true })
    return { status: error ? 'erro' : 'ok', detalhe: error ? error.message : `${count ?? 0} visitas` }
  })

  // 6. Corretores sincronizados
  await run('site_corretores_sync', 'Corretores sincronizados', async () => {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).not('uhomesales_id', 'is', null)
    const n = count ?? 0
    return { status: n === 0 ? 'aviso' : 'ok', detalhe: n === 0 ? 'Nenhum sincronizado' : `${n} corretores` }
  })

  // 7. Slugs
  await run('site_slug_ref', 'Slugs gerados', async () => {
    const { data: sem } = await supabase.from('profiles').select('nome').eq('role', 'corretor').is('slug_ref', null).limit(5)
    const n = sem?.length ?? 0
    return { status: n > 0 ? 'aviso' : 'ok', detalhe: n > 0 ? `${n} sem slug` : 'Todos têm slug' }
  })

  // 8. RLS anon corretores
  await run('rls_anon_corretores', 'RLS anon lê corretores', async () => {
    const anonClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
    const { data, error } = await anonClient.from('profiles').select('id').eq('role', 'corretor').eq('ativo', true).limit(3)
    if (error) return { status: 'erro', detalhe: `RLS bloqueando: ${error.message}` }
    return { status: (data?.length ?? 0) > 0 ? 'ok' : 'aviso', detalhe: `${data?.length ?? 0} corretores` }
  })

  // 9. Trigger on_lead_created
  await run('trigger_on_lead', 'Trigger on_lead_created', async () => {
    const { count } = await supabase.from('sync_log').select('*', { count: 'exact', head: true }).eq('tipo', 'lead').eq('direcao', 'site->crm')
    const n = count ?? 0
    return { status: n > 0 ? 'ok' : 'aviso', detalhe: n > 0 ? `${n} leads no log` : 'Sem registros' }
  })

  // 10. Cron job
  await run('cron_sync', 'Cron job corretor sync', async () => {
    const { data } = await supabase.from('sync_log').select('created_at').eq('tipo', 'corretor').order('created_at', { ascending: false }).limit(1)
    const d = data?.[0]?.created_at
    return { status: d ? 'ok' : 'aviso', detalhe: d ? `Último: ${d}` : 'Nunca rodou' }
  })

  // 11. CRM conexão
  await run('crm_conexao', 'Conexão CRM', async () => {
    const { data } = await supabase.from('sync_log').select('created_at, sucesso, erro').eq('tipo', 'corretor').order('created_at', { ascending: false }).limit(1)
    const log = data?.[0]
    if (!log) return { status: 'aviso', detalhe: 'Nenhum sync registrado' }
    return { status: log.sucesso ? 'ok' : 'erro', detalhe: log.sucesso ? `OK: ${log.created_at}` : `Erro: ${log.erro}` }
  })

  // 12. % leads sincronizados
  await run('crm_tabela_leads', '% leads sincronizados', async () => {
    const { count: comId } = await supabase.from('public_leads').select('*', { count: 'exact', head: true }).not('uhomesales_lead_id', 'is', null).not('nome', 'ilike', '%TESTE%')
    const { count: semId } = await supabase.from('public_leads').select('*', { count: 'exact', head: true }).is('uhomesales_lead_id', null).not('nome', 'ilike', '%TESTE%')
    const total = (comId ?? 0) + (semId ?? 0)
    const pct = total > 0 ? Math.round(((comId ?? 0) / total) * 100) : 0
    return {
      status: total === 0 ? 'aviso' : pct >= 80 ? 'ok' : pct >= 50 ? 'aviso' : 'erro',
      detalhe: total === 0 ? 'Nenhum lead' : `${comId}/${total} (${pct}%)`
    }
  })

  // 13. Status recebidos
  await run('crm_fn_status', 'Status recebidos do CRM', async () => {
    const { data } = await supabase.from('sync_log').select('created_at').eq('direcao', 'crm->site').in('tipo', ['status', 'lead_status']).order('created_at', { ascending: false }).limit(1)
    return { status: data?.length ? 'ok' : 'aviso', detalhe: data?.length ? `Último: ${data[0].created_at}` : 'Nenhum' }
  })

  // Contadores
  const ok = results.filter(r => r.status === 'ok').length
  const avisos = results.filter(r => r.status === 'aviso').length
  const erros = results.filter(r => r.status === 'erro').length

  // Salvar no banco
  await supabase.from('diagnostico_log').insert({
    total_testes: results.length,
    ok,
    avisos,
    erros,
    resultados: results,
    origem: 'cron'
  })

  // Também registrar no sync_log se houver erros
  if (erros > 0) {
    await supabase.from('sync_log').insert({
      direcao: 'site->site',
      tipo: 'diagnostico',
      sucesso: false,
      erro: `${erros} erro(s) encontrado(s)`,
      payload: { ok, avisos, erros, falhas: results.filter(r => r.status === 'erro').map(r => r.nome) }
    })
  }

  return new Response(JSON.stringify({
    ok: erros === 0,
    total: results.length,
    ok_count: ok,
    avisos,
    erros,
    resultados: results
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
