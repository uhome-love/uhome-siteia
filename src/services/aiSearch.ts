import { supabase } from "@/integrations/supabase/client";

export interface AISearchFilters {
  finalidade?: "venda";
  tipo?: string;
  bairros?: string[];
  preco_max?: number;
  preco_min?: number;
  quartos?: number;
  area_min?: number;
  area_util_min?: number;
  diferenciais?: string[];
}

export interface AISearchResult {
  filtros: AISearchFilters;
  resumo: string;
  confianca: "alta" | "media" | "baixa";
}

export async function interpretarBusca(query: string): Promise<AISearchResult> {
  const { data, error } = await supabase.functions.invoke("ai-search", {
    body: { query },
  });

  if (error) {
    throw new Error(error.message || "Erro ao interpretar busca");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const f = data.filtros;
  return {
    filtros: {
      finalidade: f.finalidade,
      tipo: f.tipo,
      bairros: f.bairros,
      preco_max: f.preco_max,
      preco_min: f.preco_min,
      quartos: f.quartos,
      area_min: f.area_min,
      area_util_min: f.area_util_min,
      diferenciais: f.diferenciais,
    },
    resumo: f.resumo || "Busca interpretada",
    confianca: f.confianca || "media",
  };
}
