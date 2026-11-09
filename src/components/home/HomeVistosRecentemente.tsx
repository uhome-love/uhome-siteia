import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCorretor } from "@/contexts/CorretorContext";

/** Últimos imóveis abertos pelo visitante (só aparece para quem já navegou). */
export function HomeVistosRecentemente() {
  const { prefixLink } = useCorretor();
  const ids = useMemo(() => {
    try {
      const v = JSON.parse(localStorage.getItem("imoveis_vistos") || "[]");
      return Array.isArray(v) ? (v as string[]).slice(-8).reverse() : [];
    } catch { return []; }
  }, []);

  const { data = [] } = useQuery({
    queryKey: ["vistos-recentes", ids],
    enabled: ids.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("imoveis")
        .select("id, slug, titulo, bairro, preco, quartos, area_util, foto_principal")
        .in("id", ids)
        .eq("status", "disponivel");
      const ordem = new Map(ids.map((id, i) => [id, i]));
      return (data ?? []).filter((i) => i.foto_principal).sort((a, b) => (ordem.get(a.id) ?? 0) - (ordem.get(b.id) ?? 0));
    },
  });

  if (!data.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-8">
      <h2 className="flex items-center gap-2 font-body text-base font-bold text-foreground">
        <History className="h-4 w-4 text-muted-foreground" /> Vistos recentemente
      </h2>
      <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
        {data.map((i) => (
          <Link key={i.id} to={prefixLink(`/imovel/${i.slug}`)} className="flex w-64 flex-shrink-0 snap-start items-center gap-3 rounded-xl border border-border bg-card p-2 transition-colors hover:border-foreground/30">
            <img src={i.foto_principal!} alt="" loading="lazy" className="h-16 w-20 flex-shrink-0 rounded-lg object-cover" />
            <span className="min-w-0">
              <span className="block truncate font-body text-sm font-semibold text-foreground">{i.bairro}</span>
              <span className="block truncate font-body text-xs text-muted-foreground">
                {[i.quartos ? `${i.quartos} quarto${i.quartos > 1 ? "s" : ""}` : null, i.area_util ? `${Math.round(Number(i.area_util))} m²` : null].filter(Boolean).join(" · ")}
              </span>
              {i.preco && <span className="block font-body text-sm font-bold text-foreground">R$ {Number(i.preco).toLocaleString("pt-BR")}</span>}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
