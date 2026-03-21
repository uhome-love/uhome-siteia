import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";
import { useFavoritos } from "@/hooks/useFavoritos";

interface Props {
  imovel: Imovel;
  index: number;
  highlighted?: boolean;
  onHover?: (id: string | null) => void;
}

type BadgeStyle = "novo" | "exclusivo" | "visto";

function getBadge(imovel: Imovel): { label: string; style: BadgeStyle } | null {
  const vistos: string[] = JSON.parse(localStorage.getItem("imoveis_vistos") || "[]");
  if (vistos.includes(imovel.id)) {
    return { label: "Visualizado", style: "visto" };
  }

  if (imovel.publicado_em) {
    const dias = Math.floor(
      (Date.now() - new Date(imovel.publicado_em).getTime()) / 86400000
    );
    if (dias <= 7) return { label: "Novo", style: "novo" };
  }

  if (imovel.destaque) return { label: "Exclusivo", style: "exclusivo" };

  return null;
}

const badgeClasses: Record<BadgeStyle, string> = {
  novo: "bg-white/95 text-foreground",
  exclusivo: "bg-black/80 text-white",
  visto: "bg-primary/15 text-primary border border-primary/30",
};

export function SearchPropertyCard({ imovel, index, highlighted, onHover }: Props) {
  const { isFavorito, toggleFavorito } = useFavoritos();
  const [hovering, setHovering] = useState(false);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const navigate = useNavigate();

  const liked = isFavorito(imovel.id);
  const fotos = imovel.fotos.length > 0 ? imovel.fotos.map((f) => f.url) : [fotoPrincipal(imovel)];
  const price = formatPreco(imovel.preco);
  const area = imovel.area_total ?? imovel.area_util ?? 0;

  const stats = [
    area > 0 ? `${area}m²` : null,
    (imovel.quartos ?? 0) > 0 ? `${imovel.quartos} quartos` : null,
    (imovel.vagas ?? 0) > 0 ? `${imovel.vagas} vaga${imovel.vagas! > 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(" · ");

  const badge = getBadge(imovel);

  const handleMouseEnter = () => { setHovering(true); onHover?.(imovel.id); };
  const handleMouseLeave = () => { setHovering(false); onHover?.(null); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.15) }}
      className={`relative cursor-pointer ${highlighted ? "ring-2 ring-primary rounded-xl" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/imovel/${imovel.slug}`)}
    >
      {/* Mobile: horizontal layout / Desktop: vertical */}
      <div className="flex gap-3 sm:block">
        {/* Photo */}
        <div className="relative w-[120px] shrink-0 overflow-hidden rounded-lg sm:w-full sm:rounded-xl" style={{ aspectRatio: "1/1" }}>
          <img
            src={fotos[fotoAtiva]}
            alt={imovel.titulo}
            loading={index < 6 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 sm:aspect-[4/3]"
            style={{ transform: hovering ? "scale(1.03)" : "scale(1)" }}
          />

          {/* Badge */}
          {badge && (
            <span
              className={`absolute left-1.5 top-1.5 z-10 rounded-md px-2 py-0.5 font-body text-[10px] font-semibold backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-xs ${badgeClasses[badge.style]}`}
            >
              {badge.label}
            </span>
          )}

          {/* Nav arrows on hover (desktop only) */}
          {hovering && fotos.length > 1 && (
            <>
              {fotoAtiva > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setFotoAtiva((i) => i - 1); }}
                  className="absolute left-2 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm shadow transition-transform hover:scale-105 active:scale-95 sm:flex"
                >
                  ‹
                </button>
              )}
              {fotoAtiva < fotos.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setFotoAtiva((i) => i + 1); }}
                  className="absolute right-2 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm shadow transition-transform hover:scale-105 active:scale-95 sm:flex"
                >
                  ›
                </button>
              )}
            </>
          )}

          {/* Heart */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorito(imovel.id); }}
            className="absolute right-1.5 top-1.5 z-10 sm:right-3 sm:top-3"
          >
            <Heart
              className="h-5 w-5 drop-shadow-md transition-colors sm:h-6 sm:w-6"
              fill={liked ? "#ff385c" : "rgba(255,255,255,0.85)"}
              stroke={liked ? "#ff385c" : "rgba(0,0,0,0.3)"}
              strokeWidth={1.5}
            />
          </button>

          {/* Dots (desktop only) */}
          {hovering && fotos.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 z-10 hidden -translate-x-1/2 gap-1 sm:flex">
              {fotos.slice(0, 5).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === fotoAtiva ? 18 : 5,
                    height: 5,
                    background: i === fotoAtiva ? "white" : "rgba(255,255,255,0.55)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Text */}
        <div className="flex min-w-0 flex-1 flex-col justify-center sm:px-0.5 sm:pt-2.5">
          <span className="truncate font-body text-[13px] font-semibold text-foreground">
            {imovel.tipo.charAt(0).toUpperCase() + imovel.tipo.slice(1)} · {imovel.bairro}
          </span>

          {stats && (
            <p className="mt-0.5 truncate font-body text-[11px] text-muted-foreground sm:text-xs">{stats}</p>
          )}

          <p className="mt-1 font-body text-[15px] font-bold text-foreground sm:text-sm">{price}</p>
        </div>
      </div>
    </motion.div>
  );
}
