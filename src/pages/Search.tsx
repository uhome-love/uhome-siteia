import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SearchFiltersBar } from "@/components/SearchFiltersBar";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { SearchMap } from "@/components/SearchMap";
import { useSearchStore } from "@/stores/searchStore";
import { fetchImoveis, type Imovel } from "@/services/imoveis";
import { ArrowUpDown, Loader2, Map as MapIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sortLabels: Record<string, string> = {
  recentes: "Mais recentes",
  preco_asc: "Menor preço",
  preco_desc: "Maior preço",
  area_desc: "Maior área",
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const { filters, setFilter, setFilters } = useSearchStore();
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileMap, setMobileMap] = useState(false);

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

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />

      {/* Filter pills bar */}
      <SearchFiltersBar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Cards column */}
        <div className="flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
          {/* Subheader: count + sort */}
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="font-body text-sm font-semibold text-foreground">
                {total.toLocaleString("pt-BR")} imóveis
              </p>
              <p className="font-body text-xs text-muted-foreground">
                à venda em Porto Alegre
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-body text-xs font-medium text-foreground transition-colors hover:border-primary"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortLabels[filters.ordem]}
              </button>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-border bg-card p-1 shadow-xl"
                >
                  {Object.entries(sortLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setFilter("ordem", key as any); setSortOpen(false); }}
                      className={`block w-full rounded-lg px-3 py-2 text-left font-body text-[13px] transition-colors ${
                        filters.ordem === key
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Cards grid */}
          <div className="px-5 pb-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 font-body text-sm text-muted-foreground">Carregando imóveis...</p>
              </div>
            ) : imoveis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="font-body text-lg font-bold text-foreground">Nenhum imóvel encontrado</p>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  Tente ajustar seus filtros.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {imoveis.map((imovel, i) => (
                  <SearchPropertyCard key={imovel.id} imovel={imovel} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map — desktop (≥1024px) */}
        <div className="hidden w-[45%] shrink-0 lg:block">
          <SearchMap imoveis={imoveis} />
        </div>
      </div>

      {/* Mobile: floating map button */}
      <button
        onClick={() => setMobileMap(true)}
        className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 font-body text-sm font-semibold text-primary-foreground shadow-xl transition-transform active:scale-95 lg:hidden"
      >
        <MapIcon className="h-4 w-4" />
        Ver no mapa
      </button>

      {/* Mobile fullscreen map */}
      <AnimatePresence>
        {mobileMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background lg:hidden"
          >
            <button
              onClick={() => setMobileMap(false)}
              className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-card px-4 py-2 font-body text-sm font-medium text-foreground shadow-lg active:scale-95"
            >
              <X className="h-4 w-4" />
              Voltar à lista
            </button>
            <SearchMap imoveis={imoveis} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
