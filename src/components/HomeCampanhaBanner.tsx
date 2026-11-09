import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useCorretor } from "@/contexts/CorretorContext";
import { useCampanhaDestaque, useProdutosFoco, formatPreco } from "@/lib/produtosFoco";
import { NATAL_ART, NatalLuzes, Ouro, natalBg } from "@/components/foco/NatalArt";

/** Banner da campanha ativa + faixa de produtos, logo abaixo da busca da página principal. */
export function HomeCampanhaBanner() {
  const { prefixLink } = useCorretor();
  const { campanha: c, black } = useCampanhaDestaque();
  const { data: produtos = [] } = useProdutosFoco();
  if (!c && !produtos.length) return null;
  const linkTodos = c ? `/campanha/${c.slug}` : "/em-foco";

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-8">
      {c && (
        <Link
          to={prefixLink(`/campanha/${c.slug}`)}
          className={`group relative block overflow-hidden rounded-3xl ${black ? "bg-noir text-noir-foreground" : `${natalBg} text-natal-foreground`}`}
        >
          <NatalLuzes />
          <div className="relative grid items-center gap-6 px-6 pb-8 pt-4 sm:px-10 sm:pb-10 lg:grid-cols-[1fr_auto]">
            <div className="relative z-10">
              <img src={NATAL_ART.selo} alt="Natal Chave de Ouro" className="h-14 w-auto sm:h-16" />
              <h2 className="mt-4 font-natal text-3xl font-extrabold leading-tight sm:text-5xl">
                {black ? <>Black Natal <Ouro>Uhome</Ouro></> : <>Natal <Ouro>Chave de Ouro</Ouro></>}
              </h2>
              <p className="mt-3 max-w-xl font-body text-sm text-natal-foreground/85 sm:text-base">{c.subtitulo}</p>
              <span className="mt-6 inline-flex h-12 items-center gap-2 rounded-full px-6 font-body text-sm font-bold text-natal-deep transition-transform group-hover:scale-[1.02]" style={{ backgroundImage: "var(--natal-gold-grad)" }}>
                Ver os {produtos.length || ""} empreendimentos <ArrowRight className="h-4 w-4" />
              </span>
              <p className="mt-3 font-body text-xs text-natal-foreground/70">{black ? "Condições Black só até 29/11" : "Contratos até 18 de dezembro"}</p>
            </div>
            <img src={NATAL_ART.homi} alt="" loading="lazy" className="pointer-events-none absolute -bottom-4 right-2 hidden h-56 w-auto lg:static lg:block lg:h-64" />
            <img src={NATAL_ART.presentes} alt="" loading="lazy" className="pointer-events-none absolute -bottom-2 -right-4 h-28 w-auto opacity-90 lg:hidden" />
          </div>
        </Link>
      )}

      {produtos.length > 0 && (
        <div className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground sm:text-2xl">
              {c ? <img src={NATAL_ART.chave} alt="" className="h-5 w-auto" /> : <Sparkles className="h-5 w-5 text-primary" />}
              {c ? "Empreendimentos do Natal" : "Uhome em Foco"}
            </h2>
            <Link to={prefixLink(linkTodos)} className="whitespace-nowrap font-body text-sm font-semibold text-primary">Ver todos →</Link>
          </div>
          <div className="-mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8">
            {produtos.map((p) => (
              <Link key={p.id} to={prefixLink(`/em-foco/${p.slug}`)} className="group w-[72vw] max-w-[260px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 bg-card sm:w-64">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {p.capa_url && <img src={p.capa_url} alt={p.nome} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                  {c && <span className="absolute left-2 top-2 rounded-full bg-natal px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wide text-natal-gold">{black ? "Black Natal" : "Natal"}</span>}
                </div>
                <div className="p-4">
                  <p className="truncate font-heading text-base font-bold text-foreground">{p.nome}</p>
                  <p className="truncate font-body text-xs text-muted-foreground">{p.bairro}, {p.cidade}</p>
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
