import { useParams, Link, useNavigate } from "react-router-dom";
import { getImovelUrl } from "@/utils/shareUrl";
import { useEffect, useState, useRef, useCallback, lazy, Suspense } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeadSidebar } from "@/components/LeadSidebar";
import { DetalheNavFixa } from "@/components/imovel/DetalheNavFixa";
import { AgendamentoVisita } from "@/components/AgendamentoVisita";
import { SimilarProperties } from "@/components/SimilarProperties";
const PropertyMap = lazy(() => import("../components/PropertyMap.tsx").then(m => ({ default: m.PropertyMap })));
import { FotoImovel } from "@/components/FotoImovel";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
const MaterialGallery = lazy(() => import("@/components/foco/MaterialGallery").then(m => ({ default: m.MaterialGallery })));
import { AuthModal } from "@/components/AuthModal";
import { Bed, Car, Maximize, Bath, MapPin, Share2, Heart, ChevronLeft, ChevronRight, Loader2, Camera, ArrowLeft, MoreVertical, Map as MapIcon, Play, MessageCircle, Building2, Eye, TrendingUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl, buildCorretorWhatsAppUrl } from "@/lib/whatsapp";
import { useCorretor } from "@/contexts/CorretorContext";
import { submitLead } from "@/services/leads";
import { useWhatsAppLeadStore } from "@/stores/whatsappLeadStore";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/trackEvent";
import { trackView, getViewCount } from "@/services/leads";
import { fetchImovelBySlug, isCodigoSlug, type Imovel, formatPreco, fotoPrincipal } from "@/services/imoveis";
import { supabase } from "@/integrations/supabase/client";
import { setJsonLd, removeJsonLd, buildImovelJsonLd, buildImovelBreadcrumbJsonLd } from "@/lib/jsonld";
import { useCanonical } from "@/hooks/useCanonical";
import { useFavoritos } from "@/hooks/useFavoritos";
import { trackWhatsAppClick } from "@/services/whatsappTracker";
import { StickyPropertyCTA } from "@/components/StickyPropertyCTA";
import { formatIptu } from "@/lib/iptu";
import { custoMensalFixo, primeiraParcelaSAC } from "@/lib/financiamento";

function extractPropertyCode(slug: string, id: string): string {
  const parts = slug.split("-");
  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  return secondLast && /^\d+$/.test(secondLast)
    ? `${secondLast}-${last}`.toUpperCase()
    : last?.toUpperCase() || id.slice(0, 8).toUpperCase();
}

const PropertyDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  useCanonical(slug ? `/imovel/${slug}` : undefined);
  const [currentImage, setCurrentImage] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const { isFavorito, toggleFavorito } = useFavoritos();
  const { corretor, prefixLink } = useCorretor();
  const openLeadModal = useWhatsAppLeadStore((s) => s.openModal);
  const [showAuth, setShowAuth] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [todasComodidades, setTodasComodidades] = useState(false);
  const [visitaOpen, setVisitaOpen] = useState(false);
  const galleryTrigger = useRef<HTMLElement | null>(null);
  const abrirVisita = () => { setGalleryOpen(false); setVisitaOpen(true); };

  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });

  useEffect(() => { if (galleryOpen) void trackEvent({ tipo: "foto_aberta", imovel_slug: slug, dados: { foto_index: currentImage } }); }, [galleryOpen, currentImage, slug]);

  // Sync embla with currentImage state
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentImage(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== currentImage) {
      emblaApi.scrollTo(currentImage);
    }
  }, [emblaApi, currentImage]);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setImovel(null);

    

    function handleSuccess(data: Imovel | null) {
      if (cancelled) return;
      setImovel(data);
      if (data) {
        trackView(data.id);
        trackEvent({ tipo: "imovel_visualizado", imovel_slug: data.slug, imovel_titulo: data.titulo, imovel_bairro: data.bairro, imovel_preco: data.preco });
        getViewCount(data.id).then((count) => {
          if (!cancelled) setViewCount(count);
        });
        const vistos: string[] = JSON.parse(localStorage.getItem("imoveis_vistos") || "[]");
        if (!vistos.includes(data.id)) {
          vistos.push(data.id);
          if (vistos.length > 100) vistos.shift();
          localStorage.setItem("imoveis_vistos", JSON.stringify(vistos));
        }
      }
      setLoading(false);
    }

    const porCodigo = isCodigoSlug(slug);
    const carregar = async () => {
      let data = await fetchImovelBySlug(slug);
      // Código ainda não sincronizado: puxa novidades do Jetimob e tenta de novo uma vez
      if (!data && porCodigo && !cancelled) {
        setSincronizando(true);
        await supabase.functions.invoke("sync-jetimob", { body: { mode: "incremental" } }).catch(() => null);
        if (cancelled) return null;
        data = await fetchImovelBySlug(slug);
        setSincronizando(false);
      }
      return data;
    };

    carregar()
      .then((data) => {
        if (cancelled) return;
        // Link curto (/imovel/CODIGO) → troca para o link completo do imóvel
        if (data && porCodigo && data.slug !== slug) {
          navigate(prefixLink(`/imovel/${data.slug}`), { replace: true });
          return;
        }
        handleSuccess(data);
      })
      .catch((error) => {
        console.error("Erro ao carregar imóvel:", error);
        if (cancelled) return;
        setSincronizando(false);
        setLoadError("Não foi possível carregar este imóvel agora.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const images = imovel?.fotos.map((f) => f.url) ?? [];
  if (images.length === 0 && imovel) {
    images.push("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop");
  }

  const nextImage = () => setCurrentImage((i) => (i + 1) % images.length);
  const prevImage = () => setCurrentImage((i) => (i - 1 + images.length) % images.length);

  // Dynamic SEO meta tags
  useEffect(() => {
    if (!imovel) return;
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const price = formatPreco(imovel.preco);
    document.title = `${imovel.titulo} | Uhome Imóveis`;
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    const desc = `${cap(imovel.tipo)} ${(imovel.quartos ?? 0) > 0 ? `com ${imovel.quartos} quartos` : ""} em ${imovel.bairro}, Porto Alegre. ${price}.`;
    setMeta("name", "description", desc);
    setMeta("property", "og:title", `${imovel.titulo} | Uhome`);
    setMeta("property", "og:description", `${cap(imovel.tipo)} em ${imovel.bairro} — ${price}`);
    setMeta("property", "og:image", fotoPrincipal(imovel));
    setMeta("property", "og:url", `https://uhome.com.br/imovel/${imovel.slug}`);
    setJsonLd("jsonld-imovel", buildImovelJsonLd(imovel));
    setJsonLd("jsonld-breadcrumb", buildImovelBreadcrumbJsonLd(imovel));
    return () => {
      document.title = "Uhome Imóveis | Apartamentos e Casas à Venda em Porto Alegre";
      removeJsonLd("jsonld-imovel");
      removeJsonLd("jsonld-breadcrumb");
    };
  }, [imovel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center gap-3 pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {sincronizando && (
            <p className="font-body text-sm text-muted-foreground">Este imóvel está sendo atualizado…</p>
          )}
        </div>
      </div>
    );
  }

  if (!imovel) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32">
          <p className="font-body text-xl font-bold text-foreground">
            {loadError ? "Erro ao carregar imóvel" : "Este imóvel saiu de venda"}
          </p>
          <p className="mt-2 max-w-md text-center font-body text-sm text-muted-foreground">
            {loadError ?? "Ele pode ter sido vendido ou retirado do site. Temos milhares de outros imóveis à venda — veja opções parecidas ou fale com um corretor."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {loadError && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            )}
            <Button onClick={() => navigate(prefixLink("/busca"))}>
              Ver imóveis disponíveis
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isIndisponivel = imovel.status !== "disponivel";
  const statusLabel: Record<string, string> = {
    vendido: "Vendido",
    reservado: "Reservado",
    inativo: "Indisponível",
  };
  const priceFormatted = formatPreco(imovel.preco);
  const finalidadeLabel = "Venda";
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const areaPriv = imovel.area_util ?? 0;
  const areaTotal = imovel.area_total ?? 0;
  const areaPrincipal = areaPriv || areaTotal;

  const statItems = [
    areaPriv > 0 ? { icon: Maximize, value: `${areaPriv.toLocaleString("pt-BR")} m²`, label: "Área privativa" } : null,
    areaTotal > 0 && areaTotal !== areaPriv ? { icon: Maximize, value: `${areaTotal.toLocaleString("pt-BR")} m²`, label: "Área total" } : null,
    (imovel.quartos ?? 0) > 0 ? { icon: Bed, value: String(imovel.quartos), label: "Quartos" } : null,
    (imovel.banheiros ?? 0) > 0 ? { icon: Bath, value: String(imovel.banheiros), label: "Banheiros" } : null,
    (imovel.vagas ?? 0) > 0 ? { icon: Car, value: String(imovel.vagas), label: "Vagas" } : null,
  ].filter(Boolean) as { icon: any; value: string; label: string }[];

  const handleShare = () => {
    const slug = imovel?.slug;
    const url = slug ? getImovelUrl(slug) : window.location.href;
    navigator.clipboard.writeText(url);
    import("sonner").then(({ toast }) => toast.success("Link copiado!"));
  };

  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {isIndisponivel && (
        <div className="bg-amber-50 border-b border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
          <div className="mx-auto max-w-[1120px] px-6 py-3 flex items-center justify-between">
            <p className="font-body text-sm font-medium text-amber-800 dark:text-amber-200">
              Este imóvel está <strong>{statusLabel[imovel.status] || "indisponível"}</strong> e não está mais à venda.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(prefixLink("/busca"))}
              className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900"
            >
              Ver imóveis disponíveis
            </Button>
          </div>
        </div>
      )}
      <div className="mt-16 hidden sm:block">
        <div className="mx-auto flex max-w-[1120px] items-end justify-between gap-6 px-6 pb-6 pt-8">
          <div className="min-w-0">
            <p aria-hidden="true" className="truncate font-body text-[26px] font-bold leading-tight text-foreground">{imovel.titulo}</p>
            <p className="mt-1 font-body text-sm text-muted-foreground">{imovel.bairro}, {imovel.cidade}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button onClick={handleShare} className="flex items-center gap-2 rounded-lg px-3 py-2 font-body text-sm font-semibold underline underline-offset-2 hover:bg-secondary"><Share2 className="h-4 w-4" />Compartilhar</button>
            <button onClick={async () => { const r = await toggleFavorito(imovel.id); if (r === "needs_auth") setShowAuth(true); }} className="flex items-center gap-2 rounded-lg px-3 py-2 font-body text-sm font-semibold underline underline-offset-2 hover:bg-secondary"><Heart className={`h-4 w-4 ${isFavorito(imovel.id) ? "fill-primary text-primary" : ""}`} />{isFavorito(imovel.id) ? "Salvo" : "Salvar"}</button>
          </div>
        </div>
        <div className="px-6">
        <div id="fotos" className="detalhe-grade relative mx-auto max-w-[1120px] gap-2 grid grid-cols-4 grid-rows-2 overflow-hidden rounded-xl" style={{ height: 440 }}>
          <button
            onClick={(e) => { galleryTrigger.current = e.currentTarget; setCurrentImage(0); setGalleryOpen(true); }}
            className="group relative col-span-2 row-span-2 overflow-hidden"
          >
            <FotoImovel src={images[0]} alt={imovel.titulo} className="h-full w-full object-cover transition-transform duration-500 group-hover:brightness-90" />
          </button>
          {images.slice(1, 5).map((img, i) => (
            <button
              key={i}
              onClick={(e) => { galleryTrigger.current = e.currentTarget; setCurrentImage(i + 1); setGalleryOpen(true); }}
              className="group relative overflow-hidden"
            >
              <FotoImovel src={img} alt={`Foto ${i + 2}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:brightness-90" />
              {i === 3 && images.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="font-body text-sm font-semibold text-white">+{images.length - 5} fotos</span>
                </div>
              )}
            </button>
          ))}
          {images.length > 1 && <button onClick={(e) => { galleryTrigger.current = e.currentTarget; setCurrentImage(0); setGalleryOpen(true); }} className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-foreground bg-card px-4 py-2 font-body text-sm font-semibold text-foreground shadow-sm transition-transform active:scale-[0.97]"><Camera className="h-4 w-4" />Mostrar todas as {images.length} fotos</button>}
        </div>
        </div>
      </div>
      <DetalheNavFixa preco={priceFormatted} onAgendar={isIndisponivel ? undefined : abrirVisita} />

      {/* Mobile hero — QuintoAndar style */}
      <div className="relative sm:hidden">
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Embla carousel */}
          <div ref={emblaRef} className="h-full overflow-hidden">
            <div className="flex h-full">
              {images.map((img, i) => (
                <div key={i} className="relative h-full min-w-0 flex-[0_0_100%]">
                  <img src={img} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" draggable={false} onClick={(e) => { galleryTrigger.current = e.currentTarget as any; setCurrentImage(i); setGalleryOpen(true); }} />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

          {/* Top action bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
            <button
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleShare}
                aria-label="Compartilhar"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md active:scale-95"
              >
                <Share2 className="h-[18px] w-[18px] text-white" />
              </button>
              <button
                aria-label={imovel && isFavorito(imovel.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                onClick={async () => {
                  if (!imovel) return;
                  const result = await toggleFavorito(imovel.id);
                  if (result === "needs_auth") setShowAuth(true);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md active:scale-95"
              >
                <Heart className={`h-[18px] w-[18px] ${imovel && isFavorito(imovel.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
              </button>
            </div>
          </div>

          {/* Bottom pills */}
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 px-5">
            <button
              onClick={(e) => { galleryTrigger.current = e.currentTarget; setCurrentImage(0); setGalleryOpen(true); }}
              className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 active:scale-95"
            >
              <Camera className="h-3.5 w-3.5 text-white" />
              <span className="font-body text-[13px] font-semibold text-white">{images.length} Fotos</span>
            </button>
            {imovel.video_url && (
              <a
                href={imovel.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 active:scale-95"
              >
                <Play className="h-3.5 w-3.5 text-white" />
                <span className="font-body text-[13px] font-semibold text-white">Vídeo</span>
              </a>
            )}
            {imovel.latitude && imovel.longitude && (
              <button
                onClick={scrollToMap}
                className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 active:scale-95"
              >
                <MapIcon className="h-3.5 w-3.5 text-white" />
                <span className="font-body text-[13px] font-semibold text-white">Mapa</span>
              </button>
            )}
          </div>
        </div>
      </div>


      {galleryOpen && <Suspense fallback={null}>
        <MaterialGallery fotos={images.map(url => ({ url }))} index={currentImage} restoreFocus={galleryTrigger.current} onClose={() => setGalleryOpen(false)} onAgendar={isIndisponivel ? undefined : abrirVisita} />
      </Suspense>}
      <Dialog open={visitaOpen} onOpenChange={setVisitaOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogTitle>Agendar visita</DialogTitle>
          <DialogDescription>{imovel.titulo}</DialogDescription>
          <AgendamentoVisita imovelId={imovel.id} imovelSlug={imovel.slug} imovelTitulo={imovel.titulo} imovelBairro={imovel.bairro} imovelPreco={imovel.preco} />
        </DialogContent>
      </Dialog>

      {/* Content */}
      <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 sm:py-8">
        {imovel.slug.toUpperCase().endsWith("28238-UH") && <p className="mb-6 border-b border-border pb-4 text-sm text-muted-foreground">Ainda sem fotos por dentro. As imagens disponíveis mostram o condomínio.</p>}
        <div className="flex flex-col gap-8 sm:gap-10 lg:flex-row">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex-1 space-y-8 lg:max-w-[63%]"
          >
            <section id="detalhes" aria-label="Resumo do imóvel" className="min-w-0 scroll-mt-32 space-y-5">
            {/* Breadcrumb and property reference */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <nav aria-label="Navegação do imóvel" className="min-w-0 break-words font-body text-xs leading-relaxed text-muted-foreground">
                <Link to={prefixLink("/busca")} className="hover:text-foreground">Imóveis</Link>
                <span className="hidden sm:inline">{" › "}</span>
                <Link to={prefixLink(`/busca?bairro=${encodeURIComponent(imovel.bairro)}`)} className="hidden hover:text-foreground sm:inline">{imovel.bairro}</Link>
                {imovel.condominio_nome && (
                  <>
                    {" › "}
                    <Link
                      to={`/condominios/${imovel.condominio_nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                      className="hover:text-foreground"
                    >
                      {imovel.condominio_nome}
                    </Link>
                  </>
                )}
                {" › "}
                <span className="text-foreground">{capitalize(imovel.tipo)}</span>
              </nav>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                Cód. {extractPropertyCode(imovel.slug, imovel.id)}
              </span>
            </div>

            {/* Badge + title */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary">
                  {finalidadeLabel}
                </span>
                {viewCount >= 5 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-body text-xs font-semibold text-accent-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Alta procura
                  </span>
                )}
                {viewCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 font-body text-[11px] text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {viewCount} {viewCount === 1 ? "pessoa viu" : "pessoas viram"} hoje
                  </span>
                )}
              </div>
              <h1 className="mt-3 sm:sr-only break-words font-body text-[22px] font-bold leading-tight tracking-normal text-foreground sm:text-3xl">
                {imovel.titulo}
              </h1>
              <div className="mt-2 font-body text-base text-muted-foreground sm:hidden">
                <span className="flex items-start gap-1.5">
                  <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words">{imovel.bairro}, {imovel.cidade}</span>
                </span>
              </div>
              {imovel.condominio_nome && (
                <Link
                  to={`/condominios/${imovel.condominio_nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                  className="mt-2 inline-flex max-w-full items-start gap-1.5 font-body text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words">{imovel.condominio_nome}</span>
                </Link>
              )}
            </div>

            {/* Price */}
            <div className="border-t border-border pt-4">
              <p className="font-body text-xs font-medium text-muted-foreground">Valor de venda</p>
              <p className="mt-1 break-words font-body text-3xl font-extrabold leading-tight tracking-normal text-foreground sm:text-4xl" data-price={imovel.preco}>{priceFormatted}</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-body text-sm leading-relaxed text-muted-foreground">
                {typeof imovel.preco_condominio === "number" && imovel.preco_condominio > 0 && (
                  <p>Condomínio: R$ {imovel.preco_condominio.toLocaleString("pt-BR")}/mês</p>
                )}
                {(imovel.preco_iptu ?? 0) > 0 && <p>{formatIptu(imovel)}</p>}
              </div>
              {(() => {
                const custo = custoMensalFixo(imovel);
                const temCond = (imovel.preco_condominio ?? 0) > 0;
                const temIptu = (imovel.preco_iptu ?? 0) > 0;
                const parcela = primeiraParcelaSAC(imovel.preco);
                return (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {temCond && temIptu && custo > 0 && (
                      <span className="rounded-lg bg-muted px-3 py-1.5 font-body text-[13px] text-foreground">
                        Custo mensal: <strong>R$ {custo.toLocaleString("pt-BR")}</strong> <span className="text-muted-foreground">(cond. + IPTU)</span>
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Scannable property specifications */}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-border py-4 sm:grid-cols-3 xl:grid-cols-5">
              {statItems.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex min-w-0 items-start gap-2.5">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 font-body">
                    <dt className="text-xs leading-relaxed text-muted-foreground">{label}</dt>
                    <dd className="break-words text-base font-bold text-foreground">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            </section>

            {/* Mobile CTA moved to fixed bottom bar */}

            {/* Description */}
            {imovel.descricao && imovel.descricao.trim().length > 0 && (() => {
              const paragraphs = imovel.descricao.split(/\n\n|\n/).filter((p: string) => p.trim().length > 0);
              const hasMore = paragraphs.length > 1;
              return (
                <div>
                  <h2 className="font-body text-lg font-bold text-foreground">Sobre o imóvel</h2>
                  <div className="mt-3 font-body text-sm leading-[1.8] text-muted-foreground whitespace-pre-line" style={{ maxWidth: "65ch" }}>
                    {showFullDesc ? imovel.descricao : paragraphs[0]}
                  </div>
                  {hasMore && (
                    <button
                      onClick={() => setShowFullDesc(!showFullDesc)}
                      className="mt-2 text-primary font-semibold text-sm cursor-pointer hover:underline bg-transparent border-none p-0"
                    >
                      {showFullDesc ? "Ver menos ↑" : "Ver mais ↓"}
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Diferenciais */}
            {imovel.diferenciais.length > 0 && (
              <div id="comodidades" className="scroll-mt-32">
                <h2 className="font-body text-lg font-bold text-foreground">O que este imóvel oferece</h2>
                <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                  {(todasComodidades ? imovel.diferenciais : imovel.diferenciais.slice(0, 10)).map((f) => (
                    <li key={f} className="flex items-center gap-3 font-body text-[15px] text-foreground"><Check className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />{f}</li>
                  ))}
                </ul>
                {imovel.diferenciais.length > 10 && <button type="button" onClick={() => setTodasComodidades((v) => !v)} className="mt-5 rounded-lg border border-foreground px-5 py-2.5 font-body text-sm font-semibold hover:bg-secondary">{todasComodidades ? "Mostrar menos" : `Mostrar todas as ${imovel.diferenciais.length} comodidades`}</button>}
              </div>
            )}

            <div className="h-px bg-border" />

            {/* Location */}
            {imovel.latitude && imovel.longitude && (
              <div ref={mapRef} id="localizacao" className="scroll-mt-32">
                <h2 className="font-body text-lg font-bold text-foreground">Localização</h2>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  {imovel.bairro}, {imovel.cidade} — endereço exato após contato
                </p>
                <div className="mt-4">
                  <Suspense fallback={<div className="h-64 w-full rounded-xl bg-muted animate-pulse" />}>
                    <PropertyMap
                      neighborhood={imovel.bairro}
                      city={imovel.cidade}
                      lat={imovel.latitude}
                      lng={imovel.longitude}
                    />
                  </Suspense>
                </div>
              </div>
            )}

            <div className="h-px bg-border" />

          </motion.div>

          {/* Right — Lead Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="w-full lg:w-[35%]"
          >
            <div className="detalhe-cartao sticky top-24 space-y-4">
              <LeadSidebar
                imovelId={imovel.id}
                imovelSlug={imovel.slug}
                imovelTitulo={imovel.titulo}
                imovelBairro={imovel.bairro}
                imovelPreco={imovel.preco}
                viewCount={viewCount}
                onAgendar={isIndisponivel ? undefined : abrirVisita}
              />

            </div>

            {/* Secondary actions below sidebar — desktop only */}
            <div className="mt-4 hidden gap-3 sm:flex">
              <button
                onClick={async () => {
                  if (!imovel) return;
                  const result = await toggleFavorito(imovel.id);
                  if (result === "needs_auth") setShowAuth(true);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 font-body text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:scale-[0.97]"
              >
                <Heart className={`h-4 w-4 ${imovel && isFavorito(imovel.id) ? "fill-red-500 text-red-500" : ""}`} />
                Salvar
              </button>
              <button
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 font-body text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:scale-[0.97]"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Similar properties */}
      <div className="mx-auto max-w-[1120px] px-6 pb-12">
        <SimilarProperties
          currentId={imovel.id}
          bairro={imovel.bairro}
          tipo={imovel.tipo}
          preco={imovel.preco}
        />
      </div>

      <Footer />

      {/* Desktop sticky CTA */}
      <StickyPropertyCTA
        imovelId={imovel.id}
        imovelSlug={imovel.slug}
        imovelTitulo={imovel.titulo}
        imovelBairro={imovel.bairro}
        imovelPreco={imovel.preco}
        onAgendar={isIndisponivel ? undefined : abrirVisita}
      />

      {/* Fixed bottom bar — mobile only */}
      {!isIndisponivel && <div data-barra-baixo className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
        <Button className="mb-2 h-11 w-full" onClick={abrirVisita}>Agendar visita</Button>
        <Button
          variant="outline"
          className="h-11 w-full text-sm"
          onClick={() => {
            if (!imovel) return;
            const url = corretor
              ? buildCorretorWhatsAppUrl(corretor.nome, corretor.telefone, {
                  titulo: imovel.titulo,
                  bairro: imovel.bairro,
                  slug: imovel.slug,
                })
              : buildWhatsAppUrl(undefined, {
                  titulo: imovel.titulo,
                  bairro: imovel.bairro,
                  slug: imovel.slug,
                });
            openLeadModal({
              whatsappUrl: url,
              origem_componente: "detalhe_mobile_sticky",
              imovel_id: imovel.id,
              imovel_slug: imovel.slug,
              imovel_titulo: imovel.titulo,
              imovel_bairro: imovel.bairro,
              imovel_preco: imovel.preco,
            });
          }}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Receber informações
        </Button>
      </div>}
      {/* Spacer for fixed bottom bar */}
      <div className="h-32 sm:hidden" />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default PropertyDetail;
