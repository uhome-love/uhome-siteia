import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Gift, Star, KeyRound, Loader2, MessageCircle, ArrowDown, Clock3 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCanonical } from "@/hooks/useCanonical";
import { useCorretor } from "@/contexts/CorretorContext";
import { blackAtiva, useCampanha } from "@/lib/produtosFoco";
import { ProdutoFocoCard } from "@/components/foco/FocoShared";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { FAIXAS_CAMPANHA, filtrarProdutosCampanha } from "@/lib/campanhaFilters";
import { NATAL_ART, NatalLuzes, Ouro, natalBg } from "@/components/foco/NatalArt";

function useCountdown(fim?: string | null) {
  const alvo = useMemo(() => (fim ? new Date(`${fim}T23:59:59-03:00`).getTime() : 0), [fim]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, alvo - now);
  return { dias: Math.floor(ms / 86_400_000), horas: Math.floor((ms / 3_600_000) % 24), min: Math.floor((ms / 60_000) % 60) };
}

export default function CampanhaPage() {
  const { slug } = useParams();
  useCanonical(`/campanha/${slug}`);
  const { data, isLoading } = useCampanha(slug);
  const { prefixLink, corretor, isDirectAccess } = useCorretor();
  const c = data?.campanha;
  const black = blackAtiva(c);
  const fimExibido = black ? c?.config.black?.fim : c?.fim;
  const [cidade, setCidade] = useState("todas");
  const [faixa, setFaixa] = useState("todos");
  const cidades = Array.from(new Set((data?.produtos ?? []).map(p => p.cidade).filter((x): x is string => !!x)));
  const lista = filtrarProdutosCampanha(data?.produtos ?? [], cidade, faixa);
  const { dias, horas, min } = useCountdown(fimExibido);

  useEffect(() => {
    if (!c) return;
    document.title = `${black ? "Black Natal Uhome" : c.titulo} | Imóveis com condição especial | Uhome`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", (c.subtitulo ?? "").slice(0, 158));
  }, [c, black]);

  if (isLoading) {
    return <div className="min-h-screen bg-natal"><Navbar /><div className="flex justify-center pt-40"><Loader2 className="h-6 w-6 animate-spin text-natal-gold" /></div></div>;
  }
  if (!data || !data.vigente || !c) return <Navigate to={prefixLink("/em-foco")} replace />;

  const tel = isDirectAccess ? corretor?.telefone?.replace(/\D/g, "") : "";
  const numero = tel ? (tel.startsWith("55") ? tel : `55${tel}`) : WHATSAPP_NUMBER;
  const msg = `Olá${corretor && isDirectAccess ? ` ${corretor.nome.split(" ")[0]}` : ""}! Vi a campanha ${c.nome} no site da Uhome e quero saber as condições.`;
  const tema = black ? "bg-noir text-noir-foreground" : `${natalBg} text-natal-foreground`;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Navbar />
      <main className="pt-14">
        <section className={`relative overflow-hidden ${tema}`}>
          <NatalLuzes />
          <img src={NATAL_ART.homi} alt="" className="uh-float pointer-events-none absolute bottom-0 right-8 hidden h-[280px] w-auto lg:block xl:right-16" />
          <img src={NATAL_ART.estrela} alt="" aria-hidden className="pointer-events-none absolute right-6 top-12 h-10 w-auto opacity-80 lg:hidden" />
          <div className="uh-rise relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
            <img src={NATAL_ART.selo} alt="Natal Chave de Ouro" className="h-10 w-auto sm:h-12" />
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-natal-gold/40 px-4 py-1.5 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-natal-gold sm:text-xs">
              <KeyRound className="h-3.5 w-3.5" /> {black ? "Semana Black · 23 a 29/11" : "Campanha de Natal Uhome"}
            </p>
            <h1 className="mt-5 max-w-3xl font-natal text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              {black ? <>Black Natal <Ouro>Uhome</Ouro></> : <>Natal <Ouro>Chave de Ouro</Ouro></>}
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg opacity-90">{c.subtitulo}</p>
            <p className="mt-3 max-w-xl font-body text-sm opacity-75">{c.descricao}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-natal-gold text-natal-deep hover:bg-natal-gold/90"><a href="#empreendimentos"><ArrowDown /> Ver empreendimentos</a></Button>
              <Button asChild size="lg" variant="ghost" className="border border-natal-gold/40 text-natal-foreground hover:bg-natal-foreground/10 hover:text-natal-foreground"><a href={`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> {isDirectAccess && corretor ? `Falar com ${corretor.nome.split(" ")[0]}` : "Falar sobre as condições"}</a></Button>
            </div>
            <p className="mt-5 flex items-center gap-2 font-body text-sm text-natal-gold"><Clock3 className="h-4 w-4" /> Faltam <span className="tabular-nums font-semibold">{dias} dias · {String(horas).padStart(2, "0")}h · {String(min).padStart(2, "0")}min</span></p>

          </div>
        </section>

        <section className="border-b border-border/60 bg-secondary/40">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:grid-cols-3 sm:px-8">
            {[
              { i: Star, t: "Condições por empreendimento", d: "Confira preços, entrega e condições disponíveis na página de cada produto." },
              { i: Gift, t: "Comprou, ganhou", d: c.config.urna ?? "" },
              { i: KeyRound, t: "Até 18 de dezembro", d: "Contratos assinados de 02/11 a 18/12/2026. Peça as regras da campanha ao seu corretor." },
            ].map((x) => (
              <div key={x.t} className="flex gap-4">
                <x.i className="h-7 w-7 flex-shrink-0 text-natal-red" />
                <div>
                  <p className="font-heading text-base font-bold text-foreground">{x.t}</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">{x.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isDirectAccess && corretor && <section className="border-b border-border"><div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-5 sm:px-8">
          {corretor.foto_url && <img src={corretor.foto_url} alt={corretor.nome} loading="lazy" className="h-14 w-14 shrink-0 rounded-full object-cover" />}
          <div className="min-w-0"><p className="font-body text-xs text-muted-foreground">Seu corretor Uhome</p><p className="break-words font-heading font-semibold">{corretor.nome}</p>{corretor.creci && <p className="text-xs text-muted-foreground">CRECI {corretor.creci}</p>}</div>
        </div></section>}
        <Reveal><section id="empreendimentos" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-8 sm:px-8">
          <h2 className="text-h2 text-foreground">Empreendimentos participantes</h2>
          <p className="mt-2 font-body text-muted-foreground">{data.produtos.length} produtos selecionados, do primeiro apê ao alto padrão.</p>
          <div className="mt-5 flex flex-wrap gap-4">
            <label className="flex min-w-0 flex-col gap-1.5 font-body text-sm font-medium">Cidade<select aria-label="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} className="h-11 max-w-full rounded-lg border border-border bg-background px-3 text-foreground"><option value="todas">Todas as cidades</option>{cidades.map(x => <option key={x} value={x}>{x}</option>)}</select></label>
            <label className="flex min-w-0 flex-col gap-1.5 font-body text-sm font-medium">Preço inicial<select aria-label="Preço inicial" value={faixa} onChange={e => setFaixa(e.target.value)} className="h-11 max-w-full rounded-lg border border-border bg-background px-3 text-foreground">{FAIXAS_CAMPANHA.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
            {(cidade !== "todas" || faixa !== "todos") && <Button variant="ghost" className="self-end" onClick={() => { setCidade("todas"); setFaixa("todos"); }}>Limpar filtros</Button>}
          </div>
          <p aria-live="polite" className="mt-4 font-body text-sm text-muted-foreground">{lista.length} {lista.length === 1 ? "empreendimento" : "empreendimentos"}</p>
          {!lista.length && <div className="py-10"><p className="font-body text-muted-foreground">Nenhum empreendimento nesta combinação. Experimente outra cidade ou faixa de preço.</p><Button variant="link" onClick={() => { setCidade("todas"); setFaixa("todos"); }}>Ver todos os empreendimentos</Button></div>}
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((p) => (
              <ProdutoFocoCard key={p.id} p={p} selo={black ? "Black Natal" : "Condição de Natal"} campanha={black ? "black" : "natal"} contato />
            ))}
          </div>
        </section></Reveal>
        <Reveal><section className="mx-auto max-w-3xl px-5 pb-12 sm:px-8">
          <h2 className="text-h2 text-foreground">Perguntas frequentes</h2>
          <div className="mt-5 divide-y divide-border rounded-2xl border border-border">
            {[
              { q: "Até quando vale a campanha?", a: "Para contratos assinados de 02/11 a 18/12/2026." },
              { q: "Como funciona o presente de Natal?", a: c.config.urna ?? "Quem assina e paga dentro do período tira um cartão da urna premiada." },
              { q: "Os preços já são os finais?", a: "Os valores são \"a partir de\" e dependem da unidade e da disponibilidade. Um especialista confirma a condição da unidade que você escolher." },
              { q: "Posso visitar antes de decidir?", a: "Sim. Fale com a gente e marcamos a visita ao decorado ou ao local no melhor dia para você." },
            ].map((f) => (
              <details key={f.q} className="group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold text-foreground">{f.q}<span className="text-natal-red transition-transform group-open:rotate-45">+</span></summary>
                <p className="mt-2 font-body text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section></Reveal>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-natal-gold/30 bg-natal-deep/95 p-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {isDirectAccess && corretor ? (
          <Button asChild size="lg" className="w-full bg-natal-gold text-natal-deep hover:bg-natal-gold/90"><a href={`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> Falar com {corretor.nome.split(" ")[0]}</a></Button>
        ) : (
          <Button size="lg" className="w-full bg-natal-gold text-natal-deep hover:bg-natal-gold/90" onClick={() => window.dispatchEvent(new CustomEvent("uhome:abrir-lia", { detail: { mensagem: "Quero saber as condições do Natal Chave de Ouro" } }))}><MessageCircle /> Quero as condições de Natal</Button>
        )}
      </div>
      <Footer />
    </div>
  );
}
