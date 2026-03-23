import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchImoveis, type BuscaFilters, type Imovel } from "@/services/imoveis";

interface UseImoveisQueryOptions {
  filters: BuscaFilters;
  enabled?: boolean;
}

interface ImoveisResult {
  data: Imovel[];
  count: number;
}

/**
 * React Query wrapper for fetchImoveis.
 * Uses a stable cache key based on filters so identical queries
 * are served from cache within the staleTime window (5 min default).
 */
export function useImoveisQuery({ filters, enabled = true }: UseImoveisQueryOptions) {
  const queryClient = useQueryClient();

  const query = useQuery<ImoveisResult>({
    queryKey: ["imoveis", "list", filters],
    queryFn: () => fetchImoveis(filters),
    enabled,
    staleTime: 3 * 60 * 1000, // 3 min — listing-specific (overrides global 5 min)
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData, // keep previous data while refetching
  });

  /** Fetch the next page and merge into cache */
  const fetchNextPage = async (currentPage: number, pageSize: number) => {
    const offset = (currentPage + 1) * pageSize;
    const result = await fetchImoveis({ ...filters, offset });
    
    // Merge new data into the cached result
    queryClient.setQueryData<ImoveisResult>(
      ["imoveis", "list", filters],
      (old) => {
        if (!old) return result;
        return {
          data: [...old.data, ...result.data],
          count: old.count,
        };
      }
    );
    
    return result.data.length;
  };

  /** Prefetch a set of filters (e.g., on hover or navigation intent) */
  const prefetch = (prefetchFilters: BuscaFilters) => {
    queryClient.prefetchQuery({
      queryKey: ["imoveis", "list", prefetchFilters],
      queryFn: () => fetchImoveis(prefetchFilters),
      staleTime: 3 * 60 * 1000,
    });
  };

  return {
    imoveis: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    fetchNextPage,
    prefetch,
  };
}
