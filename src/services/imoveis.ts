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

function mapRow(row: any): Imovel {
  return {
    ...row,
    fotos: parseFotos(row.fotos),
    diferenciais: row.diferenciais || [],
  };
}

export async function fetchImoveis(filters?: {
  finalidade?: string;
  tipo?: string;
  bairro?: string;
  precoMin?: number;
  precoMax?: number;
  quartos?: number;
  destaque?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ data: Imovel[]; count: number }> {
  let query = supabase
    .from("imoveis")
    .select("*", { count: "exact" });

  if (filters?.finalidade) query = query.eq("finalidade", filters.finalidade);
  if (filters?.tipo) query = query.eq("tipo", filters.tipo);
  if (filters?.bairro) query = query.ilike("bairro", `%${filters.bairro}%`);
  if (filters?.precoMin) query = query.gte("preco", filters.precoMin);
  if (filters?.precoMax) query = query.lte("preco", filters.precoMax);
  if (filters?.quartos) query = query.gte("quartos", filters.quartos);
  if (filters?.destaque) query = query.eq("destaque", true);

  query = query.order("publicado_em", { ascending: false });

  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters?.limit || 20) - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []).map(mapRow),
    count: count || 0,
  };
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
  return (data || []).map(mapRow);
}

export async function syncFromJetimob(): Promise<{
  inseridos: number;
  atualizados: number;
  erros: number;
  total: number;
}> {
  const { data, error } = await supabase.functions.invoke("sync-jetimob");
  if (error) throw error;
  return data;
}
