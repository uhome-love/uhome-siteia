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
  if (lower.includes("garden")) return "garden";
  if (lower.includes("cobert")) return "cobertura";
  if (lower.includes("casa") && lower.includes("condom")) return "casa_condominio";
  if (lower.includes("casa")) return "casa";
  if (lower.includes("studio") || lower.includes("kitnet") || lower.includes("kit")) return "studio";
  if (lower.includes("loft")) return "loft";
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

function mapFase(s?: string): string {
  if (!s) return "usado";
  if (s === "Em construção") return "em_construcao";
  if (s === "Na planta") return "na_planta";
  if (s === "Novo") return "novo";
  return "usado";
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
    fase: mapFase(j.status),
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

const PAGE_SIZE = 100;
const MAX_RETRIES = 3;
const RATE_LIMIT_MS = 50;
// Só desativa imóveis quando a execução trouxe pelo menos 90% do total informado pelo Jetimob
const SAFETY_RATIO = 0.9;
// Uma execução parada há mais de 10 minutos é considerada travada e é retomada
const STALE_RUN_MINUTES = 10;
// Uma execução que passa disso sem terminar é abandonada e uma nova é iniciada
const ABANDON_RUN_HOURS = 6;
// Intervalo mínimo entre execuções completas
const MIN_HOURS_BETWEEN_RUNS = 20;

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

    // ---- Parse body -------------------------------------------------------
    // mode: "tick"  → continua execução em andamento, ou inicia se estiver na hora (usado pelo cron)
    //       "start" → força o início de uma nova execução completa (usado pelo admin)
    let mode: "tick" | "start" | "continue" = "tick";
    let maxPagesToProcess = 8;
    try {
      const body = await req.json();
      if (body?.mode === "start" || body?.force === true) mode = "start";
      else if (body?.mode === "continue") mode = "continue";
      if (body?.max_pages) maxPagesToProcess = Math.max(1, Number(body.max_pages));
    } catch { /* sem body é válido (cron) */ }

    // ---- Determina a execução (run) a usar --------------------------------
    const { data: lastRuns } = await supabase
      .from("sync_state")
      .select("*")
      .order("iniciado_em", { ascending: false })
      .limit(1);

    let run = lastRuns?.[0] ?? null;
    const nowMs = Date.now();

    if (mode === "start") {
      // Fecha execução anterior ainda aberta
      if (run && run.status === "rodando") {
        await supabase
          .from("sync_state")
          .update({ status: "cancelada", finalizado_em: new Date().toISOString() })
          .eq("id", run.id);
      }
      run = null;
    } else if (run && run.status === "rodando") {
      const lastTouch = new Date(run.updated_at ?? run.iniciado_em).getTime();
      const minutesIdle = (nowMs - lastTouch) / 60000;
      if (mode === "tick" && minutesIdle < 1) {
        // Outro bloco provavelmente ainda está rodando — evita execução concorrente
        return json({ skipped: "already_running", run_id: run.id, pagina_atual: run.pagina_atual });
      }
      if (minutesIdle >= STALE_RUN_MINUTES) {
        console.log(`♻️ Retomando execução travada ${run.id} na página ${run.pagina_atual + 1}`);
      }
    } else if (run) {
      const finished = new Date(run.finalizado_em ?? run.iniciado_em).getTime();
      const hoursSince = (nowMs - finished) / 3600000;
      if (hoursSince < MIN_HOURS_BETWEEN_RUNS) {
        return json({ skipped: "recent_run", horas_desde_ultima: Number(hoursSince.toFixed(1)) });
      }
      run = null;
    }

    if (!run) {
      const { data: created, error: createErr } = await supabase
        .from("sync_state")
        .insert({ status: "rodando", pagina_atual: 0, total_processado: 0 })
        .select()
        .single();
      if (createErr) throw createErr;
      run = created;
      console.log(`🚀 Nova execução iniciada: ${run.id}`);
    }

    // ---- Lock otimista: só um worker por execução -------------------------
    // Reivindica a execução comparando updated_at (CAS). Se outro worker
    // atualizou a linha nesse meio tempo, este bloco encerra sem duplicar trabalho.
    let lockToken: string = run.updated_at;
    async function claim(): Promise<boolean> {
      const next = new Date().toISOString();
      const { data, error } = await supabase
        .from("sync_state")
        .update({ updated_at: next })
        .eq("id", run.id)
        .eq("updated_at", lockToken)
        .select("updated_at")
        .maybeSingle();
      if (error || !data) return false;
      lockToken = data.updated_at;
      return true;
    }

    if (!(await claim())) {
      return json({ skipped: "lock_taken", run_id: run.id });
    }

    const syncStartedAt: string = run.iniciado_em;
    const startPage = (run.pagina_atual ?? 0) + 1;
    const endPage = startPage + maxPagesToProcess - 1;

    let inserted = 0;
    let errors = 0;
    let fetched = 0;
    let expectedTotal: number | null = run.total_esperado ?? null;
    let totalPages: number | null = run.paginas_totais ?? null;
    let lastPage = run.pagina_atual ?? 0;
    let reachedEnd = false;
    let chunkError: string | null = null;
    let lockLost = false;

    console.log(`🔄 run=${run.id} páginas ${startPage}-${endPage} (início ${syncStartedAt})`);



    for (let page = startPage; page <= endPage; page++) {
      const url = `${JETIMOB_BASE}/${JETIMOB_KEY}/imoveis/todos?v=6&page=${page}&pageSize=${PAGE_SIZE}`;

      let response: Response | null = null;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          response = await fetch(url, { headers: { Accept: "application/json" } });
          if (response.ok) break;
          console.error(`❌ Página ${page} HTTP ${response.status}`);
          response = null;
        } catch (fetchErr) {
          console.error(`❌ Página ${page} erro (tentativa ${attempt}):`, fetchErr);
          response = null;
        }
        if (attempt < MAX_RETRIES) await sleep(1500 * attempt);
      }

      if (!response) {
        // Não avança a página: o próximo tick retoma exatamente daqui
        chunkError = `Falha ao buscar a página ${page} após ${MAX_RETRIES} tentativas`;
        console.warn(`⚠️ ${chunkError}`);
        break;
      }

      const data = await response.json();

      const total = extractTotal(data);
      if (total) {
        expectedTotal = total;
        totalPages = data?.totalPages != null ? Number(data.totalPages) : Math.ceil(total / PAGE_SIZE);
      }

      const items = extractItems(data);
      if (items.length === 0) {
        console.log(`🏁 Página ${page} vazia — fim da listagem.`);
        reachedEnd = true;
        break;
      }

      fetched += items.length;

      for (let i = 0; i < items.length; i += 50) {
        const batch = items.slice(i, i + 50);
        const mapped = batch.map(mapImovel);
        const { error } = await supabase
          .from("imoveis")
          .upsert(mapped, { onConflict: "jetimob_id", ignoreDuplicates: false });
        if (error) {
          console.error(`❌ Upsert p${page}b${i}: ${error.message}`);
          errors += batch.length;
          chunkError = error.message;
        } else {
          inserted += batch.length;
        }
      }

      lastPage = page;

      // Heartbeat + verificação do lock
      if (!(await claim())) {
        lockLost = true;
        console.warn("⚠️ Lock perdido para outro worker — encerrando este bloco.");
        break;
      }

      if (!hasNextPage(data, items.length, PAGE_SIZE, page)) {
        console.log(`🏁 Sem próxima página após ${page}.`);
        reachedEnd = true;
        break;
      }

      await sleep(RATE_LIMIT_MS);
    }

    const totalProcessado = (run.total_processado ?? 0) + inserted;

    if (lockLost) {
      return json({ skipped: "lock_lost", run_id: run.id, inseridos: inserted, last_page: lastPage });
    }

    // ---- Persiste progresso ----------------------------------------------
    const progressoAt = new Date().toISOString();
    const { data: progressoRow } = await supabase
      .from("sync_state")
      .update({
        pagina_atual: lastPage,
        paginas_totais: totalPages,
        total_esperado: expectedTotal,
        total_processado: totalProcessado,
        erro: chunkError,
        updated_at: progressoAt,
      })
      .eq("id", run.id)
      .eq("updated_at", lockToken)
      .select("updated_at")
      .maybeSingle();

    if (!progressoRow) {
      return json({ skipped: "lock_lost", run_id: run.id, inseridos: inserted, last_page: lastPage });
    }
    lockToken = progressoRow.updated_at;


    await supabase.from("sync_log").insert({
      tipo: "jetimob",
      direcao: "jetimob→uhome",
      sucesso: errors === 0 && !chunkError,
      erro: chunkError,
      payload: {
        run_id: run.id,
        start_page: startPage,
        last_page: lastPage,
        inseridos: inserted,
        erros: errors,
        total_fetched: fetched,
        total_processado: totalProcessado,
        expected_total: expectedTotal,
        sync_started_at: syncStartedAt,
      },
    });

    let desativados: number | null = null;
    let finalizado = false;

    // ---- Finalização + limpeza -------------------------------------------
    if (reachedEnd) {
      const safeToDeactivate =
        totalProcessado > 0 &&
        expectedTotal !== null &&
        expectedTotal > 0 &&
        totalProcessado >= expectedTotal * SAFETY_RATIO;

      if (safeToDeactivate) {
        const { count, error: deactErr } = await supabase
          .from("imoveis")
          .update({ status: "inativo" })
          .eq("origem", "jetimob")
          .eq("status", "disponivel")
          .lt("updated_at", syncStartedAt)
          .select("id", { count: "exact", head: true });

        if (deactErr) {
          console.error("❌ Erro ao desativar:", deactErr.message);
        } else {
          desativados = count ?? 0;
          console.log(`🧹 ${desativados} imóveis desativados (fora do Jetimob).`);
        }
      } else {
        console.warn(
          `⚠️ Desativação pulada por segurança: processado=${totalProcessado} esperado=${expectedTotal}`
        );
      }

      finalizado = true;
      await supabase
        .from("sync_state")
        .update({
          status: safeToDeactivate ? "concluida" : "concluida_sem_limpeza",
          finalizado_em: new Date().toISOString(),
          desativados,
        })
        .eq("id", run.id);

      await supabase.from("sync_log").insert({
        tipo: "jetimob",
        direcao: "jetimob→uhome",
        sucesso: true,
        payload: {
          action: "sync_complete",
          run_id: run.id,
          sync_started_at: syncStartedAt,
          total_processado: totalProcessado,
          expected_total: expectedTotal,
          desativados,
          limpeza_aplicada: safeToDeactivate,
        },
      });
    } else {
      // Encadeia o próximo bloco; se a chamada se perder, o cron retoma pelo sync_state
      try {
        fetch(`${SUPABASE_URL}/functions/v1/sync-jetimob`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY") ?? ""}`,
          },
          body: JSON.stringify({ mode: "continue", max_pages: maxPagesToProcess }),
        }).catch((err) => console.error("Chain error:", err));
      } catch (chainErr) {
        console.error("Chain error:", chainErr);
      }
    }

    return json({
      run_id: run.id,
      inseridos: inserted,
      erros: errors,
      total: fetched,
      total_processado: totalProcessado,
      total_esperado: expectedTotal,
      last_page: lastPage,
      paginas_totais: totalPages,
      finalizado,
      desativados,
      erro: chunkError,
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

function json(payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
