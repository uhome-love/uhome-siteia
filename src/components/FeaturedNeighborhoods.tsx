import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const bairrosConfig = [
  {
    nome: "Moinhos de Vento",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Moinhos_de_Vento_park%2C_18_Nov_2016.jpg/800px-Moinhos_de_Vento_park%2C_18_Nov_2016.jpg",
  },
  {
    nome: "Bela Vista",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Porto_Alegre04.jpg/800px-Porto_Alegre04.jpg",
  },
  {
    nome: "Petrópolis",
    foto: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Petr%C3%B3polis_Porto_Alegre.JPG",
  },
  {
    nome: "Mont'Serrat",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/0000_Igreja_de_Nossa_Senhora_do_Mont%27Serrat_em_Porto_Alegre%2C_Rio_Grande_do_Sul%2C_Brasil.JPG/800px-0000_Igreja_de_Nossa_Senhora_do_Mont%27Serrat_em_Porto_Alegre%2C_Rio_Grande_do_Sul%2C_Brasil.JPG",
  },
  {
    nome: "Três Figueiras",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Avenida_Luiz_Manoel_Gonzaga.JPG/800px-Avenida_Luiz_Manoel_Gonzaga.JPG",
  },
  {
    nome: "Boa Vista",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Rua_Anita_Garibaldi_2_Porto_Alegre.JPG/800px-Rua_Anita_Garibaldi_2_Porto_Alegre.JPG",
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
