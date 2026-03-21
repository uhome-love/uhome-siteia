import { motion } from "framer-motion";
import { Bed, Car, Maximize, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeadFormInline } from "@/components/LeadFormInline";

interface Property {
  id: string;
  slug?: string;
  title: string;
  neighborhood: string;
  price: string;
  priceLabel: string;
  priceNumeric?: number;
  area: number;
  bedrooms: number;
  parking: number;
  image: string;
  badge?: string;
}

const properties: Property[] = [
  {
    id: "1", slug: "apartamento-moinhos-de-vento", title: "Apartamento no Moinhos", neighborhood: "Moinhos de Vento",
    price: "R$ 1.850.000", priceLabel: "Venda", priceNumeric: 1850000, area: 142, bedrooms: 3, parking: 2,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
    badge: "Destaque",
  },
  {
    id: "2", slug: "cobertura-duplex-petropolis", title: "Cobertura Duplex Petrópolis", neighborhood: "Petrópolis",
    price: "R$ 2.490.000", priceLabel: "Venda", priceNumeric: 2490000, area: 228, bedrooms: 4, parking: 3,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
  },
  {
    id: "3", slug: "studio-moderno-bela-vista", title: "Studio Moderno Bela Vista", neighborhood: "Bela Vista",
    price: "R$ 2.200/mês", priceLabel: "Aluguel", priceNumeric: 2200, area: 38, bedrooms: 1, parking: 1,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop",
    badge: "Novo",
  },
  {
    id: "4", slug: "casa-tres-figueiras", title: "Casa com Jardim Três Figueiras", neighborhood: "Três Figueiras",
    price: "R$ 3.200.000", priceLabel: "Venda", priceNumeric: 3200000, area: 320, bedrooms: 5, parking: 4,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
  },
  {
    id: "5", slug: "apto-reformado-boa-vista", title: "Apto Reformado Boa Vista", neighborhood: "Boa Vista",
    price: "R$ 3.800/mês", priceLabel: "Aluguel", priceNumeric: 3800, area: 95, bedrooms: 2, parking: 1,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
  },
  {
    id: "6", slug: "loft-montserrat", title: "Loft Mont'Serrat", neighborhood: "Mont'Serrat",
    price: "R$ 890.000", priceLabel: "Venda", priceNumeric: 890000, area: 68, bedrooms: 1, parking: 1,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
    badge: "Exclusivo",
  },
];

function PropertyCard({ property, index }: { property: Property; index: number }) {
  const [liked, setLiked] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group w-[300px] flex-shrink-0 sm:w-auto"
    >
      <div className="overflow-hidden rounded-2xl bg-card hover-lift">
        {/* Image — clickable to detail */}
        <div
          className="relative aspect-[4/3] cursor-pointer overflow-hidden"
          onClick={() => navigate(`/imovel/${property.slug || property.id}`)}
        >
          <img
            src={property.image}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {property.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 font-body text-xs font-semibold text-primary-foreground">
              {property.badge}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className="absolute right-3 top-3 rounded-full bg-black/30 p-2 backdrop-blur-sm transition-colors hover:bg-black/50 active:scale-95"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          </button>
          <div className="absolute bottom-3 left-3">
            <span className="rounded-md bg-black/40 px-2 py-1 font-body text-xs text-white/80 backdrop-blur-sm">
              {property.priceLabel}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="font-body text-xs text-muted-foreground">{property.neighborhood}</p>
          <h3 className="mt-1 font-body text-sm font-semibold text-foreground line-clamp-1">
            {property.title}
          </h3>
          <p className="mt-2 font-display text-lg font-bold text-primary">{property.price}</p>

          <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
            <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
              <Maximize className="h-3.5 w-3.5" /> {property.area}m²
            </span>
            <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
              <Bed className="h-3.5 w-3.5" /> {property.bedrooms}
            </span>
            <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
              <Car className="h-3.5 w-3.5" /> {property.parking}
            </span>
          </div>

          {/* CTA button */}
          <button
            onClick={() => setShowLead(!showLead)}
            className="mt-3 w-full rounded-lg border border-primary/30 py-2 font-body text-xs font-medium text-primary transition-all hover:bg-primary/10 active:scale-[0.97]"
          >
            Tenho interesse
          </button>
        </div>

        {/* Inline lead form */}
        <LeadFormInline
          isOpen={showLead}
          imovelId={property.id}
          imovelTitulo={property.title}
          imovelBairro={property.neighborhood}
          imovelPreco={property.priceNumeric}
          onClose={() => setShowLead(false)}
        />
      </div>
    </motion.div>
  );
}

export function FeaturedProperties() {
  return (
    <section className="py-24">
      <div className="container-uhome">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between"
        >
          <div>
            <p className="font-body text-sm font-medium uppercase tracking-[0.15em] text-primary">
              Seleção
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl text-balance">
              Imóveis em destaque
            </h2>
          </div>
          <button className="hidden font-body text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:block">
            Ver todos →
          </button>
        </motion.div>

        <div className="mt-10 flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
          {properties.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
