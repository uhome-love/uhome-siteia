import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseSite = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const supabaseCRM = createClient(
    Deno.env.get('UHOMESALES_SUPABASE_URL')!,
    Deno.env.get('UHOMESALES_SERVICE_ROLE_KEY')!
  )

  // 1. Buscar corretores ativos no CRM
  const { data: corretoresCRM, error: fetchError } = await supabaseCRM
    .from('profiles')
    .select('id, nome, email, telefone, avatar_url, creci')
    .eq('role', 'corretor')
    .eq('ativo', true)

  if (fetchError) {
    console.error('[sync-corretores] Erro ao buscar CRM:', fetchError.message)
    return new Response(JSON.stringify({ ok: false, error: fetchError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (!corretoresCRM?.length) {
    return new Response(JSON.stringify({ ok: true, sincronizados: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // 2. Para cada corretor, upsert no site
  let sincronizados = 0
  const erros: string[] = []

  for (const corretor of corretoresCRM) {
    const slugRef = gerarSlug(corretor.nome)

    const { error } = await supabaseSite
      .from('profiles')
      .upsert({
        uhomesales_id: corretor.id,
        nome: corretor.nome,
        email: corretor.email,
        telefone: corretor.telefone,
        foto_url: corretor.avatar_url ?? null,
        creci: corretor.creci,
        role: 'corretor',
        ativo: true,
        slug_ref: slugRef,
        sincronizado_em: new Date().toISOString(),
      }, {
        onConflict: 'uhomesales_id',
        ignoreDuplicates: false
      })

    if (!error) {
      sincronizados++
    } else {
      erros.push(`${corretor.nome}: ${error.message}`)
      console.error(`[sync-corretores] Erro upsert ${corretor.nome}:`, error.message)
    }

    // Log
    await supabaseSite.from('sync_log').insert({
      direcao: 'crm->site',
      tipo: 'corretor',
      payload: { corretor_id: corretor.id, nome: corretor.nome },
      sucesso: !error,
      erro: error?.message ?? null
    })
  }

  return new Response(JSON.stringify({
    ok: true,
    sincronizados,
    total: corretoresCRM.length,
    erros: erros.length > 0 ? erros : undefined
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})

function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
