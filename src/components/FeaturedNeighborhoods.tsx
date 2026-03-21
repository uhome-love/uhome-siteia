import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const bairrosConfig = [
  {
    nome: "Moinhos de Vento",
    foto: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
  },
  {
    nome: "Bela Vista",
    foto: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
  },
  {
    nome: "Petrópolis",
    foto: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80",
  },
  {
    nome: "Mont'Serrat",
    foto: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
  },
  {
    nome: "Três Figueiras",
    foto: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80",
  },
  {
    nome: "Boa Vista",
    foto: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
  },
];

export function FeaturedNeighborhoods() {
  const navigate = useNavigate();
  const [contagens, setContagens] = useState<number[]>(bairrosConfig.map(() => 0));

  useEffect(() => {
    async function buscarContagens() {
      const promises = bairrosConfig.map((b) =>
        supabase
          .from("imoveis")
          .select("*", { count: "exact", head: true })
          .eq("status", "disponivel")
          .ilike("bairro", `%${b.nome}%`)
      );
      const results = await Promise.all(promises);
      setContagens(results.map((r) => r.count ?? 0));
    }
    buscarContagens();
  }, []);

  return (
    <section className="py-24">
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
            <motion.button
              key={b.nome}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl hover-lift"
              onClick={() => navigate(`/busca?bairros=${encodeURIComponent(b.nome)}`)}
            >
              <div className="aspect-[3/4] w-full">
                <img
                  src={b.foto}
                  alt={b.nome}
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
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
