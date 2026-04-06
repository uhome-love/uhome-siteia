import { useParams, Link, useNavigate } from "react-router-dom";
import { getShareUrl } from "@/utils/shareUrl";
import { useEffect, useState, useRef, useCallback, lazy, Suspense } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeadSidebar } from "@/components/LeadSidebar";
import { FinancingSimulator } from "@/components/FinancingSimulator";
import { AgendamentoVisita } from "@/components/AgendamentoVisita";
import { SimilarProperties } from "@/components/SimilarProperties";
const PropertyMap = lazy(() => import("@/components/PropertyMap").then(m => ({ default: m.PropertyMap })));
import { FotoImovel } from "@/components/FotoImovel";
import { CardUhomePreco } from "@/components/CardUhomePreco";
import { AuthModal } from "@/components/AuthModal";
import { Bed, Car, Maximize, Bath, MapPin, Share2, Heart, ChevronLeft, ChevronRight, Loader2, Camera, ArrowLeft, MoreVertical, Map as MapIcon, Play, MessageCircle, Building2, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl, buildCorretorWhatsAppUrl } from "@/lib/whatsapp";
import { useCorretor } from "@/contexts/CorretorContext";
import { submitLead } from "@/services/leads";
import { useWhatsAppLeadStore } from "@/stores/whatsappLeadStore";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/trackEvent";
import { trackView, getViewCount } from "@/services/leads";
import { fetchImovelBySlug, type Imovel, formatPreco, fotoPrincipal } from "@/services/imoveis";
import { setJsonLd, removeJsonLd, buildImovelJsonLd, buildImovelBreadcrumbJsonLd } from "@/lib/jsonld";
import { useCanonical } from "@/hooks/useCanonical";
import { useFavoritos } from "@/hooks/useFavoritos";
import { trackWhatsAppClick } from "@/services/whatsappTracker";
import { StickyPropertyCTA } from "@/components/StickyPropertyCTA";

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
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });

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

    fetchImovelBySlug(slug)
      .then(handleSuccess)
      .catch((error) => {
        console.error("Erro ao carregar imóvel:", error);
        if (cancelled) return;
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setGalleryOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [images.length]);

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
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            {loadError ? "Erro ao carregar imóvel" : "Imóvel não encontrado"}
          </p>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            {loadError ?? "Este imóvel pode ter sido removido ou o link está incorreto."}
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
  const area = imovel.area_total ?? imovel.area_util ?? 0;

  const statItems = [
    area > 0 ? { icon: Maximize, value: `${area}m²`, label: "Área" } : null,
    (imovel.quartos ?? 0) > 0 ? { icon: Bed, value: String(imovel.quartos), label: "Quartos" } : null,
    (imovel.banheiros ?? 0) > 0 ? { icon: Bath, value: String(imovel.banheiros), label: "Banheiros" } : null,
    (imovel.vagas ?? 0) > 0 ? { icon: Car, value: String(imovel.vagas), label: "Vagas" } : null,
  ].filter(Boolean) as { icon: any; value: string; label: string }[];

  const handleShare = () => {
    const slug = imovel?.slug;
    const url = slug ? getShareUrl(slug) : window.location.href;
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
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
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
        <div className="mx-auto max-w-7xl px-6 pt-4 pb-2">
          <button
            onClick={() => window.history.length > 2 ? navigate(-1) : navigate(prefixLink("/busca"))}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
        <div className="px-6">
        <div className="mx-auto max-w-7xl gap-2 grid grid-cols-4 grid-rows-2" style={{ height: 480 }}>
          <button
            onClick={() => { setCurrentImage(0); setGalleryOpen(true); }}
            className="group relative col-span-2 row-span-2 overflow-hidden rounded-l-2xl"
          >
            <FotoImovel src={images[0]} alt={imovel.titulo} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          </button>
          {images.slice(1, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => { setCurrentImage(i + 1); setGalleryOpen(true); }}
              className={`group relative overflow-hidden ${
                i === 1 ? "rounded-tr-2xl" : i === 3 ? "rounded-br-2xl" : ""
              }`}
            >
              <FotoImovel src={img} alt={`Foto ${i + 2}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              {i === 3 && images.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="font-body text-sm font-semibold text-white">+{images.length - 5} fotos</span>
                </div>
              )}
            </button>
          ))}
        </div>
        </div>
        {images.length > 1 && (
          <div className="mx-auto mt-3 max-w-7xl flex justify-end">
            <button
              onClick={() => { setCurrentImage(0); setGalleryOpen(true); }}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-body text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary active:scale-[0.97]"
            >
              <Camera className="h-3.5 w-3.5" />
              Ver todas as {images.length} fotos
            </button>
          </div>
        )}
      </div>

      {/* Mobile hero — QuintoAndar style */}
      <div className="relative sm:hidden mt-16">
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Embla carousel */}
          <div ref={emblaRef} className="h-full overflow-hidden">
            <div className="flex h-full">
              {images.map((img, i) => (
                <div key={i} className="relative h-full min-w-0 flex-[0_0_100%]">
                  <img src={img} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" draggable={false} />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

          {/* Top action bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md active:scale-95"
              >
                <Share2 className="h-[18px] w-[18px] text-white" />
              </button>
              <button
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
              onClick={() => { setCurrentImage(0); setGalleryOpen(true); }}
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


      {/* Fullscreen lightbox */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setGalleryOpen(false)}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-5 py-4 sm:px-8">
            <div>
              <p className="font-body text-sm font-semibold text-white/90 line-clamp-1">
                {imovel.titulo}
              </p>
              <p className="font-body text-xs text-white/50">
                {currentImage + 1} de {images.length} fotos
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setGalleryOpen(false); }}
              className="rounded-full bg-white/10 px-4 py-2 font-body text-sm font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 active:scale-95"
            >
              ✕ Fechar
            </button>
          </div>

          {/* Main photo area */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-16"
            onClick={() => setGalleryOpen(false)}
          >
            <img
              key={currentImage}
              src={images[currentImage]}
              alt={`Foto ${currentImage + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full object-contain select-none animate-lightbox-appear"
            />

            {/* Left arrow */}
            {currentImage > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-3 top-1/2 flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/[0.12] text-2xl font-light text-white backdrop-blur-xl transition-colors hover:bg-white/25 active:scale-95 sm:left-6"
              >
                ‹
              </button>
            )}

            {/* Right arrow */}
            {currentImage < images.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-3 top-1/2 flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/[0.12] text-2xl font-light text-white backdrop-blur-xl transition-colors hover:bg-white/25 active:scale-95 sm:right-6"
              >
                ›
              </button>
            )}
          </div>

          {/* Thumbnails */}
          <div
            className="flex shrink-0 items-center justify-center gap-2 overflow-x-auto px-4 py-4 scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className="shrink-0 overflow-hidden rounded-md transition-all duration-150"
                style={{
                  width: 64,
                  height: 48,
                  border: i === currentImage ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                  opacity: i === currentImage ? 1 : 0.45,
                  transform: i === currentImage ? "scale(1.05)" : "scale(1)",
                }}
              >
                <img src={img} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-8 sm:gap-10 lg:flex-row">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex-1 space-y-8 lg:max-w-[63%]"
          >
            {/* Property code + Breadcrumb */}
            <div className="space-y-1">
              <span className="font-mono text-[11px] text-muted-foreground/60">
                Cód. {(() => { const parts = imovel.slug.split("-"); const last = parts[parts.length - 1]; const secondLast = parts[parts.length - 2]; return secondLast && /^\d+$/.test(secondLast) ? `${secondLast}-${last}`.toUpperCase() : last?.toUpperCase() || imovel.id.slice(0, 8).toUpperCase(); })()}
              </span>
              <nav className="font-body text-xs text-muted-foreground">
                <Link to="/busca" className="hover:text-foreground">Imóveis</Link>
                {" › "}
                <Link to={`/busca?bairro=${encodeURIComponent(imovel.bairro)}`} className="hover:text-foreground">{imovel.bairro}</Link>
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
              <h1 className="mt-3 font-body text-[clamp(1.5rem,4vw,2rem)] font-extrabold leading-tight tracking-tight text-foreground" style={{ textWrap: "balance" }}>
                {imovel.titulo}
              </h1>
              <div className="mt-2 flex items-center gap-3 font-body text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {imovel.bairro}, {imovel.cidade}
                </span>
              </div>
              {imovel.condominio_nome && (
                <Link
                  to={`/condominios/${imovel.condominio_nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 font-body text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {imovel.condominio_nome}
                </Link>
              )}
            </div>

            {/* Price */}
            <div>
              <p className="font-body text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-primary">{priceFormatted}</p>
              {(imovel.preco_condominio ?? 0) > 0 && (
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  + R$ {imovel.preco_condominio!.toLocaleString("pt-BR")}/mês condomínio
                </p>
              )}
              {(imovel.preco_iptu ?? 0) > 0 && (
                <p className="font-body text-sm text-muted-foreground">
                  IPTU: R$ {imovel.preco_iptu!.toLocaleString("pt-BR")}/mês
                </p>
              )}
            </div>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {statItems.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary sm:h-9 sm:w-9">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                  </div>
                  <div>
                    <p className="font-body text-sm font-bold text-foreground sm:text-base">{value}</p>
                    <p className="font-body text-[10px] text-muted-foreground sm:text-[11px]">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile CTA moved to fixed bottom bar */}

            {/* Description */}
            {imovel.descricao && imovel.descricao.trim().length > 0 && (
              <div>
                <h2 className="font-body text-lg font-bold text-foreground">Sobre o imóvel</h2>
                <div className="mt-3 font-body text-sm leading-[1.8] text-muted-foreground whitespace-pre-line" style={{ maxWidth: "65ch" }}>
                  {imovel.descricao}
                </div>
              </div>
            )}

            {/* Diferenciais */}
            {imovel.diferenciais.length > 0 && (
              <div>
                <h2 className="font-body text-lg font-bold text-foreground">Diferenciais</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {imovel.diferenciais.map((f) => (
                    <span key={f} className="rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-border" />

            {/* Location */}
            {imovel.latitude && imovel.longitude && (
              <div ref={mapRef}>
                <h2 className="font-body text-lg font-bold text-foreground">Localização</h2>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  {imovel.bairro}, Porto Alegre — endereço exato após contato
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

            {/* Financing */}
            <FinancingSimulator propertyPrice={imovel.preco} />
          </motion.div>

          {/* Right — Lead Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="w-full lg:w-[35%]"
          >
            <div className="sticky top-24 space-y-4">
              <LeadSidebar
                imovelId={imovel.id}
                imovelSlug={imovel.slug}
                imovelTitulo={imovel.titulo}
                imovelBairro={imovel.bairro}
                imovelPreco={imovel.preco}
                viewCount={viewCount}
              />

              {/* Agendamento de visita */}
              <AgendamentoVisita
                imovelId={imovel.id}
                imovelSlug={imovel.slug}
                imovelTitulo={imovel.titulo}
                imovelBairro={imovel.bairro}
                imovelPreco={imovel.preco}
              />

              {/* Análise de preço */}
              <CardUhomePreco imovel={imovel} />
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
      <div className="mx-auto max-w-7xl px-6 pb-12">
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
      />

      {/* Fixed bottom bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs text-muted-foreground truncate">{imovel.bairro}</p>
            <p className="font-body text-base font-bold text-foreground">{priceFormatted}</p>
          </div>
          <Button
            size="sm"
            className="shrink-0 text-[13px] px-4 py-2.5 h-auto"
            onClick={() => {
              const sidebar = document.querySelector('[data-lead-sidebar]');
              if (sidebar) sidebar.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          >
            <Heart className="h-4 w-4 mr-1.5" />
            Interesse
          </Button>
          <Button
            variant="whatsapp"
            size="sm"
            className="shrink-0 text-[13px] px-4 py-2.5 h-auto"
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
                origem_componente: "detalhe_mobile_bar",
                imovel_id: imovel.id,
                imovel_slug: imovel.slug,
                imovel_titulo: imovel.titulo,
                imovel_bairro: imovel.bairro,
                imovel_preco: imovel.preco,
              });
            }}
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            WhatsApp
          </Button>
        </div>
      </div>
      {/* Spacer for fixed bottom bar */}
      <div className="h-16 sm:hidden" />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default PropertyDetail;
