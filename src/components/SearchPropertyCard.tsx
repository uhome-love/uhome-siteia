import React, { useState, useRef, useCallback, useEffect, forwardRef } from "react";
import { AuthModal } from "@/components/AuthModal";
import { Heart, TrendingDown, Sparkles, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";
import { FotoImovel } from "@/components/FotoImovel";
import { useCorretor } from "@/contexts/CorretorContext";
import { supabase } from "@/integrations/supabase/client";
import { getBairroStats } from "@/services/bairroStatsCache";

interface Props {
  imovel: Imovel;
  index: number;
  highlighted?: boolean;
  onHover?: (id: string | null) => void;
  isFavorito?: (id: string) => boolean;
  toggleFavorito?: (id: string) => Promise<"needs_auth" | void>;
}

type BadgeStyle = "novo" | "exclusivo" | "visto" | "otimo-preco" | "oportunidade" | "em-obras" | "lancamento" | "novo-imovel";

interface SmartBadge {
  label: string;
  style: BadgeStyle;
  icon?: React.ReactNode;
}

function getBaseBadges(imovel: Imovel): SmartBadge[] {
  const badges: SmartBadge[] = [];

  // Fase badges — highest visual priority
  if (imovel.fase === "em_construcao") {
    badges.push({ label: "Em obras", style: "em-obras" });
  } else if (imovel.fase === "na_planta") {
    badges.push({ label: "Lançamento", style: "lancamento" });
  } else if (imovel.fase === "novo") {
    badges.push({ label: "Novo", style: "novo-imovel" });
  }


  // Novidade — using real jetimob registration date (now in publicado_em)
  if (imovel.publicado_em) {
    const dias = Math.floor(
      (Date.now() - new Date(imovel.publicado_em).getTime()) / 86400000
    );
    if (dias <= 15) badges.push({ label: "Novidade", style: "novo", icon: <Clock className="h-3 w-3" /> });
  }

  // Visualizado — lowest priority
  const vistos: string[] = JSON.parse(localStorage.getItem("imoveis_vistos") || "[]");
  if (vistos.includes(imovel.id)) {
    badges.push({ label: "Visualizado", style: "visto" });
  }

  return badges;
}

const badgeClasses: Record<BadgeStyle, string> = {
  novo: "bg-primary/90 text-primary-foreground font-semibold shadow-sm",
  
  exclusivo: "bg-foreground text-background font-semibold shadow-sm",
  visto: "bg-white/90 text-foreground font-semibold shadow-sm backdrop-blur-sm",
  "otimo-preco": "bg-white/95 text-primary font-bold shadow-sm backdrop-blur-sm border border-primary/20",
  oportunidade: "bg-white/95 text-primary font-bold shadow-sm backdrop-blur-sm border border-primary/20",
  "em-obras": "bg-amber-500/90 text-white font-semibold shadow-sm",
  lancamento: "bg-emerald-500/90 text-white font-semibold shadow-sm",
  "novo-imovel": "bg-sky-500/90 text-white font-semibold shadow-sm",
};

export const SearchPropertyCard = forwardRef<HTMLAnchorElement, Props>(function SearchPropertyCard({ imovel, index, highlighted, onHover, isFavorito: isFavoritoProp, toggleFavorito: toggleFavoritoProp }, ref) {
  const [hovering, setHovering] = useState(false);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [lazyFotos, setLazyFotos] = useState<string[] | null>(null);
  const [loadingFotos, setLoadingFotos] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const fotosLoadedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const { prefixLink } = useCorretor();
  const isFavorito = isFavoritoProp ?? (() => false);
  const toggleFavorito = toggleFavoritoProp ?? (async () => undefined as "needs_auth" | void);
  const liked = isFavorito(imovel.id);
  const baseFotos = (() => {
    // Use foto_principal directly (always available from listing query)
    if (imovel.fotos && imovel.fotos.length > 0) {
      const urls = imovel.fotos.map((f) => f.url).filter(Boolean);
      if (urls.length > 0) return urls;
    }
    const fp = fotoPrincipal(imovel);
    return fp ? [fp] : [];
  })();
  const fotos = lazyFotos && lazyFotos.length > 0 ? lazyFotos : baseFotos;

  // Load full photo set lazily
  const loadFullFotos = useCallback(() => {
    if (fotosLoadedRef.current || baseFotos.length > 1) return;
    fotosLoadedRef.current = true;
    setLoadingFotos(true);
    supabase
      .from("imoveis")
      .select("fotos")
      .eq("id", imovel.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.fotos && Array.isArray(data.fotos) && data.fotos.length > 0) {
          const urls = (data.fotos as any[])
            .sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0))
            .map((f: any) => f?.url || f?.src || f)
            .filter(Boolean)
            .slice(0, 8);
          if (urls.length > 0) setLazyFotos(urls);
        }
        setLoadingFotos(false);
      });
  }, [imovel.id, baseFotos.length]);

  // Intersection Observer: detect when card enters viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
          // Auto-load full photos on mobile when card enters viewport
          if (window.innerWidth < 640) loadFullFotos();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadFullFotos]);

  // Merge forwarded ref with internal cardRef
  const mergedRef = useCallback((node: HTMLAnchorElement | null) => {
    (cardRef as React.MutableRefObject<HTMLElement | null>).current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLAnchorElement | null>).current = node;
  }, [ref]);
  const price = formatPreco(imovel.preco);
  const area = imovel.area_util ?? imovel.area_total ?? 0;

  const statsArr = [
    area > 0 ? `${area} m²` : null,
    (imovel.quartos ?? 0) > 0 ? `${imovel.quartos} quarto${imovel.quartos! > 1 ? "s" : ""}` : null,
    (imovel.vagas ?? 0) > 0 ? `${imovel.vagas} vaga${imovel.vagas! > 1 ? "s" : ""}` : null,
  ].filter(Boolean);
  const stats = statsArr.join(" · ");

  // Smart badges: base + price-based (loaded async, only when visible)
  const [smartBadges, setSmartBadges] = useState<SmartBadge[]>(() => getBaseBadges(imovel));
  useEffect(() => {
    if (!isVisible || area <= 0 || imovel.preco <= 0) return;
    const precoM2 = imovel.preco / area;
    getBairroStats().then((stats) => {
      const bairroStat = stats.get(imovel.bairro);
      if (!bairroStat || bairroStat.count < 5) return;
      const ratio = precoM2 / bairroStat.precoM2Medio;
      const newBadges = [...getBaseBadges(imovel)];
      if (ratio <= 0.75) {
        newBadges.unshift({ label: "Oportunidade", style: "oportunidade", icon: <TrendingDown className="h-3 w-3" /> });
      } else if (ratio <= 0.90) {
        newBadges.unshift({ label: "Ótimo preço", style: "otimo-preco", icon: <Sparkles className="h-3 w-3" /> });
      }
      setSmartBadges(newBadges);
    });
  }, [isVisible, imovel.id, imovel.preco, imovel.bairro, area]);

  // Build a short description
  const tipoCapitalized = imovel.tipo.charAt(0).toUpperCase() + imovel.tipo.slice(1);
  const descParts = [
    `${tipoCapitalized} à venda em ${imovel.bairro}`,
  ];
  if ((imovel.quartos ?? 0) > 0) descParts[0] += `. ${imovel.quartos} quarto${imovel.quartos! > 1 ? "s" : ""}`;
  if (imovel.diferenciais.length > 0) {
    descParts[0] += `, ${imovel.diferenciais.slice(0, 2).join(", ").toLowerCase()}`;
  }
  descParts[0] += ".";

  const handleMouseEnter = useCallback(() => {
    setHovering(true);
    onHover?.(imovel.id);
    // Lazy-load full photo set on first hover (desktop)
    loadFullFotos();
  }, [imovel.id, onHover, loadFullFotos]);

  const handleMouseLeave = useCallback(() => { setHovering(false); onHover?.(null); }, [onHover]);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setFotoAtiva(idx);
    // Load full photos on first swipe (mobile)
    if (idx > 0) loadFullFotos();
  }, [loadFullFotos]);

  return (
    <>
    <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    <motion.a
      ref={mergedRef}
      href={prefixLink(`/imovel/${imovel.slug}`)}
      initial={index < 6 ? { opacity: 0, y: 8 } : false}
      animate={index < 6 ? { opacity: 1, y: 0 } : undefined}
      transition={index < 6 ? { duration: 0.3, delay: Math.min(index * 0.03, 0.15) } : undefined}
      className={`relative block w-full min-w-0 cursor-pointer select-none outline-none [&_*]:outline-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] no-underline text-inherit ${highlighted ? "sm:rounded-xl sm:ring-2 sm:ring-primary" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ===== MOBILE: QuintoAndar-style full-width vertical card ===== */}
      <div className="sm:hidden">
        {/* Native scroll-snap carousel */}
        <div className="relative overflow-hidden rounded-xl">
          {fotos.length > 0 ? (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
            style={{ aspectRatio: "4/3", WebkitOverflowScrolling: "touch" }}
          >
            {fotos.slice(0, 7).map((foto, i) => (
              <div
                key={i}
                className="w-full shrink-0 snap-center"
              >
                <FotoImovel
                  src={foto}
                  alt={`${imovel.titulo} - foto ${i + 1}`}
                  loading={index < 4 && i === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 && i === 0 ? "high" : "auto"}
                  decoding="async"
                  className="h-full w-full object-cover"
                  style={{ aspectRatio: "4/3" }}
                />
              </div>
            ))}
          </div>
          ) : (
            <div className="flex items-center justify-center bg-muted" style={{ aspectRatio: "4/3" }}>
              <div className="flex flex-col items-center gap-1 opacity-40">
                <span className="text-3xl">🏠</span>
                <span className="font-body text-[11px] text-muted-foreground">Foto em breve</span>
              </div>
            </div>
          )}

          {/* Badges */}
           <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
              {smartBadges.slice(0, 2).map((b, i) => (
                <span key={i} className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-body text-[11px] ${badgeClasses[b.style]}`}>
                  {b.icon}{b.label}
                </span>
              ))}
            </div>

          {/* Heart */}
          <button
            onClick={async (e) => { e.preventDefault(); e.stopPropagation(); const r = await toggleFavorito(imovel.id); if (r === "needs_auth") setShowAuth(true); }}
            aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
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
          {fotos.length > 1 ? (
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {fotos.slice(0, 7).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: 6,
                    height: 6,
                    background: i === fotoAtiva ? "white" : "rgba(255,255,255,0.5)",
                    transform: i === fotoAtiva ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          ) : loadingFotos ? (
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Text content — QuintoAndar style */}
        <div className="px-1 pt-2.5 pb-1">
          {/* Price */}
          <p className="font-body text-[17px] font-extrabold leading-tight text-foreground">{price}</p>

          {/* Monthly costs inline */}
          {((imovel.preco_condominio ?? 0) > 0 || (imovel.preco_iptu ?? 0) > 0) && (
            <p className="mt-0.5 font-body text-[12px] text-muted-foreground">
              {(imovel.preco_condominio ?? 0) > 0 && `Cond. R$ ${imovel.preco_condominio!.toLocaleString("pt-BR")}`}
              {(imovel.preco_condominio ?? 0) > 0 && (imovel.preco_iptu ?? 0) > 0 && " · "}
              {(imovel.preco_iptu ?? 0) > 0 && `IPTU R$ ${imovel.preco_iptu!.toLocaleString("pt-BR")}`}
            </p>
          )}

          {/* Stats line */}
          {stats && (
            <p className="mt-1.5 font-body text-[13px] text-foreground">{stats}</p>
          )}

          {/* Address */}
          <p className="mt-0.5 font-body text-[12px] text-muted-foreground truncate">
            {imovel.endereco_completo
              ? `${imovel.endereco_completo.split(",")[0]}, ${imovel.bairro}`
              : `${imovel.bairro}, ${imovel.cidade || "Porto Alegre"}`
            }
          </p>
        </div>
      </div>

      {/* ===== DESKTOP: existing vertical card ===== */}
      <div className="hidden w-full sm:block">
        {/* Photo */}
        <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "4/3" }}>
          {fotos.length > 0 ? (
          <FotoImovel
            src={fotos[fotoAtiva]}
            alt={imovel.titulo}
            loading={index < 6 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500"
            style={{ transform: hovering ? "scale(1.03)" : "scale(1)" }}
          />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <div className="flex flex-col items-center gap-1 opacity-40">
                <span className="text-3xl">🏠</span>
                <span className="font-body text-[11px] text-muted-foreground">Foto em breve</span>
              </div>
            </div>
          )}

          {/* Badges */}
          {smartBadges.length > 0 && (
            <div className="absolute left-2.5 top-2.5 z-10 flex flex-wrap gap-1.5">
              {smartBadges.slice(0, 2).map((b, i) => (
                <span key={i} className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-body text-xs ${badgeClasses[b.style]}`}>
                  {b.icon}{b.label}
                </span>
              ))}
            </div>
          )}

          {/* Nav arrows on hover */}
          {hovering && fotos.length > 1 && (
            <>
              {fotoAtiva > 0 && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFotoAtiva((i) => i - 1); }}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm shadow transition-transform hover:scale-105 active:scale-95"
                >
                  ‹
                </button>
              )}
              {fotoAtiva < fotos.length - 1 && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFotoAtiva((i) => i + 1); }}
                  aria-label="Próxima foto"
                  className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm shadow transition-transform hover:scale-105 active:scale-95"
                >
                  ›
                </button>
              )}
            </>
          )}

          {/* Heart */}
          <button
            onClick={async (e) => { e.preventDefault(); e.stopPropagation(); const r = await toggleFavorito(imovel.id); if (r === "needs_auth") setShowAuth(true); }}
            aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
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
            <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1">
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

        {/* Text — QuintoAndar style: price first */}
        <div className="px-0.5 pt-2.5">
          <p className="font-body text-[15px] font-bold text-foreground">{price}</p>

          {((imovel.preco_condominio ?? 0) > 0 || (imovel.preco_iptu ?? 0) > 0) && (
            <p className="mt-0.5 font-body text-[11px] text-muted-foreground">
              {(() => {
                const cond = imovel.preco_condominio ?? 0;
                const iptu = imovel.preco_iptu ?? 0;
                const total = cond + iptu;
                if (total > 0) return `R$ ${total.toLocaleString("pt-BR")} Cond. + IPTU`;
                return null;
              })()}
            </p>
          )}

          {stats && (
            <p className="mt-1 truncate font-body text-[12px] text-foreground">{stats}</p>
          )}

          <p className="mt-0.5 truncate font-body text-[11px] text-muted-foreground">
            {imovel.endereco_completo
              ? `${imovel.endereco_completo.split(",")[0]}, ${imovel.bairro}`
              : `${tipoCapitalized} · ${imovel.bairro}`
            }
          </p>
        </div>
      </div>
    </motion.a>
    </>
  );
});
