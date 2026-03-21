import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeadSidebar } from "@/components/LeadSidebar";
import { FinancingSimulator } from "@/components/FinancingSimulator";
import { PropertyMap } from "@/components/PropertyMap";
import { Bed, Car, Maximize, Bath, MapPin, Share2, Heart, ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { trackView, getViewCount } from "@/services/leads";
import { fetchImovelBySlug, type Imovel, formatPreco } from "@/services/imoveis";

const PropertyDetail = () => {
  const { slug } = useParams();
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
          // Register in localStorage for "Visualizado" badge
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
          <p className="font-display text-xl font-bold text-foreground">Imóvel não encontrado</p>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            Este imóvel pode ter sido removido ou o link está incorreto.
          </p>
        </div>
      </div>
    );
  }

  const priceFormatted = formatPreco(imovel.preco);
  const finalidadeLabel = imovel.finalidade === "locacao" ? "Locação" : "Venda";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Gallery */}
      <div className="relative mt-16">
        <div className="container-uhome py-4">
          <div className="hidden gap-2 sm:grid sm:grid-cols-4 sm:grid-rows-2 sm:h-[480px]">
            <button
              onClick={() => { setCurrentImage(0); setGalleryOpen(true); }}
              className="relative col-span-1 overflow-hidden rounded-l-2xl sm:col-span-2 sm:row-span-2 group"
            >
              <img
                src={images[0]}
                alt={imovel.titulo}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-background/10 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>

            {images.slice(1, 5).map((img, i) => (
              <button
                key={i}
                onClick={() => { setCurrentImage(i + 1); setGalleryOpen(true); }}
                className={`relative hidden overflow-hidden sm:block group ${
                  i === 1 ? "rounded-tr-2xl" : i === 3 ? "rounded-br-2xl" : ""
                }`}
              >
                <img src={img} alt={`Foto ${i + 2}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-background/10 opacity-0 transition-opacity group-hover:opacity-100" />
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <span className="font-body text-sm font-semibold text-foreground">+{images.length - 5} fotos</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Mobile */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:hidden">
            <img src={images[currentImage]} alt={imovel.titulo} className="h-full w-full object-cover" />
            <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/60 p-2 backdrop-blur-sm active:scale-95">
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/60 p-2 backdrop-blur-sm active:scale-95">
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/60 px-3 py-1 backdrop-blur-sm">
              <span className="font-body text-xs text-foreground">{currentImage + 1} / {images.length}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              <span>{viewCount > 0 ? viewCount : 7} visualizações hoje</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground active:scale-95"
              >
                <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                Salvar
              </button>
              <button className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground active:scale-95">
                <Share2 className="h-3.5 w-3.5" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen gallery */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute right-6 top-6 rounded-full bg-secondary p-2 font-body text-sm text-foreground hover:bg-secondary/80 active:scale-95"
          >
            ✕
          </button>
          <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-secondary p-3 active:scale-95">
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          <img src={images[currentImage]} alt={`Foto ${currentImage + 1}`} className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain" />
          <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-secondary p-3 active:scale-95">
            <ChevronRight className="h-6 w-6 text-foreground" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === currentImage ? "w-6 bg-primary" : "bg-muted-foreground/40 hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container-uhome py-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 space-y-10 lg:max-w-[63%]"
          >
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">
                {finalidadeLabel}
              </span>
              <h1 className="mt-3 text-h1 text-foreground" style={{ textWrap: "balance" }}>
                {imovel.titulo}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 font-body text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {imovel.bairro}, {imovel.cidade}
              </p>
              <p className="mt-4 text-price-lg text-primary">{priceFormatted}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 rounded-2xl border border-border bg-card p-5">
              {[
                (imovel.area_total ?? imovel.area_util ?? 0) > 0 ? { icon: Maximize, value: `${imovel.area_total ?? imovel.area_util}m²`, label: "Área" } : null,
                (imovel.quartos ?? 0) > 0 ? { icon: Bed, value: imovel.quartos, label: "Quartos" } : null,
                (imovel.banheiros ?? 0) > 0 ? { icon: Bath, value: imovel.banheiros, label: "Banheiros" } : null,
                (imovel.vagas ?? 0) > 0 ? { icon: Car, value: imovel.vagas, label: "Vagas" } : null,
              ].filter(Boolean).map((item) => {
                const { icon: Icon, value, label } = item!;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-body text-lg font-bold text-foreground">{value}</p>
                      <p className="font-body text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            {imovel.descricao && (
              <div>
                <h2 className="text-h3 text-foreground">Sobre o imóvel</h2>
                <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground" style={{ maxWidth: "65ch" }}>
                  {imovel.descricao}
                </p>
              </div>
            )}

            {/* Diferenciais */}
            {imovel.diferenciais.length > 0 && (
              <div>
                <h2 className="text-h3 text-foreground">Diferenciais</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {imovel.diferenciais.map((f) => (
                    <span key={f} className="rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {imovel.latitude && imovel.longitude && (
              <PropertyMap
                neighborhood={imovel.bairro}
                city={imovel.cidade}
                lat={imovel.latitude}
                lng={imovel.longitude}
              />
            )}

            {/* Financing */}
            <FinancingSimulator propertyPrice={imovel.preco} />
          </motion.div>

          {/* Right — Lead Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
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
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
