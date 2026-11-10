import { X } from "lucide-react";
import { useSearchStore, type SearchFilters } from "@/stores/searchStore";

const fmt = (v: number) =>
  v >= 1_000_000 ? `R$ ${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi` : `R$ ${Math.round(v / 1000)} mil`;

type Chip = { key: string; label: string; clear: Partial<SearchFilters> };

export function buildChips(f: SearchFilters): Chip[] {
  const c: Chip[] = [];
  if (f.tipo) c.push({ key: "tipo", label: f.tipo.split(",").join(", "), clear: { tipo: "" } });
  if (f.bairro) c.push({ key: "bairro", label: f.bairro.split(",").join(", "), clear: { bairro: "" } });
  if (f.precoMin || f.precoMax)
    c.push({
      key: "preco",
      label: f.precoMin && f.precoMax ? `${fmt(f.precoMin)} – ${fmt(f.precoMax)}` : f.precoMin ? `A partir de ${fmt(f.precoMin)}` : `Até ${fmt(f.precoMax)}`,
      clear: { precoMin: 0, precoMax: 0 },
    });
  if (f.quartos) c.push({ key: "quartos", label: `${f.quartos}+ quartos`, clear: { quartos: 0 } });
  if (f.banheiros) c.push({ key: "banheiros", label: `${f.banheiros}+ banheiros`, clear: { banheiros: 0 } });
  if (f.vagas) c.push({ key: "vagas", label: `${f.vagas}+ vagas`, clear: { vagas: 0 } });
  if (f.areaUtilMin || f.areaUtilMax) c.push({ key: "areaUtil", label: `Área privativa ${f.areaUtilMin || 0}–${f.areaUtilMax || "∞"} m²`, clear: { areaUtilMin: 0, areaUtilMax: 0 } });
  if (f.areaMin || f.areaMax) c.push({ key: "area", label: `Área total ${f.areaMin || 0}–${f.areaMax || "∞"} m²`, clear: { areaMin: 0, areaMax: 0 } });
  if (f.condominioMax) c.push({ key: "cond", label: `Condomínio até ${fmt(f.condominioMax)}`, clear: { condominioMax: 0 } });
  if (f.iptuMax) c.push({ key: "iptu", label: `IPTU até ${fmt(f.iptuMax)}`, clear: { iptuMax: 0 } });
  if (f.condominio) c.push({ key: "condominio", label: f.condominio, clear: { condominio: "" } });
  if (f.fase) c.push({ key: "fase", label: f.fase.replace(/_/g, " "), clear: { fase: "" } });
  if (f.bounds) c.push({ key: "bounds", label: "Área do mapa", clear: { bounds: null } });
  return c;
}

export function ActiveFilterChips() {
  const { filters, setFilters } = useSearchStore();
  const chips = buildChips(filters);
  if (chips.length === 0) return null;
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-4 py-2 scrollbar-hide sm:px-6" aria-label="Filtros aplicados">
      {chips.map((ch) => (
        <button
          key={ch.key}
          onClick={() => setFilters(ch.clear)}
          aria-label={`Remover filtro ${ch.label}`}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 font-body text-xs font-medium capitalize text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10"
        >
          {ch.label}
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          onClick={() => setFilters(chips.reduce((a, c) => ({ ...a, ...c.clear }), {}))}
          className="shrink-0 px-2 font-body text-xs font-semibold text-primary hover:text-primary/70"
        >
          Limpar tudo
        </button>
      )}
    </div>
  );
}
