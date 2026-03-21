import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { bairrosData } from "@/data/bairros";

const bairrosConfig = bairrosData.slice(0, 6);

export function FeaturedNeighborhoods() {
  const [contagens, setContagens] = useState<number[]>(bairrosConfig.map(() => 0));

  useEffect(() => {
    async function buscarContagens() {
      // Single efficient query instead of 6 separate count queries
      const { data } = await supabase.rpc("get_bairros_disponiveis");
      if (data) {
        const map = new Map(data.map((d: { bairro: string; count: number }) => [d.bairro, d.count]));
        setContagens(bairrosConfig.map((b) => {
          // Try exact match first, then partial match
          const exact = map.get(b.nome);
          if (exact !== undefined) return Number(exact);
          // Partial match for names that might differ slightly
          for (const [key, val] of map) {
            if (key.toLowerCase().includes(b.nome.toLowerCase()) || b.nome.toLowerCase().includes(key.toLowerCase())) {
              return Number(val);
            }
          }
          return 0;
        }));
      }
    }
    buscarContagens();
  }, []);

  return (
    <section className="pt-16 pb-10">
      <div className="container-uhome">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-sm font-medium uppercase tracking-[0.15em] text-primary">
            Explore
          </p>
          <h2 className="mt-2 text-h2 text-foreground text-balance">
            Bairros em destaque
          </h2>
          <p className="mt-3 max-w-md font-body text-muted-foreground">
            Os melhores endereços de Porto Alegre, selecionados pela equipe Uhome.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {bairrosConfig.map((b, i) => (
            <motion.div
              key={b.nome}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={`/bairros/${b.slug}`}
                className="group relative block overflow-hidden rounded-2xl hover-lift"
              >
                <div className="aspect-[3/4] w-full">
                  <img
                    src={b.foto}
                    alt={`Imóveis à venda em ${b.nome}, Porto Alegre`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-body text-sm font-semibold text-white">{b.nome}</p>
                  <p className="mt-0.5 flex items-center gap-1 font-body text-xs text-white/70">
                    <MapPin className="h-3 w-3" />
                    {contagens[i]} imóveis
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
