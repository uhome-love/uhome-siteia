import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeadSidebar } from "@/components/LeadSidebar";
import { FinancingSimulator } from "@/components/FinancingSimulator";
import { PropertyMap } from "@/components/PropertyMap";
import { Bed, Car, Maximize, Bath, MapPin, Share2, Heart, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { trackView, getViewCount } from "@/services/leads";

const mockProperty = {
  id: "1",
  slug: "apartamento-moinhos-de-vento",
  title: "Apartamento no Moinhos de Vento",
  neighborhood: "Moinhos de Vento",
  city: "Porto Alegre",
  price: 1850000,
  priceFormatted: "R$ 1.850.000",
  priceLabel: "Venda",
  area: 142,
  bedrooms: 3,
  bathrooms: 2,
  parking: 2,
  description:
    "Apartamento de alto padrão no coração do Moinhos de Vento. Living amplo com dois ambientes, cozinha integrada com ilha, suíte master com closet e banheira. Acabamentos premium em porcelanato, iluminação planejada e ar-condicionado central. Condomínio com piscina, academia e salão de festas.",
  features: ["Piscina", "Academia", "Salão de festas", "Portaria 24h", "Pet friendly", "Churrasqueira", "Mobiliado"],
  characteristics: [
    { category: "Áreas comuns", items: ["Piscina aquecida", "Academia equipada", "Salão de festas", "Playground", "Bicicletário"] },
    { category: "Segurança", items: ["Portaria 24h", "CFTV", "Controle de acesso", "Cerca elétrica"] },
    { category: "Conforto", items: ["Ar-condicionado central", "Piso aquecido", "Iluminação LED", "Vidros acústicos"] },
  ],
  images: [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop",
  ],
  lat: -30.0277,
  lng: -51.2287,
};

const PropertyDetail = () => {
  const { slug } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const property = mockProperty;

  useEffect(() => {
    trackView(property.id);
    getViewCount(property.id).then(setViewCount);
  }, [property.id]);

  const nextImage = () => setCurrentImage((i) => (i + 1) % property.images.length);
  const prevImage = () => setCurrentImage((i) => (i - 1 + property.images.length) % property.images.length);

  // Keyboard nav for gallery
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setGalleryOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Gallery */}
      <div className="relative mt-16">
        {/* Main image + grid */}
        <div className="container-uhome py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2 sm:h-[480px]">
            {/* Hero image */}
            <button
              onClick={() => { setCurrentImage(0); setGalleryOpen(true); }}
              className="relative col-span-1 overflow-hidden rounded-l-2xl sm:col-span-2 sm:row-span-2 group"
            >
              <img
                src={property.images[0]}
                alt={property.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-background/10 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>

            {/* Secondary images */}
            {property.images.slice(1, 5).map((img, i) => (
              <button
                key={i}
                onClick={() => { setCurrentImage(i + 1); setGalleryOpen(true); }}
                className={`relative hidden overflow-hidden sm:block group ${
                  i === 1 ? "rounded-tr-2xl" : i === 3 ? "rounded-br-2xl" : ""
                }`}
              >
                <img
                  src={img}
                  alt={`Foto ${i + 2}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-background/10 opacity-0 transition-opacity group-hover:opacity-100" />
                {i === 3 && property.images.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <span className="font-body text-sm font-semibold text-foreground">
                      +{property.images.length - 5} fotos
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Mobile: single image with nav */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:hidden">
            <img
              src={property.images[currentImage]}
              alt={property.title}
              className="h-full w-full object-cover"
            />
            <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/60 p-2 backdrop-blur-sm active:scale-95">
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/60 p-2 backdrop-blur-sm active:scale-95">
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/60 px-3 py-1 backdrop-blur-sm">
              <span className="font-body text-xs text-foreground">{currentImage + 1} / {property.images.length}</span>
            </div>
          </div>

          {/* Actions row */}
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

      {/* Fullscreen gallery modal */}
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
          <img
            src={property.images[currentImage]}
            alt={`Foto ${currentImage + 1}`}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
          />
          <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-secondary p-3 active:scale-95">
            <ChevronRight className="h-6 w-6 text-foreground" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {property.images.map((_, i) => (
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
          {/* Left — Details */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 space-y-10 lg:max-w-[63%]"
          >
            {/* Header */}
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">
                {property.priceLabel}
              </span>
              <h1 className="mt-3 font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl" style={{ textWrap: "balance" }}>
                {property.title}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 font-body text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {property.neighborhood}, {property.city}
              </p>
              <p className="mt-4 font-display text-3xl font-bold text-primary">{property.priceFormatted}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 rounded-2xl border border-border bg-card p-5">
              {[
                { icon: Maximize, value: `${property.area}m²`, label: "Área" },
                { icon: Bed, value: property.bedrooms, label: "Quartos" },
                { icon: Bath, value: property.bathrooms, label: "Banheiros" },
                { icon: Car, value: property.parking, label: "Vagas" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-body text-lg font-bold text-foreground">{value}</p>
                    <p className="font-body text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Sobre o imóvel</h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground" style={{ maxWidth: "65ch" }}>
                {property.description}
              </p>
            </div>

            {/* Characteristics */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Características</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-3">
                {property.characteristics.map(({ category, items }) => (
                  <div key={category}>
                    <h3 className="font-body text-sm font-semibold text-foreground">{category}</h3>
                    <ul className="mt-2 space-y-1.5">
                      {items.map((item) => (
                        <li key={item} className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Features tags */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Diferenciais</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {property.features.map((f) => (
                  <span key={f} className="rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Map */}
            <PropertyMap
              neighborhood={property.neighborhood}
              city={property.city}
              lat={property.lat}
              lng={property.lng}
            />

            {/* Financing Simulator */}
            <FinancingSimulator propertyPrice={property.price} />
          </motion.div>

          {/* Right — Lead Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[35%]"
          >
            <LeadSidebar
              imovelId={property.id}
              imovelSlug={property.slug}
              imovelTitulo={property.title}
              imovelBairro={property.neighborhood}
              imovelPreco={property.price}
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
