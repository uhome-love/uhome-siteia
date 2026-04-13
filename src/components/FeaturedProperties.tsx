import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Gem, ArrowRight } from "lucide-react";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { fetchImoveisDestaque, type Imovel } from "@/services/imoveis";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useCorretor } from "@/contexts/CorretorContext";
import { useQuery } from "@tanstack/react-query";

export function FeaturedProperties() {
  const { data: imoveis = [] } = useQuery<Imovel[]>({
    queryKey: ["imoveis", "destaque"],
    queryFn: () => fetchImoveisDestaque(6),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
  const { isFavorito, toggleFavorito } = useFavoritos();
  const { prefixLink } = useCorretor();

  if (imoveis.length === 0) return null;

  return (
    <section className="relative pt-8 pb-16 sm:pt-10 sm:pb-20 overflow-hidden">
      {/* Subtle premium background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

      <div className="container-uhome relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Gem className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="font-body text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                Uhome Collection
              </p>
            </div>
            <h2 className="mt-3 text-h2 text-foreground text-balance">
              Uhome Collection
            </h2>
            <p className="mt-1.5 font-body text-sm text-muted-foreground max-w-md">
              Curadoria premium dos melhores imóveis à venda em Porto Alegre
            </p>
          </div>

          <Link
            to={prefixLink("/collection")}
            className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 font-body text-sm font-medium text-primary transition-all hover:bg-primary/10 hover:border-primary/30 sm:inline-flex"
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        {/* Cards grid */}
        <div className="mt-10 flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
          {imoveis.map((imovel, i) => (
            <div key={imovel.id} className="w-[300px] flex-shrink-0 sm:w-auto">
              <SearchPropertyCard
                imovel={imovel}
                index={i}
                isFavorito={isFavorito}
                toggleFavorito={toggleFavorito}
              />
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            to={prefixLink("/collection")}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 font-body text-sm font-medium text-primary transition-all hover:bg-primary/10"
          >
            Ver toda a Collection
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
