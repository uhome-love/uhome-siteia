import { useRef } from "react";
import { Link } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { useCorretoresVitrine } from "@/hooks/useCorretoresVitrine";

function Estrelas({ n, className = "h-4 w-4" }: { n: number; className?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < Math.round(n) ? "fill-natal-gold text-natal-gold" : "text-border"}`} />
      ))}
    </span>
  );
}

function Setas({ alvo }: { alvo: React.RefObject<HTMLDivElement> }) {
  const rolar = (d: number) => alvo.current?.scrollBy({ left: d * alvo.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <div className="hidden gap-2 md:flex">
      {[-1, 1].map((d) => (
        <button key={d} onClick={() => rolar(d)} aria-label={d < 0 ? "Anteriores" : "Próximos"} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary">
          {d < 0 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
}

/** Prova social: avaliações reais do Google + corretores com foto. Cada bloco some se não houver dados. */
export function HomeConfianca() {
  const { data: g } = useGoogleReviews();
  const { data: corretores = [] } = useCorretoresVitrine();
  const trilhoR = useRef<HTMLDivElement>(null);
  const trilhoC = useRef<HTMLDivElement>(null);
  if (!g && !corretores.length) return null;

  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {g && g.avaliacoes.length > 0 && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary">Quem comprou com a Uhome</p>
                <h2 className="mt-3 font-body text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold leading-tight tracking-tight text-foreground">
                  Nota {g.nota.toLocaleString("pt-BR")} no Google
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <Estrelas n={g.nota} className="h-5 w-5" />
                  {g.maps_url && (
                    <a href={g.maps_url} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-muted-foreground underline-offset-2 hover:underline">
                      {g.total} avaliações reais
                    </a>
                  )}
                </div>
              </div>
              <Setas alvo={trilhoR} />
            </div>
            <div ref={trilhoR} className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none]">
              {g.avaliacoes.map((r) => (
                <figure key={r.nome + r.data} className="flex w-[82vw] max-w-[360px] flex-shrink-0 snap-start flex-col rounded-2xl border border-border bg-card p-6">
                  <Estrelas n={r.estrelas} />
                  <blockquote className="mt-4 line-clamp-6 flex-1 font-body text-sm leading-relaxed text-foreground">“{r.texto}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    {r.foto ? <img src={r.foto} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" /> : <span className="h-9 w-9 rounded-full bg-secondary" />}
                    <span>
                      <span className="block font-body text-sm font-semibold text-foreground">{r.nome}</span>
                      <span className="block font-body text-xs text-muted-foreground">Avaliação no Google</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        )}

        {corretores.length > 0 && (
          <div className={g ? "mt-16" : ""}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary">Nosso time</p>
                <h2 className="mt-3 font-body text-[clamp(1.4rem,3vw,2rem)] font-extrabold leading-tight tracking-tight text-foreground">
                  Conheça nossos corretores
                </h2>
                <p className="mt-2 font-body text-sm text-muted-foreground">Fale direto com um especialista, sem intermediários.</p>
              </div>
              <Setas alvo={trilhoC} />
            </div>
            <div ref={trilhoC} className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none]">
              {corretores.map((c) => {
                const tel = c.telefone?.replace(/\D/g, "");
                const primeiro = c.nome.split(" ")[0];
                return (
                  <div key={c.id} className="w-44 flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card sm:w-52">
                    <Link to={`/c/${c.slug_ref}`} className="block aspect-[4/5] overflow-hidden bg-muted">
                      <img src={c.foto_url} alt={c.nome} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                    </Link>
                    <div className="p-3">
                      <p className="truncate font-body text-sm font-bold text-foreground">{c.nome}</p>
                      {c.creci && <p className="truncate font-body text-[11px] text-muted-foreground">CRECI {c.creci}</p>}
                      {tel && (
                        <a
                          href={`https://wa.me/55${tel}?text=${encodeURIComponent(`Olá ${primeiro}! Vi seu perfil no site da Uhome e quero ajuda para encontrar um imóvel.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-full border border-border font-body text-xs font-semibold text-foreground transition-colors hover:border-foreground"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> Falar com {primeiro}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
