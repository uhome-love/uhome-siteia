import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  let tipo: string
  let record: Record<string, unknown>

  try {
    const body = await req.json()
    // Support both old format (just record) and new format (tipo + record)
    if (body.tipo) {
      tipo = body.tipo
      record = body.record
    } else {
      tipo = 'lead'
      record = body.record
    }
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

  // Resolve corretor CRM ID
  let corretorCRMId: string | null = null
  const corretorRefId = record.corretor_ref_id as string | null

  if (corretorRefId) {
    const { data: perfil } = await supabaseSite
      .from('profiles')
      .select('uhomesales_id')
      .eq('id', corretorRefId)
      .maybeSingle()
    corretorCRMId = perfil?.uhomesales_id ?? null
  }

  // Fallback: corretor de plantão
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

  let result: { ok: boolean; crm_lead_id?: string | null; error?: string } = { ok: false }

  try {
    if (tipo === 'lead') {
      result = await handleLead(supabaseSite, supabaseCRM, record, corretorCRMId)
    } else if (tipo === 'agendamento') {
      result = await handleAgendamento(supabaseCRM, record, corretorCRMId)
    } else if (tipo === 'captacao') {
      result = await handleCaptacao(supabaseCRM, record, corretorCRMId)
    } else if (tipo === 'whatsapp_click') {
      result = await handleWhatsAppClick(supabaseCRM, record, corretorCRMId)
    } else {
      result = { ok: false, error: `Unknown tipo: ${tipo}` }
    }
  } catch (err) {
    result = { ok: false, error: (err as Error).message }
  }

  // Log
  await supabaseSite.from('sync_log').insert({
    direcao: 'site->crm',
    tipo,
    payload: {
      record_id: record.id,
      crm_lead_id: result.crm_lead_id,
      corretor: corretorCRMId,
      tipo,
    },
    sucesso: result.ok,
    erro: result.error ?? null
  })

  // Send notification to CRM if corretor is assigned
  if (result.ok && corretorCRMId) {
    await createCRMNotification(supabaseCRM, corretorCRMId, tipo, record)
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})

// ─── Lead handler (existing flow) ────────────────────────────────
async function handleLead(
  supabaseSite: any,
  supabaseCRM: any,
  record: Record<string, unknown>,
  corretorCRMId: string | null
) {
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
      site_lead_id: record.id,
      utm_source: record.utm_source ?? null,
      utm_campaign: record.utm_campaign ?? null,
      created_at: record.created_at,
    })
    .select()
    .single()

  if (leadCRM) {
    await supabaseSite
      .from('public_leads')
      .update({
        uhomesales_lead_id: leadCRM.id,
        sincronizado_em: new Date().toISOString()
      })
      .eq('id', record.id as string)
  }

  return { ok: !error, crm_lead_id: leadCRM?.id ?? null, error: error?.message }
}

// ─── Agendamento handler ─────────────────────────────────────────
async function handleAgendamento(
  supabaseCRM: any,
  record: Record<string, unknown>,
  corretorCRMId: string | null
) {
  // Create/update lead in CRM pipeline with agendamento info
  const { data: leadCRM, error } = await supabaseCRM
    .from('leads')
    .insert({
      nome: record.nome,
      telefone: record.telefone,
      origem: 'site_uhome',
      origem_detalhe: 'agendamento_visita',
      imovel_interesse: record.imovel_titulo ?? null,
      imovel_id_site: record.imovel_id ?? null,
      status: 'agendado',
      atribuido_para: corretorCRMId,
      observacoes: `Visita agendada: ${record.data_visita} às ${record.horario}`,
    })
    .select()
    .single()

  return { ok: !error, crm_lead_id: leadCRM?.id ?? null, error: error?.message }
}

// ─── Captação handler ────────────────────────────────────────────
async function handleCaptacao(
  supabaseCRM: any,
  record: Record<string, unknown>,
  corretorCRMId: string | null
) {
  const { data: leadCRM, error } = await supabaseCRM
    .from('leads')
    .insert({
      nome: record.nome,
      telefone: record.telefone,
      origem: 'site_uhome',
      origem_detalhe: 'captacao_imovel',
      status: 'novo',
      atribuido_para: corretorCRMId,
      observacoes: `Captação: ${record.tipo_imovel ?? ''} em ${record.bairro ?? ''} - ${record.valor_pretendido ?? ''}`,
    })
    .select()
    .single()

  return { ok: !error, crm_lead_id: leadCRM?.id ?? null, error: error?.message }
}

// ─── WhatsApp click handler ──────────────────────────────────────
async function handleWhatsAppClick(
  supabaseCRM: any,
  record: Record<string, unknown>,
  corretorCRMId: string | null
) {
  // Create a lightweight lead entry for the WhatsApp click
  const { data: leadCRM, error } = await supabaseCRM
    .from('leads')
    .insert({
      nome: `WhatsApp - ${record.imovel_titulo || 'Geral'}`,
      telefone: 'via_whatsapp',
      origem: 'site_uhome',
      origem_detalhe: 'whatsapp_click',
      imovel_interesse: record.imovel_titulo ?? null,
      imovel_id_site: record.imovel_id ?? null,
      status: 'novo',
      atribuido_para: corretorCRMId,
      observacoes: `Clique no WhatsApp via link do corretor. Página: ${record.origem_pagina ?? '/'}`,
    })
    .select()
    .single()

  return { ok: !error, crm_lead_id: leadCRM?.id ?? null, error: error?.message }
}

// ─── CRM Notification ────────────────────────────────────────────
async function createCRMNotification(
  supabaseCRM: any,
  corretorCRMId: string,
  tipo: string,
  record: Record<string, unknown>
) {
  const messages: Record<string, string> = {
    lead: `Novo lead pelo seu link: ${record.nome} - ${record.imovel_titulo || 'interesse geral'}`,
    agendamento: `Visita agendada pelo seu link: ${record.nome} - ${record.imovel_titulo || ''} em ${record.data_visita} às ${record.horario}`,
    captacao: `Nova captação pelo seu link: ${record.nome} - ${record.tipo_imovel || 'imóvel'} em ${record.bairro || ''}`,
    whatsapp_click: `Clique no WhatsApp pelo seu link: ${record.imovel_titulo || 'página geral'}`,
  }

  try {
    // Insert notification in CRM
    await supabaseCRM.from('notifications').insert({
      user_id: corretorCRMId,
      tipo: `site_${tipo}`,
      mensagem: messages[tipo] || `Nova ação pelo seu link: ${tipo}`,
      lida: false,
      metadata: {
        tipo_acao: tipo,
        nome: record.nome ?? null,
        imovel: record.imovel_titulo ?? null,
        origem: 'site_uhome',
      },
    })
  } catch {
    // Non-blocking — notification failure shouldn't break sync
    console.error('[CRM Notification] Failed to create notification')
  }

  // Send email to corretor
  try {
    const { data: corretor } = await supabaseCRM
      .from('profiles')
      .select('email, nome')
      .eq('id', corretorCRMId)
      .maybeSingle()

    if (corretor?.email) {
      // Use CRM's send email function if available
      await supabaseCRM.functions.invoke('send-notification-email', {
        body: {
          to: corretor.email,
          subject: `[Uhome] ${messages[tipo]?.substring(0, 60) || 'Nova ação no site'}`,
          corretor_nome: corretor.nome,
          mensagem: messages[tipo] || 'Nova ação registrada pelo seu link.',
          tipo,
        }
      })
    }
  } catch {
    console.error('[CRM Email] Failed to send notification email')
  }
}
