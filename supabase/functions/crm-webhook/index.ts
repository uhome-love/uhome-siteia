import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-secret',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Authenticate via shared secret
    const secret = req.headers.get('x-sync-secret')
    const expectedSecret = Deno.env.get('SYNC_SECRET')
    if (!expectedSecret || secret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const site = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { tipo, record } = await req.json()

    switch (tipo) {
      case 'lead_status': {
        // CRM notifica mudança de status de um lead
        if (!record.site_lead_id || !record.status) {
          throw new Error('site_lead_id e status são obrigatórios')
        }
        const { error } = await site
          .from('public_leads')
          .update({
            status: record.status,
            corretor_ref_id: record.atribuido_para ?? undefined,
          })
          .eq('id', record.site_lead_id)

        if (error) throw error
        console.log(`[crm-webhook] Lead ${record.site_lead_id} status → ${record.status}`)
        break
      }

      case 'agendamento_status': {
        // CRM atualiza status de agendamento
        if (!record.imovel_slug || !record.telefone) {
          throw new Error('imovel_slug e telefone são obrigatórios')
        }
        const { error } = await site
          .from('agendamentos')
          .update({ status: record.status })
          .eq('imovel_slug', record.imovel_slug)
          .eq('telefone', record.telefone)

        if (error) throw error
        console.log(`[crm-webhook] Agendamento atualizado: ${record.imovel_slug}`)
        break
      }

      case 'corretor_update': {
        // CRM atualiza dados do corretor no site (slug, ativo)
        if (!record.user_id) throw new Error('user_id é obrigatório')
        const update: Record<string, any> = {}
        if (record.slug_ref !== undefined) update.slug_ref = record.slug_ref
        if (record.ativo !== undefined) update.ativo = record.ativo
        if (record.nome !== undefined) update.nome = record.nome

        const { error } = await site
          .from('profiles')
          .update(update)
          .eq('id', record.user_id)

        if (error) throw error
        console.log(`[crm-webhook] Corretor ${record.user_id} atualizado`)
        break
      }

      case 'test':
        console.log('[crm-webhook] Teste de conectividade OK')
        break

      default:
        throw new Error(`Tipo desconhecido: ${tipo}`)
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('[crm-webhook] Erro:', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
