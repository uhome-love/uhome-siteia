import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useCorretor } from "@/contexts/CorretorContext";
import { useCampanhaDestaque, useProdutosFoco, formatPreco } from "@/lib/produtosFoco";
import { NATAL_ART, NatalLuzes, Ouro, natalBg } from "@/components/foco/NatalArt";

const FAIXAS = [
  { id: "todas", label: "Todos os valores", min: 0, max: Infinity },
  { id: "ate400", label: "Até R$ 400 mil", min: 0, max: 400_000 },
  { id: "400a1m", label: "R$ 400 mil a 1 mi", min: 400_000, max: 1_000_000 },
  { id: "1m", label: "Acima de R$ 1 mi", min: 1_000_000, max: Infinity },
];

/** Banner da campanha ativa + faixa de produtos, logo abaixo da busca da página principal. */
export function HomeCampanhaBanner() {
  const { prefixLink } = useCorretor();
  const { campanha: c, black, isLoading: carregandoCampanha } = useCampanhaDestaque();
  const { data: produtos = [], isLoading: carregandoProdutos } = useProdutosFoco();
  const trilho = useRef<HTMLDivElement>(null);
  const [faixa, setFaixa] = useState("todas");
  const [cidade, setCidade] = useState("todas");
  const fim = black ? c?.config.black?.fim : c?.fim;
  const alvo = useMemo(() => (fim ? new Date(`${fim}T23:59:59-03:00`).getTime() : 0), [fim]);
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setAgora(Date.now()), 60_000); return () => clearInterval(t); }, []);
  const dias = Math.max(0, Math.floor((alvo - agora) / 86_400_000));
  const cidades = Array.from(new Set(produtos.map((p) => p.cidade).filter(Boolean))) as string[];
  const F = FAIXAS.find((f) => f.id === faixa)!;
  const lista = produtos.filter((p) => (cidade === "todas" || p.cidade === cidade) && (p.preco_a_partir ?? 0) >= F.min && (p.preco_a_partir ?? 0) < F.max);
  const chip = (on: boolean) => `h-9 whitespace-nowrap rounded-full border px-4 font-body text-[13px] font-medium transition-colors ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:border-foreground/40"}`;
  const rolar = (dir: number) => trilho.current?.scrollBy({ left: dir * (trilho.current.clientWidth * 0.8), behavior: "smooth" });
  // Reserva o espaço enquanto carrega, para o conteúdo abaixo não "pular".
  if (carregandoCampanha || carregandoProdutos) {
    return (
      <section aria-hidden className="mx-auto max-w-7xl px-4 pt-8 sm:px-8">
        <div className="h-[282px] animate-pulse rounded-3xl bg-muted lg:h-[238px]" />
        <div className="mt-8 h-[436px] lg:h-[413px]" />
      </section>
    );
  }
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
          <div className="relative grid items-center gap-4 px-6 pb-6 pt-5 sm:px-10 sm:pb-7 lg:grid-cols-[1fr_auto]">
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <img src={NATAL_ART.selo} alt="Natal Chave de Ouro" width={48} height={48} className="h-12 w-auto flex-shrink-0 sm:h-14" />
                <h2 className="font-natal text-2xl font-extrabold leading-tight sm:text-4xl">
                  {black ? <>Black Natal <Ouro>Uhome</Ouro></> : <>Natal <Ouro>Chave de Ouro</Ouro></>}
                </h2>
              </div>
              <p className="mt-2 max-w-xl font-body text-sm text-natal-foreground/85">{c.subtitulo}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="inline-flex h-11 items-center gap-2 rounded-full px-5 font-body text-sm font-bold text-natal-deep transition-transform group-hover:scale-[1.02]" style={{ backgroundImage: "var(--natal-gold-grad)" }}>
                  Ver os {produtos.length || ""} empreendimentos <ArrowRight className="h-4 w-4" />
                </span>
                <p className="font-body text-xs text-natal-foreground/70">
                  {alvo > agora && <><strong className="text-natal-gold">Faltam {dias} dias</strong> · </>}
                  {black ? "condições Black só até 29/11" : "contratos até 18/12 · comprou, ganhou presente da urna"}
                </p>
              </div>
            </div>
            <img src={NATAL_ART.homi} alt="" loading="lazy" className="uh-float pointer-events-none hidden h-40 w-auto self-end lg:block xl:mr-6" />
            <img src={NATAL_ART.presentes} alt="" loading="lazy" className="pointer-events-none absolute -bottom-2 -right-4 h-20 w-auto opacity-80 lg:hidden" />
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
            <div className="flex items-center gap-2">
              <Link to={prefixLink(linkTodos)} className="whitespace-nowrap font-body text-sm font-semibold text-primary">Ver todos →</Link>
              <button onClick={() => rolar(-1)} aria-label="Anteriores" className="hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary md:flex"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => rolar(1)} aria-label="Próximos" className="hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary md:flex"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          {c && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {FAIXAS.map((f) => <button key={f.id} onClick={() => setFaixa(f.id)} className={chip(faixa === f.id)}>{f.label}</button>)}
              {cidades.length > 1 && <span className="mx-1 w-px flex-shrink-0 bg-border" />}
              {cidades.length > 1 && ["todas", ...cidades].map((x) => <button key={x} onClick={() => setCidade(x)} className={chip(cidade === x)}>{x === "todas" ? "Todas as cidades" : x}</button>)}
            </div>
          )}
          <div ref={trilho} className="scrollbar-none mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none]">
            {lista.map((p) => (
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
