import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { fetchImoveis, formatPreco, type Imovel } from "@/services/imoveis";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";
import { useCanonical } from "@/hooks/useCanonical";
import { LeadFormInline } from "@/components/LeadFormInline";

const TIPO_CONFIG: Record<string, { tipo: string; label: string; plural: string; desc: string }> = {
  "apartamentos-porto-alegre": {
    tipo: "apartamento",
    label: "Apartamentos",
    plural: "apartamentos",
    desc: "Encontre apartamentos à venda em Porto Alegre com a Uhome. Opções em todos os bairros, do studio ao 4 dormitórios.",
  },
  "casas-porto-alegre": {
    tipo: "casa",
    label: "Casas",
    plural: "casas",
    desc: "Casas à venda em Porto Alegre. Encontre casas em condomínio, térreas e sobrados nos melhores bairros.",
  },
  "coberturas-porto-alegre": {
    tipo: "cobertura",
    label: "Coberturas",
    plural: "coberturas",
    desc: "Coberturas à venda em Porto Alegre. Duplex, triplex e coberturas com terraço nos bairros mais valorizados.",
  },
  "studios-porto-alegre": {
    tipo: "studio",
    label: "Studios e Kitnets",
    plural: "studios",
    desc: "Studios e kitnets à venda em Porto Alegre. Compactos, modernos e bem localizados para investimento ou moradia.",
  },
  "comerciais-porto-alegre": {
    tipo: "comercial",
    label: "Imóveis Comerciais",
    plural: "imóveis comerciais",
    desc: "Imóveis comerciais à venda em Porto Alegre. Salas, lojas e conjuntos em regiões estratégicas.",
  },
};

const TipoImovel = () => {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, "");
  const navigate = useNavigate();
  const config = slug ? TIPO_CONFIG[slug] : null;
  useCanonical();

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [showLead, setShowLead] = useState(false);
  const PAGE_SIZE = 40;

  useEffect(() => {
    if (!config) return;
    const title = `${config.label} à Venda em Porto Alegre | Uhome Imóveis`;
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("name", "description", config.desc);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", config.desc);
    setMeta("property", "og:url", `https://uhome.com.br/${slug}`);

    setJsonLd("jsonld-tipo", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${config.label} à Venda em Porto Alegre`,
      description: config.desc,
      url: `https://uhome.com.br/${slug}`,
    });

    return () => {
      document.title = "Uhome Imóveis | Porto Alegre";
      removeJsonLd("jsonld-tipo");
    };
  }, [config, slug]);

  useEffect(() => {
    if (!config) return;
    setLoading(true);
    setPage(0);
    fetchImoveis({ tipo: config.tipo, limit: PAGE_SIZE })
      .then((r) => { setImoveis(r.data); setTotal(r.count); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [config]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !config) return;
    const nextPage = page + 1;
    const offset = nextPage * PAGE_SIZE;
    if (offset >= total) return;
    setLoadingMore(true);
    try {
      const result = await fetchImoveis({ tipo: config.tipo, limit: PAGE_SIZE, offset });
      setImoveis((prev) => [...prev, ...result.data]);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, total, loadingMore, config]);

  if (!config) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="font-body text-muted-foreground">Página não encontrada</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border bg-secondary/30 pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="mb-4 font-body text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Uhome</Link>
            {" › "}
            <Link to="/busca" className="hover:text-foreground">Imóveis</Link>
            {" › "}
            <span className="text-foreground">{config.label}</span>
          </nav>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-body text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight tracking-tight text-foreground"
            style={{ textWrap: "balance" }}
          >
            {config.label} à Venda em Porto Alegre
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 max-w-xl font-body text-sm leading-relaxed text-muted-foreground"
          >
            {config.desc}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex items-center gap-3"
          >
            <span className="font-body text-2xl font-extrabold text-foreground tabular-nums">
              {total.toLocaleString("pt-BR")}
            </span>
            <span className="font-body text-sm text-muted-foreground">
              {config.plural} disponíveis
            </span>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {imoveis.map((imovel, i) => (
                  <SearchPropertyCard key={imovel.id} imovel={imovel} index={i} />
                ))}
              </div>

              {/* CTA inline after listings */}
              <div className="mx-auto mt-10 max-w-md rounded-2xl border border-border bg-card p-6 text-center">
                <p className="font-body text-base font-bold text-foreground">
                  Não encontrou o que procura?
                </p>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  Deixe seus dados e um corretor te ajuda gratuitamente
                </p>
                <button
                  onClick={() => setShowLead(!showLead)}
                  className="mt-4 rounded-full bg-primary px-6 py-2.5 font-body text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
                >
                  Falar com corretor
                </button>
                <LeadFormInline
                  isOpen={showLead}
                  onClose={() => setShowLead(false)}
                />
              </div>

              {imoveis.length < total && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-full border-[1.5px] border-border px-8 py-3 font-body text-sm font-semibold text-foreground transition-all hover:border-foreground active:scale-[0.97] disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando...
                      </span>
                    ) : (
                      `Ver mais (${imoveis.length} de ${total.toLocaleString("pt-BR")})`
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TipoImovel;
