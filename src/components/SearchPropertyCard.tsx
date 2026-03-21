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
      {/* Photo — 4/3 */}
      <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "4/3" }}>
        <img
          src={fotos[fotoAtiva]}
          alt={imovel.titulo}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500"
          style={{ transform: hovering ? "scale(1.03)" : "scale(1)" }}
        />

        {/* Badge */}
        {badge && (
          <span
            className={`absolute left-2.5 top-2.5 z-10 rounded-md px-2.5 py-1 font-body text-xs font-semibold backdrop-blur-sm ${badgeClasses[badge.style]}`}
          >
            {badge.label}
          </span>
        )}

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

        {/* Gradient + CTA button on hover */}
        {hovering && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/40 to-transparent pt-12 pb-3 px-3 flex flex-col items-center">
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="rounded-full bg-white px-5 py-2 font-body text-[13px] font-semibold text-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 animate-fade-in"
            >
              Tenho interesse
            </button>
          </div>
        )}

        {/* Dots — above gradient */}
        {hovering && fotos.length > 1 && (
          <div className="absolute bottom-14 left-1/2 z-20 flex -translate-x-1/2 gap-1">
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

      {/* Text — no box, fixed height */}
      <div className="px-0.5 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-body text-[13px] font-semibold text-foreground">
            {imovel.tipo} · {imovel.bairro}
          </span>
        </div>

        {stats && (
          <p className="mt-0.5 truncate font-body text-xs text-muted-foreground">{stats}</p>
        )}

        <p className="mt-1 font-body text-sm font-bold text-foreground">{price}</p>
      </div>
    </motion.div>
  );
}
