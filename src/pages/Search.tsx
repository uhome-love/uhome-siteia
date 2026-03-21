import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SearchFiltersBar } from "@/components/SearchFiltersBar";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { SearchMap } from "@/components/SearchMap";
import { useSearchStore, type MapBounds } from "@/stores/searchStore";
import { fetchImoveis, type Imovel } from "@/services/imoveis";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpDown, Bell, Loader2, Map as MapIcon, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const sortLabels: Record<string, string> = {
  recentes: "Mais recentes",
  preco_asc: "Menor preço",
  preco_desc: "Maior preço",
  area_desc: "Maior área",
};

function describeFilters(filters: Record<string, any>): string {
  const parts: string[] = [];
  if (filters.tipo) parts.push(filters.tipo);
  if (filters.bairro) parts.push(`em ${filters.bairro}`);
  if (filters.precoMin || filters.precoMax) {
    const min = filters.precoMin ? `R$${(filters.precoMin / 1000).toFixed(0)}k` : "";
    const max = filters.precoMax ? `R$${(filters.precoMax / 1000).toFixed(0)}k` : "";
    if (min && max) parts.push(`${min}–${max}`);
    else if (min) parts.push(`a partir de ${min}`);
    else parts.push(`até ${max}`);
  }
  if (filters.quartos) parts.push(`${filters.quartos}+ quartos`);
  return parts.length > 0 ? parts.join(", ") : "Todos os imóveis";
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const { filters, setFilter, setFilters } = useSearchStore();
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileMap, setMobileMap] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertLoading, setAlertLoading] = useState(false);

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
        bounds: filters.bounds || undefined,
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

  const handleBoundsSearch = useCallback((bounds: MapBounds) => {
    setFilter("bounds", bounds);
  }, [setFilter]);

  const clearBounds = useCallback(() => {
    setFilter("bounds", null);
  }, [setFilter]);

  const handleCreateAlert = async () => {
    if (!alertEmail || !alertEmail.includes("@")) {
      toast.error("Informe um e-mail válido");
      return;
    }
    setAlertLoading(true);
    try {
      await supabase.from("public_leads").insert({
        nome: "Alerta de busca",
        telefone: "-",
        email: alertEmail,
        tipo_interesse: "alerta_busca",
        origem_pagina: "/busca",
        origem_componente: "alerta_busca_modal",
      });
      toast.success("Alerta criado! Avisaremos quando houver novidades.");
      setShowAlertModal(false);
      setAlertEmail("");
    } catch {
      toast.error("Erro ao criar alerta. Tente novamente.");
    } finally {
      setAlertLoading(false);
    }
  };

  const filterDesc = describeFilters(filters);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />
      <SearchFiltersBar />

      {/* Subheader: counter + bounds badge + sort + alert */}
      <div className="flex items-center justify-between border-b border-border bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          <div>
            <span className="font-body text-lg font-extrabold text-foreground">
              {total.toLocaleString("pt-BR")}
            </span>
            <span className="ml-1.5 font-body text-sm text-muted-foreground">imóveis encontrados</span>
          </div>

          {/* Bounds active badge */}
          {filters.bounds && (
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary">
              <MapPin className="h-3 w-3" />
              Área do mapa
              <button
                onClick={clearBounds}
                className="ml-0.5 font-bold leading-none hover:opacity-70"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-body text-xs font-medium text-foreground transition-colors hover:border-foreground"
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

          {/* Alert button */}
          <button
            onClick={() => setShowAlertModal(true)}
            className="flex items-center gap-1.5 rounded-full border-[1.5px] border-primary px-3.5 py-1.5 font-body text-xs font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-[0.97]"
          >
            <Bell className="h-3.5 w-3.5" />
            Criar alerta
          </button>
        </div>
      </div>

      {/* Main area: cards + map */}
      <div className="flex flex-1 overflow-hidden">
        {/* Cards column */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ minWidth: 0 }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 font-body text-sm text-muted-foreground">Carregando imóveis...</p>
            </div>
          ) : imoveis.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="font-body text-lg font-bold text-foreground">Nenhum imóvel encontrado</p>
              <p className="mt-1 font-body text-sm text-muted-foreground">Tente ajustar seus filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 pb-4 sm:grid-cols-2 xl:grid-cols-3">
              {imoveis.map((imovel, i) => (
                <SearchPropertyCard
                  key={imovel.id}
                  imovel={imovel}
                  index={i}
                  highlighted={hoveredId === imovel.id}
                  onHover={setHoveredId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Map — desktop */}
        <div className="relative hidden w-[45%] shrink-0 border-l border-border lg:block" style={{ overflow: "visible" }}>
          <div className="h-full w-full overflow-hidden rounded-none">
            <SearchMap imoveis={imoveis} hoveredId={hoveredId} onPinHover={setHoveredId} onBoundsSearch={handleBoundsSearch} />
          </div>
        </div>
      </div>

      {/* Mobile: floating map button */}
      <button
        onClick={() => setMobileMap(true)}
        className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-5 py-3 font-body text-sm font-semibold text-background shadow-xl transition-transform active:scale-95 lg:hidden"
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
            <SearchMap imoveis={imoveis} hoveredId={hoveredId} onPinHover={setHoveredId} onBoundsSearch={handleBoundsSearch} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert modal */}
      <AnimatePresence>
        {showAlertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAlertModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="mx-4 w-full max-w-sm rounded-2xl bg-card p-7 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-body text-lg font-bold text-foreground">Criar alerta de imóvel</h3>
              <p className="mt-1.5 font-body text-sm text-muted-foreground">
                Avise-me quando aparecerem imóveis como:
              </p>
              <p className="mt-1 font-body text-sm font-semibold text-foreground">{filterDesc}</p>

              <input
                type="email"
                placeholder="Seu e-mail"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="mt-5 w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
              />

              <button
                onClick={handleCreateAlert}
                disabled={alertLoading}
                className="mt-3 w-full rounded-lg bg-primary px-4 py-3 font-body text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
              >
                {alertLoading ? "Criando..." : "Criar alerta gratuito"}
              </button>

              <p className="mt-3 text-center font-body text-xs text-muted-foreground">
                Sem spam. Cancele quando quiser.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
