import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { getBairroBySlug, bairrosData } from "@/data/bairros";
import { fetchImoveis, formatPreco, type Imovel } from "@/services/imoveis";
import { motion } from "framer-motion";
import { MapPin, Home, ArrowRight, Loader2, ChevronRight } from "lucide-react";
import { setJsonLd, removeJsonLd, buildBairroJsonLd, buildBairroBreadcrumbJsonLd } from "@/lib/jsonld";
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

const Bairro = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const bairro = getBairroBySlug(slug || "");

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bairro) return;
    const title = `Imóveis à Venda em ${bairro.nome} — Porto Alegre | Uhome`;
    const desc = `${bairro.descricao.slice(0, 140)}. Veja apartamentos, casas e coberturas à venda em ${bairro.nome} com a Uhome.`;
    document.title = title;
    setMeta("name", "description", desc);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:image", bairro.foto);
    setMeta("property", "og:url", `https://uhome.com.br/bairros/${bairro.slug}`);
    setJsonLd("jsonld-breadcrumb", buildBairroBreadcrumbJsonLd(bairro.nome, bairro.slug));
    return () => {
      document.title = "Uhome Imóveis | Porto Alegre";
      removeJsonLd("jsonld-bairro");
      removeJsonLd("jsonld-breadcrumb");
    };
  }, [bairro]);

  useEffect(() => {
    if (!bairro) return;
    setLoading(true);
    fetchImoveis({ bairro: bairro.nome, limit: 40 })
      .then((r) => {
        setImoveis(r.data);
        setTotal(r.count);
        if (bairro) {
          const precos = r.data.map((i) => i.preco).filter(Boolean);
          const avg = precos.length ? precos.reduce((a, b) => a + b, 0) / precos.length : undefined;
          setJsonLd("jsonld-bairro", buildBairroJsonLd(bairro, r.count, avg));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bairro]);

  const stats = useMemo(() => {
    if (!imoveis.length) return null;
    const precos = imoveis.map((i) => i.preco).filter(Boolean);
    const areas = imoveis.map((i) => i.area_total).filter(Boolean) as number[];
    return {
      precoMedio: precos.length ? precos.reduce((a, b) => a + b, 0) / precos.length : 0,
      areMedia: areas.length ? areas.reduce((a, b) => a + b, 0) / areas.length : 0,
      tipos: {
        apartamento: imoveis.filter((i) => i.tipo === "apartamento").length,
        casa: imoveis.filter((i) => i.tipo === "casa").length,
        cobertura: imoveis.filter((i) => i.tipo === "cobertura").length,
      },
    };
  }, [imoveis]);

  if (!bairro) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pt-20">
          <Home className="h-12 w-12 text-muted-foreground/30" />
          <h1 className="text-h3 text-foreground">Bairro não encontrado</h1>
          <Link to="/bairros" className="font-body text-sm text-primary hover:underline">
            Ver todos os bairros
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[340px] w-full overflow-hidden sm:h-[420px]">
        <img
          src={bairro.foto}
          alt={`${bairro.nome}, Porto Alegre`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 sm:px-12">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 font-body text-xs text-white/60">
            <Link to="/" className="hover:text-white/80">Uhome</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/bairros" className="hover:text-white/80">Bairros</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">{bairro.nome}</span>
          </nav>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-h1 text-white text-balance"
          >
            Imóveis à Venda em {bairro.nome}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 flex items-center gap-1.5 font-body text-sm text-white/80"
          >
            <MapPin className="h-3.5 w-3.5" />
            Porto Alegre, RS · {total.toLocaleString("pt-BR")} imóveis disponíveis
          </motion.p>
        </div>
      </section>

      {/* Description + stats */}
      <section className="border-b border-border py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_280px]">
            <div>
              <h2 className="text-h3 text-foreground">Sobre {bairro.nome}</h2>
              <p className="mt-4 font-body text-[15px] leading-relaxed text-muted-foreground">
                {bairro.descricao}
              </p>
            </div>
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Números do bairro
                </h3>
                <div>
                  <p className="text-h3 text-foreground tabular-nums">{formatPreco(stats.precoMedio)}</p>
                  <p className="font-body text-xs text-muted-foreground">preço médio</p>
                </div>
                <div>
                  <p className="text-h3 text-foreground tabular-nums">{Math.round(stats.areMedia)} m²</p>
                  <p className="font-body text-xs text-muted-foreground">área média</p>
                </div>
                <div className="flex gap-3 text-center">
                  {stats.tipos.apartamento > 0 && (
                    <div className="flex-1 rounded-xl bg-secondary p-2">
                      <p className="font-body text-lg font-bold text-foreground">{stats.tipos.apartamento}</p>
                      <p className="font-body text-[10px] text-muted-foreground">aptos</p>
                    </div>
                  )}
                  {stats.tipos.casa > 0 && (
                    <div className="flex-1 rounded-xl bg-secondary p-2">
                      <p className="font-body text-lg font-bold text-foreground">{stats.tipos.casa}</p>
                      <p className="font-body text-[10px] text-muted-foreground">casas</p>
                    </div>
                  )}
                  {stats.tipos.cobertura > 0 && (
                    <div className="flex-1 rounded-xl bg-secondary p-2">
                      <p className="font-body text-lg font-bold text-foreground">{stats.tipos.cobertura}</p>
                      <p className="font-body text-[10px] text-muted-foreground">coberturas</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Properties grid */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-h3 text-foreground">
            {total} imóveis em {bairro.nome}
          </h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Apartamentos, casas e coberturas à venda
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : imoveis.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-body text-muted-foreground">
                Nenhum imóvel disponível neste bairro no momento.
              </p>
              <button
                onClick={() => navigate("/busca")}
                className="mt-4 rounded-full bg-primary px-6 py-2.5 font-body text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Ver todos os imóveis
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {imoveis.map((imovel, i) => (
                <SearchPropertyCard key={imovel.id} imovel={imovel} index={i} />
              ))}
            </div>
          )}

          {total > 40 && (
            <div className="mt-10 text-center">
              <button
                onClick={() => navigate(`/busca?bairros=${encodeURIComponent(bairro.nome)}`)}
                className="inline-flex items-center gap-2 rounded-full border border-primary px-6 py-2.5 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-[0.97]"
              >
                Ver todos os {total} imóveis <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Other neighborhoods */}
      <section className="border-t border-border bg-secondary/30 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-h3 text-foreground">Outros bairros em Porto Alegre</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {bairrosData
              .filter((b) => b.slug !== bairro.slug)
              .map((b) => (
                <Link
                  key={b.slug}
                  to={`/bairros/${b.slug}`}
                  className="rounded-full border border-border bg-card px-4 py-2 font-body text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary active:scale-[0.97]"
                >
                  {b.nome}
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Bairro;
