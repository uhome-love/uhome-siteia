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
      <div
        className="overflow-hidden bg-card transition-all duration-200 ease-out hover:-translate-y-[3px]"
        style={{
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(91,108,249,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(91,108,249,0.15)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(91,108,249,0.08), 0 0 0 1px rgba(0,0,0,0.04)'; }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div
            className="relative w-full cursor-pointer overflow-hidden sm:h-48 sm:w-56 sm:shrink-0"
            style={{ aspectRatio: '4/3', borderRadius: '12px 12px 0 0' }}
            onClick={() => navigate(`/imovel/${property.slug}`)}
          >
            <img
              src={property.image}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
            {/* Badge tipo */}
            <span
              className="absolute left-2 top-2 font-body"
              style={{
                background: 'hsl(233 100% 97%)',
                color: 'hsl(235 93% 67%)',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                padding: '3px 8px',
              }}
            >
              {property.tipo}
            </span>
            {/* Badge destaque */}
            {property.badge && (
              <span
                className="absolute left-2 top-8 font-body"
                style={{
                  background: 'hsl(235 93% 67%)',
                  color: '#fff',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 8px',
                }}
              >
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
              <p className="font-body text-[11px] text-muted-foreground">{property.neighborhood}</p>
              <h3
                className="mt-0.5 cursor-pointer font-body text-sm font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors"
                onClick={() => navigate(`/imovel/${property.slug}`)}
              >
                {property.title}
              </h3>
              <p className="mt-2 font-mono text-lg font-bold text-foreground">{property.priceFormatted}</p>
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
                className="rounded-full border-[1.5px] border-primary px-3 py-1.5 font-body text-[11px] font-semibold text-primary transition-all hover:bg-[hsl(233_100%_97%)] active:scale-[0.97]"
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
