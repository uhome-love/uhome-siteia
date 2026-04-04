import { useState, useEffect, useMemo } from "react";
import { X, Hash, Building2, DollarSign, Sparkles, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchStore } from "@/stores/searchStore";
import { featureOptions } from "@/data/properties";
import { getCondominiosDisponiveis } from "@/services/condominiosCache";
import { formatCurrency, rawCurrency } from "@/lib/currencyMask";

const banheiroOptions = [1, 2, 3, 4];
const andarOptions = [
  { label: "Qualquer", value: 0 },
  { label: "1+", value: 1 },
  { label: "5+", value: 5 },
  { label: "10+", value: 10 },
  { label: "15+", value: 15 },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdvancedFiltersModal({ open, onClose }: Props) {
  const { filters, setFilter } = useSearchStore();
  const [condoInput, setCondoInput] = useState(filters.condominio || "");
  const [condoList, setCondoList] = useState<string[]>([]);
  const [condoOpen, setCondoOpen] = useState(false);

  useEffect(() => {
    getCondominiosDisponiveis().then(setCondoList);
  }, []);

  const condoSuggestions = useMemo(() => {
    if (!condoInput.trim()) return condoList.slice(0, 8);
    const q = condoInput.toLowerCase();
    return condoList.filter(c => c.toLowerCase().includes(q)).slice(0, 10);
  }, [condoInput, condoList]);

  const advancedCount = [
    filters.banheiros,
    filters.andarMin,
    filters.condominioMax,
    filters.iptuMax,
    filters.codigo,
    filters.condominio,
  ].filter(Boolean).length + filters.diferenciais.length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-body text-lg font-bold text-foreground">+ Filtros</h2>
              <button onClick={onClose} className="rounded-full p-1.5 transition-colors hover:bg-muted">
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
              {/* Banheiros */}
              <section>
                <p className="font-body text-sm font-bold text-foreground">Banheiros</p>
                <div className="mt-3 flex gap-2">
                  {banheiroOptions.map((b) => (
                    <button
                      key={b}
                      onClick={() => setFilter("banheiros", filters.banheiros === b ? 0 : b)}
                      className={`flex h-10 w-14 items-center justify-center rounded-full font-body text-sm font-medium transition-colors ${
                        filters.banheiros === b
                          ? "bg-primary/10 text-primary border-[1.5px] border-primary"
                          : "bg-muted/50 text-foreground hover:bg-muted"
                      }`}
                    >
                      {b}+
                    </button>
                  ))}
                </div>
              </section>

              {/* Andar mínimo */}
              <section>
                <p className="font-body text-sm font-bold text-foreground">Andar mínimo</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {andarOptions.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => setFilter("andarMin", filters.andarMin === a.value ? 0 : a.value)}
                      className={`flex h-10 items-center justify-center rounded-full px-4 font-body text-sm font-medium transition-colors ${
                        filters.andarMin === a.value
                          ? "bg-primary/10 text-primary border-[1.5px] border-primary"
                          : "bg-muted/50 text-foreground hover:bg-muted"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Condomínio máximo */}
              <section>
                <p className="font-body text-sm font-bold text-foreground">Valor máximo do condomínio</p>
                <div className="mt-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 1.500"
                    value={filters.condominioMax ? formatCurrency(filters.condominioMax) : ""}
                    onChange={(e) => setFilter("condominioMax", rawCurrency(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>
              </section>

              {/* IPTU máximo */}
              <section>
                <p className="font-body text-sm font-bold text-foreground">Valor máximo do IPTU</p>
                <div className="mt-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 500"
                    value={filters.iptuMax ? formatCurrency(filters.iptuMax) : ""}
                    onChange={(e) => setFilter("iptuMax", rawCurrency(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>
              </section>

              {/* Condomínio / Empreendimento */}
              <section>
                <p className="font-body text-sm font-bold text-foreground">Condomínio / Empreendimento</p>
                <div className="mt-3 relative">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Ex: Esplêndido Palace"
                      value={condoInput}
                      onChange={(e) => { setCondoInput(e.target.value); setCondoOpen(true); }}
                      onFocus={() => setCondoOpen(true)}
                      className="w-full bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    {filters.condominio && (
                      <X
                        className="h-4 w-4 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => { setFilter("condominio", ""); setCondoInput(""); }}
                      />
                    )}
                  </div>
                  {condoOpen && condoSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                      {condoSuggestions.map(c => (
                        <button
                          key={c}
                          onClick={() => { setFilter("condominio", c); setCondoInput(c); setCondoOpen(false); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 font-body text-sm text-foreground transition-colors hover:bg-accent/50"
                        >
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Código do imóvel */}
              <section>
                <p className="font-body text-sm font-bold text-foreground">Código do imóvel</p>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                  <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Ex: 17485-BT"
                    value={filters.codigo || ""}
                    onChange={(e) => setFilter("codigo", e.target.value.trim())}
                    className="w-full bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </section>

              {/* Características / Diferenciais */}
              <section>
                <p className="font-body text-sm font-bold text-foreground">Características</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {featureOptions.map((feat) => {
                    const isSelected = filters.diferenciais.includes(feat);
                    return (
                      <button
                        key={feat}
                        onClick={() => {
                          const next = isSelected
                            ? filters.diferenciais.filter(d => d !== feat)
                            : [...filters.diferenciais, feat];
                          setFilter("diferenciais", next);
                        }}
                        className={`rounded-full px-3.5 py-2 font-body text-[13px] font-medium transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary border-[1.5px] border-primary"
                            : "bg-muted/50 text-foreground hover:bg-muted"
                        }`}
                      >
                        {feat}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-5 py-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setFilter("banheiros", 0);
                  setFilter("andarMin", 0);
                  setFilter("condominioMax", 0);
                  setFilter("iptuMax", 0);
                  setFilter("codigo", "");
                  setFilter("condominio", "");
                  setCondoInput("");
                  setFilter("diferenciais", []);
                }}
                className="font-body text-sm font-semibold text-primary transition-colors active:opacity-70"
              >
                Limpar filtros
              </button>
              <button
                onClick={onClose}
                className="rounded-full bg-primary px-6 py-3 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97]"
              >
                Aplicar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
