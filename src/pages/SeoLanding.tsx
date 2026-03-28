import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { fetchImoveis, formatPreco, type Imovel } from "@/services/imoveis";
import { LeadFormInline } from "@/components/LeadFormInline";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, ChevronRight, TrendingUp, MapPin, Building2 } from "lucide-react";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";
import { useBairroDescricao } from "@/hooks/useBairroDescricao";
import { useCanonical } from "@/hooks/useCanonical";
import { useCorretor } from "@/contexts/CorretorContext";
import {
  parseSeoSlug,
  generateBairroDescription,
  generateIntentDescription,
  slugify,
  SEO_TIPOS,
  type SeoPageConfig,
} from "@/data/seoPages";
import { bairrosData } from "@/data/bairros";

function setMeta(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const PAGE_SIZE = 40;

const SeoLanding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prefixLink } = useCorretor();
  useCanonical();

  const slug = location.pathname.replace(/^\//, "");
  const config = useMemo(() => parseSeoSlug(slug), [slug]);

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [showLead, setShowLead] = useState(false);

  // Set meta tags
  useEffect(() => {
    if (!config) return;
    document.title = config.metaTitle;
    setMeta("name", "description", config.metaDescription);
    setMeta("property", "og:title", config.metaTitle);
    setMeta("property", "og:description", config.metaDescription);
    setMeta("property", "og:url", `https://uhome.com.br${config.canonicalPath}`);
    setMeta("name", "robots", "index, follow");

    setJsonLd("jsonld-seo-page", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: config.h1,
      description: config.metaDescription,
      url: `https://uhome.com.br${config.canonicalPath}`,
    });

    setJsonLd("jsonld-seo-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: config.breadcrumbs.map((bc, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: bc.label,
        ...(bc.href ? { item: `https://uhome.com.br${bc.href}` } : {}),
      })),
    });

    return () => {
      document.title = "Uhome Imóveis | Porto Alegre";
      removeJsonLd("jsonld-seo-page");
      removeJsonLd("jsonld-seo-breadcrumb");
    };
  }, [config]);

  // Fetch properties
  useEffect(() => {
    if (!config) return;
    setLoading(true);
    setPage(0);
    fetchImoveis({
      tipo: config.tipo,
      bairro: config.bairro,
      quartos: config.quartos,
      precoMin: config.precoMin,
      precoMax: config.precoMax,
      limit: PAGE_SIZE,
    })
      .then((r) => {
        setImoveis(r.data);
        setTotal(r.count);
      })
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
      const result = await fetchImoveis({
        tipo: config.tipo,
        bairro: config.bairro,
        quartos: config.quartos,
        precoMin: config.precoMin,
        precoMax: config.precoMax,
        limit: PAGE_SIZE,
        offset,
      });
      setImoveis((prev) => [...prev, ...result.data]);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, total, loadingMore, config]);

  const stats = useMemo(() => {
    if (!imoveis.length) return null;
    const precos = imoveis.map((i) => i.preco).filter(Boolean);
    const areas = imoveis.map((i) => i.area_total).filter(Boolean) as number[];
    return {
      precoMedio: precos.length ? precos.reduce((a, b) => a + b, 0) / precos.length : 0,
      areMedia: areas.length ? areas.reduce((a, b) => a + b, 0) / areas.length : 0,
    };
  }, [imoveis]);

  // AI-generated description from DB
  const { data: aiDesc } = useBairroDescricao(config?.bairro);

  // Description text - prefer AI description, fallback to generated
  const descriptionText = useMemo(() => {
    if (!config) return "";
    if (aiDesc?.descricao_seo) return aiDesc.descricao_seo;
    if (config.bairro) return generateBairroDescription(config.bairro, config.tipo, config.quartos);
    return generateIntentDescription(config.h1);
  }, [config, aiDesc]);

  const investText = useMemo(() => {
    if (aiDesc?.por_que_investir) return aiDesc.por_que_investir;
    return null;
  }, [aiDesc]);

  const infraText = useMemo(() => {
    if (aiDesc?.infraestrutura) return aiDesc.infraestrutura;
    return null;
  }, [aiDesc]);

  // Related links
  const relatedBairros = useMemo(() => {
    if (!config) return [];
    const topBairros = bairrosData.slice(0, 12);
    return topBairros.filter((b) => b.nome !== config.bairro);
  }, [config]);

  const relatedTipos = useMemo(() => {
    if (!config || !config.bairro) return [];
    const bairroSlug = slugify(config.bairro);
    return SEO_TIPOS
      .filter((t) => t !== (config.tipo ? config.tipo + "s" : ""))
      .map((t) => ({
        label: t.charAt(0).toUpperCase() + t.slice(1),
        href: `/${t}-${bairroSlug}`,
      }));
  }, [config]);

  if (!config) {
    // This shouldn't render since App.tsx checks, but as safety
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-secondary/50 to-background pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex flex-wrap items-center gap-1 font-body text-xs text-muted-foreground">
            {config.breadcrumbs.map((bc, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {bc.href ? (
                  <Link to={prefixLink(bc.href)} className="hover:text-foreground transition-colors">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{bc.label}</span>
                )}
              </span>
            ))}
          </nav>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-body text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight tracking-tight text-foreground"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {config.h1}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 max-w-xl font-body text-sm leading-relaxed text-muted-foreground"
          >
            {config.metaDescription}
          </motion.p>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-body text-2xl font-extrabold text-foreground tabular-nums">
                {loading ? "—" : total.toLocaleString("pt-BR")}
              </span>
              <span className="font-body text-sm text-muted-foreground">imóveis disponíveis</span>
            </div>
            {stats && (
              <>
                <div className="hidden sm:flex items-center gap-2 border-l border-border pl-6">
                  <span className="font-body text-sm text-muted-foreground">Preço médio:</span>
                  <span className="font-body text-sm font-bold text-foreground">{formatPreco(stats.precoMedio)}</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 border-l border-border pl-6">
                  <span className="font-body text-sm text-muted-foreground">Área média:</span>
                  <span className="font-body text-sm font-bold text-foreground">{Math.round(stats.areMedia)} m²</span>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Description section (SEO content) */}
      <section className="border-b border-border py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div>
              <h2 className="text-h3 text-foreground">
                {config.bairro
                  ? `Sobre ${config.bairro}`
                  : `Guia de ${config.h1}`}
              </h2>
              {descriptionText.split("\n\n").map((paragraph, i) => (
                <p key={i} className="mt-4 font-body text-[15px] leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Investment card */}
            {config.bairro && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 h-fit"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-body text-sm font-bold text-foreground">
                    Por que investir em {config.bairro}?
                  </h3>
                </div>
                {investText ? (
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">{investText}</p>
                ) : (
                  <ul className="space-y-2 font-body text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />Valorização constante nos últimos anos</li>
                    <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />Infraestrutura completa e consolidada</li>
                    <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />Alta demanda por locação e revenda</li>
                  </ul>
                )}
                {infraText && (
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <p className="font-body text-xs font-semibold text-muted-foreground mb-1">Infraestrutura</p>
                    <p className="font-body text-xs text-muted-foreground">{infraText}</p>
                  </div>
                )}
                {stats && (
                  <div className="rounded-xl bg-secondary p-3 text-center">
                    <p className="font-body text-xs text-muted-foreground">Preço médio na região</p>
                    <p className="font-body text-lg font-bold text-foreground">{formatPreco(stats.precoMedio)}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Property grid */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-h3 text-foreground">
            {total.toLocaleString("pt-BR")} resultados
          </h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {config.metaDescription.split(".")[0]}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : imoveis.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-body text-muted-foreground">
                Nenhum imóvel encontrado com esses critérios no momento.
              </p>
              <button
                onClick={() => navigate(prefixLink("/busca"))}
                className="mt-4 rounded-full bg-primary px-6 py-2.5 font-body text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Ver todos os imóveis
              </button>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {imoveis.map((imovel, i) => (
                  <SearchPropertyCard key={imovel.id} imovel={imovel} index={i} />
                ))}
              </div>

              {/* CTA inline */}
              <div className="mx-auto mt-10 max-w-md rounded-2xl border border-border bg-card p-6 text-center">
                <p className="font-body text-base font-bold text-foreground">
                  Não encontrou o que procura?
                </p>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  Um corretor especializado te ajuda gratuitamente
                </p>
                <button
                  onClick={() => setShowLead(!showLead)}
                  className="mt-4 rounded-full bg-primary px-6 py-2.5 font-body text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
                >
                  Falar com corretor
                </button>
                <LeadFormInline
                  isOpen={showLead}
                  imovelBairro={config.bairro}
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

      {/* Internal links — Related types in this bairro */}
      {relatedTipos.length > 0 && (
        <section className="border-t border-border bg-secondary/20 py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-h3 text-foreground">
              Outros tipos em {config.bairro}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedTipos.map((rt) => (
                <Link
                  key={rt.href}
                  to={prefixLink(rt.href)}
                  className="rounded-full border border-border bg-card px-4 py-2 font-body text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary active:scale-[0.97]"
                >
                  {rt.label} em {config.bairro}
                </Link>
              ))}
              {config.quartos == null && [1, 2, 3, 4].map((q) => {
                const tipoSlug = config.tipo ? config.tipo + "s" : "apartamentos";
                const bairroSlug = slugify(config.bairro!);
                return (
                  <Link
                    key={q}
                    to={prefixLink(`/${tipoSlug}-${q}-quartos-${bairroSlug}`)}
                    className="rounded-full border border-border bg-card px-4 py-2 font-body text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary active:scale-[0.97]"
                  >
                    {q} quartos em {config.bairro}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Internal links — Related neighborhoods */}
      <section className="border-t border-border bg-secondary/30 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-h3 text-foreground">
            Explore outros bairros em Porto Alegre
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedBairros.map((b) => {
              const tipoPrefix = config.tipo ? config.tipo + "s" : "imoveis";
              return (
                <Link
                  key={b.slug}
                  to={prefixLink(`/${tipoPrefix}-${b.slug}`)}
                  className="rounded-full border border-border bg-card px-4 py-2 font-body text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary active:scale-[0.97]"
                >
                  {config.tipo
                    ? `${SEO_TIPOS.find((t) => t.startsWith(config.tipo!))?.charAt(0).toUpperCase()}${SEO_TIPOS.find((t) => t.startsWith(config.tipo!))?.slice(1) ?? ""}`
                    : "Imóveis"}{" "}
                  em {b.nome}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedBairros.slice(0, 8).map((b) => (
              <Link
                key={`bairro-${b.slug}`}
                to={prefixLink(`/bairros/${b.slug}`)}
                className="rounded-full border border-border bg-card px-4 py-2 font-body text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary active:scale-[0.97]"
              >
                <MapPin className="mr-1 inline-block h-3 w-3" />
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

export default SeoLanding;
