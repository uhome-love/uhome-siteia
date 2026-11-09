import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Loader2, Gift, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCanonical } from "@/hooks/useCanonical";
import { useCorretor } from "@/contexts/CorretorContext";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";
import { blackAtiva, useCampanhasAtivas, useProdutosFoco, SITE_URL } from "@/lib/produtosFoco";
import { FocoBadge, FocoEmptyState, ProdutoFocoCard } from "@/components/foco/FocoShared";

const FAIXAS = [
  { id: "todas", label: "Todos os valores", min: 0, max: Infinity },
  { id: "ate400", label: "Até R$ 400 mil", min: 0, max: 400_000 },
  { id: "400a1m", label: "R$ 400 mil a 1 mi", min: 400_000, max: 1_000_000 },
  { id: "1m", label: "Acima de R$ 1 mi", min: 1_000_000, max: Infinity },
];
const ESTAGIOS = [
  { id: "todos", label: "Todos" },
  { id: "lancamento", label: "Lançamento" },
  { id: "obras", label: "Em obras" },
  { id: "pronto", label: "Pronto" },
];

function estagio(s?: string | null) {
  const t = (s ?? "").toLowerCase();
  if (t.includes("pronto")) return "pronto";
  if (t.includes("lança")) return "lancamento";
  return "obras";
}

export default function EmFoco() {
  useCanonical("/em-foco");
  const { prefixLink, corretor } = useCorretor();
  const { data: produtos = [], isLoading } = useProdutosFoco();
  const { data: campanhas = [], isLoading: loadingCampanhas } = useCampanhasAtivas();
  const [cidade, setCidade] = useState("todas");
  const [faixa, setFaixa] = useState("todas");
  const [est, setEst] = useState("todos");
  const natal = campanhas.find((c) => c.tema === "natal");
  const black = blackAtiva(natal);

  useEffect(() => {
    document.title = "Uhome em Foco: lançamentos e oportunidades em Porto Alegre e Canoas | Uhome";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      "Os empreendimentos com as melhores condições do momento: lançamentos, obras e prontos para morar em Porto Alegre e Canoas, com atendimento Uhome."
    );
  }, []);

  useEffect(() => {
    if (!produtos.length) return;
    setJsonLd("em-foco-list", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Uhome em Foco",
      itemListElement: produtos.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/em-foco/${p.slug}`, name: p.nome })),
    });
    return () => removeJsonLd("em-foco-list");
  }, [produtos]);

  const cidades = useMemo(() => Array.from(new Set(produtos.map((p) => p.cidade).filter(Boolean))) as string[], [produtos]);
  const f = FAIXAS.find((x) => x.id === faixa)!;
  const lista = produtos.filter(
    (p) =>
      (cidade === "todas" || p.cidade === cidade) &&
      (est === "todos" || estagio(p.status_obra) === est) &&
      (p.preco_a_partir ?? 0) >= f.min &&
      (p.preco_a_partir ?? 0) < f.max
  );
  const naCampanha = new Set(natal ? produtos.map((p) => p.id) : []);

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 font-body text-sm font-medium transition-colors ${
      active ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:border-foreground"
    }`;

  // Enquanto a campanha em destaque (Natal) estiver vigente, ela é a única vitrine.
  const destaque = campanhas.find((c) => c.destaque_home);
  if (loadingCampanhas) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (destaque) return <Navigate to={prefixLink(`/campanha/${destaque.slug}`)} replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <section className="border-b border-border/60 bg-secondary/40">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
            <FocoBadge />
            <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Os empreendimentos com as melhores condições do momento
            </h1>
            <p className="mt-4 max-w-2xl font-body text-lg text-muted-foreground">
              Selecionamos os produtos em que estamos com campanha ativa e condições especiais.
              {corretor ? ` Atendimento direto com ${corretor.nome}.` : " Atendimento especializado Uhome."}
            </p>
          </div>
        </section>

        {natal && (
          <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
            <Link
              to={prefixLink(`/campanha/${natal.slug}`)}
              className={`group flex flex-col gap-4 overflow-hidden rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 ${
                black ? "bg-noir text-noir-foreground" : "bg-natal text-natal-foreground"
              }`}
            >
              <div className="flex items-center gap-4">
                <Gift className="h-10 w-10 flex-shrink-0 text-natal-gold" />
                <div>
                  <p className="font-heading text-2xl font-bold">{black ? "Black Natal Uhome" : natal.titulo}</p>
                  <p className="font-body text-sm opacity-85">{natal.subtitulo}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-natal-gold px-5 py-2.5 font-body text-sm font-bold text-natal-deep">
                Ver a campanha <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <button className={chip(cidade === "todas")} onClick={() => setCidade("todas")}>Todas as cidades</button>
              {cidades.map((c) => (
                <button key={c} className={chip(cidade === c)} onClick={() => setCidade(c)}>{c}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {ESTAGIOS.map((e) => (
                <button key={e.id} className={chip(est === e.id)} onClick={() => setEst(e.id)}>{e.label}</button>
              ))}
              <span className="mx-1 hidden w-px bg-border sm:block" />
              {FAIXAS.map((x) => (
                <button key={x.id} className={chip(faixa === x.id)} onClick={() => setFaixa(x.id)}>{x.label}</button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : lista.length === 0 ? (
            <FocoEmptyState />
          ) : (
            <>
              <p className="mt-6 font-body text-sm text-muted-foreground">{lista.length} produtos</p>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {lista.map((p) => (
                  <ProdutoFocoCard
                    key={p.id}
                    p={p}
                    selo={naCampanha.has(p.id) ? (black ? "Black Natal" : "Condição de Natal") : undefined}
                    campanha={naCampanha.has(p.id) ? (black ? "black" : "natal") : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
