import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FotoImovel } from "@/components/FotoImovel";
import { supabase } from "@/integrations/supabase/client";
import { useCanonical } from "@/hooks/useCanonical";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Loader2, Building2 } from "lucide-react";

interface CondominioData {
  condominio_nome: string;
  bairro: string;
  total: number;
  foto: string;
  precoMin: number;
  tipos: string[];
}

interface BairroGroup {
  bairro: string;
  condominios: CondominioData[];
  totalImoveis: number;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const TOP_BAIRROS = [
  "Moinhos de Vento", "Petrópolis", "Rio Branco", "Menino Deus",
  "Centro", "Cidade Baixa", "Tristeza", "Auxiliadora", "Bela Vista",
  "Praia de Belas", "Três Figueiras", "Navegantes", "Zona Nova",
];

async function fetchCondominios(): Promise<BairroGroup[]> {
  const { data, error } = await supabase
    .from("imoveis")
    .select("condominio_nome, bairro, preco, fotos, tipo")
    .eq("status", "disponivel")
    .not("condominio_nome", "is", null);

  if (error || !data) return [];

  // Group by condominio_nome
  const byName: Record<string, {
    bairro: string;
    total: number;
    foto: string;
    precoMin: number;
    tipos: Set<string>;
  }> = {};

  for (const row of data) {
    const name = (row as any).condominio_nome?.trim();
    if (!name) continue;

    if (!byName[name]) {
      const fotos = (row.fotos as any[]) || [];
      const fotoUrl = fotos.length > 0 ? fotos[0]?.url || fotos[0]?.link || "" : "";
      byName[name] = {
        bairro: row.bairro,
        total: 0,
        foto: fotoUrl,
        precoMin: row.preco,
        tipos: new Set(),
      };
    }
    byName[name].total++;
    if (row.preco < byName[name].precoMin) byName[name].precoMin = row.preco;
    if (row.tipo) byName[name].tipos.add(row.tipo);
  }

  // Group condominios by bairro
  const byBairro: Record<string, CondominioData[]> = {};
  for (const [name, info] of Object.entries(byName)) {
    if (info.total < 1 || !info.foto) continue;
    if (!byBairro[info.bairro]) byBairro[info.bairro] = [];
    byBairro[info.bairro].push({
      condominio_nome: name,
      bairro: info.bairro,
      total: info.total,
      foto: info.foto,
      precoMin: info.precoMin,
      tipos: Array.from(info.tipos),
    });
  }

  // Sort condominios within each bairro by total desc
  for (const b of Object.keys(byBairro)) {
    byBairro[b].sort((a, c) => c.total - a.total);
  }

  // Order bairros
  const orderedBairros = [
    ...TOP_BAIRROS.filter((b) => byBairro[b]),
    ...Object.keys(byBairro).filter((b) => !TOP_BAIRROS.includes(b)).sort(),
  ];

  return orderedBairros.map((bairro) => ({
    bairro,
    condominios: byBairro[bairro].slice(0, 25),
    totalImoveis: byBairro[bairro].reduce((s, c) => s + c.total, 0),
  })).filter((g) => g.condominios.length >= 1);
}

function formatPreco(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (v >= 1_000) return `R$ ${Math.round(v / 1000)}mil`;
  return `R$ ${v.toLocaleString("pt-BR")}`;
}

function HorizontalCarousel({ items }: { items: CondominioData[] }) {
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
    el.scrollBy({ left: dir === "left" ? -el.clientWidth * 0.75 : el.clientWidth * 0.75, behavior: "smooth" });
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
            key={`${c.condominio_nome}-${i}`}
            to={`/condominios/${slugify(c.condominio_nome)}`}
            className="w-[260px] shrink-0 snap-start sm:w-[300px]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
              <FotoImovel
                src={c.foto}
                alt={c.condominio_nome}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-3 py-1 font-body text-[11px] font-semibold text-background backdrop-blur-sm">
                {c.total} {c.total === 1 ? "imóvel" : "imóveis"}
              </span>
            </div>
            <h3 className="mt-2.5 font-body text-sm font-bold text-foreground leading-snug line-clamp-1">
              {c.condominio_nome}
            </h3>
            <p className="mt-0.5 font-body text-xs text-muted-foreground">
              {c.bairro} · a partir de {formatPreco(c.precoMin)}
            </p>
          </Link>
        ))}
      </div>

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
    document.title = "Condomínios e Empreendimentos em Porto Alegre | Uhome Imóveis";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Explore condomínios e empreendimentos à venda em Porto Alegre. Veja unidades disponíveis, preços e fotos dos melhores prédios da cidade.");

    fetchCondominios().then((g) => {
      setGroups(g);
      setLoading(false);
    });
  }, []);

  const totalCondominios = groups.reduce((s, g) => s + g.condominios.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary pt-24 pb-16 px-5 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <nav className="flex items-center gap-1.5 font-body text-xs text-primary-foreground/70">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Início</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground">Condomínios</span>
          </nav>

          <h1
            className="mt-5 font-body text-3xl font-extrabold text-primary-foreground leading-tight sm:text-4xl"
            style={{ textWrap: "balance" as any }}
          >
            Condomínios e Empreendimentos
          </h1>
          <p className="mt-4 font-body text-base text-primary-foreground/80 leading-relaxed sm:text-lg max-w-xl">
            {loading
              ? "Carregando empreendimentos..."
              : `${totalCondominios} empreendimentos com unidades à venda em Porto Alegre, organizados por bairro.`}
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Building2 className="h-12 w-12 text-muted-foreground/40" />
            <p className="font-body text-sm text-muted-foreground">Nenhum empreendimento encontrado no momento.</p>
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
                  <div>
                    <h2 className="font-body text-xl font-extrabold text-foreground sm:text-2xl">
                      {group.bairro}
                    </h2>
                    <p className="mt-1 font-body text-xs text-muted-foreground">
                      {group.condominios.length} {group.condominios.length === 1 ? "empreendimento" : "empreendimentos"} · {group.totalImoveis} {group.totalImoveis === 1 ? "unidade" : "unidades"}
                    </p>
                  </div>
                  <Link
                    to={`/bairro/${encodeURIComponent(group.bairro.toLowerCase().replace(/\s+/g, "-"))}`}
                    className="shrink-0 font-body text-xs font-semibold text-primary hover:underline"
                  >
                    Ver bairro →
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
