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
  const tipo = capitalize(imovel.tipo);
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
  areaMin?: number;
  areaMax?: number;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  diferenciais?: string[];
  destaque?: boolean;
  ordem?: "recentes" | "preco_asc" | "preco_desc" | "area_desc";
  q?: string;
  codigo?: string;
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
const LISTING_COLUMNS = "id,slug,tipo,finalidade,status,destaque,preco,preco_condominio,area_total,quartos,banheiros,vagas,bairro,cidade,uf,publicado_em,foto_principal";

export async function fetchImoveis(filters: BuscaFilters = {}): Promise<{ data: Imovel[]; count: number }> {
  // Build data query — NO count (much faster)
  let query = supabase
    .from("imoveis")
    .select(LISTING_COLUMNS)
    .eq("status", "disponivel")
    .eq("finalidade", "venda");

  // City filter: specific city or all allowed
  if (filters.cidade) {
    query = query.eq("cidade", filters.cidade);
  } else {
    query = query.in("cidade", CIDADES_PERMITIDAS);
  }

  if (filters.tipo) {
    const tipos = filters.tipo.split(",").map(s => s.trim()).filter(Boolean);
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
  if (filters.quartos) query = query.gte("quartos", filters.quartos);
  if (filters.banheiros) query = query.gte("banheiros", filters.banheiros);
  if (filters.vagas) query = query.gte("vagas", filters.vagas);
  if (filters.destaque) query = query.eq("destaque", true);
  if (filters.diferenciais?.length) query = query.contains("diferenciais", filters.diferenciais);
  if (filters.q) query = query.or(`titulo.ilike.%${filters.q}%,bairro.ilike.%${filters.q}%,tipo.ilike.%${filters.q}%`);
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

  // Build count RPC params (parallel, separate from data query)
  const bairroStr = filters.bairro || undefined;
  const bairrosArr = filters.bairros?.length ? filters.bairros : undefined;
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
  if (filters.areaMin) countParams.p_area_min = filters.areaMin;
  if (filters.areaMax) countParams.p_area_max = filters.areaMax;

  if (filters.bounds) {
    countParams.lat_min = filters.bounds.lat_min;
    countParams.lat_max = filters.bounds.lat_max;
    countParams.lng_min = filters.bounds.lng_min;
    countParams.lng_max = filters.bounds.lng_max;
  }

  const t0 = performance.now();
  // Skip count on paginated "load more" requests — caller already has total
  const skipCount = (filters.offset ?? 0) > 0;
  const [dataResult, countResult] = await Promise.all([
    query,
    skipCount ? Promise.resolve({ data: -1 }) : supabase.rpc("count_imoveis", countParams),
  ]);
  const loadMs = Math.round(performance.now() - t0);

  if (dataResult.error) throw dataResult.error;

  const rows = dataResult.data || [];
  const totalCount = (countResult.data as number) ?? 0;

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
  if (filters.areaMin) rpcParams.p_area_min = filters.areaMin;
  if (filters.areaMax) rpcParams.p_area_max = filters.areaMax;
  if (filters.quartos) rpcParams.p_quartos = filters.quartos;
  if (filters.banheiros) rpcParams.p_banheiros = filters.banheiros;
  if (filters.vagas) rpcParams.p_vagas = filters.vagas;

  if (filters.bounds) {
    rpcParams.lat_min = filters.bounds.lat_min;
    rpcParams.lat_max = filters.bounds.lat_max;
    rpcParams.lng_min = filters.bounds.lng_min;
    rpcParams.lng_max = filters.bounds.lng_max;
  }

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

export async function fetchImovelBySlug(slug: string): Promise<Imovel | null> {
  const { data, error } = await supabase
    .from("imoveis")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRow(data);
}

export async function fetchImoveisDestaque(limit = 6): Promise<Imovel[]> {
  const { data, error } = await supabase
    .from("imoveis")
    .select(LISTING_COLUMNS)
    .eq("destaque", true)
    .eq("status", "disponivel")
    .in("cidade", CIDADES_PERMITIDAS)
    .order("publicado_em", { ascending: false })
    .limit(limit);

  if (error) throw error;
  const result = (data || []).map(mapRow);

  // If no featured, return latest
  if (result.length === 0) {
    const { data: fallback } = await supabase
      .from("imoveis")
      .select(LISTING_COLUMNS)
      .eq("status", "disponivel")
      .in("cidade", CIDADES_PERMITIDAS)
      .order("publicado_em", { ascending: false })
      .limit(limit);
    return (fallback || []).map(mapRow);
  }

  return result;
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
