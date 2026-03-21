import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";

export function SearchPropertyCard({ imovel, index }: { imovel: Imovel; index: number }) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  const image = fotoPrincipal(imovel);
  const price = formatPreco(imovel.preco);
  const area = imovel.area_total ?? imovel.area_util ?? 0;

  const stats = [
    area > 0 ? `${area}m²` : null,
    (imovel.quartos ?? 0) > 0 ? `${imovel.quartos} quarto${imovel.quartos! > 1 ? "s" : ""}` : null,
    (imovel.vagas ?? 0) > 0 ? `${imovel.vagas} vaga${imovel.vagas! > 1 ? "s" : ""}` : null,
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.2) }}
      className="group cursor-pointer overflow-hidden rounded-xl bg-card transition-all duration-200 hover:-translate-y-0.5"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 6px 20px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)";
      }}
      onClick={() => navigate(`/imovel/${imovel.slug}`)}
    >
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img
          src={image}
          alt={imovel.titulo}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge */}
        {imovel.destaque && (
          <span className="absolute left-2 top-2 rounded bg-card px-2 py-0.5 font-body text-[11px] font-semibold text-foreground shadow-sm">
            Destaque
          </span>
        )}
        <span className="absolute left-2 top-2 rounded bg-card/90 px-2 py-0.5 font-body text-[11px] font-semibold text-foreground shadow-sm" style={{ top: imovel.destaque ? 32 : 8 }}>
          {imovel.tipo}
        </span>
        {/* Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute right-2 top-2 rounded-full bg-black/25 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/40 active:scale-95"
        >
          <Heart
            className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-white"}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="truncate font-body text-[13px] text-muted-foreground">
          {imovel.titulo}
        </p>
        <p className="mt-1 font-mono text-lg font-bold text-foreground">{price}</p>
        {stats.length > 0 && (
          <p className="mt-1 font-body text-[13px] text-muted-foreground">
            {stats.join(" · ")}
          </p>
        )}
        <p className="mt-1 truncate font-body text-xs text-muted-foreground/70">
          {imovel.bairro} · {imovel.cidade}
        </p>
      </div>
    </motion.div>
  );
}
