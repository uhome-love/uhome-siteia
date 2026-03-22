import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FotoImovel } from "@/components/FotoImovel";
import { supabase } from "@/integrations/supabase/client";
import { useCanonical } from "@/hooks/useCanonical";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Building2, Loader2 } from "lucide-react";

interface Condominio {
  endereco: string;
  bairro: string;
  total: number;
  foto: string;
  precoMin: number;
}

interface BairroGroup {
  bairro: string;
  condominios: Condominio[];
  totalImoveis: number;
}

const TOP_BAIRROS = [
  "Petrópolis", "Moinhos de Vento", "Menino Deus", "Centro Histórico",
  "Tristeza", "Rio Branco", "Auxiliadora", "Cristal", "Floresta", "Bela Vista",
];

async function fetchCondominios(): Promise<BairroGroup[]> {
  const { data, error } = await supabase
    .from("imoveis")
    .select("endereco_completo, bairro, preco, fotos")
    .eq("status", "disponivel")
    .not("endereco_completo", "is", null);

  if (error || !data) return [];

  // Group by bairro -> endereco
  const byBairro: Record<string, Record<string, { total: number; foto: string; precoMin: number }>> = {};

  for (const row of data) {
    const addr = row.endereco_completo?.trim();
    const bairro = row.bairro;
    if (!addr || !bairro) continue;

    if (!byBairro[bairro]) byBairro[bairro] = {};
    if (!byBairro[bairro][addr]) {
      const fotos = (row.fotos as any[]) || [];
      const fotoUrl = fotos.length > 0 ? fotos[0]?.url || "" : "";
      byBairro[bairro][addr] = { total: 0, foto: fotoUrl, precoMin: row.preco };
    }
    byBairro[bairro][addr].total++;
    if (row.preco < byBairro[bairro][addr].precoMin) {
      byBairro[bairro][addr].precoMin = row.preco;
    }
  }

  // Build groups, prioritize TOP_BAIRROS order
  const orderedBairros = [
    ...TOP_BAIRROS.filter(b => byBairro[b]),
    ...Object.keys(byBairro).filter(b => !TOP_BAIRROS.includes(b)).sort(),
  ];

  return orderedBairros.map(bairro => {
    const addrs = byBairro[bairro];
    const condominios = Object.entries(addrs)
      .filter(([_, v]) => v.total >= 2 && v.foto)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 20)
      .map(([endereco, v]) => ({
        endereco,
        bairro,
        total: v.total,
        foto: v.foto,
        precoMin: v.precoMin,
      }));

    const totalImoveis = Object.values(addrs).reduce((s, v) => s + v.total, 0);
    return { bairro, condominios, totalImoveis };
  }).filter(g => g.condominios.length >= 2);
}

function HorizontalCarousel({ items }: { items: Condominio[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
      >
        {items.map((c, i) => (
          <Link
            key={`${c.endereco}-${i}`}
            to={`/busca?q=${encodeURIComponent(c.endereco)}`}
            className="w-[260px] shrink-0 snap-start sm:w-[300px]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
              <FotoImovel
                src={c.foto}
                alt={c.endereco}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-3 py-1 font-body text-[11px] font-semibold text-background backdrop-blur-sm">
                {c.total} imóveis disponíveis
              </span>
            </div>
            <h3 className="mt-2 font-body text-sm font-bold text-foreground leading-snug line-clamp-2">
              {c.endereco}
            </h3>
            <p className="mt-0.5 font-body text-xs text-muted-foreground">
              {c.bairro} · a partir de R$ {c.precoMin.toLocaleString("pt-BR")}
            </p>
          </Link>
        ))}
      </div>

      {/* Nav arrows — desktop */}
      {canLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-[35%] z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:bg-secondary sm:flex"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      )}
      {canRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-[35%] z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:bg-secondary sm:flex"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      )}
    </div>
  );
}

const Condominios = () => {
  useCanonical();
  const [groups, setGroups] = useState<BairroGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Condomínios em Porto Alegre | Uhome Imóveis";
    fetchCondominios().then((g) => {
      setGroups(g);
      setLoading(false);
    });
  }, []);

  const totalCondominios = groups.reduce((s, g) => s + g.condominios.length, 0);
  const totalImoveis = groups.reduce((s, g) => s + g.totalImoveis, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary pt-24 pb-16 px-5 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 font-body text-xs text-primary-foreground/70">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Início</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground">Condomínios</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground">Porto Alegre</span>
          </nav>

          <h1 className="mt-5 font-body text-3xl font-extrabold text-primary-foreground leading-tight sm:text-4xl" style={{ textWrap: "balance" as any }}>
            Condomínios em Porto Alegre
          </h1>
          <p className="mt-4 font-body text-base text-primary-foreground/80 leading-relaxed sm:text-lg max-w-xl">
            {loading
              ? "Carregando condomínios..."
              : `São ${totalCondominios.toLocaleString("pt-BR")} condomínios em Porto Alegre para você explorar e descobrir qual atende suas necessidades.`}
          </p>

          <Link
            to="/busca"
            className="mt-6 inline-block rounded-full bg-primary-foreground px-6 py-3 font-body text-sm font-bold text-primary transition-all hover:shadow-lg active:scale-[0.97]"
          >
            Explorar condomínios
          </Link>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-14 sm:space-y-20">
            {groups.map((group, gi) => (
              <motion.section
                key={group.bairro}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: Math.min(gi * 0.05, 0.2) }}
              >
                <div className="flex items-end justify-between mb-5">
                  <h2 className="font-body text-xl font-extrabold text-foreground sm:text-2xl">
                    Condomínios em {group.bairro}
                  </h2>
                  <Link
                    to={`/busca?q=${encodeURIComponent(group.bairro)}`}
                    className="shrink-0 font-body text-xs font-semibold text-primary hover:underline"
                  >
                    Ver todos →
                  </Link>
                </div>
                <HorizontalCarousel items={group.condominios} />
              </motion.section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Condominios;
