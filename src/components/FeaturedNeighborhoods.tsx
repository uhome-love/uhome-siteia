import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    <section className="section-y">
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
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <img src="/categorias/canoas.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" width={56} height={56} className="h-14 w-14 shrink-0 object-contain transition-transform duration-300 group-hover:scale-110" />
                <div className="min-w-0">
                  <p className="font-body text-base font-bold text-foreground">{b.nome}</p>
                  <p className="mt-0.5 font-body text-sm text-muted-foreground">
                    {contagens[i]} imóveis
                    {aPartir[b.nome] > 0 && <span className="ml-1">· a partir de <strong className="font-semibold text-foreground">{fmt(aPartir[b.nome])}</strong></span>}
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
