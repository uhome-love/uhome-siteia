import { useEffect, useState } from "react";
import { useCorretor } from "@/contexts/CorretorContext";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { bairrosData } from "@/data/bairros";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useCanonical } from "@/hooks/useCanonical";

function setMeta(attr: string, key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const Bairros = () => {
  useCanonical();
  const [contagens, setContagens] = useState<Record<string, number>>({});
  const { prefixLink } = useCorretor();

  useEffect(() => {
    document.title = "Bairros de Porto Alegre — Imóveis à Venda | Uhome";
    setMeta("name", "description", "Explore os melhores bairros de Porto Alegre para comprar imóvel. Veja apartamentos, casas e coberturas à venda em Moinhos de Vento, Petrópolis, Bela Vista e mais.");
    setMeta("property", "og:title", "Bairros de Porto Alegre | Uhome Imóveis");
    setMeta("property", "og:url", "https://uhome.com.br/bairros");
    return () => { document.title = "Uhome Imóveis | Porto Alegre"; };
  }, []);

  useEffect(() => {
    async function load() {
      // Single efficient query instead of 15 separate count queries
      const { data } = await supabase.rpc("get_bairros_disponiveis");
      if (data) {
        const dbMap = new Map(data.map((d: { bairro: string; count: number }) => [d.bairro, Number(d.count)]));
        const map: Record<string, number> = {};
        bairrosData.forEach((b) => {
          const exact = dbMap.get(b.nome);
          if (exact !== undefined) { map[b.slug] = exact; return; }
          for (const [key, val] of dbMap) {
            if (key.toLowerCase().includes(b.nome.toLowerCase())) { map[b.slug] = (map[b.slug] ?? 0) + val; }
          }
          if (!(b.slug in map)) map[b.slug] = 0;
        });
        setContagens(map);
      }
    }
    load();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <section className="pb-16 pt-28 sm:pt-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-h1 text-foreground text-balance">
              Bairros de Porto Alegre
            </h1>
            <p className="mt-3 max-w-lg font-body text-muted-foreground">
              Explore os melhores endereços da capital gaúcha. Cada bairro com imóveis
              selecionados e curadoria especializada pela Uhome.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bairrosData.map((b, i) => (
              <motion.div
                key={b.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <Link
                  to={prefixLink(`/bairros/${b.slug}`)}
                  className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={b.foto}
                      alt={`${b.nome}, Porto Alegre`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h2 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {b.nome}
                    </h2>
                    <p className="mt-1 flex items-center gap-1 font-body text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {contagens[b.slug] ?? "—"} imóveis à venda
                    </p>
                    <p className="mt-2 line-clamp-2 font-body text-sm text-muted-foreground">
                      {b.descricao}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Bairros;
