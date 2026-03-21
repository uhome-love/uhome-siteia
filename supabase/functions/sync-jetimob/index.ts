import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Jetimob API: https://api.jetimob.com/webservice/{TOKEN}/imoveis
const JETIMOB_BASE = "https://api.jetimob.com/webservice";

interface JetimobImovel {
  codigo?: string;
  titulo?: string;
  descricao?: string;
  tipo?: string;
  finalidade?: string;
  status?: string;
  destaque?: boolean;
  valor?: number;
  valor_condominio?: number;
  valor_iptu?: number;
  area_total?: number;
  area_util?: number;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  andar?: number;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  endereco?: string;
  latitude?: number;
  longitude?: number;
  diferenciais?: string[];
  fotos?: Array<{ url: string; ordem?: number; principal?: boolean }>;
  video_url?: string;
  [key: string]: unknown;
}

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
  if (lower.includes("studio") || lower.includes("kitnet")) return "studio";
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

function mapImovel(j: JetimobImovel) {
  const codigo = j.codigo || String(Date.now());
  return {
    jetimob_id: codigo,
    slug: slugify(j.titulo || `imovel-${codigo}`, codigo),
    tipo: mapTipo(j.tipo),
    finalidade: mapFinalidade(j.finalidade),
    status: mapStatus(j.status),
    destaque: j.destaque || false,
    preco: j.valor || 0,
    preco_condominio: j.valor_condominio || null,
    preco_iptu: j.valor_iptu || null,
    area_total: j.area_total || null,
    area_util: j.area_util || null,
    quartos: j.quartos || null,
    banheiros: j.banheiros || null,
    vagas: j.vagas || null,
    andar: j.andar || null,
    bairro: j.bairro || "Sem bairro",
    cidade: j.cidade || "Porto Alegre",
    uf: j.uf || "RS",
    cep: j.cep || null,
    endereco_completo: j.endereco || null,
    latitude: j.latitude || null,
    longitude: j.longitude || null,
    titulo: j.titulo || `Imóvel ${codigo}`,
    descricao: j.descricao || null,
    diferenciais: j.diferenciais || [],
    fotos: JSON.stringify(
      (j.fotos || []).map((f, i) => ({
        url: f.url,
        ordem: f.ordem ?? i,
        principal: f.principal ?? i === 0,
      }))
    ),
    video_url: j.video_url || null,
    origem: "jetimob",
    jetimob_raw: JSON.stringify(j),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const JETIMOB_API_TOKEN = Deno.env.get("JETIMOB_API_TOKEN");
    if (!JETIMOB_API_TOKEN) {
      throw new Error("JETIMOB_API_TOKEN is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch from Jetimob
    const jetimobUrl = `${JETIMOB_BASE}/${JETIMOB_API_TOKEN}/imoveis`;
    console.log("Fetching from Jetimob:", jetimobUrl.replace(JETIMOB_API_TOKEN, "***"));

    const response = await fetch(jetimobUrl);
    if (!response.ok) {
      const text = await response.text();
      console.error("Jetimob API error:", response.status, text);
      throw new Error(`Jetimob API returned ${response.status}`);
    }

    const data = await response.json();

    // Jetimob may return { imoveis: [...] } or directly an array
    const imoveis: JetimobImovel[] = Array.isArray(data)
      ? data
      : data.imoveis || data.data || [];

    console.log(`Found ${imoveis.length} properties from Jetimob`);

    let inseridos = 0;
    let atualizados = 0;
    let erros = 0;

    // Process in batches of 20
    const batchSize = 20;
    for (let i = 0; i < imoveis.length; i += batchSize) {
      const batch = imoveis.slice(i, i + batchSize);
      const mapped = batch.map(mapImovel);

      const { error } = await supabase.from("imoveis").upsert(mapped, {
        onConflict: "jetimob_id",
        ignoreDuplicates: false,
      });

      if (error) {
        console.error("Upsert error batch", i, error.message);
        erros += batch.length;
      } else {
        // Approximate: we can't easily distinguish insert vs update with upsert
        inseridos += batch.length;
      }
    }

    const result = { inseridos, atualizados, erros, total: imoveis.length };
    console.log("Sync result:", result);

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
