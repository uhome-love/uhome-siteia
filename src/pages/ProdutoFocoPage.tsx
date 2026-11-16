import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Building2, MessageCircle, Gift, Loader2, Navigation, Star, ShieldCheck, CalendarDays, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { UhomeLogo } from "@/components/UhomeLogo";
import { InfoLeadFoco } from "@/components/foco/InfoLeadFoco";
import { AgendaVisitaFoco } from "@/components/foco/AgendaVisitaFoco";
import { useCanonical } from "@/hooks/useCanonical";
import { useCorretor } from "@/contexts/CorretorContext";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";
import { absUrl, blackAtiva, formatPreco, useCampanha, useCampanhasAtivas, useProdutoFoco, SITE_URL, type MidiaFoco, type ProdutoFoco } from "@/lib/produtosFoco";
import { CorretorContatoCard, ProdutoFocoCard, trackProdutoWhatsApp, useWhatsAppProduto } from "@/components/foco/FocoShared";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { MaterialGallery } from "@/components/foco/MaterialGallery";


/** Rola até o formulário de contato visível (no celular fica logo após as condições). */
function irParaContato() {
  const alvo = Array.from(document.querySelectorAll<HTMLElement>("[data-contato]")).find((el) => el.offsetParent !== null);
  alvo?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function ProdutoFocoPage() {
  const { slug } = useParams();
  useCanonical(`/em-foco/${slug}`);
  const { data: p, isLoading } = useProdutoFoco(slug);
  const { data: campanhas = [] } = useCampanhasAtivas();
  const { isDirectAccess, corretor, prefixLink } = useCorretor();
  const wa = useWhatsAppProduto();
  const [box, setBox] = useState<{ fotos: MidiaFoco[]; i: number } | null>(null);
  const [planta, setPlanta] = useState<string | null>(null);
  const [fotoAtual, setFotoAtual] = useState(0);
  const [abaAtiva, setAbaAtiva] = useState("Todas");
  const trilho = useRef<HTMLDivElement>(null);
  const natal = campanhas.find((c) => c.tema === "natal");
  const black = blackAtiva(natal);
  const modoCorretor = isDirectAccess && !!corretor;
  const { data: camp } = useCampanha(natal?.slug);
  const outros = (camp?.produtos ?? []).filter((x) => x.slug !== slug).slice(0, 6);

  useEffect(() => {
    if (!p) return;
    const desc = `${p.nome} em ${p.bairro}, ${p.cidade}${p.preco_a_partir ? `, a partir de ${formatPreco(p.preco_a_partir)}` : ""}. ${p.resumo ?? ""}`.slice(0, 158);
    document.title = `${p.nome} | ${p.bairro}, ${p.cidade} | Uhome em Foco`;
    setMeta("name", "description", desc);
    setMeta("property", "og:title", modoCorretor ? `${p.nome} · enviado por ${corretor?.nome ?? "Uhome"}` : `${p.nome} | Uhome`);
    setMeta("property", "og:description", desc);
    if (p.capa_url) setMeta("property", "og:image", absUrl(p.capa_url) ?? p.capa_url);
    setJsonLd("produto-foco", {
      "@context": "https://schema.org",
      "@type": "Residence",
      name: p.nome,
      description: p.resumo,
      image: p.galeria.slice(0, 6).map((g) => absUrl(g.url)),
      url: `${SITE_URL}/em-foco/${p.slug}`,
      address: { "@type": "PostalAddress", streetAddress: p.endereco, addressLocality: p.cidade, addressRegion: "RS", addressCountry: "BR" },
      ...(p.preco_a_partir ? { offers: { "@type": "Offer", price: p.preco_a_partir, priceCurrency: "BRL" } } : {}),
    });
    setJsonLd("produto-foco-bc", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Uhome", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Uhome em Foco", item: `${SITE_URL}/em-foco` },
        { "@type": "ListItem", position: 3, name: p.nome, item: `${SITE_URL}/em-foco/${p.slug}` },
      ],
    });
    return () => {
      removeJsonLd("produto-foco");
      removeJsonLd("produto-foco-bc");
    };
  }, [p, modoCorretor, corretor]);

  const [ativa, setAtiva] = useState("");
  useEffect(() => {
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setAtiva(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [p?.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex justify-center pt-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }
  if (!p) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="mx-auto max-w-xl px-6 pt-40 text-center">
          <h1 className="font-heading text-2xl font-bold">Produto não encontrado</h1>
          <Link to={prefixLink("/em-foco")} className="mt-4 inline-block font-body font-semibold text-primary">Ver todos os produtos em foco</Link>
        </div>
      </div>
    );
  }

  const fi = p.ficha ?? {};
  const precos = fi.precos ?? [];
  const bk = black ? fi.black : null;
  const fotos = p.galeria;
  const waUrl = wa(p);
  const condGerais = natal?.config?.condicoes_gerais ?? [];
  const nums = (fi.tipologias ?? []).flatMap((t) => (t.area?.split("(")[0].match(/\d+(?:,\d+)?/g) ?? []).map((n) => parseFloat(n.replace(",", ".")))).filter((n) => n > 15);
  const fmtM = (n: number) => `${Math.round(n)} m²`;
  const area = nums.length ? [fmtM(Math.min(...nums)), ...(Math.max(...nums) - Math.min(...nums) >= 1 ? [fmtM(Math.max(...nums))] : [])] : [];
  const dorms = Array.from(new Set((fi.tipologias ?? []).map((t) => t.dorm).filter((x): x is number => !!x))).sort();
  const vagas = fi.tipologias?.find((t) => t.vagas)?.vagas;
  const chips = [
    dorms.length ? `${dorms.join(" e ")} dormitório${dorms.length > 1 || dorms[0] > 1 ? "s" : ""}` : fi.segmento?.split(" (")[0] ?? p.tipo,
    area.length ? (area.length > 1 ? `${area[0]} a ${area[area.length - 1]}` : area[0]) : null,
    vagas ? (/vaga/i.test(vagas) ? vagas : `${vagas} ${vagas === "1" ? "vaga" : "vagas"}`) : null,
    p.entrega ? `entrega ${p.entrega.toLowerCase()}` : null,
  ].filter(Boolean) as string[];
  const motivos = fi.motivos?.length ? fi.motivos.slice(0, 3) : motivosAuto(p);
  const faq = fi.faq?.length ? fi.faq : faqAuto(p, natal ? condGerais : []);
  const proximos = (fi.proximidades ?? []).slice(0, 6);
  const abas = categorizar(fotos);
  const corBotao = natal && !black ? "bg-natal-gold text-natal-deep" : "bg-primary text-primary-foreground";
  const temPlantas = !!fi.tipologias?.length || p.plantas.length > 0;
  const ancoras = [
    { id: "fotos", l: "Fotos", s: fotos.length > 0 },
    { id: "plantas", l: "Plantas", s: temPlantas },
    { id: "pagamento", l: "Pagamento", s: precos.length > 0 || !!natal },
    { id: "local", l: "Localização", s: true },
    { id: "informacoes", l: "Informações", s: !modoCorretor },
    { id: "visita", l: "Visita", s: true },
    { id: "duvidas", l: "Dúvidas", s: faq.length > 0 },
  ].filter((a) => a.s);
  const pedirInfo = () => document.getElementById("informacoes")?.scrollIntoView({ behavior: "smooth" });
  const regiao = [...outros].sort((a, b) => Number(b.bairro === p.bairro) - Number(a.bairro === p.bairro) || Number(b.cidade === p.cidade) - Number(a.cidade === p.cidade)).slice(0, 3);
  const agendar = (pl?: string) => {
    if (modoCorretor) { window.open(waUrl, "_blank", "noopener"); trackProdutoWhatsApp(p); return; }
    setPlanta(pl ?? null);
    document.getElementById("visita")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      {/* Topo enxuto */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to={prefixLink("/")} aria-label="Uhome, página inicial"><UhomeLogo variant="full" height={22} /></Link>
          <nav aria-label="Seções" className="hidden gap-1 md:flex">
            {ancoras.map((a) => <Button key={a.id} asChild variant="ghost" size="sm"><a href={`#${a.id}`}>{a.l}</a></Button>)}
          </nav>
          <Button size="sm" onClick={() => agendar()} className={corBotao}>{modoCorretor ? `Falar com ${corretor?.nome.split(" ")[0]}` : "Agendar visita"}</Button>
        </div>
        <nav aria-label="Seções" className="flex gap-1 overflow-x-auto border-t border-border/40 px-3 py-1.5 pr-10 md:hidden [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_85%,transparent)]">
          {ancoras.map((a) => <Button key={a.id} asChild variant={ativa === a.id ? "secondary" : "ghost"} size="sm" className="shrink-0"><a href={`#${a.id}`} aria-current={ativa === a.id ? "true" : undefined}>{a.l}</a></Button>)}
        </nav>
      </header>

      <main>
        {/* Abertura com galeria */}
        <section className="mx-auto max-w-6xl sm:px-8 sm:pt-6">
          <div className="relative overflow-hidden bg-muted sm:rounded-2xl">
            <div ref={trilho} onScroll={(e) => { const el = e.currentTarget; setFotoAtual(Math.round(el.scrollLeft / el.clientWidth)); }} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]">
              {(fotos.length ? fotos : p.capa_url ? [{ url: p.capa_url }] : []).map((f, i) => (
                <button type="button" key={f.url} aria-label={`Abrir foto ${i + 1} de ${p.nome}`} onClick={() => setBox({ fotos, i })} className="w-full shrink-0 snap-center">
                  <img src={f.url} alt={semProvisoria((f as any).legenda) ?? p.nome} fetchPriority={i === 0 ? "high" : undefined} loading={i === 0 ? "eager" : "lazy"} className="aspect-[4/3] w-full object-cover sm:aspect-[16/7]" />
                </button>
              ))}
            </div>
            {natal && (
              <Link to={prefixLink(`/campanha/${natal.slug}`)} className={`absolute left-4 top-4 rounded-full px-3 py-1 font-body text-xs font-bold ${black ? "bg-noir text-noir-foreground" : "bg-natal-red text-natal-foreground"}`}>
                {black ? "Black Natal até 29/11" : "Condição de Natal até 18/12"}
              </Link>
            )}
            {fotos.length > 1 && <span className="absolute right-4 top-4 rounded-full bg-noir/70 px-2.5 py-1 font-body text-xs font-semibold text-noir-foreground">{fotoAtual + 1}/{fotos.length}</span>}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
              {fotos.length > 0 && <button type="button" onClick={() => setBox({ fotos, i: 0 })} className="rounded-full bg-background/90 px-3 py-1.5 font-body text-xs font-semibold text-foreground shadow">{fotos.length} fotos</button>}
              {p.plantas.length > 0 && <button type="button" onClick={() => setBox({ fotos: p.plantas, i: 0 })} className="rounded-full bg-background/90 px-3 py-1.5 font-body text-xs font-semibold text-foreground shadow">Plantas</button>}
              {p.mapas.length > 0 && <button type="button" onClick={() => setBox({ fotos: p.mapas, i: 0 })} className="rounded-full bg-background/90 px-3 py-1.5 font-body text-xs font-semibold text-foreground shadow">Mapa</button>}
            </div>
          </div>
          <div className="px-5 pt-6 sm:px-0">
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">{[p.incorporadora, p.status_obra].filter(Boolean).join(" · ")}</p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-foreground sm:text-5xl">{p.nome}</h1>
            <p className="mt-2 flex items-start gap-1.5 font-body text-base text-muted-foreground"><MapPin className="mt-1 h-4 w-4 shrink-0" />{[p.bairro, p.cidade].filter(Boolean).join(", ")}</p>
            {fi.frase && <p className="mt-2 font-body text-lg font-semibold text-foreground">{fi.frase[0].toUpperCase() + fi.frase.slice(1)}</p>}
            {chips.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {chips.map((c) => <li key={c} className="rounded-full border border-border px-3 py-1 font-body text-sm text-foreground">{c}</li>)}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                {p.preco_a_partir && <p className="font-heading text-3xl font-bold text-foreground sm:text-4xl"><span className="block font-body text-xs font-normal uppercase tracking-wider text-muted-foreground">a partir de</span>{formatPreco(p.preco_a_partir)}</p>}
                {natal && condGerais[0] && <p className="mt-1 font-body text-sm font-semibold text-primary">{condGerais[0]}</p>}
              </div>
              <Button size="lg" onClick={() => agendar()} className={`hidden sm:inline-flex ${corBotao}`}><CalendarDays className="h-4 w-4" />{modoCorretor ? `Falar com ${corretor?.nome.split(" ")[0]}` : "Agendar visita"}</Button>
              {!modoCorretor && <Button size="lg" variant="outline" onClick={pedirInfo} className="hidden sm:inline-flex">Quero mais informações</Button>}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-16 px-5 py-12 sm:px-8">
          {/* Confiança */}
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-secondary p-4"><Building2 className="h-5 w-5 text-primary" /><p className="mt-2 font-body text-sm font-semibold text-foreground">{p.incorporadora ?? "Incorporadora parceira"}</p><p className="font-body text-xs text-muted-foreground">{p.status_obra ?? "Lançamento"}</p></div>
            <div className="rounded-2xl bg-secondary p-4"><Star className="h-5 w-5 fill-current text-natal-gold" /><p className="mt-2 font-body text-sm font-semibold text-foreground">4,9 no Google</p><p className="font-body text-xs text-muted-foreground">68 avaliações da Uhome</p></div>
            <div className="rounded-2xl bg-secondary p-4"><ShieldCheck className="h-5 w-5 text-primary" /><p className="mt-2 font-body text-sm font-semibold text-foreground">CRECI-RS 25682J</p><p className="font-body text-xs text-muted-foreground">atendimento Uhome</p></div>
          </section>

          {/* Por que */}
          {motivos.length > 0 && (
            <section>
              <h2 className="text-h2 text-foreground">Por que o {p.nome}</h2>
              <ol className="mt-6 grid gap-4 sm:grid-cols-3">
                {motivos.map((m, i) => (
                  <li key={m.titulo} className="rounded-2xl border border-border/60 bg-card p-5">
                    <span className="font-heading text-2xl font-bold text-primary">{i + 1}</span>
                    <p className="mt-2 font-heading text-base font-bold text-foreground">{m.titulo}</p>
                    <p className="mt-1 font-body text-sm text-muted-foreground">{m.texto}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Como é */}
          {fotos.length > 0 && (
            <section id="fotos" className="scroll-mt-28">
              <h2 className="text-h2 text-foreground">Como é</h2>
              <p className="mt-1 font-body text-sm text-muted-foreground">Imagens ilustrativas do projeto.</p>
              {abas.length > 1 && (
                <div role="tablist" className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none]">
                  {abas.map((a) => (
                    <button key={a.nome} role="tab" aria-selected={abaAtiva === a.nome} type="button" onClick={() => setAbaAtiva(a.nome)} className={`shrink-0 rounded-full border px-4 py-1.5 font-body text-sm font-semibold ${abaAtiva === a.nome ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-secondary"}`}>{a.nome}</button>
                  ))}
                </div>
              )}
              {(() => {
                const lista = abas.find((a) => a.nome === abaAtiva)?.fotos ?? fotos;
                return (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {lista.slice(0, 6).map((f, i) => (
                      <button type="button" key={f.url} aria-label={`Abrir ${semProvisoria(f.legenda) ?? "foto"}`} onClick={() => setBox({ fotos: lista, i })} className={`group relative overflow-hidden rounded-xl bg-muted ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                        <img src={f.url} alt={semProvisoria(f.legenda) ?? p.nome} loading="lazy" className="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        {f.legenda && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-noir/70 to-transparent p-2 text-left font-body text-xs text-noir-foreground">{semProvisoria(f.legenda)}</span>}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </section>
          )}

          {/* Plantas */}
          {temPlantas && (
            <section id="plantas" className="scroll-mt-28">
              <h2 className="text-h2 text-foreground">Escolha a planta</h2>
              <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
                {(fi.tipologias ?? []).map((t, i) => {
                  const preco = precos.find((x) => x.tipologia === t.nome) ?? (t.dorm ? precos.find((x) => x.tipologia.includes(`${t.dorm} dorm`)) : undefined) ?? (fi.tipologias!.length === precos.length ? precos[i] : undefined);
                  const img = (t.dorm ? p.plantas.find((x) => (x.legenda ?? "").includes(`${t.dorm} dorm`)) : undefined) ?? (p.plantas.length === fi.tipologias!.length ? p.plantas[i] : undefined);
                  return (
                    <div key={t.nome + i} className="flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border/60 bg-card sm:w-auto">
                      {img && <button type="button" onClick={() => setBox({ fotos: p.plantas, i })} aria-label={`Ampliar planta ${t.nome}`} className="bg-secondary/40 p-3"><img src={img.url} alt={semProvisoria(img.legenda) ?? t.nome} loading="lazy" className="mx-auto aspect-[4/3] max-h-44 w-full object-contain sm:max-h-none" /></button>}
                      <div className="flex flex-1 flex-col p-5">
                        <p className="font-heading text-lg font-bold text-foreground">{t.nome}</p>
                        <p className="mt-1 font-body text-sm text-muted-foreground">{[t.area, t.vagas ? (/vaga/i.test(t.vagas) ? t.vagas : `${t.vagas} ${t.vagas === "1" ? "vaga" : "vagas"}`) : null].filter(Boolean).join(" · ")}</p>
                        {preco && <p className="mt-3 font-body text-base font-bold text-foreground">{preco.texto}</p>}
                        <Button variant="outline" className="mt-4" onClick={() => agendar(t.nome)}>Quero esta planta</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!fi.tipologias?.length && p.plantas.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {p.plantas.map((f, i) => (
                    <button type="button" key={f.url} onClick={() => setBox({ fotos: p.plantas, i })} className="rounded-xl border border-border/60 bg-card p-2"><img src={f.url} alt={semProvisoria(f.legenda) ?? "Planta"} loading="lazy" className="aspect-square w-full object-contain" /></button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Pagamento */}
          {(precos.length > 0 || natal) && (
            <section id="pagamento" className={`scroll-mt-28 rounded-2xl p-6 sm:p-8 ${black ? "bg-noir text-noir-foreground" : natal ? "bg-natal text-natal-foreground" : "bg-secondary"}`}>
              <p className="flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest text-natal-gold"><Gift className="h-4 w-4" />{black ? "Black Natal, até 29/11" : natal ? "Condição de Natal, até 18/12" : "Pagamento"}</p>
              {bk?.titulo && <h2 className="mt-3 text-h2 text-inherit">{bk.titulo}</h2>}
              {natal && condGerais.length > 0 && <p className="mt-3 font-heading text-xl font-bold">{condGerais.join(" e ").replace(/^./, (c) => c.toUpperCase())}.</p>}
              {natal && <p className="mt-2 font-body text-sm opacity-90">Financiamento conforme o perfil do comprador.</p>}
              {precos.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {precos.map((x) => <li key={x.tipologia} className="flex flex-wrap justify-between gap-x-4 border-b border-current/10 pb-2 font-body text-sm"><span className="opacity-90">{x.tipologia}</span><span className="font-bold">{x.texto}</span></li>)}
                </ul>
              )}
              {natal?.config?.urna && <p className="mt-5 rounded-xl bg-current/5 p-4 font-body text-sm"><strong>Comprou, ganhou:</strong> {natal.config.urna}</p>}
              <p className="mt-4 font-body text-[11px] opacity-70">Valores "a partir de", sujeitos a alteração e à disponibilidade.</p>
            </section>
          )}

          {/* Onde fica */}
          <section id="local" className="scroll-mt-28">
            <h2 className="text-h2 text-foreground">Onde fica</h2>
            <p className="mt-2 font-body text-muted-foreground">{[p.endereco, p.bairro, p.cidade].filter(Boolean).join(", ")}{fi.referencia ? ` · ${fi.referencia}` : ""}</p>
            {proximos.length > 0 && (
              <ul className="mt-5 grid gap-x-8 sm:grid-cols-2">
                {proximos.map((x) => <li key={x.lugar} className="flex justify-between gap-4 border-b border-border/50 py-3 font-body text-sm"><span className="text-foreground">{x.lugar}</span><span className="shrink-0 text-muted-foreground">{x.tempo}</span></li>)}
              </ul>
            )}
            {fi.maps_url && <a href={fi.maps_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 font-body text-sm font-semibold text-primary"><Navigation className="h-4 w-4" />Abrir no mapa</a>}
          </section>

          {!modoCorretor && (
            <section id="informacoes" className="scroll-mt-28">
              <h2 className="text-h2 text-foreground">{natal ? `Receba as condições de Natal do ${p.nome}` : `Receba as condições do ${p.nome}`}</h2>
              <p className="mt-1 font-body text-muted-foreground">Um especialista da Uhome te chama no WhatsApp com valores, plantas e unidades disponíveis.</p>
              <div className="mt-5 max-w-2xl"><InfoLeadFoco p={p} /></div>
            </section>
          )}

          {/* Visita */}
          <section id="visita" className="scroll-mt-28">
            <h2 className="text-h2 text-foreground">Agende sua visita</h2>
            <p className="mt-1 font-body text-muted-foreground">Escolha o dia e o período. Um especialista confirma pelo WhatsApp.</p>
            <div className="mt-5 max-w-2xl">
              {modoCorretor ? <CorretorContatoCard produto={p} /> : <AgendaVisitaFoco p={p} planta={planta} />}
              {!modoCorretor && (
                <a href={waUrl} onClick={() => trackProdutoWhatsApp(p)} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 font-body text-sm font-semibold text-primary"><MessageCircle className="h-4 w-4" />Prefiro conversar no WhatsApp</a>
              )}
            </div>
          </section>

          {/* Dúvidas */}
          {faq.length > 0 && (
            <section id="duvidas" className="scroll-mt-28">
              <h2 className="text-h2 text-foreground">Dúvidas</h2>
              <div className="mt-5 divide-y divide-border/60 rounded-2xl border border-border/60">
                {faq.map((q) => (
                  <details key={q.p} className="group p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-body text-base font-semibold text-foreground">{q.p}<ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /></summary>
                    <p className="mt-2 font-body text-sm text-muted-foreground">{q.r}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Também na região */}
          {regiao.length > 0 && (
            <section>
              <h2 className="text-h2 text-foreground">Também {regiao.some((o) => o.bairro === p.bairro) ? `no ${p.bairro}` : "no Natal Uhome"}</h2>
              <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible [scrollbar-width:none]">
                {regiao.map((o) => <div key={o.id} className="w-[80%] shrink-0 snap-start sm:w-auto"><ProdutoFocoCard p={o} selo={black ? "Black Natal" : "Condição de Natal"} campanha={black ? "black" : "natal"} /></div>)}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Rodapé curto */}
      <footer className="border-t border-border/60 py-8 text-center font-body text-xs text-muted-foreground">
        Uhome Imóveis · CRECI-RS 25682J · <Link to="/politica-de-privacidade" className="underline">Política de privacidade</Link> · <Link to={prefixLink("/em-foco")} className="underline">Ver outros produtos</Link>
      </footer>

      {/* Barra fixa no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <button type="button" onClick={() => agendar()} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-body text-sm font-bold ${corBotao}`}>
          <CalendarDays className="h-4 w-4" />{modoCorretor ? `Falar com ${corretor?.nome.split(" ")[0]}` : "Agendar visita"}
        </button>
        {!modoCorretor && <button type="button" onClick={pedirInfo} className="flex flex-1 items-center justify-center rounded-xl border border-border py-3.5 font-body text-sm font-bold text-foreground">Mais informações</button>}
        <a href={waUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" onClick={() => trackProdutoWhatsApp(p)} className="flex items-center justify-center rounded-xl border border-border px-4 py-3.5 text-foreground"><MessageCircle className="h-5 w-5" /></a>
      </div>

      {box && <MaterialGallery fotos={box.fotos} index={box.i} onClose={() => setBox(null)} />}
    </div>
  );
}

const CATS: [string, RegExp][] = [
  ["Fachada", /fachada|torre|portaria|guarita|acesso|entrada/i],
  ["Lazer", /piscina|lazer|quadra|salão|salao|brinquedo|academia|fitness|gourmet|churras|quiosque|playground|pet|coworking|spa|sauna|clube|teen|jardim|praça|praca/i],
  ["Apartamento", /apartamento|sala|living|cozinha|dormit|suíte|suite|quarto|banheiro|varanda|sacada|decorado|terraço|terraco|casa|studio|estar/i],
  ["Vista", /vista|aérea|aerea|panor|parque|bosque|lago/i],
];
function categorizar(fotos: MidiaFoco[]) {
  const map = new Map<string, MidiaFoco[]>();
  for (const f of fotos) {
    const nome = f.categoria ? f.categoria[0].toUpperCase() + f.categoria.slice(1) : CATS.find(([, r]) => r.test(f.legenda ?? ""))?.[0];
    if (!nome) continue;
    map.set(nome, [...(map.get(nome) ?? []), f]);
  }
  const abas = CATS.map(([n]) => n).filter((n) => map.has(n)).map((n) => ({ nome: n, fotos: map.get(n)! }));
  return abas.length > 1 ? [{ nome: "Todas", fotos }, ...abas] : [];
}
function motivosAuto(p: ProdutoFoco) {
  const fi = p.ficha ?? {};
  const out: { titulo: string; texto: string }[] = [];
  if (fi.unidade?.length) out.push({ titulo: "Na sua unidade", texto: fi.unidade.slice(0, 3).join(", ") + "." });
  if (fi.lazer?.length) out.push({ titulo: "Lazer completo", texto: fi.lazer.slice(0, 5).join(", ") + "." });
  if (fi.proximidades?.length) out.push({ titulo: "Tudo perto", texto: fi.proximidades.slice(0, 3).map((x) => `${x.lugar} (${x.tempo})`).join(", ") + "." });
  return out.slice(0, 3);
}
function faqAuto(p: ProdutoFoco, cond: string[]) {
  const fi = p.ficha ?? {};
  const out: { p: string; r: string }[] = [];
  if (p.entrega) out.push({ p: "Quando fica pronto?", r: `Entrega prevista para ${p.entrega.toLowerCase()}.${p.status_obra ? ` Situação atual: ${p.status_obra.toLowerCase()}.` : ""}` });
  const vg = (fi.tipologias ?? []).filter((t) => t.vagas).map((t) => `${t.nome}: ${t.vagas}`);
  if (vg.length) out.push({ p: "Tem vaga?", r: vg.join(". ") + "." });
  if (fi.unidade?.length) out.push({ p: "O que vem na unidade?", r: fi.unidade.join(", ") + "." });
  out.push({ p: "Como funciona o pagamento?", r: cond.length ? `Condição de Natal até 18/12: ${cond.join(", ").toLowerCase()}. Financiamento conforme o perfil.` : "Um especialista apresenta as condições e simula o financiamento conforme o seu perfil." });
  if (fi.ficha_tecnica?.length) out.push({ p: "Ficha técnica", r: fi.ficha_tecnica.map((x) => `${x.item}: ${x.valor}`).join(". ") + "." });
  return out;
}

function semProvisoria(t?: string | null) {
  return t ? t.replace(/\s*\((imagem |foto )?provis[óo]ria\)/gi, "").trim() : t;
}
