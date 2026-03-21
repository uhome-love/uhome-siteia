import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bed, Car, Maximize, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { LeadFormInline } from "@/components/LeadFormInline";
import type { MockProperty } from "@/data/properties";

export function SearchPropertyCard({ property, index }: { property: MockProperty; index: number }) {
  const [liked, setLiked] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <div className="overflow-hidden rounded-xl bg-card hover-lift">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div
            className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden sm:aspect-auto sm:h-48 sm:w-56 sm:shrink-0"
            onClick={() => navigate(`/imovel/${property.slug}`)}
          >
            <img
              src={property.image}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
            {property.badge && (
              <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-0.5 font-body text-[10px] font-semibold text-primary-foreground">
                {property.badge}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
              className="absolute right-2 top-2 rounded-full bg-black/30 p-1.5 backdrop-blur-sm active:scale-95"
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
            </button>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-body text-[11px] text-muted-foreground">{property.neighborhood}</p>
                  <h3
                    className="mt-0.5 cursor-pointer font-body text-sm font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors"
                    onClick={() => navigate(`/imovel/${property.slug}`)}
                  >
                    {property.title}
                  </h3>
                </div>
              </div>

              <p className="mt-2 font-display text-lg font-bold text-primary">{property.priceFormatted}</p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                  <Maximize className="h-3 w-3" /> {property.area}m²
                </span>
                {property.bedrooms > 0 && (
                  <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                    <Bed className="h-3 w-3" /> {property.bedrooms}
                  </span>
                )}
                <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                  <Car className="h-3 w-3" /> {property.parking}
                </span>
              </div>
              <button
                onClick={() => setShowLead(!showLead)}
                className="rounded-lg border border-primary/30 px-3 py-1.5 font-body text-[11px] font-medium text-primary transition-all hover:bg-primary/10 active:scale-[0.97]"
              >
                Tenho interesse
              </button>
            </div>
          </div>
        </div>

        <LeadFormInline
          isOpen={showLead}
          imovelId={property.id}
          imovelTitulo={property.title}
          imovelBairro={property.neighborhood}
          imovelPreco={property.price}
          onClose={() => setShowLead(false)}
        />
      </div>
    </motion.div>
  );
}
