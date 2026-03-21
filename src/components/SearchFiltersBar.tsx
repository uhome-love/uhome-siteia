import { Search, RotateCcw, MapPin } from "lucide-react";
import { useSearchStore } from "@/stores/searchStore";
import { FilterPill, PillOption } from "@/components/FilterPill";
import { propertyTypes } from "@/data/properties";
import { CIDADES_PERMITIDAS } from "@/services/imoveis";

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

export function SearchFiltersBar() {
  const { filters, setFilter, resetFilters } = useSearchStore();

  const tipoLabel = propertyTypes.find((t) => t.value === filters.tipo)?.label;
  const precoLabel = precoRanges.find(
    (r) => r.min === filters.precoMin && r.max === filters.precoMax
  )?.label;
  const areaLabel = areaRanges.find(
    (r) => r.min === filters.areaMin && r.max === filters.areaMax
  )?.label;
  const cidadeLabel = filters.cidade || "Todas";

  const hasAny =
    filters.tipo || filters.precoMin || filters.precoMax || filters.areaMin || filters.areaMax || filters.quartos || filters.vagas || filters.q || (filters.cidade && filters.cidade !== "Porto Alegre");

  return (
    <div className="sticky top-16 z-10 flex items-center gap-2 overflow-x-auto border-b border-border bg-background px-5 py-3 scrollbar-none">
      {/* Search input */}
      <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2" style={{ minWidth: 200 }}>
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={filters.q}
          onChange={(e) => setFilter("q", e.target.value)}
          placeholder="Bairro ou tipo..."
          className="w-full border-none bg-transparent font-body text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
        />
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

      {/* Preço */}
      <FilterPill
        label="Preço"
        value={precoLabel}
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

      {/* Reset */}
      {hasAny && (
        <button
          onClick={resetFilters}
          className="flex shrink-0 items-center gap-1 rounded-full px-3 py-2 font-body text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Limpar
        </button>
      )}
    </div>
  );
}
