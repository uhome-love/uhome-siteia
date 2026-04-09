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

function extractFotos(item: any): Array<{ url: string; ordem: number; principal: boolean }> {
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
  return fotos;
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
    area_total: j.area_total ? Number(j.area_total) : (j.area_privativa ? Number(j.area_privativa) : (j.area_util ? Number(j.area_util) : null)),
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
    descricao: j.observacoes || j.descricao_anuncio || j.descricao || j.description || null,
    diferenciais: extractDiferenciais(j),
    fotos: extractFotos(j),
    video_url: j.video_url || j.video || null,
    origem: "jetimob",
    condominio_nome: j.condominio_nome || null,
    condominio_id: j.id_condominio ? String(j.id_condominio) : null,
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
    data?.total, data?.count, data?.totalResults, data?.totalItems,
    data?.total_items, data?.meta?.total, data?.pagination?.total, data?.paginacao?.total,
  ];
  for (const v of candidates) {
    const n = Number(v);
    if (n > 0) return n;
  }
  return null;
}

function hasNextPage(data: any, itemsCount: number, pageSize: number, currentPage: number): boolean {
  if (data?.totalPages != null && currentPage < Number(data.totalPages)) return true;
  if (data?.totalPages != null && currentPage >= Number(data.totalPages)) return false;
  if (data?.proxima_pagina != null) return !!data.proxima_pagina;
  if (data?.next_page != null) return !!data.next_page;
  if (data?.has_more != null) return !!data.has_more;
  if (data?.meta?.has_next_page != null) return !!data.meta.has_next_page;
  if (data?.pagination?.has_next != null) return !!data.pagination.has_next;
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

    // Parse request body
    let startPage = 1;
    let maxPagesToProcess = 10;
    let autoChain = false;
    let syncStartedAt: string | null = null;
    try {
      const body = await req.json();
      if (body?.start_page) startPage = Number(body.start_page);
      if (body?.max_pages) maxPagesToProcess = Number(body.max_pages);
      if (body?.auto_chain) autoChain = true;
      if (body?.sync_started_at) syncStartedAt = body.sync_started_at;
    } catch { /* no body is fine */ }

    // If this is the first chunk of an auto-chain, record the start time
    if (!syncStartedAt) {
      syncStartedAt = new Date().toISOString();
    }

    const PAGE_SIZE = 100;
    const MAX_RETRIES = 3;
    const RATE_LIMIT_MS = 50;

    let totalInserted = 0;
    let totalErrors = 0;
    let totalFetched = 0;
    let expectedTotal: number | null = null;
    let lastPage = startPage;

    console.log(`🔄 Sync started | startPage=${startPage} maxPages=${maxPagesToProcess} autoChain=${autoChain} syncStartedAt=${syncStartedAt}`);

    const endPage = startPage + maxPagesToProcess - 1;

    for (let page = startPage; page <= endPage; page++) {
      const url = `${JETIMOB_BASE}/${JETIMOB_KEY}/imoveis/todos?v=6&page=${page}&pageSize=${PAGE_SIZE}`;

      let response: Response | null = null;
      let retries = 0;

      while (retries < MAX_RETRIES) {
        try {
          console.log(`📄 Page ${page} (attempt ${retries + 1})...`);
          response = await fetch(url, { headers: { Accept: "application/json" } });
          if (response.ok) break;
          const text = await response.text();
          console.error(`❌ Page ${page} HTTP ${response.status}: ${text.slice(0, 200)}`);
          if (page === startPage && retries === 0) throw new Error(`Jetimob API returned ${response.status}`);
          retries++;
          if (retries < MAX_RETRIES) await sleep(2000 * retries);
        } catch (fetchErr) {
          retries++;
          console.error(`❌ Page ${page} fetch error (attempt ${retries}):`, fetchErr);
          if (page === startPage && retries >= MAX_RETRIES) throw fetchErr;
          if (retries < MAX_RETRIES) await sleep(2000 * retries);
        }
      }

      if (!response || !response.ok) {
        console.warn(`⚠️ Skipping page ${page} after ${MAX_RETRIES} retries`);
        break;
      }

      const data = await response.json();

      if (page === startPage) {
        const topKeys = Object.keys(data);
        console.log(`📊 Response structure: ${JSON.stringify(topKeys)}`);
        const total = extractTotal(data);
        if (total) {
          expectedTotal = total;
          console.log(`📊 Expected total: ${expectedTotal}, totalPages: ${data?.totalPages ?? '?'}`);
        }
      }

      const items = extractItems(data);
      if (items.length === 0) {
        console.log(`🏁 Page ${page}: empty — stopping.`);
        break;
      }

      totalFetched += items.length;

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

      lastPage = page;
      console.log(`✅ Page ${page}: ${items.length} items | Running: ${totalInserted} ok, ${totalErrors} err`);

      if (!hasNextPage(data, items.length, PAGE_SIZE, page)) {
        console.log(`🏁 No next page — stopping.`);
        break;
      }

      await sleep(RATE_LIMIT_MS);
    }

    // Check if there are more pages to sync
    const morePages = hasNextPage({ totalPages: expectedTotal ? Math.ceil(expectedTotal / PAGE_SIZE) : null }, 0, PAGE_SIZE, lastPage);
    const nextStartPage = lastPage + 1;

    // Log this chunk to sync_log
    await supabase.from("sync_log").insert({
      tipo: "jetimob",
      direcao: "jetimob→uhome",
      sucesso: totalErrors === 0,
      erro: totalErrors > 0 ? `${totalErrors} erros de upsert` : null,
      payload: {
        start_page: startPage,
        last_page: lastPage,
        inseridos: totalInserted,
        erros: totalErrors,
        total_fetched: totalFetched,
        expected_total: expectedTotal,
        more_pages: morePages,
        sync_started_at: syncStartedAt,
      },
    });

    const result = {
      inseridos: totalInserted,
      erros: totalErrors,
      total: totalFetched,
      total_esperado: expectedTotal,
      last_page: lastPage,
      next_start_page: nextStartPage,
      more_pages: morePages,
      chained: false,
      sync_started_at: syncStartedAt,
    };

    // Auto-chain: trigger the next chunk if there are more pages
    if (autoChain && morePages && totalFetched > 0) {
      try {
        const selfUrl = `${SUPABASE_URL}/functions/v1/sync-jetimob`;
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
        console.log(`🔗 Chaining next chunk: start_page=${nextStartPage}`);
        fetch(selfUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            start_page: nextStartPage,
            max_pages: maxPagesToProcess,
            auto_chain: true,
            sync_started_at: syncStartedAt,
          }),
        }).catch((err) => console.error("Chain fetch error:", err));
        result.chained = true;
      } catch (chainErr) {
        console.error("Chain error:", chainErr);
      }
    }

    // If sync is complete (no more pages), deactivate properties not touched during this sync
    if (!morePages && syncStartedAt && autoChain) {
      try {
        console.log(`🧹 Deactivating properties not updated since ${syncStartedAt}...`);
        const { count, error: deactivateError } = await supabase
          .from("imoveis")
          .update({ status: "inativo" })
          .eq("origem", "jetimob")
          .eq("status", "disponivel")
          .lt("updated_at", syncStartedAt)
          .select("id", { count: "exact", head: true });

        if (deactivateError) {
          console.error("❌ Deactivation error:", deactivateError.message);
        } else {
          console.log(`🧹 Deactivated ${count ?? 0} stale properties`);
        }

        // Log the final summary
        await supabase.from("sync_log").insert({
          tipo: "jetimob",
          direcao: "jetimob→uhome",
          sucesso: true,
          payload: {
            action: "sync_complete",
            sync_started_at: syncStartedAt,
            deactivated: count ?? 0,
          },
        });
      } catch (deactivateErr) {
        console.error("Deactivation error:", deactivateErr);
      }
    }

    console.log(`✅ Sync chunk complete:`, JSON.stringify(result));

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
