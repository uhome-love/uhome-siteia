import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from 'sonner';
import { lerPastas, salvarPastas, removerImovel } from '@/lib/favoritosPastas';
import { lerFavoritos, salvarFavoritos, devePedirAviso } from '@/lib/favoritosLocais';

export function useFavoritos() {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<Set<string>>(() => new Set(lerFavoritos()));
  const [loading, setLoading] = useState(false);

  // Load favorites
  useEffect(() => {
    const atualizar = () => setFavoritos(new Set(lerFavoritos()));
    window.addEventListener('uhome:favoritos', atualizar);
    window.addEventListener('storage', atualizar);
    if (user) {
      setLoading(true);
      const locais = lerFavoritos();
      const migrar = locais.length ? supabase.from('favoritos').upsert(locais.map(imovel_id => ({user_id:user.id,imovel_id})), {onConflict:'user_id,imovel_id'}) : Promise.resolve();
      Promise.resolve(migrar).then(() => supabase
        .from("favoritos")
        .select("imovel_id")
        .eq("user_id", user.id)
        .then(({ data }) => {
          const ids = [...new Set([...locais, ...(data ?? []).map(r => r.imovel_id)])];
          salvarFavoritos(ids);
          setLoading(false);
        }));
    } else {
      setFavoritos(new Set(lerFavoritos()));
    }
    return () => { window.removeEventListener('uhome:favoritos', atualizar); window.removeEventListener('storage', atualizar); };
  }, [user]);

  const toggleFavorito = useCallback(
    async (imovelId: string): Promise<"needs_auth" | void> => {
      const isFav = favoritos.has(imovelId);

      if (user && isFav) {
        await supabase
          .from("favoritos")
          .delete()
          .eq("user_id", user.id)
          .eq("imovel_id", imovelId);
      } else if (user) {
        const { error } = await supabase.from("favoritos").insert({ user_id: user.id, imovel_id: imovelId });
        if (error) throw error;
        void trackEvent({ tipo: "favorito_salvo", dados: { imovel_id: imovelId } });
      }

      const next = new Set(lerFavoritos());
        if (isFav) next.delete(imovelId);
        else next.add(imovelId);
      salvarFavoritos([...next]);
      if (isFav) salvarPastas(removerImovel(lerPastas(), imovelId));
      else toast('Salvo nos favoritos', { action: { label: 'Escolher pasta', onClick: () => { window.location.href = `/favoritos?escolher=${encodeURIComponent(imovelId)}`; } } });
      if (!isFav && !user) void trackEvent({tipo:'favorito_salvo',dados:{imovel_id:imovelId}});
      if (devePedirAviso(favoritos.size,next.size,localStorage.getItem('uh-aviso-preco-pedido')==='1')) window.dispatchEvent(new Event('uhome:aviso-preco'));
    },
    [user, favoritos]
  );

  const isFavorito = useCallback(
    (imovelId: string) => favoritos.has(imovelId),
    [favoritos]
  );

  return { favoritos, toggleFavorito, isFavorito, loading, count: favoritos.size };
}
