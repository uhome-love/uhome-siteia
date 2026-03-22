import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { syncToCRM } from "@/services/syncCRM";

export function useFavoritos() {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load favorites
  useEffect(() => {
    if (user) {
      setLoading(true);
      supabase
        .from("favoritos")
        .select("imovel_id")
        .eq("user_id", user.id)
        .then(({ data }) => {
          setFavoritos(new Set((data ?? []).map((r) => r.imovel_id)));
          setLoading(false);
        });
    } else {
      setFavoritos(new Set());
    }
  }, [user]);

  const toggleFavorito = useCallback(
    async (imovelId: string): Promise<"needs_auth" | void> => {
      if (!user) {
        return "needs_auth";
      }

      const isFav = favoritos.has(imovelId);

      if (isFav) {
        await supabase
          .from("favoritos")
          .delete()
          .eq("user_id", user.id)
          .eq("imovel_id", imovelId);
      } else {
        await supabase
          .from("favoritos")
          .insert({ user_id: user.id, imovel_id: imovelId });
        syncToCRM("favorito", { user_id: user.id, imovel_id: imovelId, created_at: new Date().toISOString() });
      }

      setFavoritos((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(imovelId);
        else next.add(imovelId);
        return next;
      });
    },
    [user, favoritos]
  );

  const isFavorito = useCallback(
    (imovelId: string) => favoritos.has(imovelId),
    [favoritos]
  );

  return { favoritos, toggleFavorito, isFavorito, loading, count: favoritos.size };
}
