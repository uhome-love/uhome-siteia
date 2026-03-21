import { useState } from "react";
import { useSearchStore, type SearchFilters } from "@/stores/searchStore";
import { neighborhoods, propertyTypes, featureOptions } from "@/data/properties";
import { SlidersHorizontal, X, ChevronDown, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SearchFiltersPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { filters, setFilter, resetFilters } = useSearchStore();
  const [expandedSection, setExpandedSection] = useState<string | null>("tipo");

  const toggle = (section: string) =>
    setExpandedSection((s) => (s === section ? null : section));

  const activeCount = countActive(filters);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-80 flex-col border-r border-border bg-background lg:static lg:z-auto lg:translate-x-0 lg:border-r-0"
        style={{ transform: undefined }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="font-body text-sm font-semibold text-foreground">Filtros</span>
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-body text-[10px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {activeCount > 0 && (
              <button onClick={resetFilters} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground" title="Limpar filtros">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground lg:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable filters */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
          {/* Tipo */}
          <FilterSection title="Tipo de imóvel" id="tipo" expanded={expandedSection} onToggle={toggle}>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setFilter("tipo", filters.tipo === t.value ? "" : t.value)}
                  className={`rounded-full border px-3 py-1.5 font-body text-xs transition-all ${
                    filters.tipo === t.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Bairro */}
          <FilterSection title="Bairro" id="bairro" expanded={expandedSection} onToggle={toggle}>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {neighborhoods.map((n) => (
                <button
                  key={n}
                  onClick={() => setFilter("bairro", filters.bairro === n ? "" : n)}
                  className={`block w-full rounded-lg px-3 py-2 text-left font-body text-xs transition-colors ${
                    filters.bairro === n
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Preço */}
          <FilterSection title="Preço" id="preco" expanded={expandedSection} onToggle={toggle}>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={filters.precoMin || ""}
                onChange={(e) => setFilter("precoMin", Number(e.target.value))}
                className="w-full rounded-lg bg-input px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Máx"
                value={filters.precoMax || ""}
                onChange={(e) => setFilter("precoMax", Number(e.target.value))}
                className="w-full rounded-lg bg-input px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </FilterSection>

          {/* Área */}
          <FilterSection title="Área (m²)" id="area" expanded={expandedSection} onToggle={toggle}>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={filters.areaMin || ""}
                onChange={(e) => setFilter("areaMin", Number(e.target.value))}
                className="w-full rounded-lg bg-input px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Máx"
                value={filters.areaMax || ""}
                onChange={(e) => setFilter("areaMax", Number(e.target.value))}
                className="w-full rounded-lg bg-input px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </FilterSection>

          {/* Quartos / Banheiros / Vagas */}
          <FilterSection title="Cômodos e vagas" id="comodos" expanded={expandedSection} onToggle={toggle}>
            <div className="space-y-3">
              <CounterRow label="Quartos" value={filters.quartos} onChange={(v) => setFilter("quartos", v)} />
              <CounterRow label="Banheiros" value={filters.banheiros} onChange={(v) => setFilter("banheiros", v)} />
              <CounterRow label="Vagas" value={filters.vagas} onChange={(v) => setFilter("vagas", v)} />
            </div>
          </FilterSection>

          {/* Diferenciais */}
          <FilterSection title="Diferenciais" id="diferenciais" expanded={expandedSection} onToggle={toggle}>
            <div className="flex flex-wrap gap-2">
              {featureOptions.map((f) => {
                const active = filters.diferenciais.includes(f);
                return (
                  <button
                    key={f}
                    onClick={() => {
                      const next = active
                        ? filters.diferenciais.filter((d) => d !== f)
                        : [...filters.diferenciais, f];
                      setFilter("diferenciais", next);
                    }}
                    className={`rounded-full border px-3 py-1.5 font-body text-xs transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        </div>
      </motion.aside>
    </>
  );
}

function FilterSection({
  title, id, expanded, onToggle, children,
}: {
  title: string; id: string;
  expanded: string | null; onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  const isOpen = expanded === id;
  return (
    <div className="border-b border-border pb-3">
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between py-3"
      >
        <span className="font-body text-xs font-semibold uppercase tracking-wider text-foreground">
          {title}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CounterRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
          disabled={value === 0}
        >
          −
        </button>
        <span className="w-4 text-center font-body text-sm font-medium text-foreground">
          {value || "–"}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          +
        </button>
      </div>
    </div>
  );
}

function countActive(f: SearchFilters): number {
  let c = 0;
  if (f.finalidade) c++;
  if (f.tipo) c++;
  if (f.bairro) c++;
  if (f.precoMin) c++;
  if (f.precoMax) c++;
  if (f.areaMin) c++;
  if (f.areaMax) c++;
  if (f.quartos) c++;
  if (f.banheiros) c++;
  if (f.vagas) c++;
  c += f.diferenciais.length;
  return c;
}
