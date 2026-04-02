import { useState, useEffect, useMemo } from "react";
import { X, ArrowLeft, Search, MapPin, Navigation, Clock, Hash, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchStore } from "@/stores/searchStore";
import { propertyTypes, featureOptions } from "@/data/properties";
import { getBairrosDisponiveis } from "@/services/bairrosCache";
import { getCondominiosDisponiveis } from "@/services/condominiosCache";

const quartoOptions = [1, 2, 3, 4];
const vagaOptions = [0, 1, 2, 3];
const banheiroOptions = [1, 2, 3, 4];

interface Props {
  open: boolean;
  onClose: () => void;
  total: number;
}

type SubPage = null | "location";

export function MobileFiltersSheet({ open, onClose, total }: Props) {
  const { filters, setFilter, resetFilters } = useSearchStore();
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [locationInput, setLocationInput] = useState("");
  const [dbBairros, setDbBairros] = useState<string[]>([]);
  const [condoInput, setCondoInput] = useState(filters.condominio || "");
  const [condoList, setCondoList] = useState<string[]>([]);
  const [condoOpen, setCondoOpen] = useState(false);

  useEffect(() => {
    getBairrosDisponiveis().then(data => {
      setDbBairros(data.map(d => d.bairro));
    });
    getCondominiosDisponiveis().then(setCondoList);
  }, []);

  const condoSuggestions = useMemo(() => {
    if (!condoInput.trim()) return condoList.slice(0, 8);
    const q = condoInput.toLowerCase();
    return condoList.filter(c => c.toLowerCase().includes(q)).slice(0, 10);
  }, [condoInput, condoList]);

  const bairrosSelecionados = useMemo(() => {
    const bairroStr = filters.bairro || "";
    if (!bairroStr) return [];
    return bairroStr.split(",").map(s => s.trim()).filter(Boolean);
  }, [filters.bairro]);

  const locationSuggestions = useMemo(() => {
    const available = dbBairros.filter(b => !bairrosSelecionados.includes(b));
    if (!locationInput.trim()) return available.slice(0, 12);
    const q = locationInput.toLowerCase();
    return available.filter(b => b.toLowerCase().includes(q)).slice(0, 12);
  }, [locationInput, bairrosSelecionados, dbBairros]);

  const addBairro = (nome: string) => {
    const next = [...bairrosSelecionados, nome];
    setFilter("bairro", next.join(","));
    if (filters.q) setFilter("q", "");
    setLocationInput("");
    setSubPage(null);
  };

  const removeBairro = (nome: string) => {
    const next = bairrosSelecionados.filter(b => b !== nome);
    setFilter("bairro", next.join(","));
  };

  const handlePertoDeVoce = () => {
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
          setSubPage(null);
        },
        () => {
          import("sonner").then(({ toast }) => toast.error("Não foi possível obter sua localização"));
        }
      );
    }
  };

  const activeCount = [
    filters.tipo,
    filters.precoMin || filters.precoMax,
    filters.quartos,
    filters.vagas,
    filters.banheiros,
    filters.bairro,
    filters.areaMin || filters.areaMax,
    filters.codigo,
  ].filter(Boolean).length + filters.diferenciais.length;

  const handleReset = () => {
    resetFilters();
    setLocationInput("");
  };

  const locationDisplay = bairrosSelecionados.length > 0
    ? bairrosSelecionados.join(", ") + ", Porto Alegre"
    : "Qualquer lugar em Porto Alegre";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          {/* Location sub-page */}
          <AnimatePresence>
            {subPage === "location" && (
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 z-10 flex flex-col bg-background"
              >
                {/* Header */}
                <div className="px-4 pt-4 pb-2">
                  <button onClick={() => setSubPage(null)} className="p-1 -ml-1">
                    <ArrowLeft className="h-6 w-6 text-foreground" />
                  </button>
                  <h2 className="mt-4 font-body text-2xl font-extrabold text-foreground">
                    Localização
                  </h2>
                </div>

                {/* Search input */}
                <div className="px-4 mt-2">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                    <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <input
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="Bairro em Porto Alegre"
                      autoFocus
                      className="w-full bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Selected chips */}
                {bairrosSelecionados.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-4 mt-3">
                    {bairrosSelecionados.map(b => (
                      <span
                        key={b}
                        className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 font-body text-[13px] font-medium text-primary"
                      >
                        {b}
                        <X
                          className="h-3.5 w-3.5 cursor-pointer opacity-60 hover:opacity-100"
                          onClick={() => removeBairro(b)}
                        />
                      </span>
                    ))}
                  </div>
                )}

                {/* Results */}
                <div className="flex-1 overflow-y-auto px-4 mt-4">
                  {locationInput.trim() === "" && bairrosSelecionados.length === 0 && (
                    <>
                      <p className="font-body text-sm font-bold text-foreground mb-3">
                        Mais jeitos de buscar
                      </p>
                      <button
                        onClick={handlePertoDeVoce}
                        className="flex w-full items-center gap-3 py-3 font-body text-sm text-foreground"
                      >
                        <Navigation className="h-5 w-5 text-muted-foreground" />
                        Perto de você
                      </button>
                      <div className="h-px bg-border my-2" />
                    </>
                  )}

                  <p className="font-body text-sm font-bold text-foreground mb-3 mt-2">
                    {locationInput.trim() ? "Resultados" : "Bairros disponíveis"}
                  </p>
                  {locationSuggestions.map(b => (
                    <button
                      key={b}
                      onClick={() => addBairro(b)}
                      className="flex w-full items-center gap-3 py-3 font-body text-sm text-foreground active:bg-secondary/50 rounded-lg px-1 transition-colors"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {b}
                    </button>
                  ))}
                  {locationSuggestions.length === 0 && (
                    <p className="py-6 text-center font-body text-sm text-muted-foreground">
                      Nenhum bairro encontrado
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main filters page */}
          <div className="flex-1 overflow-y-auto">
            {/* Close */}
            <div className="px-4 pt-4 pb-1">
              <button onClick={onClose} className="p-1 -ml-1">
                <X className="h-6 w-6 text-foreground" />
              </button>
            </div>

            <div className="px-5 pb-32">
              {/* Localização */}
              <section className="mt-4">
                <p className="font-body text-base font-bold text-foreground">Localização</p>
                <button
                  onClick={() => setSubPage("location")}
                  className="mt-3 flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3.5 text-left transition-colors active:bg-secondary/50"
                >
                  <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="font-body text-sm text-foreground truncate">
                    {locationDisplay}
                  </span>
                </button>
              </section>

              {/* Valor */}
              <section className="mt-8">
                <p className="font-body text-base font-bold text-foreground">Valor</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">R$</span>
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={filters.precoMin || ""}
                      onChange={(e) => setFilter("precoMin", Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-border bg-background py-3.5 pl-10 pr-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">R$</span>
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={filters.precoMax || ""}
                      onChange={(e) => setFilter("precoMax", Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-border bg-background py-3.5 pl-10 pr-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>
              </section>

              {/* Tipos de imóvel */}
              <section className="mt-8">
                <p className="font-body text-base font-bold text-foreground">Tipos de imóvel</p>
                <div className="mt-3 space-y-1">
                  {propertyTypes.map((t) => {
                    const selectedTipos = filters.tipo ? filters.tipo.split(",").map(s => s.trim()).filter(Boolean) : [];
                    const isSelected = selectedTipos.includes(t.value);
                    const toggleTipo = () => {
                      const next = isSelected
                        ? selectedTipos.filter(v => v !== t.value)
                        : [...selectedTipos, t.value];
                      setFilter("tipo", next.join(","));
                    };
                    return (
                      <label
                        key={t.value}
                        className="flex items-center gap-3 py-3 cursor-pointer"
                        onClick={toggleTipo}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        >
                          {isSelected && (
                            <svg className="h-3.5 w-3.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className="font-body text-sm text-foreground">{t.label}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Quartos */}
              <section className="mt-8">
                <p className="font-body text-base font-bold text-foreground">Quartos</p>
                <div className="mt-3 flex gap-2">
                  {quartoOptions.map((q) => (
                    <button
                      key={q}
                      onClick={() => setFilter("quartos", filters.quartos === q ? 0 : q)}
                      className={`flex h-11 w-14 items-center justify-center rounded-full font-body text-sm font-medium transition-colors ${
                        filters.quartos === q
                          ? "bg-primary/10 text-primary border-[1.5px] border-primary"
                          : "bg-muted/50 text-foreground"
                      }`}
                    >
                      {q}+
                    </button>
                  ))}
                </div>
              </section>

              {/* Vagas de garagem */}
              <section className="mt-8">
                <p className="font-body text-base font-bold text-foreground">Vagas de garagem</p>
                <div className="mt-3 flex gap-2">
                  {vagaOptions.map((v) => (
                    <button
                      key={v}
                      onClick={() => setFilter("vagas", filters.vagas === v ? 0 : v)}
                      className={`flex h-11 items-center justify-center rounded-full px-4 font-body text-sm font-medium transition-colors ${
                        filters.vagas === v
                          ? "bg-primary/10 text-primary border-[1.5px] border-primary"
                          : "bg-muted/50 text-foreground"
                      }`}
                    >
                      {v === 0 ? "Tanto faz" : `${v}+`}
                    </button>
                  ))}
                </div>
              </section>

              {/* Banheiros */}
              <section className="mt-8">
                <p className="font-body text-base font-bold text-foreground">Banheiros</p>
                <div className="mt-3 flex gap-2">
                  {banheiroOptions.map((b) => (
                    <button
                      key={b}
                      onClick={() => setFilter("banheiros", filters.banheiros === b ? 0 : b)}
                      className={`flex h-11 w-14 items-center justify-center rounded-full font-body text-sm font-medium transition-colors ${
                        filters.banheiros === b
                          ? "bg-primary/10 text-primary border-[1.5px] border-primary"
                          : "bg-muted/50 text-foreground"
                      }`}
                    >
                      {b}+
                    </button>
                  ))}
                </div>
              </section>

              {/* Área */}
              <section className="mt-8">
                <p className="font-body text-base font-bold text-foreground">Área</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={filters.areaMin || ""}
                      onChange={(e) => setFilter("areaMin", Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-border bg-background py-3.5 pl-4 pr-10 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">m²</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={filters.areaMax || ""}
                      onChange={(e) => setFilter("areaMax", Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-border bg-background py-3.5 pl-4 pr-10 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">m²</span>
                  </div>
                </div>
              </section>

              {/* Código do imóvel */}
              <section className="mt-8">
                <p className="font-body text-base font-bold text-foreground">Código do imóvel</p>
                <div className="mt-3">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5">
                    <Hash className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Ex: 17485-BT"
                      value={filters.codigo || ""}
                      onChange={(e) => setFilter("codigo", e.target.value.trim())}
                      className="w-full bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </section>

              {/* Andar mínimo */}
              <section className="mt-8">
                <p className="font-body text-base font-bold text-foreground">Andar mínimo</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[{ label: "Qualquer", value: 0 }, { label: "1+", value: 1 }, { label: "5+", value: 5 }, { label: "10+", value: 10 }, { label: "15+", value: 15 }].map((a) => (
                    <button
                      key={a.value}
                      onClick={() => setFilter("andarMin", filters.andarMin === a.value ? 0 : a.value)}
                      className={`flex h-11 items-center justify-center rounded-full px-4 font-body text-sm font-medium transition-colors ${
                        filters.andarMin === a.value
                          ? "bg-primary/10 text-primary border-[1.5px] border-primary"
                          : "bg-muted/50 text-foreground"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Condomínio máximo */}
              <section className="mt-8">
                <p className="font-body text-base font-bold text-foreground">Condomínio máximo</p>
                <div className="mt-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">R$</span>
                  <input
                    type="number"
                    placeholder="Ex: 1500"
                    value={filters.condominioMax || ""}
                    onChange={(e) => setFilter("condominioMax", Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-10 pr-4 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>
              </section>

              {/* IPTU máximo */}
              <section className="mt-8">
                <p className="font-body text-base font-bold text-foreground">IPTU máximo</p>
                <div className="mt-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">R$</span>
                  <input
                    type="number"
                    placeholder="Ex: 500"
                    value={filters.iptuMax || ""}
                    onChange={(e) => setFilter("iptuMax", Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-10 pr-4 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>
              </section>

              {/* Características */}
              <section className="mt-8">
                <p className="font-body text-base font-bold text-foreground">Características</p>
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
                        className={`rounded-full px-3.5 py-2.5 font-body text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary border-[1.5px] border-primary"
                            : "bg-muted/50 text-foreground"
                        }`}
                      >
                        {feat}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background px-5 py-4">
            <button
              onClick={handleReset}
              className="font-body text-sm font-semibold text-primary transition-colors active:opacity-70"
            >
              Limpar
            </button>
            <button
              onClick={onClose}
              className="rounded-full bg-primary px-8 py-3.5 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97]"
            >
              Ver {total.toLocaleString("pt-BR")} imóveis
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
