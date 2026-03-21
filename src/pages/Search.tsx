import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SearchFiltersPanel } from "@/components/SearchFiltersPanel";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { SearchMap } from "@/components/SearchMap";
import { useSearchStore } from "@/stores/searchStore";
import { mockProperties } from "@/data/properties";
import { SlidersHorizontal, Map, List, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

const Search = () => {
  const [searchParams] = useSearchParams();
  const { filters, setFilter, setFilters } = useSearchStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);

  // Sync URL params to store on mount
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

  // Filter properties
  const filtered = useMemo(() => {
    let result = [...mockProperties];

    if (filters.finalidade) result = result.filter((p) => p.finalidade === filters.finalidade);
    if (filters.tipo) result = result.filter((p) => p.tipo === filters.tipo);
    if (filters.bairro) result = result.filter((p) => p.neighborhood === filters.bairro);
    if (filters.precoMin) result = result.filter((p) => p.price >= filters.precoMin);
    if (filters.precoMax) result = result.filter((p) => p.price <= filters.precoMax);
    if (filters.areaMin) result = result.filter((p) => p.area >= filters.areaMin);
    if (filters.areaMax) result = result.filter((p) => p.area <= filters.areaMax);
    if (filters.quartos) result = result.filter((p) => p.bedrooms >= filters.quartos);
    if (filters.banheiros) result = result.filter((p) => p.bathrooms >= filters.banheiros);
    if (filters.vagas) result = result.filter((p) => p.parking >= filters.vagas);
    if (filters.diferenciais.length > 0) {
      result = result.filter((p) =>
        filters.diferenciais.every((d) => p.features.includes(d))
      );
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.neighborhood.toLowerCase().includes(q) ||
          p.tipo.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (filters.ordem) {
      case "preco_asc": result.sort((a, b) => a.price - b.price); break;
      case "preco_desc": result.sort((a, b) => b.price - a.price); break;
      case "area_desc": result.sort((a, b) => b.area - a.area); break;
      default: break;
    }

    return result;
  }, [filters]);

  const sortLabels: Record<string, string> = {
    recentes: "Mais recentes",
    preco_asc: "Menor preço",
    preco_desc: "Maior preço",
    area_desc: "Maior área",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex pt-16" style={{ height: "100vh" }}>
        {/* Filters sidebar — desktop always visible */}
        <div className="hidden w-80 shrink-0 border-r border-border lg:block">
          <SearchFiltersPanel isOpen={true} onClose={() => {}} />
        </div>

        {/* Mobile filter panel */}
        <SearchFiltersPanel isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} />

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
                <span className="font-semibold text-foreground">{filtered.length}</span> imóveis encontrados
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
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

              {/* Map toggle */}
              <button
                onClick={() => setShowMap(!showMap)}
                className="hidden items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 font-body text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 md:flex"
              >
                {showMap ? <List className="h-3.5 w-3.5" /> : <Map className="h-3.5 w-3.5" />}
                {showMap ? "Lista" : "Mapa"}
              </button>
            </div>
          </div>

          {/* Split view */}
          <div className="flex flex-1 overflow-hidden">
            {/* Property list */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${showMap ? "md:w-1/2" : "w-full"}`}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="font-display text-xl font-bold text-foreground">Nenhum imóvel encontrado</p>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    Tente ajustar seus filtros para ver mais resultados.
                  </p>
                </div>
              ) : (
                filtered.map((p, i) => (
                  <SearchPropertyCard key={p.id} property={p} index={i} />
                ))
              )}
            </div>

            {/* Map */}
            {showMap && (
              <div className="hidden w-1/2 p-4 md:block">
                <SearchMap properties={filtered} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
