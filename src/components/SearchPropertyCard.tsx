import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";

interface Props {
  imovel: Imovel;
  index: number;
  highlighted?: boolean;
  onHover?: (id: string | null) => void;
}

export function SearchPropertyCard({ imovel, index, highlighted, onHover }: Props) {
  const [liked, setLiked] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const navigate = useNavigate();

  const fotos = imovel.fotos.length > 0 ? imovel.fotos.map((f) => f.url) : [fotoPrincipal(imovel)];
  const price = formatPreco(imovel.preco);
  const area = imovel.area_total ?? imovel.area_util ?? 0;

  const stats = [
    area > 0 ? `${area}m²` : null,
    (imovel.quartos ?? 0) > 0 ? `${imovel.quartos} quartos` : null,
    (imovel.vagas ?? 0) > 0 ? `${imovel.vagas} vaga${imovel.vagas! > 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(" · ");

  const handleMouseEnter = () => { setHovering(true); onHover?.(imovel.id); };
  const handleMouseLeave = () => { setHovering(false); onHover?.(null); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.15) }}
      className="cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/imovel/${imovel.slug}`)}
    >
      {/* Photo — square */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ aspectRatio: "1/1" }}
      >
        <img
          src={fotos[fotoAtiva]}
          alt={imovel.titulo}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500"
          style={{ transform: hovering ? "scale(1.03)" : "scale(1)" }}
        />

        {/* Nav arrows on hover */}
        {hovering && fotos.length > 1 && (
          <>
            {fotoAtiva > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setFotoAtiva((i) => i - 1); }}
                className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm shadow transition-transform hover:scale-105 active:scale-95"
              >
                ‹
              </button>
            )}
            {fotoAtiva < fotos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setFotoAtiva((i) => i + 1); }}
                className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm shadow transition-transform hover:scale-105 active:scale-95"
              >
                ›
              </button>
            )}
          </>
        )}

        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute right-3 top-3 z-10"
        >
          <Heart
            className="h-6 w-6 drop-shadow-md transition-colors"
            fill={liked ? "#ff385c" : "rgba(255,255,255,0.85)"}
            stroke={liked ? "#ff385c" : "rgba(0,0,0,0.3)"}
            strokeWidth={1.5}
          />
        </button>

        {/* Dots */}
        {hovering && fotos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-[3px]">
            {fotos.slice(0, 5).map((_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 5, height: 5,
                  background: i === fotoAtiva ? "white" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Text — no box */}
      <div className="px-0.5 pt-2.5">
        {/* Line 1: type · neighborhood */}
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-body text-sm font-semibold text-foreground">
            {imovel.tipo} · {imovel.bairro}
          </span>
          {imovel.destaque && (
            <span className="shrink-0 font-body text-xs text-foreground">★ Destaque</span>
          )}
        </div>

        {/* Line 2: stats */}
        {stats && (
          <p className="mt-0.5 truncate font-body text-[13px] text-muted-foreground">{stats}</p>
        )}

        {/* Line 3: price */}
        <p className="mt-1 font-body text-sm font-bold text-foreground">{price}</p>
      </div>

      {/* Highlighted border from map hover */}
      {highlighted && (
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary" />
      )}
    </motion.div>
  );
}
