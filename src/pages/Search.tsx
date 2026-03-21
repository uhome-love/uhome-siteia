import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SearchFiltersPanel } from "@/components/SearchFiltersPanel";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { SearchMap } from "@/components/SearchMap";
import { useSearchStore } from "@/stores/searchStore";
import { fetchImoveis, type Imovel } from "@/services/imoveis";
import { SlidersHorizontal, ArrowUpDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Search = () => {
  const [searchParams] = useSearchParams();
  const { filters, setFilter, setFilters } = useSearchStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const f: Record<string, string | number> = {};
    const urlFinalidade = searchParams.get("finalidade");
    const urlTipo = searchParams.get("tipo");
    const urlQ = searchParams.get("q");
    if (urlFinalidade === "venda") f.finalidade = urlFinalidade;
    if (urlTipo) f.tipo = urlTipo;
    if (urlQ) f.q = urlQ;
    if (Object.keys(f).length) setFilters(f as any);
  }, []);

  const loadImoveis = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchImoveis({
        finalidade: filters.finalidade || undefined,
        tipo: filters.tipo || undefined,
        bairro: filters.bairro || undefined,
        precoMin: filters.precoMin || undefined,
        precoMax: filters.precoMax || undefined,
        areaMin: filters.areaMin || undefined,
        areaMax: filters.areaMax || undefined,
        quartos: filters.quartos || undefined,
        banheiros: filters.banheiros || undefined,
        vagas: filters.vagas || undefined,
        diferenciais: filters.diferenciais.length ? filters.diferenciais : undefined,
        ordem: filters.ordem as any,
        q: filters.q || undefined,
        limit: 40,
      });
      setImoveis(result.data);
      setTotal(result.count);
    } catch (err) {
      console.error("Erro ao buscar imóveis:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadImoveis();
  }, [loadImoveis]);

  const sortLabels: Record<string, string> = {
    recentes: "Mais recentes",
    preco_asc: "Menor preço",
    preco_desc: "Maior preço",
    area_desc: "Maior área",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Single instance of filters — handles both mobile overlay & desktop static */}
      <SearchFiltersPanel isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} />

      <div className="flex pt-16" style={{ height: "100vh" }}>
        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 font-body text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtros
              </button>
              <p className="font-body text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{total}</span> imóveis encontrados
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{sortLabels[filters.ordem]}</span>
              </button>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full z-30 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-xl"
                >
                  {Object.entries(sortLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setFilter("ordem", key as any);
                        setSortOpen(false);
                      }}
                      className={`block w-full px-3 py-2 text-left font-body text-xs transition-colors ${
                        filters.ordem === key
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Cards + Map split */}
          <div className="flex flex-1 overflow-hidden">
            {/* Cards list */}
            <div className="flex-1 overflow-y-auto p-5" style={{ minWidth: 0 }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 font-body text-sm text-muted-foreground">Carregando imóveis...</p>
                </div>
              ) : imoveis.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="font-display text-xl font-bold text-foreground">Nenhum imóvel encontrado</p>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    Tente ajustar seus filtros para ver mais resultados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {imoveis.map((imovel, i) => (
                    <SearchPropertyCard key={imovel.id} imovel={imovel} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Map — hidden below 1100px */}
            <div className="hidden min-[1100px]:block w-[420px] shrink-0">
              <SearchMap imoveis={imoveis} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
