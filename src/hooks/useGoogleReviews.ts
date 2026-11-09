import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GoogleReview { nome: string; foto: string | null; estrelas: number; texto: string; data: string }
export interface GoogleReviews { nota: number; total: number; avaliacoes: GoogleReview[]; maps_url: string | null; review_url: string | null }

/** Avaliações reais do Perfil da Uhome no Google (cache atualizado 1x por dia). */
export function useGoogleReviews() {
  return useQuery({
    queryKey: ["google-reviews"],
    staleTime: 60 * 60_000,
    queryFn: async (): Promise<GoogleReviews | null> => {
      const { data } = await supabase.from("google_reviews_cache").select("nota, total, avaliacoes, maps_url, review_url").eq("id", "uhome").maybeSingle();
      if (!data || !data.nota) return null;
      return { ...data, nota: Number(data.nota), total: data.total ?? 0, avaliacoes: (data.avaliacoes ?? []) as unknown as GoogleReview[] };
    },
  });
}
