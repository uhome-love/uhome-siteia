import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { decidirDistribuicao, temCorretorAtivo, variacoesTelefone } from './distribuicao.ts'

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

  // Sem corretor de link: o lead vai para a Fila do CEO (distribuição manual no CRM).

  // Validate corretor exists in CRM profiles to avoid FK violations
  if (corretorCRMId) {
    const { data: exists } = await supabaseCRM
      .from('profiles')
      .select('id')
      .eq('id', corretorCRMId)
      .maybeSingle()
    if (!exists) {
      console.warn(`[sync-to-crm] Corretor ${corretorCRMId} not found in CRM profiles, setting null`)
      corretorCRMId = null
    }
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
    } else if (tipo === 'favorito') {
      // Favoritos não são sincronizados ao CRM (apenas tracking interno).
      // Tratamos como sucesso silencioso para não poluir sync_log com erros.
      console.info(`[sync-to-crm] favorito ignorado (no-op) record=${record.id}`)
      result = { ok: true, crm_lead_id: null }
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

  // Alerta por e-mail ao Lucas a cada novo lead do site (via Gmail dele)
  if (tipo === 'lead' && !String(record.nome ?? '').toUpperCase().includes('TESTE')) {
    await enviarAlertaLead(record).catch((e) => console.error('[sync-to-crm] alerta e-mail:', (e as Error).message))
  }

  // Send notification to CRM if corretor is assigned
  if (result.ok && corretorCRMId) {
    await createCRMNotification(supabaseCRM, corretorCRMId, tipo, record)
  }

  // Send notification to site's notificacoes table for corretor
  const siteCorretorId = record.corretor_ref_id as string | null
  if (result.ok && siteCorretorId && tipo === 'lead') {
    try {
      await supabaseSite.from('notificacoes').insert({
        user_id: siteCorretorId,
        tipo: 'lead_recebido',
        titulo: 'Novo lead pelo seu link!',
        mensagem: `${record.nome} tem interesse em ${record.imovel_titulo || 'imóveis'}.`,
        lead_id: record.id ?? null,
        imovel_slug: record.imovel_slug ?? null,
        lida: false,
      })
    } catch {
      console.error('[sync-to-crm] Failed to insert site notification')
    }
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})

// ─── Helpers ─────────────────────────────────────────────────────
function extractImovelCodigo(slug: string | null | undefined): string | null {
  if (!slug) return null
  const match = slug.match(/(\d+(?:-[A-Za-z]+)?)$/)
  return match ? match[1] : null
}

const ORIGEM_LABELS: Record<string, string> = {
  detalhe_sidebar: 'Página do Imóvel',
  detalhe_mobile_sticky: 'Página do Imóvel (Mobile)',
  sticky_cta: 'Página do Imóvel (Sticky)',
  busca_cta: 'Página de Busca',
  floating_whatsapp: 'Botão WhatsApp',
  exit_intent: 'Pop-up de Saída',
  retargeting_popup: 'Pop-up de Retargeting',
  banner_corretor: 'Banner do Corretor',
  agendamento_visita: 'Agendamento de Visita',
  empreendimento_lead: 'Página do Empreendimento',
  lead_inline: 'Formulário na Página',
  busca_alerta: 'Alerta de Busca',
  lia_chat: 'LIA no site',
  lp_studios_cyrela: 'Landing Studios Cyrela (investimento)',
  hero_form: 'Formulário do topo',
  alerta_busca_modal: 'Alerta de Busca',
  wizard_onboarding: 'Cadastro guiado',
}

const RASTREIO_CAMPOS = ['pagina_url', 'origem_componente', 'formulario', 'device', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'referrer', 'landing_url'] as const
function rastreioDoRecord(record: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const k of RASTREIO_CAMPOS) out[k] = record[k] ?? (k === 'referrer' ? '' : null)
  if (!out.pagina_url) out.pagina_url = record.origem_pagina ?? null
  if (!out.landing_url) out.landing_url = record.landing_page ?? null
  return out
}

function humanizeOrigem(componente: string | null | undefined): string | null {
  if (!componente) return null
  return ORIGEM_LABELS[componente] ?? componente
}

// ─── Lead handler (existing flow) ────────────────────────────────
async function handleLead(
  supabaseSite: any,
  supabaseCRM: any,
  record: Record<string, unknown>,
  corretorCRMId: string | null
) {
  const imovelSlug = (record.imovel_slug as string) ?? null
  const imovelCodigo = (record.imovel_codigo as string) ?? extractImovelCodigo(imovelSlug)

  // Build observacoes with full context for CRM
  const obsLines: string[] = ['[Site uhome.com.br]']
  if (record.imovel_titulo) obsLines.push(`Imóvel: ${record.imovel_titulo}`)
  if (imovelCodigo) obsLines.push(`Código: ${imovelCodigo}`)
  if (record.imovel_bairro) obsLines.push(`Bairro: ${record.imovel_bairro}`)
  if (record.imovel_preco) obsLines.push(`Preço: R$ ${Number(record.imovel_preco).toLocaleString('pt-BR')}`)
  if (imovelSlug) obsLines.push(`Link: https://uhome.com.br/imovel/${imovelSlug}`)
  if (record.email) obsLines.push(`Email: ${record.email}`)
  const origemLabel = humanizeOrigem(record.origem_componente as string)
  if (origemLabel) obsLines.push(`Origem: ${origemLabel}`)
  if (record.origem_pagina) obsLines.push(`Página: ${record.origem_pagina}`)
  if (record.utm_source) obsLines.push(`UTM: ${record.utm_source}${record.utm_campaign ? ` / ${record.utm_campaign}` : ''}`)
  if (record.device) obsLines.push(`Device: ${record.device}`)
  if (record.formulario) obsLines.push(`Formulário: ${record.formulario}`)
  if (record.utm_term) obsLines.push(`Palavra pesquisada: ${record.utm_term}`)
  if (record.gclid) obsLines.push(`Google Ads gclid: ${record.gclid}`)
  else if (record.gbraid || record.wbraid) obsLines.push(`Google Ads: ${record.gbraid ? 'gbraid ' + record.gbraid : 'wbraid ' + record.wbraid}`)
  if (record.fbclid) obsLines.push(`Meta fbclid: ${record.fbclid}`)
  if (record.landing_url) obsLines.push(`Primeira página: ${record.landing_url}`)
  if (record.referrer !== undefined && record.referrer !== null) obsLines.push(`Veio de: ${record.referrer || 'acesso direto'}`)
  obsLines.push(...contextoLinhas(record.contexto))
  const observacoes = obsLines.join('\n')

  // Build imovel_interesse with code for easy identification in CRM
  const tituloBase = (record.imovel_titulo as string) ?? null
  const imovelInteresse = tituloBase && imovelCodigo
    ? `${tituloBase} (${imovelCodigo})`
    : tituloBase

  const payload = {
    nome: record.nome,
    telefone: record.telefone,
    email: record.email ?? null,
    origem: 'site_uhome',
    origem_detalhe: humanizeOrigem(record.origem_componente as string) ?? null,
    imovel_interesse: imovelInteresse,
    imovel_id_site: record.imovel_id ?? null,
    imovel_slug: imovelSlug,
    imovel_codigo: imovelCodigo,
    bairro_interesse: record.imovel_bairro ?? null,
    status: 'novo',
    atribuido_para: corretorCRMId,
    site_lead_id: record.id,
    utm_source: record.utm_source ?? null,
    utm_campaign: record.utm_campaign ?? null,
    observacoes,
  }

  let { data: leadCRM, error } = await supabaseCRM
    .from('leads')
    .upsert(payload, { onConflict: 'site_lead_id' })
    .select()
    .single()

  // Retry without corretor if FK violation
  if (error?.message?.includes('foreign key constraint') && corretorCRMId) {
    console.warn('[sync-to-crm] FK violation on atribuido_para, retrying without corretor')
    const retryResult = await supabaseCRM
      .from('leads')
      .upsert({ ...payload, atribuido_para: null }, { onConflict: 'site_lead_id' })
      .select()
      .single()
    leadCRM = retryResult.data
    error = retryResult.error
  }

  if (leadCRM) {
    await moverParaFilaCEO(supabaseCRM, leadCRM.pipeline_lead_id, corretorCRMId, record, observacoes)
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
  const imovelSlug = (record.imovel_slug as string) ?? null
  const imovelCodigo = (record.imovel_codigo as string) ?? extractImovelCodigo(imovelSlug)

  const agendLines: string[] = ['[Site uhome.com.br] Agendamento de Visita']
  agendLines.push(`Data: ${record.data_visita} às ${record.horario}`)
  if (record.imovel_titulo) agendLines.push(`Imóvel: ${record.imovel_titulo}`)
  if (imovelCodigo) agendLines.push(`Código: ${imovelCodigo}`)
  if (record.imovel_bairro) agendLines.push(`Bairro: ${record.imovel_bairro}`)
  if (imovelSlug) agendLines.push(`Link: https://uhome.com.br/imovel/${imovelSlug}`)
  if (record.turno) agendLines.push(`Turno preferido: ${record.turno}`)
  if (record.origem_pagina) agendLines.push(`Página: ${record.origem_pagina}`)
  agendLines.push(...contextoLinhas(record.contexto))
  const obsAgend = agendLines.join('\n')

  const tituloAgend = (record.imovel_titulo as string) ?? null
  const interesseAgend = tituloAgend && imovelCodigo
    ? `${tituloAgend} (${imovelCodigo})`
    : tituloAgend

  // Mesma pessoa já virou lead nos últimos 7 dias (ex.: LIA registrou o contato antes da visita):
  // atualiza esse lead em vez de criar um duplicado no CRM.
  const desde = new Date(Date.now() - 7 * 864e5).toISOString()
  const { data: existente } = record.telefone && !corretorCRMId
    ? await supabaseCRM.from('leads').select('id,pipeline_lead_id,observacoes')
        .eq('telefone', record.telefone).eq('origem', 'site_uhome').gte('created_at', desde)
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
    : { data: null }
  if (existente) {
    const obs = `${obsAgend}\n\n${existente.observacoes ?? ''}`.slice(0, 8000)
    const { error: upErr } = await supabaseCRM.from('leads').update({
      status: 'agendado', observacoes: obs,
      ...(interesseAgend ? { imovel_interesse: interesseAgend } : {}),
    }).eq('id', existente.id)
    await moverParaFilaCEO(supabaseCRM, existente.pipeline_lead_id, corretorCRMId, record, obs, {
      proxima_acao: `Visita solicitada pelo site: ${record.data_visita}${record.turno ? ' (' + record.turno + ')' : ''}${record.horario ? ' ' + record.horario : ''}`,
      data_proxima_acao: record.data_visita ?? null,
    })
    return { ok: !upErr, crm_lead_id: existente.id, error: upErr?.message }
  }

  const { data: leadCRM, error } = await supabaseCRM
    .from('leads')
    .insert({
      nome: record.nome,
      telefone: record.telefone,
      origem: 'site_uhome',
      origem_detalhe: 'Agendamento de Visita',
      imovel_interesse: interesseAgend,
      imovel_id_site: record.imovel_id ?? null,
      imovel_slug: imovelSlug,
      imovel_codigo: imovelCodigo,
      bairro_interesse: record.imovel_bairro ?? null,
      status: 'agendado',
      atribuido_para: corretorCRMId,
      observacoes: obsAgend,
    })
    .select()
    .single()

  if (leadCRM) {
    await moverParaFilaCEO(supabaseCRM, leadCRM.pipeline_lead_id, corretorCRMId, record, obsAgend, {
      proxima_acao: `Visita solicitada pelo site: ${record.data_visita}${record.turno ? ' (' + record.turno + ')' : ''}${record.horario ? ' ' + record.horario : ''}`,
      data_proxima_acao: record.data_visita ?? null,
    })
    // Com corretor definido (link personalizado), a visita já nasce na agenda dele.
    if (corretorCRMId && record.data_visita) {
      const { error: vErr } = await supabaseCRM.from('visitas').insert({
        corretor_id: corretorCRMId,
        created_by: corretorCRMId,
        data_visita: record.data_visita,
        hora_visita: /^\d{2}:\d{2}/.test(String(record.horario ?? '')) ? String(record.horario).slice(0, 5) : null,
        nome_cliente: record.nome,
        telefone: record.telefone,
        empreendimento: interesseAgend,
        pipeline_lead_id: leadCRM.pipeline_lead_id ?? null,
        lead_site_id: record.id,
        origem: 'site_uhome',
        origem_detalhe: (record.contexto as any)?.canal === 'lia' ? 'LIA no site' : 'Agendamento no site',
        observacoes: obsAgend,
      })
      if (vErr) console.error('[sync-to-crm] visita não criada:', vErr.message)
    }
  }

  return { ok: !error, crm_lead_id: leadCRM?.id ?? null, error: error?.message }
}

// ─── Fila do CEO + contexto ──────────────────────────────────────
function contextoLinhas(ctx: unknown): string[] {
  if (!ctx || typeof ctx !== 'object') return []
  const c = ctx as Record<string, any>
  const l: string[] = []
  if (c.canal === 'lia') l.push('Canal: conversa com a LIA no site')
  if (c.resumo) l.push(`Resumo da LIA: ${c.resumo}`)
  const q = c.qualificacao
  if (q && typeof q === 'object') {
    for (const [k, v] of Object.entries(q)) if (v) l.push(`${k}: ${v}`)
  }
  if (c.produto) l.push(`Produto de interesse: ${c.produto}`)
  if (c.campanha) l.push(`Campanha: ${c.campanha}`)
  if (c.gclid) l.push(`Google Ads gclid: ${c.gclid}`)
  if (c.utm_term) l.push(`Palavra buscada: ${c.utm_term}`)
  const r = c.rastreamento
  if (r && typeof r === 'object') {
    if (r.fonte) l.push(`Fonte: ${r.fonte}`)
    if (r.primeira_visita_em) l.push(`1ª visita: ${new Date(r.primeira_visita_em).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`)
    if (r.numero_visitas) l.push(`Nº de visitas: ${r.numero_visitas}`)
    if (r.tempo_no_site_min !== undefined) l.push(`Tempo no site (visita atual): ${r.tempo_no_site_min} min`)
    if (Array.isArray(r.imoveis_vistos) && r.imoveis_vistos.length) l.push(`Últimos imóveis vistos: ${r.imoveis_vistos.join(', ')}`)
    if (r.favoritos) l.push(`Favoritos: ${r.favoritos}`)
    if (Array.isArray(r.buscas) && r.buscas.length) l.push(`Buscas: ${r.buscas.join(' | ')}`)
    if (r.conversou_com_lia) l.push('Conversou com a LIA: sim')
    if (r.ja_enviou_contato_antes) l.push('Cliente que voltou: já tinha enviado contato antes')
  }
  if (Array.isArray(c.paginas) && c.paginas.length) l.push(`Páginas vistas: ${c.paginas.slice(-10).join(' → ')}`)
  if (Array.isArray(c.imoveis_vistos) && c.imoveis_vistos.length) l.push(`Imóveis vistos: ${c.imoveis_vistos.slice(-10).join(', ')}`)
  if (c.ultima_busca) l.push(`Última busca: ${c.ultima_busca}`)
  return l
}

async function buscarEstados(supabaseCRM: any, pipelineLeadId: string, record: Record<string, unknown>) {
  const cols = 'id,corretor_id,arquivado,motivo_descarte,tipo_descarte,observacoes,dados_site,stage_id'
  const map = new Map<string, any>()
  const { data: atual } = await supabaseCRM.from('pipeline_leads').select(cols).eq('id', pipelineLeadId).maybeSingle()
  if (atual) map.set(atual.id, atual)
  const tels = variacoesTelefone(record.telefone)
  if (tels.length) {
    const { data } = await supabaseCRM.from('pipeline_leads').select(cols).in('telefone_normalizado', tels).limit(20)
    for (const r of data ?? []) map.set(r.id, r)
  }
  const email = String(record.email ?? '').trim().toLowerCase()
  if (email.includes('@')) {
    const { data } = await supabaseCRM.from('pipeline_leads').select(cols).ilike('email', email).limit(20)
    for (const r of data ?? []) map.set(r.id, r)
  }
  const rows = [...map.values()]
  const stageIds = [...new Set(rows.map((r) => r.stage_id).filter(Boolean))]
  const tipos = new Map<string, string>()
  if (stageIds.length) {
    const { data } = await supabaseCRM.from('pipeline_stages').select('id,tipo').in('id', stageIds)
    for (const st of data ?? []) tipos.set(st.id, st.tipo)
  }
  return rows.map((r) => ({ ...r, stage_tipo: tipos.get(r.stage_id) ?? null }))
}

async function moverParaFilaCEO(
  supabaseCRM: any,
  pipelineLeadId: string | null | undefined,
  corretorCRMId: string | null,
  record: Record<string, unknown>,
  observacoes: string,
  extra: Record<string, unknown> = {},
  dadosExtra: Record<string, unknown> = {},
) {
  if (!pipelineLeadId) return
  const dadosSite = { site_lead_id: record.id, contexto: record.contexto ?? null, ...rastreioDoRecord(record), fonte: (record.contexto as any)?.rastreamento?.fonte ?? null, ...dadosExtra }
  const estados = await buscarEstados(supabaseCRM, pipelineLeadId, record)

  // Pessoa já existe no CRM com corretor ativo: só acrescenta dados, o CRM decide o resto.
  if (decidirDistribuicao(estados) === 'so_acrescentar') {
    const alvos = estados.filter(temCorretorAtivo)
    const extraTxt = extra.proxima_acao ? `\n${extra.proxima_acao}` : ''
    for (const alvo of alvos) {
      const obs = alvo.id === pipelineLeadId && alvo.observacoes?.includes(observacoes)
        ? alvo.observacoes
        : `${observacoes}${extraTxt}\n\n${alvo.observacoes ?? ''}`.slice(0, 8000)
      const { error } = await supabaseCRM.from('pipeline_leads').update({
        dados_site: { ...(alvo.dados_site ?? {}), ...dadosSite },
        observacoes: obs,
        updated_at: new Date().toISOString(),
      }).eq('id', alvo.id)
      if (error) console.error('[sync-to-crm] acrescentar dados falhou:', error.message)
    }
    console.log(`[sync-to-crm] pessoa já com corretor no CRM; só dados acrescentados em ${alvos.length} lead(s)`)
    return
  }

  const patch: Record<string, unknown> = { dados_site: dadosSite, observacoes, ...extra, updated_at: new Date().toISOString() }
  if (!corretorCRMId) {
    Object.assign(patch, {
      corretor_id: null,
      aceite_status: 'pendente_distribuicao',
      motivo_pendencia: 'fila_ceo_site',
      distribuido_em: null,
      aceito_em: null,
    })
  }
  const { error } = await supabaseCRM.from('pipeline_leads').update(patch).eq('id', pipelineLeadId)
  if (error) console.error('[sync-to-crm] fila CEO falhou:', error.message)
}

// ─── Captação handler ────────────────────────────────────────────
async function handleCaptacao(
  supabaseCRM: any,
  record: Record<string, unknown>,
  corretorCRMId: string | null
) {
  const ctx = (record.contexto ?? {}) as any
  const info = (record.dados_imovel ?? ctx.captacao ?? {}) as Record<string, unknown>
  const captacao = {
    ...info,
    tipo_imovel: record.tipo_imovel ?? info.tipo_imovel ?? null,
    finalidade: record.finalidade ?? info.finalidade ?? 'venda',
    bairro: record.bairro ?? info.bairro ?? null,
    cidade: record.cidade ?? info.cidade ?? null,
    endereco: record.endereco ?? info.endereco ?? null,
    valor_pretendido: record.valor_pretendido ?? info.valor_pretendido ?? null,
    quartos: record.quartos ?? info.quartos ?? null,
    area: record.area ?? info.area ?? null,
    mensagem: record.mensagem ?? info.mensagem ?? null,
  }
  const l: string[] = ['[Site uhome.com.br] Captação de imóvel']
  if (captacao.tipo_imovel) l.push(`Tipo: ${captacao.tipo_imovel}`)
  l.push(`Finalidade: ${captacao.finalidade}`)
  const local = [captacao.endereco, captacao.bairro, captacao.cidade].filter(Boolean).join(', ')
  if (local) l.push(`Local: ${local}`)
  if (captacao.valor_pretendido) l.push(`Valor pretendido: ${captacao.valor_pretendido}`)
  if (captacao.quartos) l.push(`Quartos: ${captacao.quartos}`)
  if (captacao.area) l.push(`Área: ${captacao.area} m²`)
  if (captacao.mensagem) l.push(`Mensagem: ${captacao.mensagem}`)
  if (record.formulario) l.push(`Formulário: ${record.formulario}`)
  if (record.pagina_url) l.push(`Página: ${record.pagina_url}`)
  if (record.device) l.push(`Aparelho: ${record.device}`)
  if (record.utm_source) l.push(`UTM: ${record.utm_source}${record.utm_campaign ? ` / ${record.utm_campaign}` : ''}`)
  if (record.utm_term) l.push(`Palavra pesquisada: ${record.utm_term}`)
  if (record.gclid) l.push(`Google Ads gclid: ${record.gclid}`)
  else if (record.gbraid || record.wbraid) l.push(`Google Ads: ${record.gbraid ? 'gbraid ' + record.gbraid : 'wbraid ' + record.wbraid}`)
  if (record.fbclid) l.push(`Meta fbclid: ${record.fbclid}`)
  if (record.landing_url) l.push(`Primeira página: ${record.landing_url}`)
  if (record.referrer !== undefined && record.referrer !== null) l.push(`Veio de: ${record.referrer || 'acesso direto'}`)
  l.push(...contextoLinhas(record.contexto))
  const observacoes = l.join('\n')

  const payload = {
    nome: record.nome,
    telefone: record.telefone,
    origem: 'site_uhome',
    origem_detalhe: 'captacao_imovel',
    bairro_interesse: captacao.bairro,
    status: 'novo',
    atribuido_para: corretorCRMId,
    site_lead_id: record.id,
    utm_source: record.utm_source ?? null,
    utm_campaign: record.utm_campaign ?? null,
    observacoes,
  }
  let { data: leadCRM, error } = await supabaseCRM.from('leads').upsert(payload, { onConflict: 'site_lead_id' }).select().single()
  if (error?.message?.includes('foreign key constraint') && corretorCRMId) {
    const r = await supabaseCRM.from('leads').upsert({ ...payload, atribuido_para: null }, { onConflict: 'site_lead_id' }).select().single()
    leadCRM = r.data; error = r.error
  }
  if (leadCRM) {
    await moverParaFilaCEO(supabaseCRM, leadCRM.pipeline_lead_id, corretorCRMId, record, observacoes, {}, { captacao })
  }
  return { ok: !error, crm_lead_id: leadCRM?.id ?? null, error: error?.message }
}

// ─── WhatsApp click handler ──────────────────────────────────────
// Cada clique em WhatsApp vai ao CRM pelo mesmo endpoint de leads de landing (receive-landing-lead).
async function handleWhatsAppClick(
  _supabaseCRM: any,
  record: Record<string, unknown>,
  corretorCRMId: string | null
) {
  const base = Deno.env.get('UHOMESALES_SUPABASE_URL')!
  const key = Deno.env.get('UHOMESALES_SERVICE_ROLE_KEY')!
  const payload = {
    tipo: 'clique_whatsapp',
    site_click_id: record.id,
    visitor_id: record.visitor_id ?? null,
    session_id: record.session_id ?? null,
    nome: record.nome ?? null,
    telefone: record.telefone ?? null,
    email: record.email ?? null,
    pagina_url: record.pagina_url ?? record.origem_pagina ?? null,
    empreendimento: record.imovel_titulo ?? null,
    imovel_slug: record.imovel_slug ?? null,
    mensagem: record.mensagem ?? null,
    whatsapp_destino: record.destino ?? null,
    origem_componente: record.origem_componente ?? null,
    formulario: record.formulario ?? 'Clique no WhatsApp',
    device: record.device ?? null,
    fonte: record.fonte ?? null,
    utm_source: record.utm_source ?? null, utm_medium: record.utm_medium ?? null,
    utm_campaign: record.utm_campaign ?? null, utm_content: record.utm_content ?? null, utm_term: record.utm_term ?? null,
    gclid: record.gclid ?? null, gbraid: record.gbraid ?? null, wbraid: record.wbraid ?? null, fbclid: record.fbclid ?? null,
    referrer: record.referrer ?? '',
    landing_url: record.landing_url ?? null,
    corretor_id: corretorCRMId,
    corretor_ref_slug: record.corretor_ref_slug ?? null,
    contexto: record.contexto ?? null,
    created_at: record.created_at ?? null,
  }
  const res = await fetch(`${base}/functions/v1/receive-landing-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify(payload),
  })
  const txt = await res.text()
  let body: any = null
  try { body = JSON.parse(txt) } catch { /* texto */ }
  if (!res.ok) return { ok: false, crm_lead_id: null, error: `receive-landing-lead ${res.status}: ${txt.slice(0, 300)}` }
  return { ok: true, crm_lead_id: body?.lead_id ?? body?.id ?? null, error: undefined }
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


// ─── Alerta por e-mail (Gmail do Lucas) ──────────────────────────
const ALERTA_PARA = 'lucas@uhome.com.br'
function b64(str: string) {
  return btoa(Array.from(new TextEncoder().encode(str), (b) => String.fromCharCode(b)).join(''))
}
function hdr(v: string) { return /^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=` }
async function enviarAlertaLead(r: Record<string, unknown>) {
  const lovKey = Deno.env.get('LOVABLE_API_KEY')
  const gmKey = Deno.env.get('GOOGLE_MAIL_API_KEY')
  if (!lovKey || !gmKey) { console.warn('[sync-to-crm] Gmail não configurado'); return }
  const ctx = (r.contexto ?? {}) as Record<string, any>
  const rt = (ctx.rastreamento ?? {}) as Record<string, any>
  const tel = String(r.telefone ?? '').replace(/\D/g, '')
  const linhas = [
    `Nome: ${r.nome ?? '-'}`,
    `Telefone: ${r.telefone ?? '-'}${tel.length >= 10 ? `  (WhatsApp: https://wa.me/${tel.startsWith('55') ? tel : '55' + tel})` : ''}`,
    r.email ? `E-mail: ${r.email}` : '',
    r.imovel_titulo ? `Imóvel: ${r.imovel_titulo}` : '',
    r.imovel_slug ? `Link: https://uhome.com.br/imovel/${r.imovel_slug}` : '',
    `Formulário: ${r.formulario ?? humanizeOrigem(r.origem_componente as string) ?? '-'}`,
    `Fonte: ${rt.fonte ?? r.origem_canal ?? r.utm_source ?? 'não informada'}`,
    r.utm_campaign ? `Campanha: ${r.utm_campaign}` : '',
    r.utm_term ? `Palavra pesquisada: ${r.utm_term}` : '',
    `Página: ${r.pagina_url ?? r.origem_pagina ?? '-'}`,
    r.device ? `Aparelho: ${r.device}` : '',
    ctx.resumo ? `Resumo da LIA: ${ctx.resumo}` : '',
    '',
    'O lead já está no CRM (Fila do CEO, se não veio por link de corretor).',
  ].filter((l) => l !== '')
  const assunto = `Novo lead do site: ${r.nome ?? 'sem nome'}${r.imovel_titulo ? ' · ' + r.imovel_titulo : ''}`
  const raw = [
    `To: ${ALERTA_PARA}`,
    `Subject: ${hdr(assunto)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    b64(linhas.join('\n')),
  ].join('\r\n')
  const res = await fetch('https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${lovKey}`, 'X-Connection-Api-Key': gmKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: b64(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }),
  })
  if (!res.ok) throw new Error(`Gmail [${res.status}]: ${await res.text()}`)
}
