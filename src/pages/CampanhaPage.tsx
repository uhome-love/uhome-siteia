import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Gift, Star, KeyRound, Loader2, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCanonical } from "@/hooks/useCanonical";
import { useCorretor } from "@/contexts/CorretorContext";
import { blackAtiva, useCampanha } from "@/lib/produtosFoco";
import { ProdutoFocoCard } from "@/components/foco/FocoShared";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { Reveal } from "@/components/ui/reveal";
import { NATAL_ART, NatalLuzes, Ouro, natalBg } from "@/components/foco/NatalArt";

function useCountdown(fim?: string | null) {
  const alvo = useMemo(() => (fim ? new Date(`${fim}T23:59:59-03:00`).getTime() : 0), [fim]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, alvo - now);
  return { dias: Math.floor(ms / 86_400_000), horas: Math.floor((ms / 3_600_000) % 24), min: Math.floor((ms / 60_000) % 60), seg: Math.floor((ms / 1000) % 60) };
}

export default function CampanhaPage() {
  const { slug } = useParams();
  useCanonical(`/campanha/${slug}`);
  const { data, isLoading } = useCampanha(slug);
  const { prefixLink, corretor, isDirectAccess } = useCorretor();
  const c = data?.campanha;
  const black = blackAtiva(c);
  const fimExibido = black ? c?.config.black?.fim : c?.fim;
  const { dias, horas, min, seg } = useCountdown(fimExibido);

  useEffect(() => {
    if (!c) return;
    document.title = `${black ? "Black Natal Uhome" : c.titulo} | Imóveis com condição especial | Uhome`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", (c.subtitulo ?? "").slice(0, 158));
  }, [c, black]);

  if (isLoading) {
    return <div className="min-h-screen bg-natal"><Navbar /><div className="flex justify-center pt-40"><Loader2 className="h-6 w-6 animate-spin text-natal-gold" /></div></div>;
  }
  if (!data || !data.vigente) return <Navigate to={prefixLink("/em-foco")} replace />;

  const tel = isDirectAccess ? corretor?.telefone?.replace(/\D/g, "") : "";
  const numero = tel ? `55${tel}` : WHATSAPP_NUMBER;
  const msg = `Olá${corretor && isDirectAccess ? ` ${corretor.nome.split(" ")[0]}` : ""}! Vi a campanha ${c!.nome} no site da Uhome e quero saber as condições.`;
  const tema = black ? "bg-noir text-noir-foreground" : `${natalBg} text-natal-foreground`;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Navbar />
      <main className="pt-14">
        <section className={`relative overflow-hidden ${tema}`}>
          <NatalLuzes />
          <img src={NATAL_ART.homi} alt="" className="uh-float pointer-events-none absolute bottom-0 right-4 hidden h-[420px] w-auto lg:block xl:right-16" />
          <img src={NATAL_ART.estrela} alt="" aria-hidden className="pointer-events-none absolute right-6 top-12 h-10 w-auto opacity-80 lg:hidden" />
          <div className="uh-rise relative mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8 lg:pb-24 lg:pt-14">
            <img src={NATAL_ART.selo} alt="Natal Chave de Ouro" className="h-16 w-auto sm:h-20" />
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-natal-gold/40 px-4 py-1.5 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-natal-gold sm:text-xs">
              <KeyRound className="h-3.5 w-3.5" /> {black ? "Semana Black · 23 a 29/11" : "Campanha de Natal Uhome"}
            </p>
            <h1 className="mt-5 max-w-3xl font-natal text-[2.6rem] font-extrabold leading-[1.05] sm:text-7xl">
              {black ? <>Black Natal <Ouro>Uhome</Ouro></> : <>Natal <Ouro>Chave de Ouro</Ouro></>}
            </h1>
            <p className="mt-6 max-w-2xl font-body text-lg opacity-90">{c!.subtitulo}</p>
            <p className="mt-3 max-w-2xl font-body text-sm opacity-75">{c!.descricao}</p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <div className="flex gap-3">
                {[{ v: dias, l: "dias" }, { v: horas, l: "horas" }, { v: min, l: "min" }, { v: seg, l: "seg" }].map((x) => (
                  <div key={x.l} className="min-w-[64px] sm:min-w-[80px] rounded-2xl border border-natal-gold/30 bg-current/5 px-4 py-3 text-center">
                    <p className="font-heading text-2xl sm:text-3xl font-bold tabular-nums text-natal-gold">{String(x.v).padStart(2, "0")}</p>
                    <p className="font-body text-xs uppercase tracking-wider opacity-75">{x.l}</p>
                  </div>
                ))}
              </div>
              <a href={`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-natal-gold px-6 py-3.5 font-body text-sm font-bold text-natal-deep shadow-lg uh-shine transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <MessageCircle className="h-4 w-4" /> {isDirectAccess && corretor ? `Falar com ${corretor.nome.split(" ")[0]}` : "Quero as condições de Natal"}
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-border/60 bg-secondary/40">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:grid-cols-3 sm:px-8">
            {[
              { i: Star, t: "Melhores condições do ano", d: "No fim do ano as incorporadoras fecham o balanço e entram com as melhores condições de 2026." },
              { i: Gift, t: "Comprou, ganhou", d: c!.config.urna ?? "" },
              { i: KeyRound, t: "Até 18 de dezembro", d: "Válido para contratos assinados de 02/11 a 18/12/2026. Consulte o regulamento." },
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

        <Reveal><section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <h2 className="font-heading text-3xl font-bold text-foreground">Empreendimentos participantes</h2>
          <p className="mt-2 font-body text-muted-foreground">{data.produtos.length} produtos selecionados, do primeiro apê ao alto padrão.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.produtos.map((p) => (
              <ProdutoFocoCard key={p.id} p={p} selo={black ? "Black Natal" : "Condição de Natal"} campanha={black ? "black" : "natal"} />
            ))}
          </div>
        </section></Reveal>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-natal-gold/30 bg-natal-deep/95 p-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <a href={`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-natal-gold py-3.5 font-body text-sm font-bold text-natal-deep">
          <MessageCircle className="h-4 w-4" /> Quero as condições de Natal
        </a>
      </div>
      <Footer />
    </div>
  );
}
