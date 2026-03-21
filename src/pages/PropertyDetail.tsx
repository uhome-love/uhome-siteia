import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeadSidebar } from "@/components/LeadSidebar";
import { FinancingSimulator } from "@/components/FinancingSimulator";
import { PropertyMap } from "@/components/PropertyMap";
import { Bed, Car, Maximize, Bath, MapPin, Share2, Heart, ChevronLeft, ChevronRight, Loader2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { trackView, getViewCount } from "@/services/leads";
import { fetchImovelBySlug, type Imovel, formatPreco, fotoPrincipal } from "@/services/imoveis";
import { setJsonLd, removeJsonLd, buildImovelJsonLd, buildImovelBreadcrumbJsonLd } from "@/lib/jsonld";
import { useCanonical } from "@/hooks/useCanonical";

const PropertyDetail = () => {
  const { slug } = useParams();
  useCanonical(slug ? `/imovel/${slug}` : undefined);
  const [currentImage, setCurrentImage] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchImovelBySlug(slug)
      .then((data) => {
        setImovel(data);
        if (data) {
          trackView(data.id);
          getViewCount(data.id).then(setViewCount);
          const vistos: string[] = JSON.parse(localStorage.getItem("imoveis_vistos") || "[]");
          if (!vistos.includes(data.id)) {
            vistos.push(data.id);
            if (vistos.length > 100) vistos.shift();
            localStorage.setItem("imoveis_vistos", JSON.stringify(vistos));
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
          <p className="font-body text-xl font-bold text-foreground">Imóvel não encontrado</p>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            Este imóvel pode ter sido removido ou o link está incorreto.
          </p>
        </div>
      </div>
    );
  }

  const priceFormatted = formatPreco(imovel.preco);
  const finalidadeLabel = imovel.finalidade === "locacao" ? "Locação" : "Venda";
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const area = imovel.area_total ?? imovel.area_util ?? 0;

  const statItems = [
    area > 0 ? { icon: Maximize, value: `${area}m²`, label: "Área" } : null,
    (imovel.quartos ?? 0) > 0 ? { icon: Bed, value: String(imovel.quartos), label: "Quartos" } : null,
    (imovel.banheiros ?? 0) > 0 ? { icon: Bath, value: String(imovel.banheiros), label: "Banheiros" } : null,
    (imovel.vagas ?? 0) > 0 ? { icon: Car, value: String(imovel.vagas), label: "Vagas" } : null,
  ].filter(Boolean) as { icon: any; value: string; label: string }[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Gallery */}
      <div className="mt-16 px-6 pt-4">
        {/* Desktop grid */}
        <div className="mx-auto hidden max-w-7xl gap-2 sm:grid sm:grid-cols-4 sm:grid-rows-2" style={{ height: 480 }}>
          <button
            onClick={() => { setCurrentImage(0); setGalleryOpen(true); }}
            className="group relative col-span-2 row-span-2 overflow-hidden rounded-l-2xl"
          >
            <img src={images[0]} alt={imovel.titulo} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          </button>
          {images.slice(1, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => { setCurrentImage(i + 1); setGalleryOpen(true); }}
              className={`group relative overflow-hidden ${
                i === 1 ? "rounded-tr-2xl" : i === 3 ? "rounded-br-2xl" : ""
              }`}
            >
              <img src={img} alt={`Foto ${i + 2}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              {i === 3 && images.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="font-body text-sm font-semibold text-white">+{images.length - 5} fotos</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* "Ver todas" button */}
        {images.length > 1 && (
          <div className="mx-auto mt-3 hidden max-w-7xl justify-end sm:flex">
            <button
              onClick={() => { setCurrentImage(0); setGalleryOpen(true); }}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-body text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary active:scale-[0.97]"
            >
              <Camera className="h-3.5 w-3.5" />
              Ver todas as {images.length} fotos
            </button>
          </div>
        )}

        {/* Mobile carousel */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:hidden">
          <img src={images[currentImage]} alt={imovel.titulo} className="h-full w-full object-cover" />
          <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow active:scale-95">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow active:scale-95">
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1">
            <span className="font-body text-xs text-white">{currentImage + 1} / {images.length}</span>
          </div>
        </div>
      </div>

      {/* Fullscreen gallery */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute right-6 top-6 rounded-full bg-white/10 px-4 py-2 font-body text-sm text-white hover:bg-white/20 active:scale-95"
          >
            ✕ Fechar
          </button>
          <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 active:scale-95">
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <img src={images[currentImage]} alt={`Foto ${currentImage + 1}`} className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain" />
          <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 active:scale-95">
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentImage ? "w-6 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex-1 space-y-8 lg:max-w-[63%]"
          >
            {/* Breadcrumb */}
            <nav className="font-body text-xs text-muted-foreground">
              <Link to="/busca" className="hover:text-foreground">Imóveis</Link>
              {" › "}
              <Link to={`/busca?bairro=${encodeURIComponent(imovel.bairro)}`} className="hover:text-foreground">{imovel.bairro}</Link>
              {" › "}
              <span className="text-foreground">{capitalize(imovel.tipo)}</span>
            </nav>

            {/* Badge + title */}
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary">
                {finalidadeLabel}
              </span>
              <h1 className="mt-3 font-body text-[clamp(1.5rem,4vw,2rem)] font-extrabold leading-tight tracking-tight text-foreground" style={{ textWrap: "balance" }}>
                {imovel.titulo}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 font-body text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {imovel.bairro}, {imovel.cidade}
              </p>
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
            <div className="flex flex-wrap gap-3">
              {statItems.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-body text-base font-bold text-foreground">{value}</p>
                    <p className="font-body text-[11px] text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-border" />

            {/* Description */}
            {imovel.descricao && (
              <div>
                <h2 className="font-body text-lg font-bold text-foreground">Sobre o imóvel</h2>
                <p className="mt-3 font-body text-sm leading-[1.8] text-muted-foreground" style={{ maxWidth: "65ch" }}>
                  {imovel.descricao}
                </p>
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
              <div>
                <h2 className="font-body text-lg font-bold text-foreground">Localização</h2>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  {imovel.bairro}, Porto Alegre — endereço exato após contato
                </p>
                <div className="mt-4">
                  <PropertyMap
                    neighborhood={imovel.bairro}
                    city={imovel.cidade}
                    lat={imovel.latitude}
                    lng={imovel.longitude}
                  />
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
            <LeadSidebar
              imovelId={imovel.id}
              imovelSlug={imovel.slug}
              imovelTitulo={imovel.titulo}
              imovelBairro={imovel.bairro}
              imovelPreco={imovel.preco}
              viewCount={viewCount}
            />

            {/* Secondary actions below sidebar */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setLiked(!liked)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 font-body text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:scale-[0.97]"
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                Salvar
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  import("sonner").then(({ toast }) => toast.success("Link copiado!"));
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 font-body text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:scale-[0.97]"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
