import { Link } from "react-router-dom";
import { ArrowRight, Gift, Sparkles } from "lucide-react";
import { useCorretor } from "@/contexts/CorretorContext";
import { blackAtiva, useCampanhasAtivas, useProdutosFoco, formatPreco } from "@/lib/produtosFoco";

/** Banner da campanha ativa + faixa de produtos em foco, logo abaixo da busca da página principal. */
export function HomeCampanhaBanner() {
  const { prefixLink } = useCorretor();
  const { data: campanhas = [] } = useCampanhasAtivas();
  const { data: produtos = [] } = useProdutosFoco();
  const c = campanhas.find((x) => x.destaque_home);
  const black = blackAtiva(c);
  if (!c && !produtos.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
      {c && (
        <Link
          to={prefixLink(`/campanha/${c.slug}`)}
          className={`group relative flex flex-col gap-6 overflow-hidden rounded-3xl p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between ${
            black ? "bg-noir text-noir-foreground" : "bg-natal text-natal-foreground"
          }`}
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-around">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className={`mt-2 h-2 w-2 animate-pulse rounded-full ${i % 3 === 0 ? "bg-natal-red" : "bg-natal-gold"}`} style={{ animationDelay: `${(i % 5) * 0.35}s` }} />
            ))}
          </div>
          <div className="relative">
            <p className="flex items-center gap-2 font-body text-xs font-bold uppercase tracking-[0.2em] text-natal-gold">
              <Gift className="h-4 w-4" /> {black ? "Só até 29/11" : "Até 18 de dezembro"}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-5xl">
              {black ? "Black Natal Uhome" : c.titulo}
            </h2>
            <p className="mt-3 max-w-xl font-body text-base opacity-90">{c.subtitulo}</p>
          </div>
          <span className="relative inline-flex flex-shrink-0 items-center gap-2 self-start rounded-full bg-natal-gold px-6 py-3.5 font-body text-sm font-bold text-natal-deep transition-transform group-hover:scale-[1.03] lg:self-center">
            Ver os {produtos.length || ""} empreendimentos <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      )}

      {produtos.length > 0 && (
        <div className="mt-8">
          <div className="flex items-end justify-between">
            <h2 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" /> Uhome em Foco
            </h2>
            <Link to={prefixLink("/em-foco")} className="font-body text-sm font-semibold text-primary">Ver todos →</Link>
          </div>
          <div className="-mx-5 mt-4 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
            {produtos.map((p) => (
              <Link key={p.id} to={prefixLink(`/em-foco/${p.slug}`)} className="group w-64 flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 bg-card">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {p.capa_url && <img src={p.capa_url} alt={p.nome} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                </div>
                <div className="p-4">
                  <p className="font-heading text-base font-bold text-foreground">{p.nome}</p>
                  <p className="font-body text-xs text-muted-foreground">{p.bairro}, {p.cidade}</p>
                  {p.preco_a_partir && <p className="mt-2 font-body text-sm font-semibold text-foreground">a partir de {formatPreco(p.preco_a_partir)}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
