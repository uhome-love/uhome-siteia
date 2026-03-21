import { motion } from "framer-motion";
import { Bed, Car, Maximize, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LeadFormInline } from "@/components/LeadFormInline";
import { fetchImoveisDestaque, type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";

function PropertyCard({ imovel, index }: { imovel: Imovel; index: number }) {
  const [liked, setLiked] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const navigate = useNavigate();

  const image = fotoPrincipal(imovel);
  const priceFormatted = formatPreco(imovel.preco);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group w-[300px] flex-shrink-0 sm:w-auto"
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
        {/* Image */}
        <div
          className="relative cursor-pointer overflow-hidden"
          style={{ aspectRatio: '4/3', borderRadius: '12px 12px 0 0' }}
          onClick={() => navigate(`/imovel/${imovel.slug}`)}
        >
          <img
            src={image}
            alt={imovel.titulo}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Badge tipo */}
          <span
            className="absolute left-3 top-3 font-body"
            style={{
              background: 'hsl(233 100% 97%)',
              color: 'hsl(235 93% 67%)',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 10px',
            }}
          >
            {imovel.finalidade === "locacao" ? "Locação" : "Venda"}
          </span>
          {/* Badge destaque */}
          {imovel.destaque && (
            <span
              className="absolute left-3 top-10 font-body"
              style={{
                background: 'hsl(235 93% 67%)',
                color: '#fff',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 10px',
              }}
            >
              Destaque
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className="absolute right-3 top-3 rounded-full bg-black/30 p-2 backdrop-blur-sm transition-colors hover:bg-black/50 active:scale-95"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="font-body text-xs text-muted-foreground">{imovel.bairro}</p>
          <h3 className="mt-1 font-body text-sm font-semibold text-foreground line-clamp-1">
            {imovel.titulo}
          </h3>
          <p className="mt-2 font-mono text-lg font-bold text-foreground">{priceFormatted}</p>

          <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
            {(imovel.area_total ?? imovel.area_util ?? 0) > 0 && (
              <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                <Maximize className="h-3.5 w-3.5" /> {imovel.area_total ?? imovel.area_util}m²
              </span>
            )}
            {(imovel.quartos ?? 0) > 0 && (
              <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                <Bed className="h-3.5 w-3.5" /> {imovel.quartos}
              </span>
            )}
            {(imovel.vagas ?? 0) > 0 && (
              <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                <Car className="h-3.5 w-3.5" /> {imovel.vagas}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowLead(!showLead)}
            className="mt-3 w-full rounded-full border-[1.5px] border-primary py-2 font-body text-xs font-semibold text-primary transition-all hover:bg-[hsl(233_100%_97%)] active:scale-[0.97]"
          >
            Tenho interesse
          </button>
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

export function FeaturedProperties() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);

  useEffect(() => {
    fetchImoveisDestaque(6).then(setImoveis).catch(console.error);
  }, []);

  if (imoveis.length === 0) return null;

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
             <h2 className="mt-2 text-h2 text-foreground text-balance">
               Imóveis em destaque
            </h2>
          </div>
          <Link to="/busca" className="hidden font-body text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:block">
            Ver todos →
          </Link>
        </motion.div>

        <div className="mt-10 flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
          {imoveis.map((imovel, i) => (
            <PropertyCard key={imovel.id} imovel={imovel} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
