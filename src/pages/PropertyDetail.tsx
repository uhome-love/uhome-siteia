import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeadSidebar } from "@/components/LeadSidebar";
import { Bed, Car, Maximize, Bath, MapPin, Share2, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { trackView, getViewCount } from "@/services/leads";

// Mock data — will be replaced by Jetimob API
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
  images: [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
  ],
};

const PropertyDetail = () => {
  const { slug } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const property = mockProperty; // Replace with API call

  useEffect(() => {
    trackView(property.id);
    getViewCount(property.id).then(setViewCount);
  }, [property.id]);

  const nextImage = () => setCurrentImage((i) => (i + 1) % property.images.length);
  const prevImage = () => setCurrentImage((i) => (i - 1 + property.images.length) % property.images.length);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Gallery */}
      <div className="relative mt-16 overflow-hidden">
        <div className="relative aspect-[16/9] max-h-[70vh] w-full sm:aspect-[21/9]">
          <img
            src={property.images[currentImage]}
            alt={property.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

          {/* Navigation */}
          <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 backdrop-blur-sm transition-colors hover:bg-black/60 active:scale-95">
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 backdrop-blur-sm transition-colors hover:bg-black/60 active:scale-95">
            <ChevronRight className="h-5 w-5 text-white" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
            <span className="font-body text-xs text-white">
              {currentImage + 1} / {property.images.length}
            </span>
          </div>

          {/* Actions */}
          <div className="absolute right-4 top-4 flex gap-2">
            <button onClick={() => setLiked(!liked)} className="rounded-full bg-black/40 p-2.5 backdrop-blur-sm transition-colors hover:bg-black/60 active:scale-95">
              <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
            </button>
            <button className="rounded-full bg-black/40 p-2.5 backdrop-blur-sm transition-colors hover:bg-black/60 active:scale-95">
              <Share2 className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="absolute bottom-4 left-4 hidden gap-2 sm:flex">
          {property.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`h-14 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                currentImage === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container-uhome py-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Left — Details (65%) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 lg:max-w-[65%]"
          >
            <span className="rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">
              {property.priceLabel}
            </span>

            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {property.title}
            </h1>

            <p className="mt-2 flex items-center gap-1.5 font-body text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {property.neighborhood}, {property.city}
            </p>

            <p className="mt-4 font-display text-3xl font-bold text-primary">{property.priceFormatted}</p>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-6 border-y border-border py-5">
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
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-foreground">Sobre o imóvel</h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground" style={{ maxWidth: "65ch" }}>
                {property.description}
              </p>
            </div>

            {/* Features */}
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-foreground">Diferenciais</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {property.features.map((f) => (
                  <span key={f} className="rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — Lead Sidebar (35%) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
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
