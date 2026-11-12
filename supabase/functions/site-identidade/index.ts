// Liga o histórico anônimo de um visitante (visitor_id) ao lead que acabou de se identificar
// e envia ao CRM Uhome Sales um resumo do que a pessoa fez no site.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const CRM_SITE_EVENTS = "https://hunbxqzhvuemgntklyzb.supabase.co/functions/v1/site-events";
const CRM_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1bmJ4cXpodnVlbWdudGtseXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODI2NTUsImV4cCI6MjA4ODE1ODY1NX0.giwij9kxlColZF21iBHZO8in86kGNJIHWXHqtdik6oY";

const Body = z.object({
  visitor_id: z.string().uuid(),
  telefone: z.string().min(8).max(30).optional(),
  email: z.string().email().max(200).optional(),
  origem: z.string().max(40).optional(),
}).refine((b) => b.telefone || b.email, "telefone ou email");

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function top(vals: (string | null | undefined)[], n = 3) {
  const m = new Map<string, number>();
  for (const v of vals) if (v) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([nome, vezes]) => ({ nome, vezes }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const p = Body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return json({ erro: "dados inválidos" }, 400);
  const { visitor_id, email, origem } = p.data;
  const telefone = p.data.telefone?.replace(/\D/g, "");
  if (p.data.telefone && (!telefone || telefone.length < 10 || telefone.length > 13)) return json({ erro: "telefone inválido" }, 400);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const identidade = { telefone: telefone ?? null, email: email ?? null };
  const desde = new Date(Date.now() - 90 * 864e5).toISOString();

  const { data: eventos } = await sb.from("lead_events")
    .select("id,tipo,pagina,imovel_slug,imovel_titulo,busca_query,busca_filtros,created_at,identidade")
    .eq("visitor_id", visitor_id).gte("created_at", desde)
    .order("created_at", { ascending: false }).limit(300);

  const anonimos = (eventos ?? []).filter((e) => !e.identidade).map((e) => e.id);
  if (anonimos.length) await sb.from("lead_events").update({ identidade }).in("id", anonimos);

  const ev = eventos ?? [];
  if (!ev.length) return json({ ok: true, vinculados: 0 });

  const vistos = ev.filter((e) => e.tipo === "imovel_visualizado");
  const resumo = {
    total_eventos: ev.length,
    primeira_visita: ev[ev.length - 1].created_at,
    ultima_visita: ev[0].created_at,
    imoveis_mais_vistos: top(vistos.map((e) => e.imovel_titulo || e.imovel_slug), 5),
    buscas: top(ev.filter((e) => e.tipo === "busca_realizada").map((e) => e.busca_query || (e.busca_filtros ? JSON.stringify(e.busca_filtros).slice(0, 120) : null)), 5),
    cliques_whatsapp: ev.filter((e) => e.tipo === "whatsapp_click").length,
    formularios: ev.filter((e) => e.tipo === "formulario_enviado").length,
  };
  const linha_do_tempo = ev.slice(0, 50).map((e) => ({
    quando: e.created_at, tipo: e.tipo, imovel: e.imovel_titulo || e.imovel_slug || null, busca: e.busca_query || null,
  }));

  try {
    const r = await fetch(CRM_SITE_EVENTS, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: CRM_ANON, Authorization: `Bearer ${CRM_ANON}` },
      body: JSON.stringify({ tipo: "historico_site", dados: { resumo, linha_do_tempo, origem_identificacao: origem ?? null }, identidade, pagina: null }),
    });
    if (!r.ok) console.warn("[site-identidade] CRM", r.status, await r.text());
  } catch (e) { console.warn("[site-identidade] CRM fetch", (e as Error).message); }

  return json({ ok: true, vinculados: anonimos.length });
});
