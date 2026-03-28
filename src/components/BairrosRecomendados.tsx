import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useCorretor } from "@/contexts/CorretorContext";
import { useSearchStore } from "@/stores/searchStore";
import { supabase } from "@/integrations/supabase/client";
import { formatPreco } from "@/services/imoveis";

interface BairroInfo {
  bairro: string;
  count: number;
  precoMedio: number;
}

export function BairrosRecomendados() {
  const { prefixLink } = useCorretor();
  const cidade = useSearchStore((s) => s.filters.cidade) || "Porto Alegre";
  const [bairros, setBairros] = useState<BairroInfo[]>([]);
  const [scrollIdx, setScrollIdx] = useState(0);

  useEffect(() => {
    setScrollIdx(0);
    async function load() {
      const query = supabase
        .from("imoveis")
        .select("bairro, preco")
        .eq("status", "disponivel")
        .eq("finalidade", "venda")
        .eq("cidade", cidade)
        .gt("preco", 0);

      const { data } = await query;
      if (!data) return;

      const map = new Map<string, { total: number; soma: number }>();
      for (const row of data) {
        const entry = map.get(row.bairro) || { total: 0, soma: 0 };
        entry.total += 1;
        entry.soma += Number(row.preco);
        map.set(row.bairro, entry);
      }

      const result: BairroInfo[] = [];
      for (const [bairro, { total, soma }] of map.entries()) {
        if (total >= 5) {
          result.push({ bairro, count: total, precoMedio: soma / total });
        }
      }
      result.sort((a, b) => b.count - a.count);
      setBairros(result.slice(0, 12));
    }
    load();
  }, [cidade]);

  const visibleCount = 4;
  const maxIdx = Math.max(0, bairros.length - visibleCount);

  const visible = useMemo(
    () => bairros.slice(scrollIdx, scrollIdx + visibleCount),
    [bairros, scrollIdx]
  );

  if (bairros.length === 0) return null;

  function slugify(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-body text-base font-bold text-foreground">
          Bairros recomendados para comprar imóveis em {cidade}
        </h3>
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => setScrollIdx(Math.max(0, scrollIdx - 1))}
            disabled={scrollIdx === 0}
            className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setScrollIdx(Math.min(maxIdx, scrollIdx + 1))}
            disabled={scrollIdx >= maxIdx}
            className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Desktop: paginated grid */}
      <div className="hidden sm:grid grid-cols-4 gap-3">
        {visible.map((b) => (
          <Link
            key={b.bairro}
            to={prefixLink(`/apartamentos-${slugify(b.bairro)}`)}
            className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
          >
            <div>
              <p className="font-body text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {b.bairro}
              </p>
              <p className="mt-1 font-body text-xs text-muted-foreground">
                {b.count} imóveis para comprar.
              </p>
            </div>
            <div className="mt-6">
              <p className="font-body text-[11px] text-muted-foreground">Valor médio</p>
              <p className="font-body text-sm font-bold text-foreground">
                {formatPreco(b.precoMedio)}
              </p>
            </div>
            <ChevronRight className="absolute right-4 top-5 h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 sm:hidden scrollbar-hide">
        {bairros.map((b) => (
          <Link
            key={b.bairro}
            to={prefixLink(`/apartamentos-${slugify(b.bairro)}`)}
            className="flex min-w-[200px] flex-col justify-between rounded-xl border border-border bg-card p-4 shrink-0"
          >
            <div>
              <p className="font-body text-sm font-bold text-foreground">{b.bairro}</p>
              <p className="mt-1 font-body text-xs text-muted-foreground">
                {b.count} imóveis para comprar.
              </p>
            </div>
            <div className="mt-4">
              <p className="font-body text-[11px] text-muted-foreground">Valor médio</p>
              <p className="font-body text-sm font-bold text-foreground">
                {formatPreco(b.precoMedio)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
