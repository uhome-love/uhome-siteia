import { supabase } from "@/integrations/supabase/client";

export interface Imovel {
  id: string;
  slug: string;
  tipo: string;
  finalidade: string;
  status: string;
  destaque: boolean;
  preco: number;
  preco_condominio: number | null;
  preco_iptu: number | null;
  area_total: number | null;
  area_util: number | null;
  quartos: number | null;
  banheiros: number | null;
  vagas: number | null;
  andar: number | null;
  bairro: string;
  cidade: string;
  uf: string;
  latitude: number | null;
  longitude: number | null;
  titulo: string;
  descricao: string | null;
  diferenciais: string[];
  fotos: Array<{ url: string; ordem: number; principal: boolean }>;
  foto_principal: string | null;
  video_url: string | null;
  condominio_nome: string | null;
  publicado_em: string;
  fase: string;
  endereco_completo: string | null;
}

function parseFotos(fotos: any): Array<{ url: string; ordem: number; principal: boolean }> {
  if (!fotos) return [];
  if (typeof fotos === "string") {
    try { return JSON.parse(fotos); } catch { return []; }
  }
  if (Array.isArray(fotos)) return fotos;
  return [];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Generate a clean title regardless of what's stored in the DB */
export function tituloLimpo(imovel: { tipo: string; finalidade: string; quartos: number | null; bairro: string; titulo?: string }): string {
  const tipoMap: Record<string, string> = {
    garden: "Apartamento Garden",
    casa_condominio: "Casa em Condomínio",
  };
  const tipo = tipoMap[imovel.tipo] ?? capitalize(imovel.tipo);
  const quartos = imovel.quartos ?? 0;
  if (quartos > 0) {
    return `${tipo} ${quartos} quarto${quartos > 1 ? "s" : ""} — ${imovel.bairro}`;
  }
  return `${tipo} para Venda — ${imovel.bairro}`;
}

function mapRow(row: any): Imovel {
  const mapped = {
    ...row,
    fotos: parseFotos(row.fotos),
    foto_principal: row.foto_principal || null,
    diferenciais: row.diferenciais || [],
    destaque: row.destaque ?? false,
    cidade: row.cidade ?? "Porto Alegre",
    uf: row.uf ?? "RS",
    condominio_nome: row.condominio_nome?.trim() || null,
    fase: row.fase || "usado",
    endereco_completo: row.endereco_completo?.trim() || null,
  };
  // Always override with clean title
  mapped.titulo = tituloLimpo(mapped);
  return mapped;
}

/** Get primary photo URL or a placeholder */
export function fotoPrincipal(imovel: Imovel): string {
  if (imovel.foto_principal) return imovel.foto_principal;
  const fotos = imovel.fotos;
  if (!fotos || fotos.length === 0) return "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop";
  const principal = fotos.find((f) => f.principal);
  return (principal ?? fotos[0]).url;
}

/** Format price as BRL */
export function formatPreco(preco: number): string {
  if (!preco || preco <= 0) return "Consulte";
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export interface BuscaFilters {
  finalidade?: string;
  tipo?: string;
  bairro?: string;
  bairros?: string[];
  cidade?: string;
  precoMin?: number;
  precoMax?: number;
  /** Filters area_total */
  areaMin?: number;
  areaMax?: number;
  /** Filters area_util (private area) */
  areaUtilMin?: number;
  areaUtilMax?: number;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  diferenciais?: string[];
  
  ordem?: "recentes" | "preco_asc" | "preco_desc" | "area_desc";
  q?: string;
  codigo?: string;
  andarMin?: number;
  condominioMax?: number;
  iptuMax?: number;
  condominio?: string;
  fase?: string;
  limit?: number;
  offset?: number;
  bounds?: {
    lat_min: number;
    lat_max: number;
    lng_min: number;
    lng_max: number;
  } | null;
}

export const CIDADES_PERMITIDAS = ["Porto Alegre", "Canoas", "Cachoeirinha", "Gravataí", "Guaíba"];

// Minimal columns for listing cards — no fotos/descricao/jetimob_raw/diferenciais
const LISTING_COLUMNS = "id,slug,tipo,finalidade,status,destaque,preco,preco_condominio,area_total,area_util,quartos,banheiros,vagas,bairro,cidade,uf,publicado_em,foto_principal,fase";

// Focused detail payload — excludes large sync/debug fields that can slow or stall property pages
const DETAIL_COLUMNS = "id,slug,tipo,finalidade,status,destaque,preco,preco_condominio,preco_iptu,area_total,area_util,quartos,banheiros,vagas,andar,latitude,longitude,titulo,descricao,diferenciais,fotos,foto_principal,video_url,condominio_nome,publicado_em,bairro,cidade,uf";

const PUBLIC_REST_URL = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/imoveis`;
const PUBLIC_REST_HEADERS: HeadersInit = {
  apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  "accept-profile": "public",
};

export async function fetchImoveis(filters: BuscaFilters = {}): Promise<{ data: Imovel[]; count: number }> {
  // Build data query — NO count (much faster)
  let query = supabase
    .from("imoveis")
    .select(LISTING_COLUMNS)
    .eq("status", "disponivel")
    .eq("finalidade", "venda")
    .not("fotos", "is", null)
    .neq("fotos", "[]");

  // City filter: skip when searching by code to find properties in any city
  if (!filters.codigo) {
    if (filters.cidade) {
      query = query.eq("cidade", filters.cidade);
    } else {
      query = query.in("cidade", CIDADES_PERMITIDAS);
    }
  }

  if (filters.tipo) {
    const tipos = filters.tipo.toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
    if (tipos.length === 1) {
      query = query.eq("tipo", tipos[0]);
    } else if (tipos.length > 1) {
      query = query.in("tipo", tipos);
    }
  }
  if (filters.bairros?.length) {
    const bairroFilter = filters.bairros.map(b => `bairro.ilike.%${b}%`).join(",");
    query = query.or(bairroFilter);
  } else if (filters.bairro) {
    query = query.ilike("bairro", `%${filters.bairro}%`);
  }
  if (filters.precoMin) query = query.gte("preco", filters.precoMin);
  if (filters.precoMax) query = query.lte("preco", filters.precoMax);
  if (filters.areaMin) query = query.gte("area_total", filters.areaMin);
  if (filters.areaMax) query = query.lte("area_total", filters.areaMax);
  if (filters.areaUtilMin) query = query.gte("area_util", filters.areaUtilMin);
  if (filters.areaUtilMax) query = query.lte("area_util", filters.areaUtilMax);
  if (filters.quartos) query = query.gte("quartos", filters.quartos);
  if (filters.banheiros) query = query.gte("banheiros", filters.banheiros);
  if (filters.vagas) query = query.gte("vagas", filters.vagas);
  
  if (filters.diferenciais?.length) query = query.contains("diferenciais", filters.diferenciais);
  if (filters.andarMin) query = query.gte("andar", filters.andarMin);
  if (filters.condominioMax) query = query.lte("preco_condominio", filters.condominioMax);
  if (filters.iptuMax) query = query.lte("preco_iptu", filters.iptuMax);
  if (filters.condominio) query = query.ilike("condominio_nome", `%${filters.condominio}%`);
  if (filters.fase) query = query.eq("fase", filters.fase);
  if (filters.q) query = query.or(`titulo.ilike.%${filters.q}%,bairro.ilike.%${filters.q}%,tipo.ilike.%${filters.q}%,endereco_completo.ilike.%${filters.q}%`);
  if (filters.codigo) query = query.or(`jetimob_id.ilike.%${filters.codigo}%,slug.ilike.%${filters.codigo}%`);
  if (filters.bounds) {
    query = query
      .gte("latitude", filters.bounds.lat_min)
      .lte("latitude", filters.bounds.lat_max)
      .gte("longitude", filters.bounds.lng_min)
      .lte("longitude", filters.bounds.lng_max);
  }

  const orderMap = {
    recentes: { column: "publicado_em" as const, ascending: false },
    preco_asc: { column: "preco" as const, ascending: true },
    preco_desc: { column: "preco" as const, ascending: false },
    area_desc: { column: "area_total" as const, ascending: false },
  };
  const ordem = orderMap[filters.ordem ?? "recentes"];
  query = query.order(ordem.column, { ascending: ordem.ascending });

  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  // Detect if advanced filters are active (not supported by count_imoveis RPC)
  const hasAdvancedFilters = !!(filters.codigo || filters.andarMin || filters.condominioMax || filters.iptuMax || filters.diferenciais?.length || filters.condominio || filters.areaUtilMin || filters.areaUtilMax);

  // Build count — either via RPC or via a parallel filtered count query
  const bairroStr = filters.bairro || undefined;
  const bairrosArr = filters.bairros?.length ? filters.bairros : undefined;

  const t0 = performance.now();
  const skipCount = (filters.offset ?? 0) > 0;

  let countPromise: Promise<number>;

  if (skipCount) {
    countPromise = Promise.resolve(-1);
  } else if (hasAdvancedFilters) {
    // Build a parallel count query with the same filters as the data query
    let countQuery = supabase
      .from("imoveis")
      .select("id", { count: "exact", head: true })
      .eq("status", "disponivel")
      .eq("finalidade", "venda");

    if (filters.cidade) countQuery = countQuery.eq("cidade", filters.cidade);
    else countQuery = countQuery.in("cidade", CIDADES_PERMITIDAS);

    if (filters.tipo) {
      const tipos = filters.tipo.split(",").map(s => s.trim()).filter(Boolean);
      if (tipos.length === 1) countQuery = countQuery.eq("tipo", tipos[0]);
      else if (tipos.length > 1) countQuery = countQuery.in("tipo", tipos);
    }
    if (bairrosArr) {
      countQuery = countQuery.or(bairrosArr.map(b => `bairro.ilike.%${b}%`).join(","));
    } else if (bairroStr) {
      countQuery = countQuery.ilike("bairro", `%${bairroStr}%`);
    }
    if (filters.precoMin) countQuery = countQuery.gte("preco", filters.precoMin);
    if (filters.precoMax) countQuery = countQuery.lte("preco", filters.precoMax);
    if (filters.areaMin) countQuery = countQuery.gte("area_total", filters.areaMin);
    if (filters.areaMax) countQuery = countQuery.lte("area_total", filters.areaMax);
    if (filters.areaUtilMin) countQuery = countQuery.gte("area_util", filters.areaUtilMin);
    if (filters.areaUtilMax) countQuery = countQuery.lte("area_util", filters.areaUtilMax);
    if (filters.quartos) countQuery = countQuery.gte("quartos", filters.quartos);
    if (filters.banheiros) countQuery = countQuery.gte("banheiros", filters.banheiros);
    if (filters.vagas) countQuery = countQuery.gte("vagas", filters.vagas);
    if (filters.diferenciais?.length) countQuery = countQuery.contains("diferenciais", filters.diferenciais);
    if (filters.andarMin) countQuery = countQuery.gte("andar", filters.andarMin);
    if (filters.condominioMax) countQuery = countQuery.lte("preco_condominio", filters.condominioMax);
    if (filters.iptuMax) countQuery = countQuery.lte("preco_iptu", filters.iptuMax);
    if (filters.condominio) countQuery = countQuery.ilike("condominio_nome", `%${filters.condominio}%`);
    if (filters.fase) countQuery = countQuery.eq("fase", filters.fase);
    
    if (filters.q) countQuery = countQuery.or(`titulo.ilike.%${filters.q}%,bairro.ilike.%${filters.q}%,tipo.ilike.%${filters.q}%`);
    if (filters.codigo) countQuery = countQuery.or(`jetimob_id.ilike.%${filters.codigo}%,slug.ilike.%${filters.codigo}%`);
    if (filters.bounds) {
      countQuery = countQuery
        .gte("latitude", filters.bounds.lat_min)
        .lte("latitude", filters.bounds.lat_max)
        .gte("longitude", filters.bounds.lng_min)
        .lte("longitude", filters.bounds.lng_max);
    }

    countPromise = Promise.resolve(countQuery).then(r => (r.count ?? 0) as number);
  } else {
    // Use fast RPC for standard filters
    const countParams: Record<string, any> = {};
    if (filters.cidade) countParams.p_cidade = filters.cidade;
    else countParams.p_cidades = CIDADES_PERMITIDAS;
    if (filters.tipo) {
      const tipos = filters.tipo.split(",").map(s => s.trim()).filter(Boolean);
      if (tipos.length === 1) countParams.p_tipo = tipos[0];
      else if (tipos.length > 1) countParams.p_tipos = tipos;
    }
    if (bairrosArr) countParams.p_bairros = bairrosArr;
    else if (bairroStr) countParams.p_bairro = bairroStr;
    if (filters.precoMin) countParams.p_preco_min = filters.precoMin;
    if (filters.precoMax) countParams.p_preco_max = filters.precoMax;
    if (filters.quartos) countParams.p_quartos = filters.quartos;
    if (filters.banheiros) countParams.p_banheiros = filters.banheiros;
    if (filters.vagas) countParams.p_vagas = filters.vagas;
    // RPC accepts one area pair (filters area_total). Prioritize private area when set.
    const areaMinForRpc = filters.areaUtilMin || filters.areaMin;
    const areaMaxForRpc = filters.areaUtilMax || filters.areaMax;
    if (areaMinForRpc) countParams.p_area_min = areaMinForRpc;
    if (areaMaxForRpc) countParams.p_area_max = areaMaxForRpc;
    if (filters.bounds) {
      countParams.lat_min = filters.bounds.lat_min;
      countParams.lat_max = filters.bounds.lat_max;
      countParams.lng_min = filters.bounds.lng_min;
      countParams.lng_max = filters.bounds.lng_max;
    }
    if (filters.fase) countParams.p_fase = filters.fase;
    countPromise = Promise.resolve(supabase.rpc("count_imoveis", countParams)).then(r => (r.data as number) ?? 0);
  }

  const [dataResult, countResult] = await Promise.all([
    query,
    countPromise,
  ]);
  const loadMs = Math.round(performance.now() - t0);

  if (dataResult.error) throw dataResult.error;

  const rows = dataResult.data || [];
  const totalCount = countResult ?? 0;

  // Emit perf metrics in dev
  if (import.meta.env.DEV) {
    const payloadKB = Math.round(JSON.stringify(rows).length / 1024);
    window.dispatchEvent(new CustomEvent("perf:update", {
      detail: { listaLoadMs: loadMs, listaPayloadKB: payloadKB },
    }));
  }

  return {
    data: rows.map(mapRow),
    count: totalCount,
  };
}

export interface MapPin {
  id: string;
  slug: string;
  preco: number;
  latitude: number;
  longitude: number;
  bairro: string;
  titulo: string;
  foto?: string;
  quartos?: number;
  area_total?: number;
  tipo?: string;
}

// Lightweight columns for map pins — minimal payload for clustering/render
const PIN_COLUMNS = "id,slug,preco,latitude,longitude,bairro,tipo,quartos,area_total";

// --- Pins cache ---
const pinsCache = new Map<string, { data: MapPin[]; timestamp: number }>();
const PINS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

function pinsCacheKey(filters: BuscaFilters): string {
  const b = filters.bounds;
  return JSON.stringify({
    n: b ? b.lat_max.toFixed(2) : null,
    s: b ? b.lat_min.toFixed(2) : null,
    e: b ? b.lng_max.toFixed(2) : null,
    w: b ? b.lng_min.toFixed(2) : null,
    t: filters.tipo || "",
    ba: filters.bairro || filters.bairros?.join(",") || "",
    pMin: filters.precoMin || 0,
    pMax: filters.precoMax || 0,
    aMin: filters.areaMin || 0,
    aMax: filters.areaMax || 0,
    auMin: filters.areaUtilMin || 0,
    auMax: filters.areaUtilMax || 0,
    q: filters.quartos || 0,
    ci: filters.cidade || "",
  });
}

/** Fetch lightweight pin data for the map via RPC — bypasses PostgREST 1000 row limit */
export async function fetchMapPins(filters: BuscaFilters = {}, signal?: AbortSignal): Promise<MapPin[]> {
  // Check cache first
  const cacheKey = pinsCacheKey(filters);
  const cached = pinsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < PINS_CACHE_TTL) {
    if (import.meta.env.DEV) {
      console.log(`[MapCache] ✅ HIT key=${cacheKey.slice(0, 60)}…`);
      window.dispatchEvent(new CustomEvent("perf:update", { detail: { cacheHit: true, pinsCarregados: cached.data.length } }));
    }
    return cached.data;
  }
  if (import.meta.env.DEV) {
    console.log(`[MapCache] ❌ MISS key=${cacheKey.slice(0, 60)}…`);
  }

  const rpcParams: Record<string, any> = {
    p_limite: 1000,
  };

  // City filter
  if (filters.cidade) {
    rpcParams.p_cidade = filters.cidade;
  } else {
    rpcParams.p_cidades = CIDADES_PERMITIDAS;
  }

  if (filters.tipo) {
    const tipos = filters.tipo.split(",").map(s => s.trim()).filter(Boolean);
    if (tipos.length === 1) rpcParams.p_tipo = tipos[0];
    // Note: get_map_pins doesn't support p_tipos yet; single tipo only for pins
  }
  if (filters.bairros?.length) {
    rpcParams.p_bairros = filters.bairros;
  } else if (filters.bairro) {
    rpcParams.p_bairro = filters.bairro;
  }
  if (filters.precoMin) rpcParams.p_preco_min = filters.precoMin;
  if (filters.precoMax) rpcParams.p_preco_max = filters.precoMax;
  // RPC accepts only one area pair (area_total). Prioritize private area when set.
  const areaMinPin = filters.areaUtilMin || filters.areaMin;
  const areaMaxPin = filters.areaUtilMax || filters.areaMax;
  if (areaMinPin) rpcParams.p_area_min = areaMinPin;
  if (areaMaxPin) rpcParams.p_area_max = areaMaxPin;
  if (filters.quartos) rpcParams.p_quartos = filters.quartos;
  if (filters.banheiros) rpcParams.p_banheiros = filters.banheiros;
  if (filters.vagas) rpcParams.p_vagas = filters.vagas;

  if (filters.bounds) {
    rpcParams.lat_min = filters.bounds.lat_min;
    rpcParams.lat_max = filters.bounds.lat_max;
    rpcParams.lng_min = filters.bounds.lng_min;
    rpcParams.lng_max = filters.bounds.lng_max;
  }
  if (filters.fase) rpcParams.p_fase = filters.fase;

  let query = supabase.rpc("get_map_pins", rpcParams).returns<any[]>();

  if (signal) {
    query = query.abortSignal(signal);
  }

  const t0 = performance.now();
  const { data, error } = await query;
  const loadMs = Math.round(performance.now() - t0);

  if (error) {
    if (error.message?.includes("aborted")) return [];
    throw error;
  }

  const rows = data || [];
  if (import.meta.env.DEV) {
    const payloadKB = Math.round(JSON.stringify(rows).length / 1024);
    window.dispatchEvent(new CustomEvent("perf:update", {
      detail: { mapaLoadMs: loadMs, mapaPayloadKB: payloadKB, pinsCarregados: rows.length },
    }));
  }

  const mapped = rows.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    preco: row.preco,
    latitude: row.latitude!,
    longitude: row.longitude!,
    bairro: row.bairro,
    titulo: tituloLimpo({
      tipo: row.tipo ?? "imóvel",
      finalidade: "venda",
      quartos: row.quartos ?? null,
      bairro: row.bairro ?? "Porto Alegre",
    }),
    foto: row.foto_principal ?? undefined,
    quartos: row.quartos ?? undefined,
    area_total: row.area_total ?? undefined,
    tipo: row.tipo ?? undefined,
  }));

  // Save to cache (max 15 entries)
  pinsCache.set(cacheKey, { data: mapped, timestamp: Date.now() });
  if (pinsCache.size > 15) {
    const firstKey = pinsCache.keys().next().value;
    if (firstKey) pinsCache.delete(firstKey);
  }

  return mapped;
}

/** Single attempt to fetch an imóvel by slug */
async function fetchImovelBySlugOnce(slug: string, signal?: AbortSignal): Promise<Imovel | null> {
  const fetchRows = async (operator: "eq" | "ilike") => {
    const url = new URL(PUBLIC_REST_URL);
    url.searchParams.set("select", DETAIL_COLUMNS);
    url.searchParams.set("slug", `${operator}.${slug}`);
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: PUBLIC_REST_HEADERS,
      signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar imóvel (${response.status})`);
    }

    return (await response.json()) as any[];
  };

  const exactRows = await fetchRows("eq");
  if (exactRows[0]) return mapRow(exactRows[0]);

  const fallbackRows = await fetchRows("ilike");
  if (!fallbackRows[0]) return null;
  return mapRow(fallbackRows[0]);
}

/**
 * Fetch a single imóvel by slug via public read endpoint, without relying
 * on any authenticated browser session.
 */
export async function fetchImovelBySlug(slug: string): Promise<Imovel | null> {
  const normalizedSlug = decodeURIComponent(slug).trim().replace(/^\/+|\/+$/g, "");
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    return await fetchImovelBySlugOnce(normalizedSlug, controller.signal);
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(`Timeout ao buscar imóvel: ${normalizedSlug}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}


export async function syncFromJetimob(): Promise<{
  inseridos: number;
  atualizados: number;
  erros: number;
  total: number;
}> {
  let totalInseridos = 0;
  let totalErros = 0;
  let totalFetched = 0;
  let startPage = 1;
  const PAGES_PER_CHUNK = 5;

  // Call in chunks to avoid edge function timeout
  for (let chunk = 0; chunk < 50; chunk++) {
    const { data, error } = await supabase.functions.invoke("sync-jetimob", {
      body: { start_page: startPage, max_pages: PAGES_PER_CHUNK },
    });
    if (error) throw error;
    totalInseridos += data.inseridos ?? 0;
    totalErros += data.erros ?? 0;
    totalFetched += data.total ?? 0;

    // If no next page or we've fetched everything
    if (!data.more_pages || (data.total_esperado && totalFetched >= data.total_esperado) || (data.total ?? 0) === 0) {
      break;
    }
    startPage = data.next_start_page;
  }

  return { inseridos: totalInseridos, atualizados: 0, erros: totalErros, total: totalFetched };
}
