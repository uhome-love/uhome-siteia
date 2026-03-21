import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SearchFiltersBar } from "@/components/SearchFiltersBar";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { SearchMap } from "@/components/SearchMap";
import { useSearchStore, type MapBounds } from "@/stores/searchStore";
import { fetchImoveis, fetchMapPins, type Imovel, type MapPin } from "@/services/imoveis";
import { interpretarBusca, type AISearchResult } from "@/services/aiSearch";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpDown, Bell, Loader2, Map as MapIcon, MapPin, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCanonical } from "@/hooks/useCanonical";

const sortLabels: Record<string, string> = {
  recentes: "Mais recentes",
  preco_asc: "Menor preço",
  preco_desc: "Maior preço",
  area_desc: "Maior área",
};

const aiSuggestions = [
  "Apartamento 2 quartos perto do Parcão até 800 mil",
  "Cobertura com terraço no Moinhos",
  "Casa com jardim em Três Figueiras",
];

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
  useCanonical();
  const [searchParams, setSearchParams] = useSearchParams();
  const modoIA = searchParams.get("modo") === "ia";
  const { filters, setFilter, setFilters } = useSearchStore();
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileMap, setMobileMap] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertLoading, setAlertLoading] = useState(false);

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // AI mode state
  const [queryIA, setQueryIA] = useState(searchParams.get("q") || "");
  const [buscandoIA, setBuscandoIA] = useState(false);
  const [resumoIA, setResumoIA] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AISearchResult | null>(null);

  useEffect(() => {
    if (!modoIA) {
      const f: Record<string, string | number> = {};
      const urlFinalidade = searchParams.get("finalidade");
      const urlTipo = searchParams.get("tipo");
      const urlQ = searchParams.get("q");
      if (urlFinalidade === "venda") f.finalidade = urlFinalidade;
      if (urlTipo) f.tipo = urlTipo;
      if (urlQ) f.q = urlQ;
      if (Object.keys(f).length) setFilters(f as any);
      // Clear AI state
      setResumoIA(null);
      setAiResult(null);
    }
  }, [modoIA]);

  // Normal mode: fetch by store filters
  const loadImoveis = useCallback(async () => {
    if (modoIA && !aiResult) return; // In AI mode, wait for AI search
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
  }, [filters, modoIA, aiResult]);

  useEffect(() => {
    if (!modoIA) loadImoveis();
  }, [loadImoveis, modoIA]);

  // AI search handler
  const buscarComIA = useCallback(async (query?: string) => {
    const q = query || queryIA;
    if (!q.trim()) return;
    setBuscandoIA(true);
    setLoading(true);
    try {
      const res = await interpretarBusca(q.trim());
      setAiResult(res);
      setResumoIA(res.resumo);

      const f = res.filtros;
      const { data, count } = await fetchImoveis({
        finalidade: f.finalidade || undefined,
        tipo: f.tipo || undefined,
        bairros: f.bairros?.length ? f.bairros : undefined,
        precoMin: f.preco_min || undefined,
        precoMax: f.preco_max || undefined,
        areaMin: f.area_min || undefined,
        quartos: f.quartos || undefined,
        diferenciais: f.diferenciais?.length ? f.diferenciais : undefined,
        limit: 40,
      });
      setImoveis(data);
      setTotal(count);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao interpretar busca");
    } finally {
      setBuscandoIA(false);
      setLoading(false);
    }
  }, [queryIA]);

  // Auto-search if arriving with ?modo=ia&q=...
  useEffect(() => {
    if (modoIA && searchParams.get("q")) {
      const q = searchParams.get("q")!;
      setQueryIA(q);
      buscarComIA(q);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const limparIA = () => {
    setResumoIA(null);
    setAiResult(null);
    setQueryIA("");
    setImoveis([]);
    setTotal(0);
  };

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
    <div className="flex h-screen flex-col bg-background pt-16">
      <Navbar />

      {/* Filter bar — switches between normal and AI */}
      {modoIA ? (
        <div className="sticky top-16 z-10 border-b border-border bg-background px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="flex flex-1 items-center gap-2.5 rounded-xl border-[1.5px] border-primary bg-primary/[0.03] px-3 py-2.5 sm:px-4 sm:py-3"
              style={{ boxShadow: "0 0 0 3px hsl(var(--primary) / 0.08)" }}
            >
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <input
                value={queryIA}
                onChange={(e) => setQueryIA(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarComIA()}
                placeholder="Ex: apartamento 2 quartos perto do Iguatemi até 800 mil..."
                autoFocus
                className="w-full border-none bg-transparent font-body text-[13px] text-foreground outline-none placeholder:text-muted-foreground sm:text-sm"
              />
              {queryIA && (
                <button
                  onClick={() => setQueryIA("")}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => buscarComIA()}
              disabled={!queryIA.trim() || buscandoIA}
              className="shrink-0 rounded-full bg-primary px-4 py-2.5 font-body text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed sm:px-6 sm:text-sm"
            >
              {buscandoIA ? "Buscando..." : "Buscar"}
            </button>
          </div>
          {/* Suggestions */}
          {!resumoIA && !buscandoIA && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {aiSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQueryIA(s); buscarComIA(s); }}
                  className="rounded-full border border-border px-2.5 py-1 font-body text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  "{s}"
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <SearchFiltersBar />
      )}

      {/* AI resumo badge */}
      <AnimatePresence>
        {modoIA && resumoIA && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between border-b border-primary/20 bg-primary/[0.05] px-4 py-2 sm:px-6"
          >
            <span className="font-body text-xs font-medium text-primary sm:text-[13px]">
              <Sparkles className="mr-1.5 inline h-3 w-3" />
              {resumoIA}
            </span>
            <button
              onClick={limparIA}
              className="font-body text-xs font-semibold text-primary hover:text-primary/70"
            >
              Limpar ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subheader: counter + bounds badge + sort + alert */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2">
          <div>
            <div className="font-body text-lg font-extrabold leading-tight text-foreground sm:text-[22px]">
              {total.toLocaleString("pt-BR")} imóveis
            </div>
            <div className="mt-0.5 font-body text-xs text-muted-foreground sm:text-sm">
              à venda em Porto Alegre{filters.bairro ? `, ${filters.bairro}` : ""}
            </div>
          </div>

          {filters.bounds && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-[11px] font-semibold text-primary sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs">
              <MapPin className="h-3 w-3" />
              Mapa
              <button
                onClick={clearBounds}
                className="ml-0.5 font-bold leading-none hover:opacity-70"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          {!modoIA && (
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 font-body text-[11px] font-medium text-foreground transition-colors hover:border-foreground sm:gap-1.5 sm:px-3 sm:text-xs"
              >
                <ArrowUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">{sortLabels[filters.ordem]}</span>
                <span className="sm:hidden">Ordenar</span>
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
          )}

          {/* Alert button */}
          <button
            onClick={() => setShowAlertModal(true)}
            className="flex items-center gap-1 rounded-full border-[1.5px] border-primary px-2.5 py-1.5 font-body text-[11px] font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-[0.97] sm:gap-1.5 sm:px-3.5 sm:text-xs"
          >
            <Bell className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Alerta
          </button>
        </div>
      </div>

      {/* Main area: cards + map */}
      <div className="flex flex-1 overflow-hidden">
        {/* Cards column */}
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5" style={{ minWidth: 0 }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 font-body text-sm text-muted-foreground">
                {modoIA && buscandoIA ? "Interpretando sua busca com IA..." : "Carregando imóveis..."}
              </p>
            </div>
          ) : imoveis.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              {modoIA && !aiResult ? (
                <>
                  <Sparkles className="h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-4 font-body text-sm text-muted-foreground">
                    Digite o que você procura acima ou clique em uma sugestão.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-body text-lg font-bold text-foreground">Nenhum imóvel encontrado</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">Tente ajustar seus filtros.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 sm:gap-6 sm:pb-4 xl:grid-cols-3">
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
