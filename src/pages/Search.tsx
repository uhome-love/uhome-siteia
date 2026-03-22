import React, { useState, useEffect, useCallback } from "react";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SearchFiltersBar } from "@/components/SearchFiltersBar";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { SearchMap } from "@/components/SearchMap";
import { SkeletonCard } from "@/components/SkeletonCard";
import { SearchCTACard } from "@/components/SearchCTACard";
import { MobileFiltersSheet } from "@/components/MobileFiltersSheet";
import { useSearchStore, type MapBounds } from "@/stores/searchStore";
import { fetchImoveis, fetchMapPins, type Imovel, type MapPin as MapPinData, type BuscaFilters } from "@/services/imoveis";
import { interpretarBusca, type AISearchResult } from "@/services/aiSearch";
import { supabase } from "@/integrations/supabase/client";
import { syncToCRM } from "@/services/syncCRM";
import { ArrowUpDown, Bell, Loader2, Map as MapIcon, MapPin, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCanonical } from "@/hooks/useCanonical";
import { useCountUp } from "@/hooks/useCountUp";

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
  const { user } = useAuth();
  useCanonical();
  const [searchParams, setSearchParams] = useSearchParams();
  const modoIA = searchParams.get("modo") === "ia";
  const { filters, setFilter, setFilters } = useSearchStore();
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileMap, setMobileMap] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [showLeadCTA, setShowLeadCTA] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [showAuthAfterAlert, setShowAuthAfterAlert] = useState(false);
  
  // Alert preferences
  const [alertPrefs, setAlertPrefs] = useState({
    notificacoes: true,
    whatsapp: false,
    email: true,
  });
  const [pendingAlert, setPendingAlert] = useState(false);

  // After login from alert flow, auto-create the alert
  useEffect(() => {
    if (user && pendingAlert) {
      setPendingAlert(false);
      setShowAuthAfterAlert(false);
      handleCreateAlert();
    }
  }, [user, pendingAlert]);

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [mapPins, setMapPins] = useState<MapPinData[]>([]);
  const [mapViewBounds, setMapViewBounds] = useState<MapBounds | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 40;

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
      if (urlQ) {
        // Multiple neighborhoods separated by comma → use bairros filter
        const parts = urlQ.split(",").map(s => s.trim()).filter(Boolean);
        if (parts.length > 1) {
          f.q = "";
          f.bairro = parts.join(",");
        } else {
          f.q = urlQ;
        }
      }
      if (Object.keys(f).length) setFilters(f as any);
      // Clear AI state
      setResumoIA(null);
      setAiResult(null);
    }
  }, [modoIA]);

  // Dynamic SEO title based on filters
  useEffect(() => {
    const parts: string[] = [];
    if (filters.tipo) {
      const t = filters.tipo;
      parts.push(t === "apartamento" ? "Apartamentos" : t === "casa" ? "Casas" : t === "cobertura" ? "Coberturas" : t.charAt(0).toUpperCase() + t.slice(1) + "s");
    } else {
      parts.push("Imóveis");
    }
    parts.push("à Venda");
    const city = filters.cidade || "Porto Alegre";
    if (filters.bairro) {
      parts.push(`em ${filters.bairro}, ${city}`);
    } else {
      parts.push(`em ${city}`);
    }
    if (filters.quartos) parts.push(`com ${filters.quartos}+ quartos`);
    document.title = `${parts.join(" ")} | Uhome Imóveis`;
    return () => { document.title = "Uhome Imóveis | Apartamentos e Casas à Venda em Porto Alegre"; };
  }, [filters.tipo, filters.bairro, filters.cidade, filters.quartos]);

  // Build filter object (shared between list and map)
  const buildFilters = useCallback(() => {
    // If bairro contains commas, treat as multiple bairros
    const bairroStr = filters.bairro || "";
    const bairrosParts = bairroStr.includes(",")
      ? bairroStr.split(",").map(s => s.trim()).filter(Boolean)
      : [];
    
    return {
      finalidade: filters.finalidade || undefined,
      tipo: filters.tipo || undefined,
      bairro: bairrosParts.length ? undefined : (filters.bairro || undefined),
      bairros: bairrosParts.length ? bairrosParts : undefined,
      cidade: filters.cidade || undefined,
      precoMin: filters.precoMin || undefined,
      precoMax: filters.precoMax || undefined,
      areaMin: filters.areaMin || undefined,
      areaMax: filters.areaMax || undefined,
      quartos: filters.quartos || undefined,
      banheiros: filters.banheiros || undefined,
      vagas: filters.vagas || undefined,
      diferenciais: filters.diferenciais.length ? filters.diferenciais : undefined,
      q: filters.q || undefined,
    };
  }, [filters]);

  // Normal mode: fetch list only (pins loaded separately by viewport)
  const loadImoveis = useCallback(async () => {
    if (modoIA && !aiResult && queryIA.trim()) return;
    setLoading(true);
    setPage(0);
    try {
      const baseFilters = buildFilters();
      const result = await fetchImoveis({
        ...baseFilters,
        ordem: filters.ordem as any,
        bounds: filters.bounds || undefined,
        limit: PAGE_SIZE,
        offset: 0,
      });
      setImoveis(result.data);
      setTotal(result.count);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar imóveis:", err);
      setLoading(false);
    }
  }, [filters, modoIA, aiResult, buildFilters]);

  // Lazy load pins by viewport bounds — only fetches what's visible on the map
  const pinLoadTimerRef = React.useRef<number | null>(null);

  const handleMapBoundsChange = useCallback((bounds: MapBounds) => {
    setMapViewBounds(bounds);
    // Debounce pin fetching to avoid rapid re-fetches during pan/zoom
    if (pinLoadTimerRef.current) clearTimeout(pinLoadTimerRef.current);
    pinLoadTimerRef.current = window.setTimeout(() => {
      setMapLoading(true);
      const baseFilters = buildFilters();
      fetchMapPins({ ...baseFilters, bounds })
        .then(setMapPins)
        .catch((err) => console.error("Erro ao buscar pins:", err))
        .finally(() => setMapLoading(false));
    }, 300);
  }, [buildFilters]);

  // Reload pins when filters change (using current map viewport)
  useEffect(() => {
    if (!mapViewBounds) return;
    setMapLoading(true);
    const baseFilters = buildFilters();
    fetchMapPins({ ...baseFilters, bounds: mapViewBounds })
      .then(setMapPins)
      .catch((err) => console.error("Erro ao buscar pins:", err))
      .finally(() => setMapLoading(false));
  }, [filters.tipo, filters.bairro, filters.precoMin, filters.precoMax, filters.quartos, filters.areaMin, filters.areaMax, filters.vagas, filters.banheiros]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return;
    const nextPage = page + 1;
    const offset = nextPage * PAGE_SIZE;
    if (offset >= total) return;
    setLoadingMore(true);
    try {
      const baseFilters = buildFilters();
      const result = await fetchImoveis({
        ...baseFilters,
        ordem: filters.ordem as any,
        bounds: filters.bounds || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setImoveis((prev) => [...prev, ...result.data]);
      setPage(nextPage);
    } catch (err) {
      console.error("Erro ao carregar mais:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, total, loadingMore, loading, buildFilters, filters]);

  useEffect(() => {
    loadImoveis();
  }, [loadImoveis]);

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
      
      // Sync AI filters to the search store so map pins use the same filters
      const storeUpdate: Record<string, any> = {};
      if (f.finalidade) storeUpdate.finalidade = f.finalidade;
      if (f.tipo) storeUpdate.tipo = f.tipo;
      if (f.bairros?.length) storeUpdate.bairro = f.bairros.join(",");
      if (f.preco_max) storeUpdate.precoMax = f.preco_max;
      if (f.preco_min) storeUpdate.precoMin = f.preco_min;
      if (f.area_min) storeUpdate.areaMin = f.area_min;
      if (f.quartos) storeUpdate.quartos = f.quartos;
      if (f.diferenciais?.length) storeUpdate.diferenciais = f.diferenciais;
      setFilters(storeUpdate);

      const aiFilters: BuscaFilters = {
        finalidade: f.finalidade || undefined,
        tipo: f.tipo || undefined,
        bairros: f.bairros?.length ? f.bairros : undefined,
        precoMin: f.preco_min || undefined,
        precoMax: f.preco_max || undefined,
        areaMin: f.area_min || undefined,
        quartos: f.quartos || undefined,
        diferenciais: f.diferenciais?.length ? f.diferenciais : undefined,
      };
      const { data, count } = await fetchImoveis({ ...aiFilters, limit: 40 });
      setImoveis(data);
      setTotal(count);
      // Pins will be reloaded automatically via the filters change effect
    } catch (e: any) {
      toast.error(e?.message || "Erro ao interpretar busca");
    } finally {
      setBuscandoIA(false);
      setLoading(false);
    }
  }, [queryIA, setFilters]);

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
    // Reset filters in the store so map also clears
    const { resetFilters } = useSearchStore.getState();
    resetFilters();
  };

  const handleBoundsSearch = useCallback((bounds: MapBounds) => {
    setFilter("bounds", bounds);
  }, [setFilter]);

  const clearBounds = useCallback(() => {
    setFilter("bounds", null);
  }, [setFilter]);

  const handleCreateAlert = async () => {
    const email = user?.email || alertEmail;
    setAlertLoading(true);
    try {
      const alertPayload = {
        nome: user?.user_metadata?.nome || user?.user_metadata?.full_name || "Alerta de busca",
        telefone: "-",
        email: email || "-",
        tipo_interesse: "alerta_busca",
        origem_pagina: "/busca",
        origem_componente: "alerta_busca_modal",
      };
      await supabase.from("public_leads").insert(alertPayload);

      const prefsDesc = [
        alertPrefs.notificacoes && "notificações",
        alertPrefs.whatsapp && "whatsapp",
        alertPrefs.email && "email",
      ].filter(Boolean).join(", ");

      syncToCRM("busca_salva", { email, filters, descricao_humana: filterDesc, preferencias: prefsDesc });
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
  const animatedTotal = useCountUp(total);

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
        <SearchFiltersBar onOpenMobileFilters={() => setMobileFilters(true)} />
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
      <div className="relative z-0 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2">
          <div>
            <div className="font-body text-lg font-extrabold leading-tight text-foreground sm:text-[22px]">
              {animatedTotal.toLocaleString("pt-BR")} imóveis
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
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-20 sm:px-6 sm:pt-3 sm:pb-5" style={{ minWidth: 0 }}>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 sm:gap-6 sm:pb-4 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
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
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {imoveis.map((imovel, i) => (
                  <React.Fragment key={imovel.id}>
                    <SearchPropertyCard
                      imovel={imovel}
                      index={i}
                      highlighted={hoveredId === imovel.id}
                      onHover={setHoveredId}
                    />
                    {i === 5 && (
                      <SearchCTACard onClickCTA={() => setShowAlertModal(true)} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              {/* Load more */}
              {imoveis.length < total && (
                <div className="flex justify-center pb-16 pt-6 sm:pb-4">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-full border-[1.5px] border-border px-8 py-3 font-body text-sm font-semibold text-foreground transition-all hover:border-foreground active:scale-[0.97] disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando...
                      </span>
                    ) : (
                      `Ver mais imóveis (${imoveis.length} de ${total.toLocaleString("pt-BR")})`
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Map — desktop */}
        <div className="relative hidden w-[45%] shrink-0 border-l border-border lg:block" style={{ overflow: "visible" }}>
          <div className="h-full w-full overflow-hidden rounded-none">
            <SearchMap pins={mapPins} hoveredId={hoveredId} onPinHover={setHoveredId} onBoundsSearch={handleBoundsSearch} onBoundsChange={handleMapBoundsChange} />
          </div>
        </div>
      </div>

      {/* Mobile: floating bottom bar — QuintoAndar style */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <button
          onClick={() => setMobileMap(true)}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 font-body text-[13px] font-semibold text-foreground shadow-sm transition-all active:scale-95"
        >
          <MapIcon className="h-4 w-4" />
          Mostrar mapa
        </button>
        <button
          onClick={() => setShowAlertModal(true)}
          className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-body text-[13px] font-semibold text-background shadow-sm transition-all active:scale-95"
        >
          <Bell className="h-4 w-4" />
          Criar alerta
        </button>
      </div>

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
            <SearchMap pins={mapPins} hoveredId={hoveredId} onPinHover={setHoveredId} onBoundsSearch={handleBoundsSearch} onBoundsChange={handleMapBoundsChange} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert preferences modal — QuintoAndar style */}
      <AnimatePresence>
        {showAlertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAlertModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card px-6 py-7 shadow-2xl sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-body text-xl font-extrabold text-foreground leading-snug">
                Escolha onde quer receber novos imóveis dessa busca
              </h3>

              {/* Preferences */}
              <div className="mt-6">
                <p className="font-body text-sm font-bold text-foreground">Assim que o imóvel chegar</p>
                
                <label className="mt-4 flex items-center justify-between cursor-pointer">
                  <span className="font-body text-sm text-foreground">Notificações no app</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={alertPrefs.notificacoes}
                    onClick={() => setAlertPrefs(p => ({ ...p, notificacoes: !p.notificacoes }))}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${alertPrefs.notificacoes ? "bg-primary" : "bg-muted"}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${alertPrefs.notificacoes ? "translate-x-6" : "translate-x-1"}`} />
                    {alertPrefs.notificacoes && (
                      <svg className="absolute left-1.5 h-3.5 w-3.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </label>

                <label className="mt-3 flex items-center justify-between cursor-pointer">
                  <span className="font-body text-sm text-foreground">WhatsApp</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={alertPrefs.whatsapp}
                    onClick={() => setAlertPrefs(p => ({ ...p, whatsapp: !p.whatsapp }))}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${alertPrefs.whatsapp ? "bg-primary" : "bg-muted"}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${alertPrefs.whatsapp ? "translate-x-6" : "translate-x-1"}`} />
                    {alertPrefs.whatsapp && (
                      <svg className="absolute left-1.5 h-3.5 w-3.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </label>
              </div>

              <div className="mt-6">
                <p className="font-body text-sm font-bold text-foreground">Imóveis que chegaram no dia</p>

                <label className="mt-4 flex items-center justify-between cursor-pointer">
                  <span className="font-body text-sm text-foreground">E-mail</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={alertPrefs.email}
                    onClick={() => setAlertPrefs(p => ({ ...p, email: !p.email }))}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${alertPrefs.email ? "bg-primary" : "bg-muted"}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${alertPrefs.email ? "translate-x-6" : "translate-x-1"}`} />
                    {alertPrefs.email && (
                      <svg className="absolute left-1.5 h-3.5 w-3.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </label>
              </div>

              <p className="mt-6 font-body text-xs text-muted-foreground">
                Você pode alterar suas preferências quando quiser dentro da página de alertas criados.
              </p>

              {/* Bottom actions */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="rounded-full border border-border px-5 py-3 font-body text-sm font-semibold text-foreground transition-colors hover:bg-secondary active:scale-[0.97]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowAlertModal(false);
                    if (!user) {
                      setPendingAlert(true);
                      setShowAuthAfterAlert(true);
                    } else {
                      handleCreateAlert();
                    }
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97]"
                >
                  <Bell className="h-4 w-4" />
                  Criar alerta de imóveis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth modal triggered after alert preferences */}
      <AuthModal open={showAuthAfterAlert} onClose={() => setShowAuthAfterAlert(false)} />
      <MobileFiltersSheet open={mobileFilters} onClose={() => setMobileFilters(false)} total={total} />
    </div>
  );
};

export default Search;
