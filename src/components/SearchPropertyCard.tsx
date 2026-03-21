import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bed, Car, Maximize, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { LeadFormInline } from "@/components/LeadFormInline";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";

export function SearchPropertyCard({ imovel, index }: { imovel: Imovel; index: number }) {
  const [liked, setLiked] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const navigate = useNavigate();

  const image = fotoPrincipal(imovel);
  const priceFormatted = formatPreco(imovel.preco);

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
        <div className="flex flex-col">
          {/* Image */}
          <div
            className="relative w-full cursor-pointer overflow-hidden"
            style={{ aspectRatio: '16/9', borderRadius: '12px 12px 0 0' }}
            onClick={() => navigate(`/imovel/${imovel.slug}`)}
          >
            <img
              src={image}
              alt={imovel.titulo}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
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
              {imovel.tipo}
            </span>
            {imovel.destaque && (
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
                Destaque
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
          <div className="flex flex-1 flex-col justify-between p-3.5">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.05em] text-muted-foreground">{imovel.bairro}</p>
              <h3
                className="mt-0.5 cursor-pointer font-body text-sm font-semibold text-foreground truncate hover:text-primary transition-colors"
                onClick={() => navigate(`/imovel/${imovel.slug}`)}
              >
                {imovel.titulo}
              </h3>
              <p className="mt-1.5 font-mono text-xl font-bold text-foreground whitespace-nowrap">{priceFormatted}</p>
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(imovel.area_total ?? imovel.area_util ?? 0) > 0 && (
                  <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                    <Maximize className="h-3 w-3" /> {imovel.area_total ?? imovel.area_util}m²
                  </span>
                )}
                {(imovel.quartos ?? 0) > 0 && (
                  <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                    <Bed className="h-3 w-3" /> {imovel.quartos}
                  </span>
                )}
                {(imovel.vagas ?? 0) > 0 && (
                  <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                    <Car className="h-3 w-3" /> {imovel.vagas}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowLead(!showLead)}
                className="shrink-0 whitespace-nowrap rounded-full border-[1.5px] border-primary px-2.5 py-1 font-body text-xs font-semibold text-primary transition-all hover:bg-primary/5 active:scale-[0.97]"
              >
                Tenho interesse
              </button>
            </div>
          </div>
        </div>

        <LeadFormInline
          isOpen={showLead}
          imovelId={imovel.id}
          imovelTitulo={imovel.titulo}
          imovelBairro={imovel.bairro}
          imovelPreco={imovel.preco}
          onClose={() => setShowLead(false)}
        />
      </div>
    </motion.div>
  );
}
