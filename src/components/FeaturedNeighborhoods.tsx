import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getBairrosDisponiveis } from "@/services/bairrosCache";
import { bairrosData } from "@/data/bairros";
import { useCorretor } from "@/contexts/CorretorContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const bairrosConfig = bairrosData.slice(0, 6);

export default function FeaturedNeighborhoods() {
  const [contagens, setContagens] = useState<number[]>(bairrosConfig.map(() => 0));
  const { prefixLink } = useCorretor();
  // Menor preço disponível por bairro ("a partir de"), com cache de 10 min.
  const { data: aPartir = {} } = useQuery({
    queryKey: ["bairros-a-partir", bairrosConfig.map((b) => b.nome)],
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const res = await Promise.all(bairrosConfig.map((b) =>
        supabase.from("imoveis").select("preco").eq("status", "disponivel").ilike("bairro", b.nome).gt("preco", 50000).order("preco").limit(1)
      ));
      return Object.fromEntries(bairrosConfig.map((b, i) => [b.nome, Number(res[i].data?.[0]?.preco ?? 0)]));
    },
  });
  const fmt = (v: number) => v >= 1_000_000 ? `R$ ${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi` : `R$ ${Math.round(v / 1000)} mil`;

  useEffect(() => {
    async function buscarContagens() {
      const data = await getBairrosDisponiveis();
      if (data.length > 0) {
        const bairroMap = new Map(data.map((d) => [d.bairro, d.count]));
        setContagens(bairrosConfig.map((b) => {
          const exact = bairroMap.get(b.nome);
          if (exact !== undefined) return Number(exact);
          for (const [key, val] of bairroMap) {
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
    <section className="pt-16 pb-8 sm:pt-20 sm:pb-10">
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

        <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {bairrosConfig.map((b, i) => (
            <motion.div
              key={b.nome}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="w-[80vw] max-w-[340px] flex-shrink-0 snap-start sm:w-auto sm:max-w-none"
            >
              <Link
                to={prefixLink(`/bairros/${b.slug}`)}
                className="group relative block overflow-hidden rounded-2xl hover-lift"
              >
                <div className="aspect-video w-full">
                  <img
                    src={b.foto}
                    alt={`Imóveis à venda em ${b.nome}, Porto Alegre`}
                    loading="lazy"
                    decoding="async"
                    width={600}
                    height={338}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-body text-base font-semibold text-white">{b.nome}</p>
                  <p className="mt-0.5 flex items-center gap-1 font-body text-sm text-white/70">
                    <MapPin className="h-3.5 w-3.5" />
                    {contagens[i]} imóveis
                    {aPartir[b.nome] > 0 && <span className="ml-1">· a partir de <strong className="font-semibold text-white">{fmt(aPartir[b.nome])}</strong></span>}
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
