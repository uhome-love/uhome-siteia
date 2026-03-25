import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BairroDescricao {
  bairro_nome: string;
  bairro_slug: string;
  descricao_curta: string | null;
  descricao_seo: string;
  por_que_investir: string | null;
  infraestrutura: string | null;
}

export function useBairroDescricao(bairroNome?: string) {
  return useQuery({
    queryKey: ["bairro-descricao", bairroNome],
    queryFn: async () => {
      if (!bairroNome) return null;
      const { data, error } = await supabase
        .from("bairro_descricoes" as any)
        .select("bairro_nome, bairro_slug, descricao_curta, descricao_seo, por_que_investir, infraestrutura")
        .eq("bairro_nome", bairroNome)
        .maybeSingle();
      if (error) throw error;
      return data as BairroDescricao | null;
    },
    enabled: !!bairroNome,
    staleTime: 30 * 60 * 1000, // 30 min cache
  });
}
