import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { fetchImoveisDestaque, type Imovel } from "@/services/imoveis";
import { useFavoritos } from "@/hooks/useFavoritos";

export function FeaturedProperties() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const { isFavorito, toggleFavorito } = useFavoritos();

  useEffect(() => {
    fetchImoveisDestaque(6).then(setImoveis).catch(console.error);
  }, []);

  if (imoveis.length === 0) return null;

  return (
    <section className="pt-8 pb-16 sm:pt-10 sm:pb-20">
      <div className="container-uhome">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between"
        >
          <div>
            <p className="font-body text-sm font-medium uppercase tracking-[0.15em] text-primary">
              Seleção
            </p>
            <h2 className="mt-2 text-h2 text-foreground text-balance">
              Imóveis em destaque
            </h2>
          </div>
          <Link to="/busca" className="hidden font-body text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:block">
            Ver todos →
          </Link>
        </motion.div>

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
      </div>
    </section>
  );
}
