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
  video_url: string | null;
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
  const label = imovel.finalidade === "locacao" ? "para Alugar" : "para Venda";
  return `${tipo} ${label} — ${imovel.bairro}`;
}

function mapRow(row: any): Imovel {
  const mapped = {
    ...row,
    fotos: parseFotos(row.fotos),
    diferenciais: row.diferenciais || [],
    destaque: row.destaque ?? false,
    cidade: row.cidade ?? "Porto Alegre",
    uf: row.uf ?? "RS",
  };
  // Always override with clean title
  mapped.titulo = tituloLimpo(mapped);
  return mapped;
}

/** Get primary photo URL or a placeholder */
export function fotoPrincipal(imovel: Imovel): string {
  const fotos = imovel.fotos;
  if (fotos.length === 0) return "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop";
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
  limit?: number;
  offset?: number;
  bounds?: {
    lat_min: number;
    lat_max: number;
    lng_min: number;
    lng_max: number;
  } | null;
}

const CIDADES_PERMITIDAS = ["Porto Alegre", "Canoas", "Cachoeirinha", "Gravataí", "Guaíba"];

export async function fetchImoveis(filters: BuscaFilters = {}): Promise<{ data: Imovel[]; count: number }> {
  let query = supabase
    .from("imoveis")
    .select("*", { count: "exact" })
    .in("cidade", CIDADES_PERMITIDAS);

  if (filters.finalidade) query = query.eq("finalidade", filters.finalidade);
  if (filters.tipo) query = query.eq("tipo", filters.tipo);
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

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapRow),
    count: count || 0,
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
}

/** Fetch lightweight pin data for the map — all matching properties, no limit */
export async function fetchMapPins(filters: BuscaFilters = {}): Promise<MapPin[]> {
  let query = supabase
    .from("imoveis")
    .select("id,slug,preco,latitude,longitude,bairro,titulo,tipo,quartos,finalidade")
    .in("cidade", CIDADES_PERMITIDAS);

  if (filters.finalidade) query = query.eq("finalidade", filters.finalidade);
  if (filters.tipo) query = query.eq("tipo", filters.tipo);
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
  if (filters.diferenciais?.length) query = query.contains("diferenciais", filters.diferenciais);
  if (filters.q) query = query.or(`titulo.ilike.%${filters.q}%,bairro.ilike.%${filters.q}%,tipo.ilike.%${filters.q}%`);

  // Only properties with coordinates
  query = query.not("latitude", "is", null).not("longitude", "is", null);

  // Supabase default limit is 1000, we need all — fetch in pages
  const allPins: MapPin[] = [];
  let offset = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await query.range(offset, offset + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      allPins.push({
        id: row.id,
        slug: row.slug,
        preco: row.preco,
        latitude: row.latitude!,
        longitude: row.longitude!,
        bairro: row.bairro,
        titulo: tituloLimpo(row),
      });
    }

    if (data.length < PAGE) break;
    offset += PAGE;
  }

  return allPins;
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
    .select("*")
    .eq("destaque", true)
    .order("publicado_em", { ascending: false })
    .limit(limit);

  if (error) throw error;
  const result = (data || []).map(mapRow);

  // If no featured, return latest
  if (result.length === 0) {
    const { data: fallback } = await supabase
      .from("imoveis")
      .select("*")
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
  const PAGES_PER_CHUNK = 15;

  // Call in chunks to avoid edge function timeout
  for (let chunk = 0; chunk < 10; chunk++) {
    const { data, error } = await supabase.functions.invoke("sync-jetimob", {
      body: { start_page: startPage, max_pages: PAGES_PER_CHUNK },
    });
    if (error) throw error;
    totalInseridos += data.inseridos ?? 0;
    totalErros += data.erros ?? 0;
    totalFetched += data.total ?? 0;

    // If no next page or we've fetched everything
    if (!data.next_start_page || (data.total_esperado && totalFetched >= data.total_esperado) || (data.total ?? 0) === 0) {
      break;
    }
    startPage = data.next_start_page;
  }

  return { inseridos: totalInseridos, atualizados: 0, erros: totalErros, total: totalFetched };
}
