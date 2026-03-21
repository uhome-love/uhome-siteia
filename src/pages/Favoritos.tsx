import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { useAuth } from "@/hooks/useAuth";
import { useFavoritos } from "@/hooks/useFavoritos";
import { supabase } from "@/integrations/supabase/client";
import { type Imovel } from "@/services/imoveis";
import { Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function parseFotos(fotos: any) {
  if (!fotos) return [];
  if (typeof fotos === "string") { try { return JSON.parse(fotos); } catch { return []; } }
  if (Array.isArray(fotos)) return fotos;
  return [];
}

const Favoritos = () => {
  const { user } = useAuth();
  const { favoritos, loading: favsLoading } = useFavoritos();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favsLoading) return;
    const ids = Array.from(favoritos);
    if (ids.length === 0) {
      setImoveis([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("imoveis")
      .select("*")
      .in("id", ids)
      .then(({ data }) => {
        setImoveis(
          (data ?? []).map((r: any) => ({
            ...r,
            fotos: parseFotos(r.fotos),
            diferenciais: r.diferenciais || [],
            destaque: r.destaque ?? false,
            cidade: r.cidade ?? "Porto Alegre",
            uf: r.uf ?? "RS",
          }))
        );
        setLoading(false);
      });
  }, [favoritos, favsLoading]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        <h1 className="font-body text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-foreground">
          Meus favoritos
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {user ? `${favoritos.size} imóveis salvos` : "Faça login para sincronizar seus favoritos"}
        </p>

        {loading || favsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : imoveis.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Heart className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 font-body text-base font-semibold text-foreground">
              Nenhum favorito ainda
            </p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              Clique no ♥ nos imóveis para salvar aqui.
            </p>
            <Link
              to="/busca?finalidade=venda"
              className="mt-6 rounded-full bg-primary px-6 py-2.5 font-body text-sm font-semibold text-primary-foreground"
            >
              Explorar imóveis
            </Link>
          </motion.div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {imoveis.map((imovel, i) => (
              <SearchPropertyCard key={imovel.id} imovel={imovel} index={i} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favoritos;
