import { Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, ChevronDown, MapPin, MessageCircle, Check, Building2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { UhomeLogo } from "@/components/UhomeLogo";
import { SiteBottomBar } from "@/components/SiteBottomBar";
import { FocoHero } from "@/components/foco/FocoHero";
import { FocoVisitCard } from "@/components/foco/FocoVisitCard";
import { CorretorContatoCard, ProdutoFocoCard, trackProdutoWhatsApp, useWhatsAppProduto } from "@/components/foco/FocoShared";
import { lazyRetry } from "@/lib/lazyRetry";
import { useCanonical } from "@/hooks/useCanonical";
import { useCorretor } from "@/contexts/CorretorContext";
import { useProdutoFoco, useProdutosFoco, useCampanhasAtivas, formatPreco, SITE_URL, absUrl, type MidiaFoco } from "@/lib/produtosFoco";
import { tituloFoco, tituloPreviaFoco, numerosFoco, destaquesFoco, faqFoco } from "../../supabase/functions/_shared/focoPresentation";
import { proximosDiasFoco, diaInicialFoco } from "@/lib/focoVisit";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";
import { trackEvent } from "@/lib/trackEvent";
import type { PedidoFoco } from "@/components/foco/FocoContactForm";
const MaterialGallery = lazyRetry(() => import("@/components/foco/MaterialGallery").then(m => ({ default: m.MaterialGallery })));
const FocoContactForm = lazyRetry(() => import("@/components/foco/FocoContactForm").then(m => ({ default: m.FocoContactForm })));

export default function ProdutoFocoPage() {
  const { slug } = useParams(); useCanonical(`/em-foco/${slug}`);
  const { data: p, isLoading } = useProdutoFoco(slug); const { data: catalogo = [] } = useProdutosFoco();
  const { data: campanhas = [] } = useCampanhasAtivas(); const natal = campanhas.find(c => c.tema === "natal");
  const { isDirectAccess, corretor, prefixLink } = useCorretor(); const modoCorretor = isDirectAccess && !!corretor;
  const wa = useWhatsAppProduto();
  const [box, setBox] = useState<{ fotos: MidiaFoco[]; i: number } | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [pedido, setPedido] = useState<PedidoFoco | null>(null); const [planta, setPlanta] = useState<string | null>(null);
  const [dia, setDia] = useState(() => diaInicialFoco(proximosDiasFoco()) ?? new Date()); const [periodo, setPeriodo] = useState("Tarde");
  const titulo = p ? tituloFoco(p) : "";
  const faq = p ? faqFoco(p, natal?.config.condicoes_gerais) : [];
  useEffect(() => {
    if (!p) return;
    document.title = tituloPreviaFoco(p);
    for (const [prop, value] of [["og:title", tituloPreviaFoco(p)], ["og:image", absUrl(p.capa_url) ?? ""]]) {
      let el = document.querySelector(`meta[property="${prop}"]`); if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.append(el); } el.setAttribute("content", value);
    }
    void trackEvent({ tipo: "imovel_visto", imovel_slug: `em-foco/${p.slug}`, imovel_titulo: p.nome, imovel_bairro: p.bairro, imovel_preco: p.preco_a_partir });
    setJsonLd("produto-foco", { "@context": "https://schema.org", "@type": "Residence", name: titulo, alternateName: p.nome, description: p.resumo, image: absUrl(p.capa_url), url: `${SITE_URL}/em-foco/${p.slug}`, address: { "@type": "PostalAddress", streetAddress: p.endereco, addressLocality: p.cidade, addressRegion: "RS", addressCountry: "BR" }, ...(p.preco_a_partir ? { offers: { "@type": "Offer", price: p.preco_a_partir, priceCurrency: "BRL" } } : {}) });
    setJsonLd("produto-foco-faq", { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(q => ({ "@type": "Question", name: q.p, acceptedAnswer: { "@type": "Answer", text: q.r } })) });
    return () => { removeJsonLd("produto-foco"); removeJsonLd("produto-foco-faq"); };
  }, [p, titulo, natal]);
  if (isLoading) return <div className="min-h-screen bg-background"><Navbar /><div className="mx-auto h-96 max-w-6xl animate-pulse bg-muted" /></div>;
  if (!p) return <div className="min-h-screen bg-background"><Navbar /><h1 className="pt-40 text-center text-2xl">Produto não encontrado</h1><Link to={prefixLink("/em-foco")}>Ver empreendimentos</Link></div>;
  const fi = p.ficha ?? {}; const waUrl = wa(p); const destaques = destaquesFoco(p);
  const tipologias = fi.tipologias ?? []; const numeros = numerosFoco(p);
  const similares = catalogo.filter(x => x.slug !== p.slug && (/casa|sobrado/i.test(x.tipo ?? "") === /casa|sobrado/i.test(p.tipo ?? "")) && x.preco_a_partir && p.preco_a_partir && x.preco_a_partir >= p.preco_a_partir * 0.65 && x.preco_a_partir <= p.preco_a_partir * 1.5).slice(0, 3);
  const abrir = (fotos: MidiaFoco[], i: number) => { opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setBox({ fotos, i }); };
  const pedir = (modo: PedidoFoco, escolhida?: string) => { if (modoCorretor) { window.open(waUrl, "_blank", "noopener"); trackProdutoWhatsApp(p); return; } setPlanta(escolhida ?? null); setPedido(modo); };
  const heading = <div data-foco-title className="foco-heading"><p className="text-sm font-semibold text-muted-foreground">{p.nome} · {p.incorporadora}</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-md bg-secondary px-3 py-1 text-xs font-semibold">{p.status_obra ?? "Empreendimento"}</span>{natal && <span className="rounded-md bg-natal-red px-3 py-1 text-xs font-semibold text-natal-foreground">Condição de Natal até 18/12</span>}</div><h1 className="mt-3 text-3xl font-extrabold leading-tight lg:text-4xl">{titulo}</h1><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{p.bairro}, {p.cidade}</p></div>;
  return <div className="foco-page min-h-screen bg-background">
    <header className="foco-header"><Link to={prefixLink("/")} aria-label="Uhome, página inicial"><UhomeLogo variant="full" height={24} /></Link><nav aria-label="Seções" className="hidden gap-1 lg:flex">{[["plantas", "Plantas"], ["comodidades", "Comodidades"], ["obra", "Obra"], ["local", "Localização"]].map(([id, l]) => <Button asChild variant="ghost" key={id}><a href={`#${id}`}>{l}</a></Button>)}</nav><Button onClick={() => pedir("visita")} className="hidden lg:inline-flex">Agendar visita</Button></header>
    <main className="foco-container">
      {heading}
      <FocoHero p={p} natal={!!natal} abrir={abrir} prefixLink={prefixLink} />
      <div className="foco-columns">
        <div className="foco-content">
          {numeros.length > 0 && <section className="border-b border-border pb-6"><dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">{numeros.map(n => <div key={n.label}><dt className="text-xs text-muted-foreground">{n.label}</dt><dd className="mt-1 text-sm font-bold">{n.valor}</dd></div>)}</dl></section>}
          <section><h2 className="text-2xl font-bold">Por que o {p.nome}</h2><div className="mt-6 space-y-5">{destaques.map(d => <div key={d.titulo} className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h3 className="font-bold">{d.titulo}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.texto}</p></div></div>)}</div></section>
          {!modoCorretor && <section className="lg:hidden"><h2 className="text-xl font-bold">Quer saber mais antes de visitar?</h2><p className="mt-2 text-sm text-muted-foreground">Valores, plantas e condições do {p.nome}.</p><Button variant="outline" onClick={() => pedir("informacoes")} className="mt-4 w-full">Receber informações</Button></section>}
          <section><h2 className="text-2xl font-bold">Conheça o {p.nome}</h2>{[p.resumo, fi.unidade?.join(". "), fi.lazer?.join(", ")].filter(Boolean).slice(0, 3).map((t, i) => <p className="mt-4 text-sm leading-relaxed text-muted-foreground" key={i}>{t}</p>)}</section>
          <section id="plantas" className="scroll-mt-6"><h2 className="text-2xl font-bold">Escolha a planta</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{tipologias.map((t, i) => {
            const image = p.plantas.find(f => t.dorm && new RegExp(`${t.dorm}\\s*(dorm|d)`, "i").test(f.legenda ?? "")) ?? (p.plantas.length === tipologias.length ? p.plantas[i] : undefined);
            const baseNome = t.nome.replace(/\s*\([^)]*\)/g, "").trim();
            const preco = fi.precos?.find(x => x.tipologia === t.nome || x.tipologia === baseNome);
            return <article key={t.nome} className="overflow-hidden rounded-lg border border-border">{image && <Button variant="ghost" className="h-auto w-full rounded-none bg-secondary p-4" aria-label={`Ampliar planta ${t.nome}`} onClick={() => abrir(p.plantas, p.plantas.indexOf(image))}><img src={image.url} alt={image.legenda ?? t.nome} className="aspect-[4/3] w-full object-contain" loading="lazy" /></Button>}<div className="p-4"><h3 className="font-bold">{t.nome}</h3><p className="mt-2 text-sm text-muted-foreground">{t.area} · {t.vagas?.replace(/tabela/gi, "disponibilidade")}</p><p className="mt-3 font-semibold">{preco ? `A partir de ${formatPreco(preco.valor)}` : "Valores sob consulta"}</p><Button variant="outline" className="mt-4 w-full" onClick={() => pedir("informacoes", t.nome)}>Receber informações</Button></div></article>;
          })}</div>{!tipologias.length && p.plantas.map((f, i) => <Button key={f.url} variant="outline" className="mt-4 h-auto" onClick={() => abrir(p.plantas, i)}><img src={f.url} alt={f.legenda ?? "Planta"} loading="lazy" className="h-40 object-contain" /></Button>)}</section>
          {!!fi.lazer?.length && <section id="comodidades"><h2 className="text-2xl font-bold">O clube do condomínio</h2><ul className="mt-6 grid gap-3 sm:grid-cols-2">{fi.lazer.map(x => <li className="flex gap-2 text-sm" key={x}><Check className="h-4 w-4 shrink-0 text-muted-foreground" />{x}</li>)}</ul></section>}
          {natal && <section className="border-y border-border py-6"><h2 className="text-2xl font-bold">Condição de Natal até 18/12</h2><p className="mt-3 font-semibold">{natal.config.condicoes_gerais?.join(" · ")}</p><ul className="mt-4 space-y-3">{fi.precos?.map(x => <li key={x.tipologia} className="flex flex-wrap justify-between gap-2 text-sm"><span>{x.tipologia}</span><strong>{x.texto}</strong></li>)}</ul>{natal.config.urna && <p className="mt-5 text-sm text-muted-foreground">Comprou, ganhou: {natal.config.urna}</p>}<p className="mt-4 text-xs text-muted-foreground">Valores sujeitos a alteração e disponibilidade. Financiamento conforme o perfil do comprador.</p></section>}
          <section id="obra"><h2 className="text-2xl font-bold">Andamento da obra</h2><div className="mt-5 flex gap-3"><Building2 className="text-primary" /><div><p className="font-semibold">{p.status_obra}</p><p className="mt-2 text-sm text-muted-foreground">Entrega prevista: {p.entrega}</p></div></div></section>
          <section id="local"><h2 className="text-2xl font-bold">Onde fica</h2><p className="mt-3 text-sm text-muted-foreground">{p.endereco}, {p.bairro}, {p.cidade}{fi.referencia ? ` · ${fi.referencia}` : ""}</p>{p.mapas[0] && <Button variant="ghost" className="mt-5 h-auto w-full p-0" aria-label="Ampliar mapa oficial" onClick={() => abrir(p.mapas, 0)}><img src={p.mapas[0].url} alt={p.mapas[0].legenda ?? "Mapa oficial do empreendimento"} loading="lazy" className="aspect-[4/3] w-full rounded-lg object-contain" /></Button>}{fi.maps_url && <iframe title={`Mapa de ${p.nome}`} loading="lazy" referrerPolicy="no-referrer" src={`https://maps.google.com/maps?q=${encodeURIComponent([p.endereco, p.cidade, "RS"].join(", "))}&output=embed`} className="mt-5 h-72 w-full rounded-lg border-0" />}<ul className="mt-5 divide-y divide-border">{fi.proximidades?.map(x => <li className="flex justify-between gap-3 py-3 text-sm" key={x.lugar}><span>{x.lugar}</span><span className="shrink-0 text-muted-foreground">{x.tempo}</span></li>)}</ul>{fi.maps_url && <Button variant="outline" asChild className="mt-4"><a href={fi.maps_url} target="_blank" rel="noopener noreferrer">Abrir no mapa</a></Button>}</section>
          <section><h2 className="text-2xl font-bold">Perguntas frequentes</h2><div className="mt-5 divide-y divide-border">{faq.map(q => <details key={q.p} className="py-4"><summary className="flex min-h-11 cursor-pointer justify-between gap-3 font-semibold">{q.p}<ChevronDown className="h-5 w-5 shrink-0" /></summary><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{q.r}</p></details>)}</div></section>
          {!!similares.length && <section><h2 className="text-2xl font-bold">Empreendimentos parecidos</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{similares.map(x => <ProdutoFocoCard key={x.id} p={x} />)}</div></section>}
          {modoCorretor && <CorretorContatoCard produto={p} />}
        </div>
        {!modoCorretor && <div className="hidden lg:block"><FocoVisitCard p={p} condicao={natal?.config.condicoes_gerais?.[0]} dia={dia} periodo={periodo} setDia={setDia} setPeriodo={setPeriodo} onVisita={() => pedir("visita")} onInfo={() => pedir("informacoes")} waUrl={waUrl} /></div>}
      </div>
    </main>
    <footer className="foco-footer border-t border-border px-5 py-10 text-center text-xs text-muted-foreground"><p className="text-base font-bold text-foreground">Você e seu novo lar.</p><p className="mt-3">Uhome Imóveis · CRECI-RS 25682J</p><Link className="inline-flex min-h-11 items-center" to="/politica-de-privacidade">Política de privacidade</Link></footer>
    <SiteBottomBar />
    <div data-barra-baixo className="uhs-contact-bar fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden"><Button onClick={() => pedir("visita")} className="flex-1 px-2 text-sm"><CalendarDays className="h-4 w-4" />Agendar visita</Button>{!modoCorretor && <Button variant="outline" onClick={() => pedir("informacoes")} className="flex-1 px-2 text-sm">Informações</Button>}<a href={waUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" onClick={() => trackProdutoWhatsApp(p)} className="flex items-center justify-center rounded-xl border border-border px-4 py-3.5 text-foreground"><MessageCircle className="h-5 w-5 text-whatsapp" /></a></div>
    {box && <Suspense fallback={null}><MaterialGallery fotos={box.fotos} index={box.i} onClose={() => setBox(null)} onAgendar={() => { setBox(null); pedir("visita"); }} restoreFocus={opener.current} /></Suspense>}
    <Dialog.Root open={!!pedido} onOpenChange={v => { if (!v) setPedido(null); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[120] bg-noir/80" /><Dialog.Content aria-describedby={undefined} className="fixed inset-x-3 top-1/2 z-[121] max-h-[85dvh] -translate-y-1/2 overflow-auto rounded-lg border border-border bg-background p-5 sm:left-1/2 sm:right-auto sm:w-[480px] sm:-translate-x-1/2 sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><Dialog.Title className="text-xl font-bold">{pedido === "visita" ? "Agendar visita" : "Receber informações"}</Dialog.Title><Dialog.Close asChild><Button variant="ghost" size="icon" aria-label="Fechar formulário"><X /></Button></Dialog.Close></div>{pedido && <Suspense fallback={<div className="h-80 animate-pulse bg-secondary" />}><FocoContactForm key={pedido} p={p} modo={pedido} dia={dia} periodo={periodo} planta={planta} setDia={setDia} setPeriodo={setPeriodo} onVisita={() => setPedido("visita")} /></Suspense>}</Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>;
}
