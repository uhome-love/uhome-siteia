import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  // Called by pg_net trigger — no CORS needed
  let record: Record<string, unknown>

  try {
    const body = await req.json()
    record = body.record
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const supabaseSite = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const supabaseCRM = createClient(
    Deno.env.get('UHOMESALES_SUPABASE_URL')!,
    Deno.env.get('UHOMESALES_SERVICE_ROLE_KEY')!
  )

  // 1. Buscar ID do corretor no CRM via uhomesales_id
  let corretorCRMId = null
  if (record.corretor_ref_id) {
    const { data: perfil } = await supabaseSite
      .from('profiles')
      .select('uhomesales_id')
      .eq('id', record.corretor_ref_id as string)
      .maybeSingle()
    corretorCRMId = perfil?.uhomesales_id ?? null
  }

  // 2. Se não tem corretor específico, buscar corretor de plantão
  if (!corretorCRMId) {
    const { data: plantao } = await supabaseCRM
      .from('profiles')
      .select('id')
      .eq('role', 'corretor')
      .eq('de_plantao', true)
      .eq('ativo', true)
      .limit(1)
      .maybeSingle()
    corretorCRMId = plantao?.id ?? null
  }

  // 3. Criar lead no CRM
  const { data: leadCRM, error } = await supabaseCRM
    .from('leads')
    .insert({
      nome: record.nome,
      telefone: record.telefone,
      email: record.email ?? null,
      origem: 'site_uhome',
      origem_detalhe: record.origem_componente,
      imovel_interesse: record.imovel_titulo ?? null,
      imovel_id_site: record.imovel_id ?? null,
      bairro_interesse: record.imovel_bairro ?? null,
      status: 'novo',
      atribuido_para: corretorCRMId,
      corretor_ref_slug: record.corretor_ref_slug ?? null,
      site_lead_id: record.id,
      origem_site: record.origem_ref ?? 'organico',
      utm_source: record.utm_source ?? null,
      utm_campaign: record.utm_campaign ?? null,
      created_at: record.created_at,
    })
    .select()
    .single()

  // 4. Atualizar lead no site com ID do CRM
  if (leadCRM) {
    await supabaseSite
      .from('public_leads')
      .update({
        uhomesales_lead_id: leadCRM.id,
        sincronizado_em: new Date().toISOString()
      })
      .eq('id', record.id as string)
  }

  // 5. Log
  await supabaseSite.from('sync_log').insert({
    direcao: 'site->crm',
    tipo: 'lead',
    payload: {
      lead_id: record.id,
      crm_lead_id: leadCRM?.id,
      corretor: corretorCRMId
    },
    sucesso: !error,
    erro: error?.message ?? null
  })

  return new Response(JSON.stringify({
    ok: !error,
    crm_lead_id: leadCRM?.id ?? null
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
