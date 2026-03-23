import { QueryClient } from "@tanstack/react-query";
import { fetchImoveis, type BuscaFilters } from "@/services/imoveis";

/**
 * Prefetch default /busca listing data into React Query cache.
 * Call on hover/mousedown of navigation links to /busca
 * so the page renders instantly from cache.
 */
export function prefetchBusca(queryClient: QueryClient, params?: URLSearchParams) {
  const filters: BuscaFilters = {
    finalidade: "venda",
    cidade: params?.get("cidade") || "Porto Alegre",
    tipo: params?.get("tipo") || undefined,
    quartos: params?.get("quartos") ? Number(params.get("quartos")) : undefined,
    precoMax: params?.get("preco_max") ? Number(params.get("preco_max")) : undefined,
    precoMin: params?.get("preco_min") ? Number(params.get("preco_min")) : undefined,
    areaMin: params?.get("area_min") ? Number(params.get("area_min")) : undefined,
    q: params?.get("q") || undefined,
    bairro: params?.get("bairro") || undefined,
    ordem: "recentes",
    limit: 40,
    offset: 0,
  };

  queryClient.prefetchQuery({
    queryKey: ["imoveis", "list", filters],
    queryFn: () => fetchImoveis(filters),
    staleTime: 3 * 60 * 1000,
  });
}
