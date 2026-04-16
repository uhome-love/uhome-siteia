import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Search, RotateCcw, MapPin, PenTool, Navigation, Sparkles, X, SlidersHorizontal } from "lucide-react";
import { useSearchStore } from "@/stores/searchStore";
import { useCorretor } from "@/contexts/CorretorContext";
import { FilterPill, PillOption } from "@/components/FilterPill";
import { propertyTypes } from "@/data/properties";
import { CIDADES_PERMITIDAS } from "@/services/imoveis";
import { getBairrosDisponiveis } from "@/services/bairrosCache";
import { getTipoCounts, type TipoCounts } from "@/services/tipoCountsCache";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency, rawCurrency } from "@/lib/currencyMask";

const quartoOptions = [1, 2, 3, 4];
const vagaOptions = [1, 2, 3];

const precoRanges = [
  { label: "Até R$ 300k", min: 0, max: 300000 },
  { label: "R$ 300k – 600k", min: 300000, max: 600000 },
  { label: "R$ 600k – 1M", min: 600000, max: 1000000 },
  { label: "R$ 1M – 2M", min: 1000000, max: 2000000 },
  { label: "R$ 2M – 5M", min: 2000000, max: 5000000 },
  { label: "Acima de R$ 5M", min: 5000000, max: 0 },
];

const areaRanges = [
  { label: "Até 50m²", min: 0, max: 50 },
  { label: "50 – 100m²", min: 50, max: 100 },
  { label: "100 – 200m²", min: 100, max: 200 },
  { label: "200 – 400m²", min: 200, max: 400 },
  { label: "Acima de 400m²", min: 400, max: 0 },
];

function formatPrecoLabel(min: number, max: number): string {
  const fmt = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}M` : `${(v / 1000).toFixed(0)}k`;
  if (min && max) return `R$ ${fmt(min)} – ${fmt(max)}`;
  if (min) return `A partir de R$ ${fmt(min)}`;
  if (max) return `Até R$ ${fmt(max)}`;
  return "";
}

function formatAreaLabel(min: number, max: number): string {
  if (min && max) return `${min} – ${max}m²`;
  if (min) return `A partir de ${min}m²`;
  if (max) return `Até ${max}m²`;
  return "";
}

export function SearchFiltersBar({ onOpenMobileFilters, onOpenAdvancedFilters }: { onOpenMobileFilters?: () => void; onOpenAdvancedFilters?: () => void }) {
  const { filters, setFilter, resetFilters } = useSearchStore();
  const navigate = useNavigate();
  const { prefixLink } = useCorretor();
  const isMobile = useIsMobile();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Multi-bairro state
  const [bairroInput, setBairroInput] = useState("");
  const [dbBairros, setDbBairros] = useState<string[]>([]);
  const [tipoCounts, setTipoCounts] = useState<TipoCounts>({});

  // Parse current bairros from filter (comma-separated)
  const bairrosSelecionados = useMemo(() => {
    const bairroStr = filters.bairro || "";
    if (!bairroStr) return [];
    return bairroStr.split(",").map(s => s.trim()).filter(Boolean);
  }, [filters.bairro]);

  // Load neighborhoods + tipo counts from DB once
  useEffect(() => {
    getBairrosDisponiveis().then(data => {
      setDbBairros(data.map(d => d.bairro));
    });
    getTipoCounts().then(setTipoCounts).catch(() => {});
  }, []);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    const all = dbBairros.length > 0 ? dbBairros : [];
    const filtered = all.filter(b => !bairrosSelecionados.includes(b));
    if (!bairroInput.trim()) return filtered.slice(0, 8);
    const q = bairroInput.toLowerCase();
    return filtered.filter(b => b.toLowerCase().includes(q)).slice(0, 10);
  }, [bairroInput, bairrosSelecionados, dbBairros]);

  const addBairro = (nome: string) => {
    const next = [...bairrosSelecionados, nome];
    setFilter("bairro", next.join(","));
    if (filters.q) setFilter("q", "");
    setBairroInput("");
  };

  const searchByAddress = (text: string) => {
    setFilter("q", text.trim());
    setBairroInput("");
    setShowDropdown(false);
  };

  const removeBairro = (nome: string) => {
    const next = bairrosSelecionados.filter(b => b !== nome);
    setFilter("bairro", next.join(","));
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        portalDropdownRef.current && !portalDropdownRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  // Position the portal dropdown below the input
  const positionDropdown = useCallback(() => {
    if (!portalDropdownRef.current || !dropdownRef.current) return;
    const anchor = dropdownRef.current.getBoundingClientRect();
    const dd = portalDropdownRef.current;
    dd.style.position = "fixed";
    dd.style.top = `${anchor.bottom + 8}px`;
    dd.style.left = `${anchor.left}px`;
    dd.style.minWidth = `${Math.min(anchor.width, 320)}px`;
  }, []);

  // Reposition when dropdown opens, chips change, or input changes
  useEffect(() => {
    if (showDropdown) requestAnimationFrame(positionDropdown);
  }, [showDropdown, positionDropdown, bairrosSelecionados.length, bairroInput, suggestions.length]);

  const handleSearchIA = () => {
    setShowDropdown(false);
    navigate(prefixLink("/busca?modo=ia"));
  };

  const handlePertoDeVoce = () => {
    setShowDropdown(false);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const delta = 0.015;
          setFilter("bounds", {
            lat_min: lat - delta,
            lat_max: lat + delta,
            lng_min: lng - delta,
            lng_max: lng + delta,
          });
        },
        () => {
          import("sonner").then(({ toast }) => toast.error("Não foi possível obter sua localização"));
        }
      );
    }
  };

  const handleDesenharArea = () => {
    setShowDropdown(false);
    window.dispatchEvent(new CustomEvent("uhome:draw-area"));
  };

  // Handle keyboard: backspace removes last chip when input is empty
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !bairroInput && bairrosSelecionados.length > 0) {
      removeBairro(bairrosSelecionados[bairrosSelecionados.length - 1]);
    }
    if (e.key === "Enter" && bairroInput) {
      e.preventDefault();
      if (suggestions.length > 0) {
        addBairro(suggestions[0]);
      } else {
        searchByAddress(bairroInput);
      }
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const tipoLabel = propertyTypes.find((t) => t.value === filters.tipo)?.label;
  const precoLabel = precoRanges.find(
    (r) => r.min === filters.precoMin && r.max === filters.precoMax
  )?.label;
  const areaLabel = areaRanges.find(
    (r) => r.min === filters.areaMin && r.max === filters.areaMax
  )?.label || (filters.areaMin || filters.areaMax ? formatAreaLabel(filters.areaMin, filters.areaMax) : undefined);
  const cidadeLabel = filters.cidade || "Todas";

  const faseOptions = [
    { value: "usado", label: "Pronto/Usado" },
    { value: "novo", label: "Novo" },
    { value: "em_construcao", label: "Em obras" },
    { value: "na_planta", label: "Lançamento" },
  ];
  const faseLabel = faseOptions.find(f => f.value === filters.fase)?.label;

  const advancedCount = [
    filters.banheiros, filters.andarMin, filters.condominioMax, filters.iptuMax, filters.codigo, filters.condominio,
  ].filter(Boolean).length + filters.diferenciais.length;
  const advancedActive = advancedCount > 0;

  const hasAny =
    filters.tipo || filters.precoMin || filters.precoMax || filters.areaMin || filters.areaMax || filters.quartos || filters.vagas || filters.q || filters.bairro || filters.fase || advancedActive || (filters.cidade && filters.cidade !== "Porto Alegre");

  const hasInput = bairroInput.trim().length > 0;
  const hasChips = bairrosSelecionados.length > 0;

  // Mobile: QuintoAndar-style summary card
  if (isMobile) {
    const tipoText = propertyTypes.find(t => t.value === filters.tipo)?.label || "";
    const bairroText = bairrosSelecionados.length > 0
      ? bairrosSelecionados.join(", ")
      : (filters.cidade || "Porto Alegre");
    const summaryTitle = tipoText
      ? `${tipoText} em ${bairroText}`
      : bairroText;

    const filterParts: string[] = [];
    filterParts.push("Comprar");
    if (filters.quartos) filterParts.push(`${filters.quartos}+ quartos`);
    if (filters.precoMin || filters.precoMax) {
      const fmt = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}M` : `${(v / 1000).toFixed(0)}k`;
      if (filters.precoMin && filters.precoMax) filterParts.push(`R$${fmt(filters.precoMin)}–${fmt(filters.precoMax)}`);
      else if (filters.precoMax) filterParts.push(`até R$${fmt(filters.precoMax)}`);
      else filterParts.push(`a partir de R$${fmt(filters.precoMin)}`);
    }
    const filterSummary = filterParts.join(" · ");

    return (
      <div className="sticky top-14 z-10 border-b border-border bg-background px-4 py-3">
        <button
          onClick={onOpenMobileFilters}
          className="flex w-full items-center justify-between rounded-2xl bg-muted/40 border border-border px-4 py-3 text-left transition-colors active:bg-muted/60"
        >
          <div className="min-w-0 flex-1">
            <p className="font-body text-sm font-bold text-foreground truncate">{summaryTitle}</p>
            <p className="mt-0.5 font-body text-xs text-muted-foreground truncate">{filterSummary}</p>
          </div>
          <SlidersHorizontal className="h-5 w-5 shrink-0 ml-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-14 z-20 flex items-center gap-2 overflow-x-auto border-b border-border bg-background px-5 py-3 scrollbar-none">
      {/* Search input with chips + autocomplete */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <div
          className="flex flex-wrap items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 transition-colors focus-within:border-primary"
          style={{ minWidth: 240, maxWidth: 420 }}
          onClick={() => { setShowDropdown(true); inputRef.current?.focus(); }}
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          {bairrosSelecionados.map(b => (
            <span
              key={b}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-[12px] font-medium text-primary"
            >
              {b}
              <X
                className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); removeBairro(b); }}
              />
            </span>
          ))}
          {filters.q && (
            <span className="flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-0.5 font-body text-[12px] font-medium text-foreground">
              🔍 {filters.q}
              <X
                className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); setFilter("q", ""); }}
              />
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={bairroInput}
            onChange={(e) => { setBairroInput(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={hasChips ? "Adicionar bairro ou rua..." : "Bairro, rua ou endereço..."}
            className="min-w-[100px] flex-1 border-none bg-transparent py-1 font-body text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Portal-rendered dropdowns to escape overflow-x-auto clipping */}
        {showDropdown && createPortal(
          <div ref={portalDropdownRef} className="z-50" style={{ position: "fixed" }}>
            {/* Autocomplete suggestions */}
            {hasInput && (
              <div className="max-h-72 w-80 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-lg">
                {suggestions.length > 0 && (
                  <>
                    <p className="px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Bairros
                    </p>
                    {suggestions.map(b => (
                      <button
                        key={b}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addBairro(b)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 font-body text-sm text-foreground transition-colors hover:bg-accent/50 active:scale-[0.98]"
                      >
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {b}
                      </button>
                    ))}
                  </>
                )}
                {/* Search by street/address option */}
                <div className={suggestions.length > 0 ? "border-t border-border mt-1 pt-1" : ""}>
                  <p className="px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Endereço
                  </p>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => searchByAddress(bairroInput)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 font-body text-sm text-foreground transition-colors hover:bg-accent/50 active:scale-[0.98]"
                  >
                    <Search className="h-3.5 w-3.5 text-primary" />
                    Buscar por "<span className="font-semibold text-primary">{bairroInput.trim()}</span>"
                  </button>
                </div>
              </div>
            )}

            {/* "More ways to search" when empty + no chips */}
            {!hasInput && !hasChips && (
              <div className="w-72 rounded-xl border border-border bg-card p-2 shadow-lg">
                <p className="px-3 py-2 font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Mais jeitos de buscar
                </p>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleSearchIA}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-foreground transition-colors hover:bg-accent/50 active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  Busca por IA
                </button>
              </div>
            )}

            {/* Suggestions when chips exist but input empty */}
            {!hasInput && hasChips && (
              <div className="max-h-64 w-80 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-lg">
                <p className="px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Adicionar bairro
                </p>
                {suggestions.slice(0, 8).map(b => (
                  <button
                    key={b}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addBairro(b)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 font-body text-sm text-foreground transition-colors hover:bg-accent/50 active:scale-[0.98]"
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
      </div>


      {/* Cidade */}
      <FilterPill
        label="Cidade"
        value={cidadeLabel}
        active={filters.cidade !== "Porto Alegre"}
        onClear={() => setFilter("cidade", "Porto Alegre")}
      >
        <PillOption
          selected={filters.cidade === ""}
          onClick={() => setFilter("cidade", filters.cidade === "" ? "Porto Alegre" : "")}
        >
          Todas
        </PillOption>
        {CIDADES_PERMITIDAS.map((c) => (
          <PillOption
            key={c}
            selected={filters.cidade === c}
            onClick={() => setFilter("cidade", filters.cidade === c ? "" : c)}
          >
            {c}
          </PillOption>
        ))}
      </FilterPill>

      {/* Tipo */}
      <FilterPill
        label="Tipo"
        value={tipoLabel}
        active={!!filters.tipo}
        onClear={() => setFilter("tipo", "")}
      >
        {propertyTypes.map((t) => (
          <PillOption
            key={t.value}
            selected={filters.tipo === t.value}
            onClick={() => setFilter("tipo", filters.tipo === t.value ? "" : t.value)}
          >
            {t.label}
          </PillOption>
        ))}
      </FilterPill>

      {/* Fase */}
      <FilterPill
        label="Fase"
        value={faseLabel}
        active={!!filters.fase}
        onClear={() => setFilter("fase", "")}
      >
        {faseOptions.map((f) => (
          <PillOption
            key={f.value}
            selected={filters.fase === f.value}
            onClick={() => setFilter("fase", filters.fase === f.value ? "" : f.value)}
          >
            {f.label}
          </PillOption>
        ))}
      </FilterPill>

      {/* Preço */}
      <FilterPill
        label="Preço"
        value={precoLabel || (filters.precoMin || filters.precoMax ? formatPrecoLabel(filters.precoMin, filters.precoMax) : undefined)}
        active={!!(filters.precoMin || filters.precoMax)}
        onClear={() => { setFilter("precoMin", 0); setFilter("precoMax", 0); }}
      >
        {precoRanges.map((r) => (
          <PillOption
            key={r.label}
            selected={filters.precoMin === r.min && filters.precoMax === r.max}
            onClick={() => {
              const isSelected = filters.precoMin === r.min && filters.precoMax === r.max;
              setFilter("precoMin", isSelected ? 0 : r.min);
              setFilter("precoMax", isSelected ? 0 : r.max);
            }}
          >
            {r.label}
          </PillOption>
        ))}
        <div className="mt-2 border-t border-border pt-3 px-1">
          <p className="mb-2 font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Valor personalizado
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-body text-[11px] text-muted-foreground">R$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Mín"
                value={filters.precoMin ? formatCurrency(filters.precoMin) : ""}
                onChange={(e) => setFilter("precoMin", rawCurrency(e.target.value))}
                className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-2 font-body text-[13px] text-foreground outline-none transition-colors focus:border-primary"
              />
            </div>
            <span className="font-body text-xs text-muted-foreground">–</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-body text-[11px] text-muted-foreground">R$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Máx"
                value={filters.precoMax ? formatCurrency(filters.precoMax) : ""}
                onChange={(e) => setFilter("precoMax", rawCurrency(e.target.value))}
                className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-2 font-body text-[13px] text-foreground outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>
        </div>
      </FilterPill>

      {/* Quartos */}
      <FilterPill
        label="Quartos"
        value={filters.quartos ? `${filters.quartos}+ quartos` : undefined}
        active={!!filters.quartos}
        onClear={() => setFilter("quartos", 0)}
      >
        {quartoOptions.map((q) => (
          <PillOption
            key={q}
            selected={filters.quartos === q}
            onClick={() => setFilter("quartos", filters.quartos === q ? 0 : q)}
          >
            {q}+ quartos
          </PillOption>
        ))}
      </FilterPill>

      {/* Área */}
      <FilterPill
        label="Área"
        value={areaLabel}
        active={!!(filters.areaMin || filters.areaMax)}
        onClear={() => { setFilter("areaMin", 0); setFilter("areaMax", 0); }}
      >
        {areaRanges.map((r) => (
          <PillOption
            key={r.label}
            selected={filters.areaMin === r.min && filters.areaMax === r.max}
            onClick={() => {
              const isSelected = filters.areaMin === r.min && filters.areaMax === r.max;
              setFilter("areaMin", isSelected ? 0 : r.min);
              setFilter("areaMax", isSelected ? 0 : r.max);
            }}
          >
            {r.label}
          </PillOption>
        ))}
        <div className="mt-2 border-t border-border pt-3 px-1">
          <p className="mb-2 font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Área personalizada
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Mín"
                value={filters.areaMin || ""}
                onChange={(e) => setFilter("areaMin", Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-3 pr-8 font-body text-[13px] text-foreground outline-none transition-colors focus:border-primary"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-body text-[11px] text-muted-foreground">m²</span>
            </div>
            <span className="font-body text-xs text-muted-foreground">–</span>
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Máx"
                value={filters.areaMax || ""}
                onChange={(e) => setFilter("areaMax", Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-3 pr-8 font-body text-[13px] text-foreground outline-none transition-colors focus:border-primary"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-body text-[11px] text-muted-foreground">m²</span>
            </div>
          </div>
        </div>
      </FilterPill>

      {/* Vagas */}
      <FilterPill
        label="Vagas"
        value={filters.vagas ? `${filters.vagas}+ vagas` : undefined}
        active={!!filters.vagas}
        onClear={() => setFilter("vagas", 0)}
      >
        {vagaOptions.map((v) => (
          <PillOption
            key={v}
            selected={filters.vagas === v}
            onClick={() => setFilter("vagas", filters.vagas === v ? 0 : v)}
          >
            {v}+ vagas
          </PillOption>
        ))}
      </FilterPill>

      {/* + Filtros */}
      <button
        onClick={() => onOpenAdvancedFilters?.()}
        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 font-body text-[13px] font-medium transition-colors ${
          advancedActive
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-foreground hover:bg-muted/50"
        }`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        + Filtros
        {advancedCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {advancedCount}
          </span>
        )}
      </button>

      {/* Reset */}
      {hasAny && (
        <button
          onClick={() => { resetFilters(); setBairroInput(""); }}
          className="flex shrink-0 items-center gap-1 rounded-full px-3 py-2 font-body text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Limpar
        </button>
      )}
    </div>
  );
}
