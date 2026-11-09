import { Building2, Star, Users } from "lucide-react";
import { useTotalImoveis, formatTotal } from "@/hooks/useTotalImoveis";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { useCorretoresVitrine } from "@/hooks/useCorretoresVitrine";

/** Faixa fina com números reais logo abaixo da abertura. */
export function HomeFaixaConfianca() {
  const total = useTotalImoveis();
  const { data: g } = useGoogleReviews();
  const { data: corretores } = useCorretoresVitrine();
  const itens = [
    { i: Building2, t: `${formatTotal(total)} imóveis à venda` },
    g ? { i: Star, t: `Nota ${g.nota.toFixed(1).replace(".", ",")} no Google · ${g.total} avaliações` } : null,
    corretores?.length ? { i: Users, t: `${corretores.length} corretores especialistas` } : null,
  ].filter(Boolean) as { i: typeof Star; t: string }[];
  return (
    <div className="border-b border-border/60 bg-card">
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-3 sm:px-8">
        {itens.map((x) => (
          <li key={x.t} className="flex items-center gap-2 font-body text-sm text-muted-foreground">
            <x.i className="h-4 w-4 text-primary" /> <span className="font-semibold text-foreground">{x.t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
