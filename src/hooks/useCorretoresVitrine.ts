import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CorretorVitrine { id: string; nome: string; foto_url: string; telefone: string | null; creci: string | null; slug_ref: string }

/** Corretores ativos com foto, para a vitrine "Conheça nossos corretores". */
export function useCorretoresVitrine() {
  return useQuery({
    queryKey: ["corretores-vitrine"],
    staleTime: 30 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, foto_url, telefone, creci, slug_ref")
        .eq("ativo", true)
        .not("slug_ref", "is", null)
        .like("foto_url", "/__l5e/%") // só quem recebeu foto oficial = corretor em atividade
        .order("nome");
      if (error) throw error;
      return (data ?? []).filter((c) => c.nome && c.foto_url) as CorretorVitrine[];
    },
  });
}
