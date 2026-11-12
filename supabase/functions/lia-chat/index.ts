// LIA no site: conversa com IA, consulta imóveis/produtos reais e registra
// leads e visitas (que seguem para o CRM pelos triggers do banco).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { generateResponse, GatewayError } from "npm:@lovable.dev/ai-gateway";
import { z } from "npm:zod@3";
import { montarPromptLia } from "./prompt.ts";
import { dividirBolhas, normalizarTelefone, normalizarTurno, TURNO_LABEL, validarDataVisita } from "./regras.ts";

const SITE = "https://uhome.com.br";
const MODEL = "openai/gpt-6-astra";

const Body = z.object({
  session_id: z.string().min(8).max(80),
  mensagens: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .min(1)
    .max(40),
  contexto: z.record(z.any()).optional(),
});

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function hojeSP() {
  const now = new Date();
  const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
  const dia = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long" }).format(now);
  return { iso, dia };
}

function contextoTexto(c: Record<string, any>) {
  const l: string[] = [];
  if (c.pagina) l.push(`Página atual: ${c.pagina}`);
  if (c.imovel?.titulo) l.push(`Imóvel aberto: ${c.imovel.titulo}${c.imovel.codigo ? ` (código ${c.imovel.codigo})` : ""}${c.imovel.preco ? `, R$ ${Number(c.imovel.preco).toLocaleString("pt-BR")}` : ""}${c.imovel.bairro ? `, ${c.imovel.bairro}` : ""}. Slug: ${c.imovel.slug ?? "-"}`);
  if (c.produto) l.push(`Empreendimento aberto: ${c.produto}`);
  if (c.campanha) l.push(`Campanha aberta: ${c.campanha}`);
  if (c.ultima_busca) l.push(`Última busca: ${c.ultima_busca}`);
  if (Array.isArray(c.imoveis_vistos) && c.imoveis_vistos.length) l.push(`Imóveis vistos antes: ${c.imoveis_vistos.slice(-6).join(", ")}`);
  if (c.utm_source) l.push(`Chegou por: ${c.utm_source}${c.utm_campaign ? ` / ${c.utm_campaign}` : ""}${c.utm_term ? `, busca "${c.utm_term}"` : ""}`);
  return l.length ? l.join("\n") : "Sem contexto adicional.";
}

const tools = [
  {
    type: "function",
    function: {
      name: "buscar_imoveis",
      description: "Busca imóveis à venda reais no catálogo do site. Use para sugerir opções ou consultar um código.",
      parameters: {
        type: "object",
        properties: {
          codigo: { type: "string", description: "Código do imóvel, ex 16366-UH" },
          texto: { type: "string", description: "Nome do empreendimento/condomínio, rua ou construtora, ex: Golden Lake" },
          bairro: { type: "string" },
          cidade: { type: "string" },
          tipo: { type: "string", description: "Apartamento, Casa, Cobertura, Terreno..." },
          quartos_min: { type: "integer" },
          preco_min: { type: "number" },
          preco_max: { type: "number" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "detalhe_imovel",
      description: "Ficha completa de um imóvel do catálogo: descrição, condomínio, IPTU, andar, vagas, banheiros, área, diferenciais, fase da obra. Use SEMPRE antes de dizer que um dado não está informado.",
      parameters: { type: "object", properties: { slug: { type: "string" }, codigo: { type: "string" } }, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "imoveis_parecidos",
      description: "Até 3 imóveis parecidos com um imóvel (mesma cidade/bairro, quartos e faixa de preço).",
      parameters: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"], additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "produtos_natal",
      description: "Lista os empreendimentos da campanha Natal Chave de Ouro (e da vitrine Uhome em Foco) com preço inicial, entrega e link.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "detalhe_produto",
      description: "Ficha completa de um empreendimento em campanha (diferenciais, tipologias, condições). Use o slug de produtos_natal.",
      parameters: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"], additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "registrar_interesse",
      description: "Registra o lead qualificado no CRM com resumo. Use quando a pessoa pedir humano, estiver qualificada ou o assunto exigir especialista.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string" },
          telefone: { type: "string", description: "WhatsApp com DDD" },
          resumo: { type: "string", description: "Resumo para o corretor: o que procura, objeções, temperatura" },
          tipo: { type: "string", enum: ["compra", "captacao"] },
          imovel_slug: { type: "string" },
          produto: { type: "string" },
          uso: { type: "string" },
          regiao: { type: "string" },
          quartos: { type: "string" },
          faixa_valor: { type: "string" },
          entrada: { type: "string" },
          fgts: { type: "string" },
          renda: { type: "string" },
          prazo: { type: "string" },
        },
        required: ["nome", "telefone", "resumo"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "registrar_qualificacao",
      description: "Guarda o que você já descobriu do perfil da pessoa (chame sempre que aprender algo novo: finalidade, faixa, prazo, pagamento, bairros, quartos). Não exige contato.",
      parameters: {
        type: "object",
        properties: {
          finalidade: { type: "string", enum: ["morar", "investir", "morar_e_investir"] },
          faixa_valor: { type: "string" },
          prazo: { type: "string", description: "Ex.: imediato, até 3 meses, 6 meses, só pesquisando" },
          pagamento: { type: "string", description: "Ex.: financiamento com entrada, à vista, permuta" },
          bairros: { type: "string" },
          quartos: { type: "string" },
          temperatura: { type: "string", enum: ["quente", "morno", "frio"], description: "quente = prazo até 3 meses e faixa compatível; frio = só pesquisando" },
          observacoes: { type: "string" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "agendar_visita",
      description: "Registra a visita com dia e turno escolhidos pela pessoa. Cria a visita no CRM.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string" },
          telefone: { type: "string" },
          data: { type: "string", description: "YYYY-MM-DD" },
          turno: { type: "string", enum: ["manha", "tarde", "noite"] },
          modalidade: { type: "string", enum: ["presencial", "videochamada"] },
          imovel_slug: { type: "string" },
          produto: { type: "string" },
          resumo: { type: "string" },
        },
        required: ["nome", "telefone", "data", "turno", "resumo"],
        additionalProperties: false,
      },
    },
  },
] as const;

type Ctx = { session_id: string; contexto: Record<string, any>; qualificacao: Record<string, any>; cartoes: any[]; corretor: { id: string; slug_ref: string; nome: string | null } | null; hoje: string; conversa: any };

async function buscarImoveis(a: any) {
  let q = sb
    .from("imoveis")
    .select("slug,titulo,tipo,bairro,cidade,preco,quartos,area_util,area_total,vagas,jetimob_id,foto_principal")
    .eq("status", "disponivel")
    .eq("finalidade", "venda")
    .not("foto_principal", "is", null)
    .limit(5);
  if (a.codigo) q = q.ilike("jetimob_id", String(a.codigo).replace(/-?uh$/i, "") + "%");
  if (a.texto) {
    const t = String(a.texto).replace(/[%,()]/g, " ").trim().slice(0, 60);
    if (t) q = q.or(`titulo.ilike.%${t}%,condominio_nome.ilike.%${t}%,endereco_completo.ilike.%${t}%,descricao.ilike.%${t}%`);
  }
  if (a.bairro) q = q.ilike("bairro", `%${a.bairro}%`);
  if (a.cidade) q = q.ilike("cidade", `%${a.cidade}%`);
  if (a.tipo) q = q.ilike("tipo", `%${a.tipo}%`);
  if (a.quartos_min) q = q.gte("quartos", a.quartos_min);
  if (a.preco_min) q = q.gte("preco", a.preco_min);
  if (a.preco_max) q = q.lte("preco", a.preco_max);
  const { data, error } = await q.order("publicado_em", { ascending: false, nullsFirst: false });
  if (error) return { erro: "busca indisponível" };
  return {
    imoveis: (data ?? []).map((i) => ({
      titulo: i.titulo, tipo: i.tipo, bairro: i.bairro, cidade: i.cidade, preco: Number(i.preco) > 0 ? Number(i.preco) : "sob consulta", quartos: i.quartos,
      area_privativa: i.area_util ?? i.area_total, vagas: i.vagas, codigo: i.jetimob_id ? `${i.jetimob_id}-UH`.replace(/-UH-UH$/, "-UH") : null,
      link: `${SITE}/imovel/${i.slug}`, slug: i.slug, foto: i.foto_principal,
    })),
  };
}

async function detalheImovel(a: any) {
  let q = sb.from("imoveis").select("slug,titulo,tipo,bairro,cidade,endereco_completo,preco,preco_condominio,preco_iptu,iptu_periodicidade,quartos,banheiros,vagas,area_util,area_total,andar,fase,condominio_nome,diferenciais,descricao,jetimob_id,status");
  if (a.slug) q = q.eq("slug", String(a.slug));
  else if (a.codigo) q = q.ilike("jetimob_id", String(a.codigo).replace(/-?uh$/i, "") + "%");
  else return { erro: "informe slug ou codigo" };
  const { data } = await q.limit(1).maybeSingle();
  if (!data) return { erro: "imóvel não encontrado" };
  return {
    ...data,
    descricao: data.descricao ? String(data.descricao).replace(/<[^>]+>/g, " ").slice(0, 1800) : null,
    area_privativa: data.area_util ?? null,
    disponivel: data.status === "disponivel",
    link: `${SITE}/imovel/${data.slug}`,
  };
}

async function imoveisParecidos(a: any) {
  const { data: base } = await sb.from("imoveis").select("slug,cidade,bairro,quartos,preco,tipo").eq("slug", String(a.slug)).maybeSingle();
  if (!base?.preco) return { erro: "imóvel base não encontrado" };
  const busca = (bairro: boolean) => {
    let q = sb.from("imoveis").select("slug,titulo,bairro,cidade,preco,quartos,area_util,vagas,foto_principal")
      .eq("status", "disponivel").eq("finalidade", "venda").not("foto_principal", "is", null)
      .neq("slug", base.slug).eq("cidade", base.cidade)
      .gte("preco", base.preco * 0.8).lte("preco", base.preco * 1.2).limit(3);
    if (base.quartos) q = q.gte("quartos", base.quartos);
    if (base.tipo) q = q.ilike("tipo", `%${base.tipo}%`);
    if (bairro && base.bairro) q = q.eq("bairro", base.bairro);
    return q;
  };
  let { data } = await busca(true);
  if (!data || data.length < 2) ({ data } = await busca(false));
  return { imoveis: (data ?? []).map((i) => ({ ...i, area_privativa: i.area_util, link: `${SITE}/imovel/${i.slug}` })) };
}

function linkProduto(slug: string, ctx: Ctx) {
  return ctx.corretor ? `${SITE}/c/${ctx.corretor.slug_ref}/em-foco/${slug}` : `${SITE}/em-foco/${slug}`;
}

async function produtosNatal(ctx: Ctx) {
  const { data: camp } = await sb.from("campanhas").select("id,nome,inicio,fim").eq("ativo", true).order("ordem").limit(3);
  const vigente = (camp ?? []).find((c) => (!c.inicio || c.inicio <= ctx.hoje) && (!c.fim || c.fim >= ctx.hoje));
  const { data: prods } = await sb
    .from("produtos_foco")
    .select("slug,nome,incorporadora,bairro,cidade,preco_a_partir,preco_texto,entrega,status_obra,resumo")
    .eq("ativo", true)
    .order("ordem");
  return {
    campanha: vigente ? { nome: vigente.nome, inicio: vigente.inicio, fim: vigente.fim } : null,
    produtos: (prods ?? []).map((p) => ({ ...p, link: linkProduto(p.slug, ctx) })),
  };
}

async function detalheProduto(a: any, ctx: Ctx) {
  const { data } = await sb.from("produtos_foco").select("id,slug,nome,incorporadora,bairro,cidade,endereco,preco_texto,entrega,status_obra,resumo,ficha").eq("slug", String(a.slug)).maybeSingle();
  if (!data) return { erro: "produto não encontrado" };
  const { data: cond } = await sb.from("campanha_produtos").select("condicao").eq("produto_id", data.id).limit(1).maybeSingle();
  const { id: _id, ...rest } = data;
  return { ...rest, condicao_campanha: cond?.condicao ?? null, link: linkProduto(data.slug, ctx) };
}

async function dadosImovel(slug?: string) {
  if (!slug) return null;
  const { data } = await sb.from("imoveis").select("id,slug,titulo,bairro,preco").eq("slug", slug).maybeSingle();
  return data;
}

function contextoCRM(ctx: Ctx, extra: Record<string, unknown>) {
  const c = ctx.contexto;
  return {
    canal: "lia",
    conversa_id: ctx.conversa?.id ?? null,
    paginas: c.paginas ?? [],
    imoveis_vistos: c.imoveis_vistos ?? [],
    ultima_busca: c.ultima_busca ?? null,
    perfil_lia: Object.keys(ctx.qualificacao ?? {}).length ? ctx.qualificacao : null,
    temperatura: ctx.qualificacao?.temperatura ?? null,
    campanha: c.campanha ?? c.utm_campaign ?? null,
    pago: Boolean(c.gclid || c.utm_medium === "cpc"),
    produto: c.produto ?? null,
    gclid: c.gclid ?? null,
    utm_term: c.utm_term ?? null,
    ...extra,
  };
}

async function registrarInteresse(a: any, ctx: Ctx) {
  const tel = normalizarTelefone(a.telefone);
  if (!tel) return { erro: "telefone inválido, peça o WhatsApp com DDD" };
  if (ctx.conversa?.lead_id) return { ok: true, ja_registrado: true };
  const imv = await dadosImovel(a.imovel_slug ?? ctx.contexto.imovel?.slug);
  const c = ctx.contexto;
  const qualificacao: Record<string, unknown> = { Uso: a.uso, Região: a.regiao, Quartos: a.quartos, "Faixa de valor": a.faixa_valor, Entrada: a.entrada, FGTS: a.fgts, Renda: a.renda, Prazo: a.prazo };
  for (const [k, v] of Object.entries(ctx.qualificacao ?? {})) {
    const igual = Object.keys(qualificacao).find((q) => q.toLowerCase() === k.toLowerCase());
    if (igual && (qualificacao as any)[igual]) continue;
    (qualificacao as any)[k] = v;
  }
  const { data, error } = await sb
    .from("public_leads")
    .insert({
      nome: String(a.nome).slice(0, 120),
      telefone: tel,
      tipo_interesse: a.tipo === "captacao" ? "captacao" : "compra",
      imovel_id: imv?.id ?? null,
      imovel_slug: imv?.slug ?? null,
      imovel_titulo: imv?.titulo ?? a.produto ?? null,
      imovel_bairro: imv?.bairro ?? null,
      imovel_preco: imv?.preco ?? null,
      origem_pagina: c.pagina ?? null,
      origem_componente: "lia_chat",
      utm_source: c.utm_source ?? null,
      utm_medium: c.utm_medium ?? null,
      utm_campaign: c.utm_campaign ?? null,
      utm_term: c.utm_term ?? null,
      utm_content: c.utm_content ?? null,
      referrer: c.referrer ?? null,
      landing_page: c.landing_page ?? null,
      device: c.device ?? null,
      origem_canal: "lia",
      session_id: ctx.session_id,
      corretor_ref_id: ctx.corretor?.id ?? null,
      corretor_ref_slug: ctx.corretor?.slug_ref ?? null,
      contexto: contextoCRM(ctx, { resumo: a.resumo, qualificacao, produto: a.produto ?? c.produto ?? null }),
    })
    .select("id")
    .single();
  if (error) {
    console.error("[lia-chat] lead:", error.message);
    return { erro: "não consegui registrar agora" };
  }
  ctx.conversa = { ...(ctx.conversa ?? {}), lead_id: data.id, etapa: "qualificado" };
  return { ok: true };
}

async function agendarVisita(a: any, ctx: Ctx) {
  const tel = normalizarTelefone(a.telefone);
  if (!tel) return { erro: "telefone inválido, peça o WhatsApp com DDD" };
  const data = validarDataVisita(a.data, ctx.hoje);
  if (!data) return { erro: `data inválida; use uma data entre hoje (${ctx.hoje}) e os próximos 60 dias` };
  const turno = normalizarTurno(a.turno);
  if (!turno) return { erro: "turno inválido (manhã, tarde ou noite)" };
  if (ctx.conversa?.agendamento_id) return { ok: true, ja_agendado: true };
  const imv = await dadosImovel(a.imovel_slug ?? ctx.contexto.imovel?.slug);
  const { data: ag, error } = await sb
    .from("agendamentos")
    .insert({
      nome: String(a.nome).slice(0, 120),
      telefone: tel,
      imovel_id: imv?.id ?? null,
      imovel_slug: imv?.slug ?? null,
      imovel_titulo: imv?.titulo ?? a.produto ?? ctx.contexto.produto ?? null,
      data_visita: data,
      horario: `${TURNO_LABEL[turno]}${a.modalidade === "videochamada" ? " (videochamada)" : ""}`,
      turno,
      status: "pendente",
      corretor_ref_id: ctx.corretor?.id ?? null,
      corretor_ref_slug: ctx.corretor?.slug_ref ?? null,
      origem_ref: "lia_chat",
      contexto: contextoCRM(ctx, { resumo: a.resumo, modalidade: a.modalidade ?? "presencial", produto: a.produto ?? ctx.contexto.produto ?? null }),
    })
    .select("id")
    .single();
  if (error) {
    console.error("[lia-chat] agendamento:", error.message);
    return { erro: "não consegui registrar a visita agora" };
  }
  ctx.conversa = { ...(ctx.conversa ?? {}), agendamento_id: ag.id, etapa: "migrado_corretor" };
  return { ok: true, data, turno: TURNO_LABEL[turno] };
}

function registrarQualificacao(a: any, ctx: Ctx) {
  for (const [k, v] of Object.entries(a ?? {})) if (typeof v === "string" && v.trim()) ctx.qualificacao[k] = v.trim().slice(0, 200);
  return { ok: true, perfil: ctx.qualificacao };
}

function coletarCartoes(res: any, ctx: Ctx) {
  const lista = Array.isArray(res?.imoveis) ? res.imoveis : [];
  const novos = lista.filter((i: any) => i.slug && i.foto_principal !== null).slice(0, 3).map((i: any) => ({
    slug: i.slug, titulo: i.titulo, bairro: i.bairro, preco: Number(i.preco) > 0 ? Number(i.preco) : null, quartos: i.quartos,
    area: i.area_privativa ?? i.area_util ?? null, foto: i.foto ?? i.foto_principal ?? null,
  })).filter((c: any) => c.foto);
  if (novos.length) ctx.cartoes = novos;
}

async function executar(nome: string, args: any, ctx: Ctx) {
  try {
    switch (nome) {
      case "buscar_imoveis": return await buscarImoveis(args);
      case "detalhe_imovel": return await detalheImovel(args);
      case "imoveis_parecidos": return await imoveisParecidos(args);
      case "produtos_natal": return await produtosNatal(ctx);
      case "detalhe_produto": return await detalheProduto(args, ctx);
      case "registrar_interesse": return await registrarInteresse(args, ctx);
      case "agendar_visita": return await agendarVisita(args, ctx);
      case "registrar_qualificacao": return registrarQualificacao(args, ctx);
      default: return { erro: "ferramenta desconhecida" };
    }
  } catch (e) {
    console.error("[lia-chat] tool", nome, (e as Error).message);
    return { erro: "falha temporária" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let body: z.infer<typeof Body>;
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    body = parsed.data;
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const contexto = (body.contexto ?? {}) as Record<string, any>;
  const { iso, dia } = hojeSP();

  let corretor: Ctx["corretor"] = null;
  if (typeof contexto.corretor_slug === "string" && contexto.corretor_slug) {
    const { data } = await sb.from("profiles").select("id,slug_ref,nome").eq("slug_ref", contexto.corretor_slug).eq("ativo", true).maybeSingle();
    if (data?.slug_ref) corretor = { id: data.id, slug_ref: data.slug_ref, nome: data.nome };
  }

  const { data: conversa } = await sb.from("lia_conversas").select("id,lead_id,agendamento_id,etapa,contexto").eq("session_id", body.session_id).maybeSingle();
  const ctx: Ctx = { session_id: body.session_id, contexto, qualificacao: { ...((conversa?.contexto as any)?.qualificacao ?? {}) }, cartoes: [], corretor, hoje: iso, conversa };

  const instructions = montarPromptLia({ hojeISO: iso, diaSemana: dia, contexto: contextoTexto(contexto), corretorNome: corretor?.nome });
  const input: any[] = body.mensagens.map((m) => ({ role: m.role, content: m.content }));
  const respTools = tools.map((t) => ({ type: "function", name: t.function.name, description: t.function.description, parameters: t.function.parameters, strict: false }));

  let resposta = "";
  let acao: string | null = null;
  try {
    for (let i = 0; i < 6; i++) {
      const r: any = await generateResponse({ model: MODEL, instructions, input, tools: respTools } as any);
      const out: any[] = r.output ?? [];
      const calls = out.filter((o) => o.type === "function_call");
      if (!calls.length) {
        resposta = r.output_text ?? out.filter((o) => o.type === "message").flatMap((o) => o.content ?? []).map((c: any) => c.text ?? "").join("");
        break;
      }
      input.push(...out.filter((o) => o.type === "function_call" || o.type === "reasoning"));
      for (const c of calls) {
        let args: any = {};
        try { args = JSON.parse(c.arguments || "{}"); } catch { /* vazio */ }
        const res: any = await executar(c.name, args, ctx);
        if (c.name === "buscar_imoveis" || c.name === "imoveis_parecidos") coletarCartoes(res, ctx);
        if (res?.ok && c.name === "agendar_visita") acao = "visita";
        else if (res?.ok && c.name === "registrar_interesse" && !acao) acao = "lead";
        input.push({ type: "function_call_output", call_id: c.call_id, output: JSON.stringify(res) });
      }
    }
  } catch (e) {
    if (e instanceof GatewayError) console.error("[lia-chat] gateway", e.code, e.message);
    else console.error("[lia-chat]", (e as Error).message);
    return json({ bolhas: ["Tive uma instabilidade aqui. Quer continuar comigo pelo WhatsApp?"], erro: true });
  }

  const bolhas = dividirBolhas(resposta || "Me conta um pouco do que você procura?");
  const historico = [...body.mensagens, { role: "assistant", content: bolhas.join("\n") }].slice(-40);
  await sb.from("lia_conversas").upsert(
    {
      session_id: body.session_id,
      mensagens: historico,
      contexto: { ...contexto, qualificacao: ctx.qualificacao },
      lead_id: ctx.conversa?.lead_id ?? null,
      agendamento_id: ctx.conversa?.agendamento_id ?? null,
      etapa: ctx.conversa?.etapa ?? "atendendo",
    },
    { onConflict: "session_id" },
  );

  return json({ bolhas, acao, cartoes: ctx.cartoes, corretor: corretor ? { nome: corretor.nome } : null });
});
