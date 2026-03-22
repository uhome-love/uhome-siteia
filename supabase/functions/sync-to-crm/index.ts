import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const crm = createClient(
  Deno.env.get('UHOMESALES_SUPABASE_URL')!,
  Deno.env.get('UHOMESALES_SERVICE_ROLE_KEY')!
)

const WA_URL = Deno.env.get('WHATSAPP_API_URL')
const WA_KEY = Deno.env.get('WHATSAPP_API_KEY')
const WA_INSTANCE = Deno.env.get('WHATSAPP_INSTANCE')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { tipo, record } = await req.json()

    switch (tipo) {
      case 'lead':        await syncLead(record); break
      case 'agendamento': await syncAgendamento(record); break
      case 'busca_salva': await syncBuscaSalva(record); break
      case 'favorito':    await syncFavorito(record); break
      default: throw new Error(`Tipo desconhecido: ${tipo}`)
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('[sync-to-crm] Erro:', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// ═══════════════════════════════════════════════════
// 1. LEAD → criar no CRM + pipeline + notificar
// ═══════════════════════════════════════════════════
async function syncLead(lead: any) {
  // Buscar corretor de plantão
  const { data: plantao } = await crm
    .from('profiles')
    .select('id, nome, telefone')
    .eq('de_plantao', true)
    .eq('ativo', true)
    .order('updated_at', { ascending: true })
    .limit(1)
    .single()

  // Verificar se lead já existe (evitar duplicata)
  const { data: existente } = await crm
    .from('leads')
    .select('id')
    .eq('site_lead_id', lead.id)
    .single()

  if (existente) {
    console.log('Lead já existe no CRM:', existente.id)
    return
  }

  // Criar lead no CRM
  const { data: leadCrm, error: errLead } = await crm
    .from('leads')
    .insert({
      nome:                lead.nome,
      telefone:            lead.telefone,
      email:               lead.email ?? null,
      origem:              'site_uhome',
      origem_detalhe:      lead.origem_componente ?? 'desconhecido',
      site_lead_id:        lead.id,
      site_user_id:        lead.user_id ?? null,
      imovel_interesse:    lead.imovel_titulo ?? null,
      imovel_id_site:      lead.imovel_id ?? null,
      bairro_interesse:    lead.imovel_bairro ?? null,
      preco_interesse:     lead.imovel_preco ?? null,
      utm_source:          lead.utm_source ?? null,
      utm_medium:          lead.utm_medium ?? null,
      utm_campaign:        lead.utm_campaign ?? null,
      corretor_ref_id:     lead.corretor_ref_id ?? null,
      corretor_ref_slug:   lead.corretor_ref_slug ?? null,
      origem_ref:          lead.origem_ref ?? 'organico',
      status:              'novo',
      atribuido_para:      lead.corretor_ref_id ?? plantao?.id ?? null,
      created_at:          lead.created_at
    })
    .select()
    .single()

  if (errLead) throw errLead

  // Criar oportunidade no pipeline
  await crm.from('oportunidades').insert({
    lead_id:          leadCrm.id,
    responsavel_id:   plantao?.id ?? null,
    origem:           'site_uhome',
    status:           'aberta',
    etapa:            'contato_inicial',
    valor_estimado:   lead.imovel_preco ?? null,
    imovel_titulo:    lead.imovel_titulo ?? null,
    observacoes:      `Lead gerado via "${lead.origem_componente}" no site Uhome em ${new Date(lead.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`
  })

  // Notificar corretor de plantão
  if (plantao?.telefone) {
    const msg = [
      '🏠 *Novo lead — site Uhome!*',
      '',
      `👤 *Nome:* ${lead.nome}`,
      `📱 *WhatsApp:* ${formatTelefone(lead.telefone)}`,
      lead.imovel_titulo ? `🏘️ *Imóvel:* ${lead.imovel_titulo}` : null,
      lead.imovel_bairro ? `📍 *Bairro:* ${lead.imovel_bairro}` : null,
      lead.imovel_preco  ? `💰 *Valor:* R$ ${Number(lead.imovel_preco).toLocaleString('pt-BR')}` : null,
      `🔗 *Origem:* ${lead.origem_componente}`,
      '',
      '⚡ Responda rápido — leads frios perdem 80% da conversão!'
    ].filter(Boolean).join('\n')

    await sendWhatsApp(plantao.telefone, msg)
  }
}

// ═══════════════════════════════════════════════════
// 2. AGENDAMENTO → visita no CRM + notificar corretor
// ═══════════════════════════════════════════════════
async function syncAgendamento(ag: any) {
  let { data: lead } = await crm
    .from('leads')
    .select('id, atribuido_para, profiles:atribuido_para(telefone, nome)')
    .eq('telefone', ag.telefone)
    .single()

  if (!lead) {
    const { data: plantao } = await crm
      .from('profiles')
      .select('id, telefone')
      .eq('de_plantao', true)
      .limit(1)
      .single()

    const { data: novoLead } = await crm
      .from('leads')
      .insert({
        nome:             ag.nome,
        telefone:         ag.telefone,
        origem:           'site_uhome',
        origem_detalhe:   'agendamento_visita',
        status:           'visita_agendada',
        imovel_interesse: ag.imovel_titulo,
        atribuido_para:   plantao?.id
      })
      .select('id, atribuido_para')
      .single()
    lead = novoLead as any
  } else {
    await crm.from('leads')
      .update({ status: 'visita_agendada' })
      .eq('id', lead.id)
  }

  if (!lead) return

  // Criar visita
  await crm.from('visitas').insert({
    lead_id:        lead.id,
    imovel_id_site: ag.imovel_id,
    imovel_titulo:  ag.imovel_titulo,
    imovel_slug:    ag.imovel_slug,
    data_visita:    ag.data_visita,
    horario:        ag.horario,
    status:         'confirmada',
    responsavel_id: lead.atribuido_para,
    observacoes:    'Agendado pelo cliente no site uhome.com.br'
  })

  // Notificar corretor responsável
  const telefoneCorretor = (lead as any).profiles?.telefone
  if (telefoneCorretor) {
    const dataFormatada = new Date(ag.data_visita).toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long',
      timeZone: 'America/Sao_Paulo'
    })
    await sendWhatsApp(telefoneCorretor, [
      '📅 *Visita agendada pelo site!*',
      '',
      `👤 *Cliente:* ${ag.nome}`,
      `📱 *WhatsApp:* ${formatTelefone(ag.telefone)}`,
      `🏠 *Imóvel:* ${ag.imovel_titulo}`,
      `📅 *Data:* ${dataFormatada}`,
      `⏰ *Horário:* ${ag.horario}`,
      '',
      'Confirme a visita com o cliente! ✅'
    ].join('\n'))
  }
}

// ═══════════════════════════════════════════════════
// 3. BUSCA SALVA → perfil de interesse no CRM
// ═══════════════════════════════════════════════════
async function syncBuscaSalva(busca: any) {
  if (!busca.email) return

  const { data: lead } = await crm
    .from('leads')
    .select('id')
    .eq('email', busca.email)
    .single()

  if (!lead) return

  const filtros = typeof busca.filters === 'string' ? JSON.parse(busca.filters) : busca.filters

  await crm.from('perfil_interesse').upsert({
    lead_id:        lead.id,
    tipo_imovel:    filtros?.tipo ?? null,
    bairros:        filtros?.bairros ?? [],
    preco_max:      filtros?.preco_max ?? filtros?.precoMax ?? null,
    preco_min:      filtros?.preco_min ?? filtros?.precoMin ?? null,
    quartos_min:    filtros?.quartos ?? null,
    diferenciais:   filtros?.diferenciais ?? [],
    query_ia:       busca.descricao_humana ?? null,
    alerta_ativo:   true,
    updated_at:     new Date().toISOString()
  }, { onConflict: 'lead_id' })
}

// ═══════════════════════════════════════════════════
// 4. FAVORITO → interesse em imóvel específico
// ═══════════════════════════════════════════════════
async function syncFavorito(fav: any) {
  if (!fav.user_id) return

  const { data: lead } = await crm
    .from('leads')
    .select('id')
    .eq('site_user_id', fav.user_id)
    .single()

  if (!lead) return

  await crm.from('imoveis_interesse').upsert({
    lead_id:        lead.id,
    imovel_id_site: fav.imovel_id,
    imovel_titulo:  fav.imovel_titulo,
    imovel_bairro:  fav.imovel_bairro,
    imovel_preco:   fav.imovel_preco,
    favoritado_em:  fav.created_at
  }, { onConflict: 'lead_id,imovel_id_site' })
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
async function sendWhatsApp(telefone: string, mensagem: string) {
  if (!WA_URL || !WA_KEY || !WA_INSTANCE) return
  const numero = '55' + telefone.replace(/\D/g, '')
  try {
    await fetch(`${WA_URL}/message/sendText/${WA_INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': WA_KEY },
      body: JSON.stringify({ number: numero, text: mensagem })
    })
  } catch (err) {
    console.error('[WhatsApp] Erro ao enviar:', err)
  }
}

function formatTelefone(tel: string): string {
  const d = tel.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return tel
}
