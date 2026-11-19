import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Gift, Star, KeyRound, Loader2, MessageCircle, Clock3, CalendarDays } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCanonical } from "@/hooks/useCanonical";
import { useCorretor } from "@/contexts/CorretorContext";
import { blackAtiva, useCampanha } from "@/lib/produtosFoco";
import { DeferredFoco } from "@/components/foco/DeferredFoco";
import { lazyRetry } from "@/lib/lazyRetry";
import { ProdutoFocoCard, trackProdutoWhatsApp, useWhatsAppProduto } from "@/components/foco/FocoShared";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { FAIXAS_CAMPANHA, filtrarProdutosCampanha } from "@/lib/campanhaFilters";
import { NATAL_ART, NatalLuzes, Ouro, natalBg } from "@/components/foco/NatalArt";

const InfoLeadFoco = lazyRetry(() => import("@/components/foco/InfoLeadFoco").then((m) => ({ default: m.InfoLeadFoco })));
const ComparadorNatal = lazyRetry(() => import("@/components/foco/ComparadorNatal").then((m) => ({ default: m.ComparadorNatal })));

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
  const wa = useWhatsAppProduto();
  const [modo, setModo] = useState<"info" | "visita">("info");
  const irContato = (m: "info" | "visita") => { setModo(m); document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" }); };

  useEffect(() => {
    if (!c) return;
    document.title = `${black ? "Black Natal Uhome" : c.titulo} | Uhome · Você e seu novo lar | Imóveis em Porto Alegre e Canoas`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", (c.subtitulo ?? "").slice(0, 158));
  }, [c, black]);

  // Topo pronto vindo da borda (#uh-pre): fica na tela até o topo real montar no mesmo lugar.
  const [temPre] = useState(() => typeof document !== "undefined" && !!document.getElementById("uh-pre"));
  useLayoutEffect(() => {
    if (!isLoading) document.getElementById("uh-pre")?.remove();
  }, [isLoading]);
  useEffect(() => () => document.getElementById("uh-pre")?.remove(), []);

  if (isLoading) {
    if (temPre) return <Navbar />;
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
      <main className="pt-[var(--uh-header-height)]">
        <section className={`relative overflow-hidden ${tema}`}>
          <NatalLuzes />
          <div className="relative mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:py-10">
            <div className="flex items-center gap-3">
              <img src={NATAL_ART.selo} alt="Natal Chave de Ouro" width={40} height={40} className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12" />
              <h1 className="min-w-0 font-natal text-3xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                {black ? <>Black Natal <Ouro>Uhome</Ouro></> : <>Natal <Ouro>Chave de Ouro</Ouro></>}
              </h1>
            </div>
            <p className="mt-3 max-w-xl font-body text-base opacity-90 lg:text-lg">{black ? "Condições Black só até 29/11" : "Condições especiais e presente na urna até 18/12"}</p>
            <p className="mt-3 hidden max-w-xl font-body text-sm opacity-75 lg:block">{c.descricao}</p>
            <div className="mt-6 hidden flex-wrap gap-3 lg:flex">
              <Button asChild size="lg" className="bg-natal-gold text-natal-deep hover:bg-natal-gold/90"><a href="#contato" onClick={() => setModo("visita")}><CalendarDays /> Agendar visita</a></Button>
              <Button asChild size="lg" variant="ghost" className="border border-natal-gold/40 text-natal-foreground hover:bg-natal-foreground/10 hover:text-natal-foreground"><a href="#contato" onClick={() => setModo("info")}>Receber informações</a></Button>
              {isDirectAccess && corretor && <Button asChild size="lg" variant="ghost" className="text-natal-foreground hover:bg-natal-foreground/10 hover:text-natal-foreground"><a href={`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> Falar com {corretor.nome.split(" ")[0]}</a></Button>}
            </div>
            <p className="mt-3 flex items-center gap-2 font-body text-sm text-natal-gold lg:mt-5"><Clock3 className="h-4 w-4" /> Faltam <span className="tabular-nums font-semibold">{dias} dias · {String(horas).padStart(2, "0")}h · {String(min).padStart(2, "0")}min</span></p>
          </div>
        </section>

        {isDirectAccess && corretor && <section className="border-b border-border"><div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-5 sm:px-8">
          {corretor.foto_url && <img src={corretor.foto_url} alt={corretor.nome} loading="lazy" className="h-14 w-14 shrink-0 rounded-full object-cover" />}
          <div className="min-w-0"><p className="font-body text-xs text-muted-foreground">Seu corretor Uhome</p><p className="break-words font-heading font-semibold">{corretor.nome}</p>{corretor.creci && <p className="text-xs text-muted-foreground">CRECI {corretor.creci}</p>}</div>
        </div></section>}
        <section id="empreendimentos" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-8 sm:px-8">
          <h2 className="text-h2 text-foreground">Empreendimentos participantes</h2>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="-mx-5 flex w-[calc(100%+2.5rem)] gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:w-auto sm:flex-wrap sm:px-0" role="group" aria-label="Cidade">{["todas", ...cidades].map(x => <button key={x} type="button" aria-pressed={cidade === x} onClick={() => setCidade(x)} className="h-11 flex-shrink-0 rounded-full border border-border px-4 font-body text-sm font-semibold text-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">{x === "todas" ? "Todas as cidades" : x}</button>)}</div>
            <div className="-mx-5 flex w-[calc(100%+2.5rem)] gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:w-auto sm:flex-wrap sm:px-0" role="group" aria-label="Preço inicial">{FAIXAS_CAMPANHA.map(x => <button key={x.id} type="button" aria-pressed={faixa === x.id} onClick={() => setFaixa(x.id)} className="h-11 flex-shrink-0 rounded-full border border-border px-4 font-body text-sm font-semibold text-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">{x.label}</button>)}</div>
            {(cidade !== "todas" || faixa !== "todos") && <Button variant="ghost" className="self-end" onClick={() => { setCidade("todas"); setFaixa("todos"); }}>Limpar filtros</Button>}
          </div>
          <p aria-live="polite" className="mt-4 font-body text-sm text-muted-foreground">{lista.length} {lista.length === 1 ? "empreendimento" : "empreendimentos"}</p>
          {!lista.length && <div className="py-10"><p className="font-body text-muted-foreground">Nenhum empreendimento nesta combinação. Experimente outra cidade ou faixa de preço.</p><Button variant="link" onClick={() => { setCidade("todas"); setFaixa("todos"); }}>Ver todos os empreendimentos</Button></div>}
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((p) => (
              <ProdutoFocoCard key={p.id} p={p} selo={black ? "Black Natal" : "Condição de Natal"} campanha={black ? "black" : "natal"} contato />
            ))}
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

        {!(isDirectAccess && corretor) && <section id="contato" className="scroll-mt-20 bg-secondary/40">
          <div className="mx-auto grid max-w-5xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:items-center [&>*]:min-w-0">
            <div>
              <h2 className="text-h2 text-foreground">Agende sua visita ou receba as condições de Natal</h2>
              <p className="mt-2 font-body text-muted-foreground">Deixe nome e WhatsApp. Um especialista da Uhome te chama com valores, plantas e unidades disponíveis. Sem compromisso.</p>
            </div>
            <DeferredFoco minHeight={400}><InfoLeadFoco key={modo} modo={modo} produtos={data.produtos} campanha={c.nome} /></DeferredFoco>
          </div>
        </section>}
        {data.produtos.length > 1 && <DeferredFoco minHeight={480}><ComparadorNatal produtos={data.produtos} linkFor={prefixLink} onContato={isDirectAccess && corretor ? (p) => { trackProdutoWhatsApp(p); window.open(wa(p), "_blank", "noopener"); } : undefined} /></DeferredFoco>}
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
      <div data-barra-baixo className="uhs-contact-bar fixed inset-x-0 bottom-0 z-40 border-t border-natal-gold/30 bg-natal-deep/95 p-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {isDirectAccess && corretor ? (
          <Button asChild size="lg" className="w-full bg-natal-gold text-natal-deep hover:bg-natal-gold/90"><a href={`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> Falar com {corretor.nome.split(" ")[0]}</a></Button>
        ) : (
          <div className="flex gap-2">
            <Button size="lg" className="min-w-0 flex-1 px-2 bg-natal-gold text-natal-deep hover:bg-natal-gold/90" onClick={() => irContato("visita")}><CalendarDays /> Agendar visita</Button>
            <Button size="lg" variant="ghost" className="min-w-0 flex-1 border border-natal-gold/40 px-2 text-natal-foreground hover:bg-natal-foreground/10 hover:text-natal-foreground" onClick={() => irContato("info")}>Informações</Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
