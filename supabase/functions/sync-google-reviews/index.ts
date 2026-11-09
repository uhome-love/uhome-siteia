import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// Lê as avaliações do Perfil da Uhome no Google e guarda um cache público.
const GATEWAY = "https://connector-gateway.lovable.dev/google_business_profile";
const ACCOUNT = "accounts/107510797017214706443";
const LOCATION = "locations/7965771444223870361";
const PLACE_ID = "ChIJb4CfzxN3GZUREHiWqVv04B8";
const STARS: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GBP = Deno.env.get("GOOGLE_BUSINESS_PROFILE_API_KEY");
    if (!LOVABLE_API_KEY || !GBP) return json({ error: "Credenciais ausentes" }, 500);

    const all: any[] = [];
    let token = "";
    let nota = 0, total = 0;
    for (let i = 0; i < 4; i++) {
      const url = `${GATEWAY}/my_business/v4/${ACCOUNT}/${LOCATION}/reviews?pageSize=50${token ? `&pageToken=${token}` : ""}`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": GBP } });
      if (!r.ok) {
        const t = await r.text();
        console.error(`Google reviews [${r.status}]: ${t}`);
        return json({ error: "Falha no Google", status: r.status, details: t }, r.status);
      }
      const d = await r.json();
      nota = d.averageRating ?? nota;
      total = d.totalReviewCount ?? total;
      all.push(...(d.reviews ?? []));
      token = d.nextPageToken ?? "";
      if (!token) break;
    }

    const avaliacoes = all
      .map((v) => ({
        nome: v.reviewer?.displayName ?? "Cliente Uhome",
        foto: v.reviewer?.profilePhotoUrl ?? null,
        estrelas: STARS[v.starRating] ?? 0,
        texto: (v.comment ?? "").split("(Translated by Google)")[0].replace(/\(Original\)/g, "").trim(),
        data: v.createTime,
      }))
      .filter((v) => v.estrelas === 5 && v.texto.length >= 30)
      .sort((a, b) => (b.data ?? "").localeCompare(a.data ?? ""))
      .slice(0, 12);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await sb.from("google_reviews_cache").upsert({
      id: "uhome",
      nota: Math.round(nota * 10) / 10,
      total,
      avaliacoes,
      maps_url: `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`,
      review_url: `https://search.google.com/local/writereview?placeid=${PLACE_ID}`,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return json({ ok: true, nota, total, salvas: avaliacoes.length });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});
