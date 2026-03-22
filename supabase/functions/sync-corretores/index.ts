import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Verificar secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${Deno.env.get('SYNC_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
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
  const { data: corretoresCRM } = await supabaseCRM
    .from('profiles')
    .select('id, nome, email, telefone, foto_url, creci')
    .eq('role', 'corretor')
    .eq('ativo', true)

  if (!corretoresCRM?.length) {
    return new Response(JSON.stringify({ ok: true, sincronizados: 0 }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // 2. Para cada corretor, upsert no site
  let sincronizados = 0
  for (const corretor of corretoresCRM) {
    const slugRef = gerarSlug(corretor.nome)

    const { error } = await supabaseSite
      .from('profiles')
      .upsert({
        uhomesales_id: corretor.id,
        nome: corretor.nome,
        email: corretor.email,
        telefone: corretor.telefone,
        foto_url: corretor.foto_url,
        creci: corretor.creci,
        role: 'corretor',
        ativo: true,
        slug_ref: slugRef,
        sincronizado_em: new Date().toISOString(),
      }, {
        onConflict: 'uhomesales_id',
        ignoreDuplicates: false
      })

    if (!error) sincronizados++

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
    total: corretoresCRM.length
  }), {
    headers: { 'Content-Type': 'application/json' }
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
