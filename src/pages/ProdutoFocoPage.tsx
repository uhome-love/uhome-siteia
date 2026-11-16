import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Calendar, Building2, Check, MessageCircle, Gift, Loader2, Navigation, Send, Star, ShieldCheck, Ruler, Sparkles, Trees } from "lucide-react";
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
  const tituloContato = natal ? `Receba a condição de Natal do ${p.nome}` : `Receba as condições do ${p.nome}`;
  const contatoCard = (
    <div data-contato className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-heading text-xl font-bold text-foreground">{tituloContato}</h2>
      <p className="mt-1 font-body text-sm text-muted-foreground">Um especialista da Uhome te chama no WhatsApp com valores, plantas e unidades disponíveis. Sem compromisso.</p>
      <div className="mt-4"><EmpreendimentoLeadForm empreendimentoNome={p.nome} empreendimentoSlug={`em-foco/${p.slug}`} bairro={p.bairro ?? undefined} cta="Quero as condições" /></div>
      <a href={waUrl} onClick={() => trackProdutoWhatsApp(p)} target="_blank" rel="noopener noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 font-body text-sm font-semibold text-foreground hover:bg-secondary">
        <MessageCircle className="h-4 w-4" /> Prefiro o WhatsApp
      </a>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-body text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current text-natal-gold" />4,9 no Google · 68 avaliações</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />CRECI-RS 25682J</span>
      </div>
    </div>
  );
  const area = (fi.tipologias?.map((t) => t.area?.split(/[,(]/)[0].trim()).filter(Boolean) ?? []) as string[];
  const destaques = [
    { i: Building2, l: "Tipo", v: fi.segmento?.split(" (")[0] ?? p.tipo },
    { i: Ruler, l: "Área", v: area.length ? (area.length > 1 ? `${area[0]} a ${area[area.length - 1]}` : area[0]) : null },
    { i: Calendar, l: "Entrega", v: p.entrega },
    { i: Check, l: "Situação", v: p.status_obra },
  ].filter((x) => x.v);
  const motivos = [...(fi.unidade ?? []), ...(fi.lazer ?? [])].slice(0, 3);
  const iconesMotivo = [Sparkles, Trees, ShieldCheck];
  const lazerResto = [...(fi.lazer ?? []), ...(fi.unidade ?? [])].filter((x) => !motivos.includes(x));
  const corBotao = natal && !black ? "bg-natal-gold text-natal-deep" : "bg-primary text-primary-foreground";

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Navbar />
      <main className="pt-14">
        {/* Abertura: uma foto, o essencial e um botão */}
        <section className="relative h-[72svh] min-h-[500px] max-h-[700px] w-full overflow-hidden bg-noir">
          {p.capa_url && <img src={p.capa_url} alt={p.nome} fetchPriority="high" className="uh-kenburns absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/30 to-transparent" />
          <div className="uh-rise relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-10 text-noir-foreground sm:px-8">
            {natal && (
              <Link to={prefixLink(`/campanha/${natal.slug}`)} className={`self-start rounded-full px-3 py-1 font-body text-xs font-bold uppercase tracking-wide ${black ? "bg-noir-foreground text-noir" : "bg-natal-red text-natal-foreground"}`}>
                {black ? "Black Natal Uhome" : "Condição de Natal"} · {diasNatalTexto()}
              </Link>
            )}
            <h1 className="mt-3 font-heading text-4xl font-bold break-words sm:text-6xl">{p.nome}</h1>
            <p className="mt-2 flex items-center gap-1.5 font-body text-base opacity-90"><MapPin className="h-4 w-4 shrink-0" />{[p.bairro, p.cidade].filter(Boolean).join(", ")}{p.incorporadora ? ` · ${p.incorporadora}` : ""}</p>
            <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4">
              {p.preco_a_partir && (
                <div>
                  <p className="font-body text-xs uppercase tracking-wider opacity-75">a partir de</p>
                  <p className="font-heading text-4xl font-bold">{formatPreco(p.preco_a_partir)}</p>
                </div>
              )}
              {modoCorretor ? (
                <a href={waUrl} onClick={() => trackProdutoWhatsApp(p)} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-full ${corBotao} px-6 py-3.5 font-body text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]`}>
                  <MessageCircle className="h-4 w-4" /> Falar com {corretor?.nome.split(" ")[0]}
                </a>
              ) : (
                <button type="button" onClick={irParaContato} className={`inline-flex items-center gap-2 rounded-full ${corBotao} px-6 py-3.5 font-body text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]`}>
                  <Gift className="h-4 w-4" /> {natal ? "Quero as condições de Natal" : "Quero as condições"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Números-chave */}
        {destaques.length > 0 && (
          <div className="border-b border-border/60">
            <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-8 md:grid-cols-4">
              {destaques.map((x) => (
                <div key={x.l} className="flex items-start gap-3 py-5">
                  <x.i className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="font-body text-xs text-muted-foreground">{x.l}</p>
                    <p className="break-words font-body text-sm font-semibold leading-snug text-foreground">{x.v}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-14">
            {p.resumo && <p className="font-body text-lg leading-relaxed text-foreground/85">{p.resumo}</p>}

            {/* Condição */}
            {(precos.length > 0 || bk || (natal && condGerais.length > 0)) && (
              <section id="condicoes" className={`scroll-mt-20 rounded-2xl p-6 sm:p-8 ${black ? "bg-noir text-noir-foreground" : natal ? "bg-natal text-natal-foreground" : "bg-secondary"}`}>
                <p className="flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest text-natal-gold">
                  <Gift className="h-4 w-4" /> {black ? "Black Natal Uhome · até 29/11" : natal ? "Condição de Natal · até 18/12" : "Condições"}
                </p>
                {bk?.titulo && <h2 className="mt-3 text-h2 text-inherit">{bk.titulo}</h2>}
                {bk?.texto && <p className="mt-2 font-body text-sm opacity-90">{bk.texto}</p>}
                {natal && condGerais.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {condGerais.map((t) => <li key={t} className="flex gap-2 font-body text-sm font-semibold"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-natal-gold" />{t}</li>)}
                  </ul>
                )}
                {precos.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {precos.map((x) => (
                      <li key={x.tipologia} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-current/10 pb-2 font-body text-sm">
                        <span className="opacity-90">{x.tipologia}</span>
                        <span className="break-words font-bold">{x.texto}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {bk?.itens?.length ? (
                  <ul className="mt-4 space-y-1">
                    {bk.itens.map((t) => <li key={t} className="flex gap-2 font-body text-sm"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-natal-gold" />{t}</li>)}
                  </ul>
                ) : null}
                {natal?.config?.urna && <p className="mt-5 rounded-xl bg-current/5 p-4 font-body text-sm"><strong>Comprou, ganhou:</strong> {natal.config.urna}</p>}
                <p className="mt-4 font-body text-[11px] opacity-70">Valores "a partir de", sujeitos a alteração e à disponibilidade. Consulte o regulamento.</p>
              </section>
            )}

            {/* Galeria curada em mosaico */}
            {fotos.length > 0 && (
              <section id="galeria" className="scroll-mt-20">
                <h2 className="text-h2 text-foreground">Conheça por dentro</h2>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:grid-rows-2">
                  {fotos.slice(0, 5).map((f, i) => (
                    <button type="button" key={f.url} aria-label={`Abrir foto ${i + 1} de ${p.nome}`} onClick={() => setBox({ fotos, i })} className={`group relative overflow-hidden rounded-xl bg-muted ${i === 0 ? "col-span-2 sm:row-span-2" : ""}`}>
                      <img src={f.url} alt={f.legenda ?? p.nome} loading="lazy" decoding="async" className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${i === 0 ? "aspect-[4/3] sm:h-full" : "aspect-square"}`} />
                      {i === 4 && fotos.length > 5 && <span className="absolute inset-0 flex items-center justify-center bg-noir/55 font-heading text-lg text-noir-foreground">+{fotos.length - 5} fotos</span>}
                    </button>
                  ))}
                </div>
                {fotos.length > 1 && <Button variant="outline" className="mt-4" onClick={() => setBox({ fotos, i: 0 })}>Ver todas as {fotos.length} fotos</Button>}
              </section>
            )}

            {/* Por que este produto */}
            {motivos.length > 0 && (
              <section>
                <h2 className="text-h2 text-foreground">Por que o {p.nome}</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {motivos.map((m, i) => {
                    const Icone = iconesMotivo[i];
                    return (
                      <div key={m} className="rounded-2xl border border-border/60 bg-card p-5">
                        <Icone className="h-5 w-5 text-primary" />
                        <p className="mt-3 font-body text-sm font-semibold leading-snug text-foreground">{m}</p>
                      </div>
                    );
                  })}
                </div>
                {lazerResto.length > 0 && (
                  <details className="group mt-4">
                    <summary className="cursor-pointer font-body text-sm font-semibold text-primary">Ver lazer e itens completos ({lazerResto.length})</summary>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {lazerResto.map((l) => <li key={l} className="flex gap-2 font-body text-sm text-foreground"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />{l}</li>)}
                    </ul>
                  </details>
                )}
              </section>
            )}

            {/* Tipologias e plantas */}
            {(fi.tipologias?.length || p.plantas.length) ? (
              <section id="plantas" className="scroll-mt-20">
                <h2 className="text-h2 text-foreground">Plantas e tipologias</h2>
                {fi.tipologias?.length ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {fi.tipologias.map((t, i) => {
                      const preco = precos.find((x) => x.tipologia === t.nome);
                      return (
                        <div key={i} className="rounded-2xl border border-border/60 bg-card p-5">
                          <p className="font-heading text-base font-bold text-foreground">{t.nome}</p>
                          <p className="mt-1 font-body text-sm text-muted-foreground">{[t.area, t.vagas ? `${t.vagas} vaga(s)` : null].filter(Boolean).join(" · ")}</p>
                          {preco && <p className="mt-2 font-body text-sm font-bold text-foreground">{preco.texto}</p>}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {p.plantas.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {p.plantas.map((f, i) => (
                      <button type="button" key={f.url} aria-label={`Ampliar planta ${i + 1} de ${p.nome}`} onClick={() => setBox({ fotos: p.plantas, i })} className="block overflow-hidden rounded-xl border border-border/60 bg-card p-2 text-left transition-shadow hover:shadow-md">
                        <img src={f.url} alt={f.legenda ?? "Planta"} loading="lazy" className="aspect-square w-full object-contain" />
                        <p className="mt-1 line-clamp-2 font-body text-xs text-muted-foreground">{f.legenda ?? `Planta ${i + 1}`}</p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {/* Localização */}
            <section id="localizacao" className="scroll-mt-20">
              <h2 className="text-h2 text-foreground">Localização</h2>
              <p className="mt-2 font-body text-muted-foreground">{[p.endereco, p.bairro, p.cidade].filter(Boolean).join(", ")}{fi.referencia ? ` · ${fi.referencia}` : ""}</p>
              {fi.maps_url && (
                <a href={fi.maps_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-body text-sm font-semibold text-primary"><Navigation className="h-4 w-4" />Abrir no mapa</a>
              )}
              {fi.proximidades?.length ? (
                <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                  {fi.proximidades.slice(0, 4).map((x) => (
                    <li key={x.lugar} className="flex justify-between border-b border-border/50 pb-2 font-body text-sm"><span className="text-foreground">{x.lugar}</span><span className="text-muted-foreground">{x.tempo}</span></li>
                  ))}
                </ul>
              ) : null}
              {p.mapas.length > 0 && (
                <button type="button" aria-label={`Ampliar mapa de ${p.nome}`} onClick={() => setBox({ fotos: p.mapas, i: 0 })} className="mt-5 block w-full overflow-hidden rounded-xl bg-muted">
                  <img src={p.mapas[0].url} alt={p.mapas[0].legenda ?? "Mapa"} loading="lazy" className="w-full object-contain" />
                </button>
              )}
            </section>

            {/* Ficha técnica */}
            {fi.ficha_tecnica?.length ? (
              <details className="rounded-xl border border-border/60 p-4">
                <summary className="cursor-pointer font-heading text-base font-bold text-foreground">Ficha técnica</summary>
                <dl className="mt-3 divide-y divide-border/60">
                  {fi.ficha_tecnica.map((x) => (
                    <div key={x.item + x.valor} className="grid gap-1 py-3 sm:grid-cols-[200px_1fr]">
                      <dt className="font-body text-sm text-muted-foreground">{x.item}</dt>
                      <dd className="font-body text-sm text-foreground">{x.valor}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            ) : null}

            {/* Contato no fim, celular */}
            {!modoCorretor && <div className="lg:hidden" id="contato-celular">{contatoCard}</div>}
          </div>

          {/* Contato */}
          <aside className="scroll-mt-20 lg:sticky lg:top-20 lg:self-start" id="contato">
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
            <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 [scrollbar-width:none]">
              {outros.map((o) => <div key={o.id} className="w-[80%] shrink-0 snap-start sm:w-auto"><ProdutoFocoCard p={o} selo={black ? "Black Natal" : "Condição de Natal"} campanha={black ? "black" : "natal"} /></div>)}
            </div>
          </Reveal>
        )}
      </main>

      {/* Barra fixa no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {modoCorretor ? (
          <a href={waUrl} onClick={() => trackProdutoWhatsApp(p)} target="_blank" rel="noopener noreferrer" className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-body text-sm font-bold ${corBotao}`}>
            <MessageCircle className="h-4 w-4" /> WhatsApp de {corretor?.nome.split(" ")[0]}
          </a>
        ) : (
          <>
            <button type="button" onClick={irParaContato} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-body text-sm font-bold ${corBotao}`}>
              <Send className="h-4 w-4" /> Quero as condições
            </button>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackProdutoWhatsApp(p)} className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-3.5 font-body text-sm font-semibold text-foreground">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </>
        )}
      </div>

      {box && <MaterialGallery fotos={box.fotos} index={box.i} onClose={() => setBox(null)} />}
      <Footer />
    </div>
  );
}
