import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchImoveis, type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";
import { FotoImovel } from "@/components/FotoImovel";
import { Bed, Car, Maximize } from "lucide-react";
import { useCorretor } from "@/contexts/CorretorContext";

interface Props {
  currentId: string;
  bairro: string;
  tipo: string;
  preco: number;
}

export function SimilarProperties({ currentId, bairro, tipo, preco }: Props) {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);

  useEffect(() => {
    async function load() {
      // Try same neighborhood first
      const { data } = await fetchImoveis({
        bairro,
        tipo,
        precoMin: Math.round(preco * 0.6),
        precoMax: Math.round(preco * 1.5),
        limit: 7,
        ordem: "recentes",
      });
      let results = data.filter((i) => i.id !== currentId).slice(0, 6);

      // Fallback: broader search if not enough
      if (results.length < 3) {
        const { data: broader } = await fetchImoveis({
          tipo,
          precoMin: Math.round(preco * 0.7),
          precoMax: Math.round(preco * 1.4),
          limit: 10,
          ordem: "recentes",
        });
        const ids = new Set(results.map((r) => r.id));
        ids.add(currentId);
        for (const item of broader) {
          if (!ids.has(item.id) && results.length < 6) {
            results.push(item);
            ids.add(item.id);
          }
        }
      }

      setImoveis(results);
    }
    load();
  }, [currentId, bairro, tipo, preco]);

  if (imoveis.length === 0) return null;

  return (
    <section className="border-t border-border pt-10 pb-6">
      <h2 className="font-body text-lg font-bold text-foreground">
        Imóveis similares
      </h2>
      <p className="mt-1 font-body text-sm text-muted-foreground">
        Outros imóveis que podem te interessar
      </p>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:gap-5">
        {imoveis.map((imovel, i) => {
          const image = fotoPrincipal(imovel);
          const price = formatPreco(imovel.preco);
          const area = imovel.area_total ?? imovel.area_util ?? 0;

          return (
            <motion.div
              key={imovel.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                to={prefixLink(`/imovel/${imovel.slug}`)}
                className="group block w-[260px] flex-shrink-0 sm:w-auto"
              >
                <div className="overflow-hidden rounded-xl">
                  <FotoImovel
                    src={image}
                    alt={imovel.titulo}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-2.5 px-0.5">
                  <p className="truncate font-body text-[13px] font-semibold text-foreground">
                    {imovel.tipo.charAt(0).toUpperCase() + imovel.tipo.slice(1)} · {imovel.bairro}
                  </p>
                  <div className="mt-0.5 flex items-center gap-3 font-body text-[11px] text-muted-foreground">
                    {area > 0 && (
                      <span className="flex items-center gap-1">
                        <Maximize className="h-3 w-3" /> {area}m²
                      </span>
                    )}
                    {(imovel.quartos ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="h-3 w-3" /> {imovel.quartos}
                      </span>
                    )}
                    {(imovel.vagas ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3" /> {imovel.vagas}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-body text-sm font-bold text-foreground">
                    {price}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
