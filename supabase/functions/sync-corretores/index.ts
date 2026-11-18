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

  // 1. Buscar corretores ativos no CRM (tabela do CRM não tem coluna 'role')
  const { data: corretoresCRM, error: fetchError } = await supabaseCRM
    .from('profiles')
    .select('id, nome, email, telefone, avatar_url, creci')
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

  // 3. Desligar no site quem não está mais ativo no CRM (nada é apagado)
  // Os ids do CRM não batem com uhomesales_id do site; comparamos por e-mail e nome.
  const emails = new Set(corretoresCRM.map((c) => (c.email ?? '').trim().toLowerCase()).filter(Boolean))
  const slugs = new Set(corretoresCRM.map((c) => gerarSlug(c.nome ?? '')).filter(Boolean))
  const { data: site } = await supabaseSite.from('profiles').select('id, nome, email, slug_ref').eq('role', 'corretor').eq('ativo', true)
  const sair = (site ?? []).filter((p) => !emails.has((p.email ?? '').trim().toLowerCase()) && !slugs.has(gerarSlug(p.nome ?? '')) && !slugs.has(p.slug_ref ?? ''))
  // Proteção: nunca desliga mais da metade de uma vez (evita apagar a equipe por erro de leitura)
  const desligados = sair.length && sair.length <= (site?.length ?? 0) / 2 ? sair : []
  if (desligados.length) await supabaseSite.from('profiles').update({ ativo: false }).in('id', desligados.map((d) => d.id))
  if (desligados.length) {
    await supabaseSite.from('sync_log').insert({ direcao: 'crm->site', tipo: 'corretor_desligado', payload: { nomes: desligados.map((d) => d.nome) }, sucesso: true })
  }

  return new Response(JSON.stringify({
    ok: true,
    sincronizados,
    desligados: desligados.map((d) => d.nome),
    candidatos_bloqueados: desligados.length ? undefined : sair.map((d) => d.nome),
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
