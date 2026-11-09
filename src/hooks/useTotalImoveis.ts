import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Contagem única de imóveis disponíveis, compartilhada por toda a página (mesmo número em todo lugar). */
export function useTotalImoveis() {
  const { data } = useQuery({
    queryKey: ["imoveis", "total-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("imoveis")
        .select("*", { count: "exact", head: true })
        .eq("status", "disponivel");
      return count && count > 0 ? count : null;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  return data ?? null;
}

/** "21.400+" arredondado para baixo na centena; texto neutro enquanto carrega. */
export function formatTotal(n: number | null) {
  if (!n) return "milhares de";
  return `${(Math.floor(n / 100) * 100).toLocaleString("pt-BR")}+`;
}
