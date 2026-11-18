import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseLazy";
import { dadosDobra } from "@/lib/dobra";
import { totalHome } from '../../supabase/functions/_shared/buscaConfig';

/** Contagem única de imóveis disponíveis, compartilhada por toda a página (mesmo número em todo lugar). */
export function useTotalImoveis() {
  const { data } = useQuery({
    queryKey: ["imoveis", "total-count"],
    queryFn: async () => {
      const { data } = await supabase.rpc('busca_site', {p:{limit:0}});
      const count = (data as any)?.count;
      return count && count > 0 ? count : null;
    },
    initialData: () => dadosDobra("total") || undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  return data ?? null;
}

/** "21.400+" arredondado para baixo na centena; texto neutro enquanto carrega. */
export function formatTotal(n: number | null) {
  return totalHome(n);
}
