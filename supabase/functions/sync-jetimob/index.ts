import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JETIMOB_BASE = "https://api.jetimob.com/webservice";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  if (lower.includes("studio") || lower.includes("kitnet") || lower.includes("kit")) return "studio";
  if (lower.includes("comerc") || lower.includes("sala") || lower.includes("loja")) return "comercial";
  if (lower.includes("terr")) return "terreno";
  return "apartamento";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function gerarTitulo(j: any, tipo: string, bairro: string): string {
  const finalidade = mapFinalidade(j.finalidade || j.operacao || j.contrato);
  const label = finalidade === "locacao" ? "para Alugar" : "para Venda";
  const quartos = j.dormitorios ?? j.quartos ?? j.bedrooms;
  if (quartos && Number(quartos) > 0) {
    const q = Number(quartos);
    return `${capitalize(tipo)} ${q} quarto${q > 1 ? "s" : ""} — ${bairro}`;
  }
  return `${capitalize(tipo)} ${label} — ${bairro}`;
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
  const candidates = [j.valor_venda, j.valor_locacao, j.valor_temporada, j.valor, j.preco, j.price, j.valor_total];
  for (const v of candidates) {
    const n = Number(v);
    if (n > 0) return n;
  }
  return 0;
}

function mapImovel(j: any) {
  const codigo = String(j.codigo || j.id || j.cod || Date.now());
  const tipo = mapTipo(j.subtipo || j.tipo_imovel || j.tipo || j.type);
  const bairro = j.endereco_bairro || j.bairro || j.neighborhood || j.bairro_nome || j.endereco?.bairro || j.localizacao?.bairro || "Porto Alegre";
  const titulo = gerarTitulo(j, tipo, bairro);

  return {
    jetimob_id: codigo,
    slug: slugify(titulo, codigo),
    tipo,
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
    bairro,
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

function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.imoveis)) return data.imoveis;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function extractTotal(data: any): number | null {
  const candidates = [
    data?.total,
    data?.count,
    data?.totalResults,
    data?.totalItems,
    data?.total_items,
    data?.meta?.total,
    data?.pagination?.total,
    data?.paginacao?.total,
  ];
  for (const v of candidates) {
    const n = Number(v);
    if (n > 0) return n;
  }
  return null;
}

function hasNextPage(data: any, itemsCount: number, pageSize: number): boolean {
  // Explicit next page indicators
  if (data?.proxima_pagina != null) return !!data.proxima_pagina;
  if (data?.next_page != null) return !!data.next_page;
  if (data?.has_more != null) return !!data.has_more;
  if (data?.meta?.has_next_page != null) return !!data.meta.has_next_page;
  if (data?.pagination?.has_next != null) return !!data.pagination.has_next;
  // Fallback: if the page came full, there's probably more
  return itemsCount >= pageSize;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const JETIMOB_KEY = Deno.env.get("JETIMOB_API_KEY") || Deno.env.get("JETIMOB_API_TOKEN");
    if (!JETIMOB_KEY) throw new Error("JETIMOB_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const PAGE_SIZE = 200;
    const MAX_PAGES = 200;
    const MAX_RETRIES = 3;
    const RATE_LIMIT_MS = 200;

    let totalInserted = 0;
    let totalErrors = 0;
    let totalFetched = 0;
    let expectedTotal: number | null = null;

    console.log(`🔄 Sync started | key length: ${JETIMOB_KEY.length}`);

    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = `${JETIMOB_BASE}/${JETIMOB_KEY}/imoveis/todos?v=6&page=${page}&pageSize=${PAGE_SIZE}`;

      let response: Response | null = null;
      let retries = 0;

      // Retry loop for this page
      while (retries < MAX_RETRIES) {
        try {
          console.log(`📄 Page ${page} (attempt ${retries + 1})...`);
          response = await fetch(url, { headers: { Accept: "application/json" } });
          if (response.ok) break;

          const text = await response.text();
          console.error(`❌ Page ${page} HTTP ${response.status}: ${text.slice(0, 200)}`);

          // If first page fails, abort entirely
          if (page === 1) throw new Error(`Jetimob API returned ${response.status}: ${text.slice(0, 200)}`);

          retries++;
          if (retries < MAX_RETRIES) await sleep(2000 * retries);
        } catch (fetchErr) {
          retries++;
          console.error(`❌ Page ${page} fetch error (attempt ${retries}):`, fetchErr);
          if (page === 1 && retries >= MAX_RETRIES) throw fetchErr;
          if (retries < MAX_RETRIES) await sleep(2000 * retries);
        }
      }

      if (!response || !response.ok) {
        console.warn(`⚠️ Skipping page ${page} after ${MAX_RETRIES} retries`);
        break;
      }

      const data = await response.json();

      // Log structure on first page for debugging
      if (page === 1) {
        const topKeys = Object.keys(data);
        console.log(`📊 Response structure: ${JSON.stringify(topKeys)}`);
        const total = extractTotal(data);
        if (total) {
          expectedTotal = total;
          console.log(`📊 Expected total: ${expectedTotal}`);
        }
      }

      const items = extractItems(data);
      if (items.length === 0) {
        console.log(`🏁 Page ${page}: empty — stopping.`);
        break;
      }

      totalFetched += items.length;

      // Upsert in batches of 50
      for (let i = 0; i < items.length; i += 50) {
        const batch = items.slice(i, i + 50);
        const mapped = batch.map(mapImovel);
        const { error } = await supabase
          .from("imoveis")
          .upsert(mapped, { onConflict: "jetimob_id", ignoreDuplicates: false });
        if (error) {
          console.error(`❌ Upsert p${page}b${i}: ${error.message}`);
          totalErrors += batch.length;
        } else {
          totalInserted += batch.length;
        }
      }

      console.log(`✅ Page ${page}: ${items.length} items | Running: ${totalInserted} ok, ${totalErrors} err, ${totalFetched} fetched`);

      // Check if we should stop
      if (!hasNextPage(data, items.length, PAGE_SIZE)) {
        console.log(`🏁 No next page indicator — stopping.`);
        break;
      }

      if (expectedTotal && totalFetched >= expectedTotal) {
        console.log(`🏁 Reached expected total ${expectedTotal} — stopping.`);
        break;
      }

      // Rate limit between pages
      await sleep(RATE_LIMIT_MS);
    }

    const result = {
      inseridos: totalInserted,
      erros: totalErrors,
      total: totalFetched,
      total_esperado: expectedTotal,
    };
    console.log(`✅ Sync complete:`, JSON.stringify(result));

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
