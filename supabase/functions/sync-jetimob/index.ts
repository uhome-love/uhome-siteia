import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JETIMOB_BASE = "https://api.jetimob.com/webservice";

function slugify(text: string, codigo: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base}-${codigo}`;
}

function mapFinalidade(f?: string): string {
  if (!f) return "venda";
  const lower = f.toLowerCase();
  if (lower.includes("loc") || lower.includes("alug")) return "locacao";
  return "venda";
}

function mapTipo(t?: string): string {
  if (!t) return "apartamento";
  const lower = t.toLowerCase();
  if (lower.includes("casa")) return "casa";
  if (lower.includes("cobert")) return "cobertura";
  if (lower.includes("studio") || lower.includes("kitnet") || lower.includes("kit")) return "studio";
  if (lower.includes("comerc") || lower.includes("sala") || lower.includes("loja")) return "comercial";
  if (lower.includes("terr")) return "terreno";
  return "apartamento";
}

function mapStatus(s?: string): string {
  if (!s) return "disponivel";
  const lower = s.toLowerCase();
  if (lower.includes("vendid") || lower.includes("alugad")) return "vendido";
  if (lower.includes("reserv")) return "reservado";
  if (lower.includes("inativ") || lower.includes("suspen")) return "inativo";
  return "disponivel";
}

function extractFotos(item: any): string {
  const fotos: Array<{ url: string; ordem: number; principal: boolean }> = [];

  // Jetimob returns fotos in various formats
  const rawFotos = item.fotos || item.imagens || item.photos || [];
  if (Array.isArray(rawFotos)) {
    rawFotos.forEach((f: any, i: number) => {
      const url = typeof f === "string" ? f : f.url || f.link || f.src || "";
      if (url) {
        fotos.push({ url, ordem: f.ordem ?? i, principal: f.principal ?? i === 0 });
      }
    });
  }

  // Also check for foto_principal
  if (item.foto_principal && !fotos.some((f) => f.url === item.foto_principal)) {
    fotos.unshift({ url: item.foto_principal, ordem: 0, principal: true });
  }

  return JSON.stringify(fotos);
}

function extractDiferenciais(item: any): string[] {
  const diffs: string[] = [];
  const raw = item.diferenciais || item.caracteristicas || item.features || [];
  if (Array.isArray(raw)) {
    raw.forEach((d: any) => {
      const name = typeof d === "string" ? d : d.nome || d.name || d.descricao || "";
      if (name) diffs.push(name);
    });
  }
  return diffs;
}

function mapImovel(j: any) {
  const codigo = String(j.codigo || j.id || j.cod || Date.now());
  const titulo = j.titulo || j.title || j.nome || `Imóvel ${codigo}`;

  return {
    jetimob_id: codigo,
    slug: slugify(titulo, codigo),
    tipo: mapTipo(j.tipo || j.subtipo || j.type),
    finalidade: mapFinalidade(j.finalidade || j.operacao),
    status: mapStatus(j.status || j.situacao),
    destaque: j.destaque === true || j.destaque === 1,
    preco: Number(j.valor || j.preco || j.price || 0),
    preco_condominio: j.valor_condominio ? Number(j.valor_condominio) : null,
    preco_iptu: j.valor_iptu || j.iptu ? Number(j.valor_iptu || j.iptu) : null,
    area_total: j.area_total ? Number(j.area_total) : null,
    area_util: j.area_util || j.area_privativa ? Number(j.area_util || j.area_privativa) : null,
    quartos: j.quartos || j.dormitorios ? Number(j.quartos || j.dormitorios) : null,
    banheiros: j.banheiros ? Number(j.banheiros) : null,
    vagas: j.vagas || j.garagens ? Number(j.vagas || j.garagens) : null,
    andar: j.andar ? Number(j.andar) : null,
    bairro: j.bairro || j.neighborhood || "Sem bairro",
    cidade: j.cidade || j.city || "Porto Alegre",
    uf: j.uf || j.estado || "RS",
    cep: j.cep || null,
    endereco_completo: j.endereco || j.logradouro || null,
    latitude: j.latitude || j.lat ? Number(j.latitude || j.lat) : null,
    longitude: j.longitude || j.lng || j.lon ? Number(j.longitude || j.lng || j.lon) : null,
    titulo,
    descricao: j.descricao || j.description || null,
    diferenciais: extractDiferenciais(j),
    fotos: extractFotos(j),
    video_url: j.video_url || j.video || null,
    origem: "jetimob",
    jetimob_raw: JSON.stringify(j),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Support both secret names
    const JETIMOB_KEY = Deno.env.get("JETIMOB_API_KEY") || Deno.env.get("JETIMOB_API_TOKEN");
    if (!JETIMOB_KEY) {
      throw new Error("JETIMOB_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all pages from Jetimob (v=6, paginated)
    const allItems: any[] = [];
    const pageSize = 200;
    const maxPages = 50;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${JETIMOB_BASE}/${JETIMOB_KEY}/imoveis/todos?v=6&page=${page}&pageSize=${pageSize}`;
      console.log(`Fetching page ${page}...`);

      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Jetimob page ${page} error: ${response.status}`, text);
        if (page === 1) throw new Error(`Jetimob API returned ${response.status}: ${text.slice(0, 200)}`);
        break;
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.imoveis || data.data || data.items || [];

      if (items.length === 0) break;
      allItems.push(...items);

      if (items.length < pageSize) break;
    }

    console.log(`Total: ${allItems.length} properties from Jetimob`);

    let inseridos = 0;
    let erros = 0;

    // Upsert in batches
    const batchSize = 20;
    for (let i = 0; i < allItems.length; i += batchSize) {
      const batch = allItems.slice(i, i + batchSize);
      const mapped = batch.map(mapImovel);

      const { error } = await supabase.from("imoveis").upsert(mapped, {
        onConflict: "jetimob_id",
        ignoreDuplicates: false,
      });

      if (error) {
        console.error(`Upsert error batch ${i}:`, error.message);
        erros += batch.length;
      } else {
        inseridos += batch.length;
      }
    }

    const result = { inseridos, erros, total: allItems.length };
    console.log("Sync complete:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sync-jetimob error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
