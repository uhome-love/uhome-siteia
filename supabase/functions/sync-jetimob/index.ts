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

  const rawFotos = item.imagens || item.fotos || item.galeria || item.photos || [];
  if (Array.isArray(rawFotos)) {
    rawFotos.forEach((f: any, i: number) => {
      let url = "";
      if (typeof f === "string") {
        url = f;
      } else {
        url = f.link_large || f.link || f.link_medio || f.link_thumb || f.url || f.arquivo || f.src || "";
      }
      if (url) {
        fotos.push({ url, ordem: f?.ordem ?? i, principal: f?.principal ?? i === 0 });
      }
    });
  }

  if (item.foto_principal && !fotos.some((f) => f.url === item.foto_principal)) {
    fotos.unshift({ url: item.foto_principal, ordem: 0, principal: true });
  }
  if (item.foto_destaque && !fotos.some((f) => f.url === item.foto_destaque)) {
    fotos.unshift({ url: item.foto_destaque, ordem: 0, principal: true });
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

function extractPreco(j: any): number {
  // Try multiple field names; pick the first truthy numeric value
  const candidates = [
    j.valor_venda,
    j.valor_locacao,
    j.valor_temporada,
    j.valor,
    j.preco,
    j.price,
    j.valor_total,
  ];
  for (const v of candidates) {
    const n = Number(v);
    if (n > 0) return n;
  }
  return 0;
}

function mapImovel(j: any) {
  const codigo = String(j.codigo || j.id || j.cod || Date.now());
  const titulo = j.titulo_anuncio || j.titulo || j.title || j.nome || `Imóvel ${codigo}`;

  return {
    jetimob_id: codigo,
    slug: slugify(titulo, codigo),
    tipo: mapTipo(j.subtipo || j.tipo_imovel || j.tipo || j.type),
    finalidade: mapFinalidade(j.finalidade || j.operacao || j.contrato),
    status: mapStatus(j.status || j.situacao),
    destaque: j.destaque === true || j.destaque === 1 || j.destaque === "Destaque",
    preco: extractPreco(j),
    preco_condominio: j.valor_condominio ? Number(j.valor_condominio) : null,
    preco_iptu: j.valor_iptu || j.iptu ? Number(j.valor_iptu || j.iptu) : null,
    area_total: j.area_total ? Number(j.area_total) : null,
    area_util: j.area_privativa || j.area_util ? Number(j.area_privativa || j.area_util) : null,
    quartos: j.dormitorios || j.quartos ? Number(j.dormitorios || j.quartos) : null,
    banheiros: j.banheiros ? Number(j.banheiros) : null,
    vagas: j.garagens || j.vagas ? Number(j.garagens || j.vagas) : null,
    andar: j.andar ? Number(j.andar) : null,
    bairro: j.endereco_bairro || j.bairro || j.neighborhood || j.bairro_nome || j.endereco?.bairro || j.localizacao?.bairro || "Porto Alegre",
    cidade: j.endereco_cidade || j.cidade || j.endereco?.cidade || "Porto Alegre",
    uf: j.endereco_estado || j.uf || j.estado || "RS",
    cep: j.endereco_cep || j.cep || null,
    endereco_completo: j.endereco_logradouro || j.endereco || j.logradouro || null,
    latitude: j.endereco_latitude || j.latitude ? Number(j.endereco_latitude || j.latitude) : null,
    longitude: j.endereco_longitude || j.longitude ? Number(j.endereco_longitude || j.longitude) : null,
    titulo,
    descricao: j.descricao_anuncio || j.descricao || j.description || null,
    diferenciais: extractDiferenciais(j),
    fotos: extractFotos(j),
    video_url: j.video_url || j.video || null,
    origem: "jetimob",
    jetimob_raw: j,
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

    // Fetch and upsert page by page (stream to avoid timeout)
    const pageSize = 200;
    const maxPages = 50;
    let totalFetched = 0;
    let inseridos = 0;
    let erros = 0;

    console.log(`JETIMOB_KEY length: ${JETIMOB_KEY.length}`);

    for (let page = 1; page <= maxPages; page++) {
      const url = `${JETIMOB_BASE}/${JETIMOB_KEY}/imoveis/todos?v=6&page=${page}&pageSize=${pageSize}`;
      console.log(`Page ${page}...`);

      const response = await fetch(url, { headers: { Accept: "application/json" } });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Page ${page} error: ${response.status}`, text.slice(0, 100));
        if (page === 1) throw new Error(`Jetimob API returned ${response.status}: ${text.slice(0, 200)}`);
        break;
      }

      const data = await response.json();
      const rawItems = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.result) ? data.result : data.imoveis || data.items || [];
      const items = Array.isArray(rawItems) ? rawItems : [];

      if (items.length === 0) break;
      totalFetched += items.length;

      // Upsert this page immediately in batches of 50
      const batchSize = 50;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const mapped = batch.map(mapImovel);
        const { error } = await supabase.from("imoveis").upsert(mapped, { onConflict: "jetimob_id", ignoreDuplicates: false });
        if (error) { console.error(`Upsert err p${page}b${i}:`, error.message); erros += batch.length; }
        else { inseridos += batch.length; }
      }

      console.log(`Page ${page}: ${items.length} items, total: ${inseridos} ok, ${erros} err`);
      if (items.length < pageSize) break;
      const rawTotal = data?.total || data?.totalResults || 0;
      if (rawTotal > 0 && totalFetched >= rawTotal) break;
    }

    const result = { inseridos, erros, total: totalFetched };
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
