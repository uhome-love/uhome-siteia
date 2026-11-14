import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Calendar, Building2, Check, MessageCircle, Gift, Loader2, Navigation, Send, Star, ShieldCheck, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmpreendimentoLeadForm } from "@/components/EmpreendimentoLeadForm";
import { useCanonical } from "@/hooks/useCanonical";
import { useCorretor } from "@/contexts/CorretorContext";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";
import { absUrl, blackAtiva, formatPreco, useCampanha, useCampanhasAtivas, useProdutoFoco, SITE_URL, type MidiaFoco } from "@/lib/produtosFoco";
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
  const natal = campanhas.find((c) => c.tema === "natal");
  const black = blackAtiva(natal);
  const modoCorretor = isDirectAccess && !!corretor;
  const { data: camp } = useCampanha(natal?.slug);
  const outros = (camp?.produtos ?? []).filter((x) => x.slug !== slug).slice(0, 3);

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

  const diasNatalTexto = () => {
    const hoje = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const fim = new Date(hoje.getFullYear(), 11, 18, 23, 59);
    const d = Math.ceil((fim.getTime() - hoje.getTime()) / 86400000);
    return d > 1 ? `faltam ${d} dias · até 18/12` : d === 1 ? "último dia: hoje" : "até 18/12";
  };
  const fi = p.ficha ?? {};
  const precos = fi.precos ?? [];
  const bk = black ? fi.black : null;
  const fotos = p.galeria;
  const waUrl = wa(p);
  const condGerais = natal?.config?.condicoes_gerais ?? [];
  const tituloContato = natal ? `Receba a tabela e a condição de Natal do ${p.nome}` : `Receba as condições do ${p.nome}`;
  const contatoCard = (
    <div data-contato className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-heading text-xl font-bold text-foreground">{tituloContato}</h2>
      <p className="mt-1 font-body text-sm text-muted-foreground">Receba em poucos minutos no WhatsApp a tabela atualizada, as plantas e a simulação da entrada. Sem compromisso.</p>
      <div className="mt-4"><EmpreendimentoLeadForm empreendimentoNome={p.nome} empreendimentoSlug={`em-foco/${p.slug}`} bairro={p.bairro ?? undefined} cta="Receber tabela e plantas" /></div>
      <a href={waUrl} onClick={() => trackProdutoWhatsApp(p)} target="_blank" rel="noopener noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 font-body text-sm font-semibold text-foreground hover:bg-secondary">
        <MessageCircle className="h-4 w-4" /> Prefiro o WhatsApp
      </a>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-body text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current text-natal-gold" />4,9 no Google · 68 avaliações</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />CRECI-RS 25682J</span>
      </div>
    </div>
  );
  const secoes = [
    { id: "visao-geral", label: "Visão geral", show: true },
    { id: "condicoes", label: "Condições", show: precos.length > 0 || !!bk },
    { id: "galeria", label: "Galeria", show: fotos.length > 0 },
    { id: "plantas", label: "Plantas", show: !!fi.tipologias?.length || p.plantas.length > 0 },
    { id: "lazer", label: "Lazer", show: !!fi.lazer?.length || !!fi.unidade?.length },
    { id: "localizacao", label: "Localização", show: true },
  ].filter(x => x.show);

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Navbar />
      <main className="pt-14">
        {/* Abertura */}
        <section className="relative h-[65svh] min-h-[480px] max-h-[640px] w-full overflow-hidden bg-noir">
          {p.capa_url && <img src={p.capa_url} alt={p.nome} fetchPriority="high" className="uh-kenburns absolute inset-0 h-full w-full object-cover opacity-90" />}
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" />
          <div className="uh-rise relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-10 text-noir-foreground sm:px-8">
            <div className="flex flex-wrap items-center gap-2">
              {natal && (
                <Link to={prefixLink(`/campanha/${natal.slug}`)} className={`rounded-full px-3 py-1 font-body text-xs font-bold uppercase tracking-wide ${black ? "bg-noir-foreground text-noir" : "bg-natal-red text-natal-foreground"}`}>
                  {black ? "Black Natal Uhome" : "Condição de Natal"}
                </Link>
              )}
              {p.status_obra && <span className="rounded-full bg-noir-foreground/15 px-3 py-1 font-body text-xs font-semibold backdrop-blur">{p.status_obra}</span>}
            </div>
            {p.logo_url && <img src={p.logo_url} alt={p.incorporadora ?? ""} className="mt-5 h-8 max-h-10 w-auto max-w-[160px] self-start object-contain drop-shadow-[0_2px_6px_hsl(var(--foreground)/0.6)] sm:h-10" />}
            {natal && condGerais.length > 0 && <p className="mt-4 font-body text-sm font-bold uppercase tracking-wide text-natal-gold">{condGerais[0]} · {diasNatalTexto()}</p>}
            <h1 className="mt-2 font-heading text-4xl font-bold break-words sm:text-5xl">{p.nome}</h1>
            <p className="mt-2 flex max-w-2xl items-start gap-1.5 font-body text-base opacity-90"><MapPin className="mt-1 h-4 w-4 shrink-0" />{[p.bairro, p.cidade, p.incorporadora].filter(Boolean).join(" · ")}</p>
            {natal && condGerais.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-body text-sm font-semibold text-natal-gold">
                {condGerais.slice(1).map((c) => <span key={c} className="inline-flex items-center gap-1"><Check className="h-4 w-4" />{c}</span>)}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-end gap-6">
              {p.preco_a_partir && (
                <div>
                  <p className="font-body text-xs uppercase tracking-wider opacity-75">a partir de</p>
                  <p className="font-heading text-4xl font-bold">{formatPreco(p.preco_a_partir)}</p>
                </div>
              )}
              {modoCorretor ? (
                <a href={waUrl} onClick={() => trackProdutoWhatsApp(p)} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-full ${natal && !black ? "bg-natal-gold text-natal-deep" : "bg-primary text-primary-foreground"} px-6 py-3.5 font-body text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]`}>
                  <MessageCircle className="h-4 w-4" /> Falar com {corretor?.nome.split(" ")[0]}
                </a>
              ) : (
                <button type="button" onClick={irParaContato} className={`inline-flex items-center gap-2 rounded-full ${natal && !black ? "bg-natal-gold text-natal-deep" : "bg-primary text-primary-foreground"} px-6 py-3.5 font-body text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]`}>
                  <Gift className="h-4 w-4" /> Receber tabela e condições
                </button>
              )}
              {fotos.length > 0 && (
                <Button variant="ghost" size="lg" onClick={() => setBox({ fotos, i: 0 })} className="border border-noir-foreground/40 text-noir-foreground hover:bg-noir-foreground/10 hover:text-noir-foreground">Ver {fotos.length} fotos</Button>
              )}
            </div>
          </div>
        </section>

        {fotos.length > 1 && (
          <div className="flex snap-x gap-2 overflow-x-auto px-5 pt-4 lg:hidden [scrollbar-width:none]">
            {fotos.slice(1, 6).map((f, i) => (
              <button key={f.url} type="button" aria-label={`Abrir foto ${i + 2} de ${p.nome}`} onClick={() => setBox({ fotos, i: i + 1 })} className="w-[70%] shrink-0 snap-start overflow-hidden rounded-xl bg-muted">
                <img src={f.url} alt={f.legenda ?? p.nome} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <nav aria-label="Seções" className="sticky top-14 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 py-2 sm:px-8 [scrollbar-width:none]">
            {secoes.map(({id,label}) => <Button key={id} asChild variant="ghost" size="sm"><a href={`#${id}`}>{label}</a></Button>)}
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-10">
            {/* Resumo */}
            <section id="visao-geral" className="scroll-mt-32">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                {[
                  { i: Building2, l: "Tipo", v: fi.segmento?.split(" (")[0] ?? p.tipo },
                  { i: Calendar, l: "Entrega", v: p.entrega },
                  { i: MapPin, l: "Bairro", v: p.bairro },
                  { i: Check, l: "Situação", v: p.status_obra },
                ].filter((x) => x.v).map((x) => (
                  <div key={x.l} className="border-b border-border/60 py-4">
                    <x.i className="h-4 w-4 text-primary" />
                    <p className="mt-2 font-body text-xs text-muted-foreground">{x.l}</p>
                    <p className="break-words font-body text-sm font-semibold leading-snug text-foreground">{x.v}</p>
                  </div>
                ))}
              </div>
              {p.resumo && <p className="mt-8 font-body text-lg leading-relaxed text-foreground/85">{p.resumo}</p>}
            </section>

            {/* Condição */}
            {(precos.length > 0 || bk) && (
              <section id="condicoes" className={`scroll-mt-32 overflow-hidden rounded-2xl ${black ? "bg-noir text-noir-foreground" : natal ? "bg-natal text-natal-foreground" : "bg-secondary"}`}>
                <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
                  <div className="p-6 sm:p-8">
                    <p className="flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest text-natal-gold">
                      <Gift className="h-4 w-4" /> {black ? "Black Natal Uhome · até 29/11" : natal ? "Condição de Natal · até 18/12" : "Condições"}
                    </p>
                    {bk?.titulo && <h2 className="mt-3 text-h2 text-inherit">{bk.titulo}</h2>}
                    {bk?.texto && <p className="mt-2 font-body text-sm opacity-90">{bk.texto}</p>}
                    {natal && condGerais.length > 0 && (
                      <ul className="mt-4 space-y-1">
                        {condGerais.map((t) => <li key={t} className="flex gap-2 font-body text-sm font-semibold"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-natal-gold" />{t}</li>)}
                      </ul>
                    )}
                    <ul className="mt-5 space-y-2">
                      {precos.map((x) => (
                        <li key={x.tipologia} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-current/10 pb-2 font-body text-sm">
                          <span className="opacity-90">{x.tipologia}</span>
                          <span className="break-words font-bold">{x.texto}</span>
                        </li>
                      ))}
                    </ul>
                    {bk?.itens?.length ? (
                      <ul className="mt-4 space-y-1">
                        {bk.itens.map((t) => <li key={t} className="flex gap-2 font-body text-sm"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-natal-gold" />{t}</li>)}
                      </ul>
                    ) : null}
                    {natal?.config?.urna && <p className="mt-5 rounded-xl bg-current/5 p-4 font-body text-sm"><strong>Comprou, ganhou:</strong> {natal.config.urna}</p>}
                    <p className="mt-4 font-body text-[11px] opacity-70">Valores "a partir de", sujeitos a alteração e à disponibilidade. Consulte o regulamento.</p>
                  </div>
                  {bk?.story && <img src={bk.story} alt={`Black Natal ${p.nome}`} loading="lazy" className="hidden h-full max-h-[520px] w-auto object-cover sm:block" />}
                </div>
              </section>
            )}

            {/* Contato no celular, logo depois das condições */}
            {!modoCorretor && <div className="lg:hidden" id="contato-celular">{contatoCard}</div>}

            {/* Galeria */}
            {fotos.length > 0 && (
              <section id="galeria" className="scroll-mt-32">
                <h2 className="text-h2 text-foreground">Galeria</h2>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {fotos.slice(0, 5).map((f, i) => (
                    <Button variant="ghost" key={f.url} aria-label={`Abrir foto ${i + 1} de ${p.nome}`} onClick={() => setBox({ fotos, i })} className={`group relative h-auto overflow-hidden rounded-lg bg-muted p-0 hover:bg-muted ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                      <img src={f.url} alt={f.legenda ?? p.nome} loading="lazy" decoding="async" className="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      {i === 4 && fotos.length > 5 && <span className="absolute inset-0 flex items-center justify-center bg-noir/60 font-heading text-lg text-noir-foreground">+{fotos.length - 5} fotos</span>}
                      {f.legenda && <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-noir/70 to-transparent p-2 text-left font-body text-xs text-noir-foreground opacity-0 transition-opacity group-hover:opacity-100">{f.legenda}</span>}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" className="mt-4" onClick={() => setBox({ fotos, i: 0 })}>Ver todas as {fotos.length} fotos</Button>
              </section>
            )}

            {/* Tipologias e plantas */}
            {(fi.tipologias?.length || p.plantas.length) ? (
              <section id="plantas" className="scroll-mt-32">
                <h2 className="text-h2 text-foreground">Plantas e tipologias</h2>
                {fi.tipologias?.length ? (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full font-body text-sm">
                      <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <tr><th className="p-3">Tipologia</th><th className="p-3">Área</th><th className="p-3">Vagas</th></tr>
                      </thead>
                      <tbody>
                        {fi.tipologias.map((t, i) => (
                          <tr key={i} className="border-t border-border/60">
                            <td className="p-3 font-semibold text-foreground">{t.nome}</td>
                            <td className="p-3 text-muted-foreground">{t.area}</td>
                            <td className="p-3 text-muted-foreground">{t.vagas ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {p.plantas.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {p.plantas.map((f, i) => (
                      <Button variant="ghost" key={f.url} aria-label={`Ampliar planta ${i + 1} de ${p.nome}`} onClick={() => setBox({ fotos: p.plantas, i })} className="block h-auto overflow-hidden rounded-lg border border-border/60 bg-card p-2 text-left hover:shadow-md">
                        <img src={f.url} alt={f.legenda ?? "Planta"} loading="lazy" className="aspect-square w-full object-contain" />
                        <p className="mt-1 line-clamp-2 font-body text-xs text-muted-foreground">{f.legenda ?? `Planta ${i + 1}`}</p>
                      </Button>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {/* Lazer e diferenciais */}
            {(fi.lazer?.length || fi.unidade?.length) ? (
              <section id="lazer" className="scroll-mt-32 grid gap-8 sm:grid-cols-2">
                {fi.lazer?.length ? (
                  <div>
                    <h2 className="text-h2 text-foreground">Lazer</h2>
                    <ul className="mt-4 grid grid-cols-1 gap-2">
                      {fi.lazer.map((l) => <li key={l} className="flex gap-2 font-body text-sm text-foreground"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />{l}</li>)}
                    </ul>
                  </div>
                ) : null}
                {fi.unidade?.length ? (
                  <div>
                    <h2 className="text-h2 text-foreground">Na sua unidade</h2>
                    <ul className="mt-4 grid grid-cols-1 gap-2">
                      {fi.unidade.map((l) => <li key={l} className="flex gap-2 font-body text-sm text-foreground"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />{l}</li>)}
                    </ul>
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* Localização */}
            <section id="localizacao" className="scroll-mt-32">
              <h2 className="text-h2 text-foreground">Localização</h2>
              <p className="mt-2 font-body text-muted-foreground">{[p.endereco, p.bairro, p.cidade].filter(Boolean).join(", ")}{fi.referencia ? ` · ${fi.referencia}` : ""}</p>
              {fi.maps_url && (
                <a href={fi.maps_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-body text-sm font-semibold text-primary"><Navigation className="h-4 w-4" />Abrir no mapa</a>
              )}
              {fi.proximidades?.length ? (
                <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                  {fi.proximidades.slice(0, 12).map((x) => (
                    <li key={x.lugar} className="flex justify-between border-b border-border/50 pb-2 font-body text-sm"><span className="text-foreground">{x.lugar}</span><span className="text-muted-foreground">{x.tempo}</span></li>
                  ))}
                </ul>
              ) : null}
              {p.mapas.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {p.mapas.map((f, i) => (
                    <Button variant="ghost" key={f.url} aria-label={`Ampliar mapa ${i + 1} de ${p.nome}`} onClick={() => setBox({ fotos: p.mapas, i })} className="h-auto overflow-hidden rounded-lg bg-muted p-0"><img src={f.url} alt={f.legenda ?? "Mapa"} loading="lazy" className="w-full object-contain" /></Button>
                  ))}
                </div>
              )}
            </section>

            {/* Ficha técnica */}
            {fi.ficha_tecnica?.length ? (
              <section>
                <h2 className="text-h2 text-foreground">Ficha técnica</h2>
                <dl className="mt-4 divide-y divide-border/60 rounded-xl border border-border/60">
                  {fi.ficha_tecnica.map((x) => (
                    <div key={x.item} className="grid gap-1 p-3 sm:grid-cols-[200px_1fr]">
                      <dt className="font-body text-sm text-muted-foreground">{x.item}</dt>
                      <dd className="font-body text-sm text-foreground">{x.valor}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>

          {/* Contato */}
          <aside className="scroll-mt-32 lg:sticky lg:top-32 lg:self-start" id="contato">
            {modoCorretor ? (
              <CorretorContatoCard produto={p} />
            ) : (
              <div className="hidden lg:block">{contatoCard}</div>
            )}
            <Link to={prefixLink("/em-foco")} className="mt-4 block text-center font-body text-sm font-semibold text-primary">Ver outros produtos em foco</Link>
          </aside>
        </div>
        {outros.length > 0 && (
          <Reveal className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
            <h2 className="text-h2 text-foreground">Outros produtos do Natal</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {outros.map((o) => <ProdutoFocoCard key={o.id} p={o} selo={black ? "Black Natal" : "Condição de Natal"} campanha={black ? "black" : "natal"} />)}
            </div>
          </Reveal>
        )}
      </main>

      {/* Barra fixa no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {modoCorretor ? (
          <a href={waUrl} onClick={() => trackProdutoWhatsApp(p)} target="_blank" rel="noopener noreferrer" className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-body text-sm font-bold ${natal && !black ? "bg-natal-gold text-natal-deep" : "bg-primary text-primary-foreground"}`}>
            <MessageCircle className="h-4 w-4" /> WhatsApp de {corretor?.nome.split(" ")[0]}
          </a>
        ) : (
          <>
            <button type="button" onClick={irParaContato} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-body text-sm font-bold ${natal && !black ? "bg-natal-gold text-natal-deep" : "bg-primary text-primary-foreground"}`}>
              <Send className="h-4 w-4" /> Receber tabela
            </button>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackProdutoWhatsApp(p)} className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-3.5 font-body text-sm font-semibold text-foreground">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </>
        )}
      </div>

      {!modoCorretor && <LembreteTabela nome={p.nome} />}
      {box && <MaterialGallery fotos={box.fotos} index={box.i} onClose={() => setBox(null)} />}
      <Footer />
    </div>
  );
}

/** Cartão discreto que aparece uma vez por visita quando a pessoa já rolou 60% da página. */
function LembreteTabela({ nome }: { nome: string }) {
  const [show, setShow] = useState(false);
  const feito = useRef(false);
  useEffect(() => {
    const k = `lembrete-tabela:${nome}`;
    if (sessionStorage.getItem(k)) return;
    const onScroll = () => {
      const h = document.documentElement;
      if (feito.current || (h.scrollTop + h.clientHeight) / h.scrollHeight < 0.6) return;
      const contato = Array.from(document.querySelectorAll<HTMLElement>("[data-contato]")).find((el) => el.offsetParent !== null);
      const r = contato?.getBoundingClientRect();
      if (r && r.top < h.clientHeight && r.bottom > 0) return;
      feito.current = true;
      sessionStorage.setItem(k, "1");
      setShow(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [nome]);
  if (!show) return null;
  return (
    <div role="dialog" aria-label="Receber tabela" className="fixed inset-x-3 bottom-24 z-50 rounded-2xl border border-border bg-card p-4 shadow-xl lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-80">
      <button type="button" aria-label="Fechar" onClick={() => setShow(false)} className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button>
      <p className="pr-6 font-heading text-base font-bold text-foreground">Quer a tabela do {nome}?</p>
      <p className="mt-1 font-body text-sm text-muted-foreground">Enviamos preços, plantas e a condição de Natal no seu WhatsApp.</p>
      <Button className="mt-3 w-full" onClick={() => { setShow(false); irParaContato(); }}>Quero receber</Button>
    </div>
  );
}
