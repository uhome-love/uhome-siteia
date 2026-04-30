import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";
import { useCorretor } from "@/contexts/CorretorContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FotoImovel } from "@/components/FotoImovel";
import { MapPin, Share2, MessageCircle, Phone } from "lucide-react";
import { trackEvent } from "@/lib/trackEvent";
import { Helmet } from "react-helmet-async";

interface VitrineData {
  id: string;
  corretor_slug: string | null;
  corretor_id: string | null;
  lead_nome: string | null;
  titulo: string | null;
  subtitulo: string | null;
  mensagem: string | null;
  mensagem_corretor: string | null;
  imovel_codigos: string[];
  imoveis_resolvidos: SnapshotImovel[] | null;
  visualizacoes: number | null;
}

interface SnapshotImovel {
  id?: string;
  jetimob_id?: string;
  slug?: string;
  titulo?: string;
  tipo?: string;
  preco?: number;
  preco_condominio?: number | null;
  area_total?: number | null;
  area_util?: number | null;
  quartos?: number | null;
  banheiros?: number | null;
  vagas?: number | null;
  bairro?: string;
  cidade?: string;
  foto_principal?: string | null;
  status?: string;
}

interface CorretorData {
  id: string;
  nome: string | null;
  foto_url: string | null;
  avatar_url: string | null;
  telefone: string | null;
  creci: string | null;
  slug_ref: string | null;
}

// Item renderizável — pode ser imóvel completo (ao vivo) ou snapshot (indisponível)
type ItemVitrine =
  | { kind: "live"; imovel: Imovel }
  | { kind: "snapshot"; data: SnapshotImovel };

export default function Vitrine() {
  const { id } = useParams<{ id: string }>();
  const { prefixLink } = useCorretor();
  const [vitrine, setVitrine] = useState<VitrineData | null>(null);
  const [itens, setItens] = useState<ItemVitrine[]>([]);
  const [corretor, setCorretor] = useState<CorretorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);

      const { data: v } = await (supabase as any)
        .from("vitrines")
        .select(
          "id, corretor_slug, corretor_id, lead_nome, titulo, subtitulo, mensagem, mensagem_corretor, imovel_codigos, imoveis_resolvidos, visualizacoes"
        )
        .eq("id", id)
        .maybeSingle();

      if (!v) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setVitrine(v);

      // 1) Buscar imóveis ao vivo
      const codigos: string[] = v.imovel_codigos ?? [];
      let liveImoveis: Imovel[] = [];
      if (codigos.length) {
        const { data: props } = await supabase
          .from("imoveis")
          .select("*")
          .in("jetimob_id", codigos)
          .eq("status", "disponivel");
        liveImoveis = (props as unknown as Imovel[]) || [];
      }

      // 2) Para códigos sem match ao vivo, usar snapshot
      const liveCodigos = new Set(liveImoveis.map((im: any) => im.jetimob_id));
      const snapshot = (v.imoveis_resolvidos ?? []) as SnapshotImovel[];
      const fallback = snapshot.filter(
        (s) => s.jetimob_id && !liveCodigos.has(s.jetimob_id)
      );

      // Preserva ordem original dos códigos
      const itensOrdenados: ItemVitrine[] = [];
      for (const cod of codigos) {
        const live = liveImoveis.find((im: any) => im.jetimob_id === cod);
        if (live) {
          itensOrdenados.push({ kind: "live", imovel: live });
          continue;
        }
        const snap = fallback.find((s) => s.jetimob_id === cod);
        if (snap) itensOrdenados.push({ kind: "snapshot", data: snap });
      }
      setItens(itensOrdenados);

      // 3) Buscar corretor
      if (v.corretor_id) {
        const { data: c } = await supabase
          .from("profiles")
          .select("id, nome, foto_url, avatar_url, telefone, creci, slug_ref")
          .eq("id", v.corretor_id)
          .maybeSingle();
        if (c) setCorretor(c as CorretorData);
      }

      // Track + incrementa view
      trackEvent({
        tipo: "imovel_visualizado",
        imovel_slug: `vitrine-${v.id}`,
        imovel_titulo: v.titulo || `Vitrine ${v.lead_nome || ""}`,
      });

      (supabase as any)
        .from("vitrines")
        .update({ visualizacoes: (v.visualizacoes || 0) + 1 })
        .eq("id", id)
        .then(() => {});

      setLoading(false);
    }

    load();
  }, [id]);

  const pageTitle = useMemo(() => {
    if (!vitrine) return "Vitrine | Uhome";
    if (vitrine.titulo) return vitrine.titulo;
    return vitrine.lead_nome
      ? `Vitrine personalizada para ${vitrine.lead_nome}`
      : "Vitrine personalizada | Uhome";
  }, [vitrine]);

  const ogImage = useMemo(() => {
    const first = itens[0];
    if (!first) return "https://uhome.com.br/og-image.png";
    if (first.kind === "live") return fotoPrincipal(first.imovel);
    return first.data.foto_principal || "https://uhome.com.br/og-image.png";
  }, [itens]);

  const ogDescription = useMemo(() => {
    if (vitrine?.mensagem) return vitrine.mensagem.slice(0, 160);
    if (vitrine?.subtitulo) return vitrine.subtitulo.slice(0, 160);
    return `${itens.length} imóveis selecionados especialmente para você. Confira preços, fotos e detalhes.`;
  }, [vitrine, itens]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: pageTitle, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </>
    );
  }

  if (notFound || !vitrine) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background px-4">
          <h1 className="text-2xl font-bold text-foreground">Vitrine não encontrada</h1>
          <p className="text-muted-foreground">Este link pode ter expirado ou não existe.</p>
          <Link to="/" className="text-primary underline">Voltar ao início</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {vitrine.titulo || (vitrine.lead_nome
                ? `Seleção especial para ${vitrine.lead_nome}`
                : "Vitrine personalizada")}
            </h1>
            {vitrine.subtitulo && (
              <p className="mt-1 text-muted-foreground">{vitrine.subtitulo}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {itens.length} {itens.length === 1 ? "imóvel selecionado" : "imóveis selecionados"} para você
            </p>
            {vitrine.mensagem && (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground italic">
                "{vitrine.mensagem}"
              </p>
            )}
          </div>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </button>
        </div>

        {/* Bloco do corretor */}
        {corretor && (
          <CorretorBlock corretor={corretor} mensagem={vitrine.mensagem_corretor} vitrineId={vitrine.id} />
        )}

        {/* Grid */}
        {itens.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 p-12 text-center">
            <p className="text-lg text-muted-foreground">
              Os imóveis desta vitrine não estão mais disponíveis.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {itens.map((item, idx) =>
              item.kind === "live" ? (
                <VitrineCard key={item.imovel.id} imovel={item.imovel} prefixLink={prefixLink} />
              ) : (
                <SnapshotCard key={`snap-${idx}`} data={item.data} />
              )
            )}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

// ─── Bloco do corretor ─────────────────────────────────────────────
function CorretorBlock({
  corretor,
  mensagem,
  vitrineId,
}: {
  corretor: CorretorData;
  mensagem: string | null;
  vitrineId: string;
}) {
  const foto = corretor.foto_url || corretor.avatar_url || "";
  const telDigits = (corretor.telefone || "").replace(/\D/g, "");
  const waNumber = telDigits.length > 0
    ? (telDigits.startsWith("55") ? telDigits : `55${telDigits}`)
    : "";
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `Olá ${corretor.nome ?? ""}! Vi a vitrine que você compartilhou e gostaria de mais informações.`
      )}`
    : null;

  const handleWaClick = () => {
    (supabase as any)
      .from("vitrines")
      .select("cliques_whatsapp")
      .eq("id", vitrineId)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          (supabase as any)
            .from("vitrines")
            .update({ cliques_whatsapp: (data.cliques_whatsapp || 0) + 1 })
            .eq("id", vitrineId)
            .then(() => {});
        }
      });
  };

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {foto ? (
          <img
            src={foto}
            alt={corretor.nome ?? "Corretor"}
            className="h-14 w-14 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
            {(corretor.nome ?? "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Seu corretor</p>
          <p className="text-base font-semibold text-foreground">{corretor.nome ?? "Corretor Uhome"}</p>
          {corretor.creci && (
            <p className="text-xs text-muted-foreground">CRECI {corretor.creci}</p>
          )}
          {mensagem && (
            <p className="mt-1 max-w-md text-sm text-muted-foreground italic">"{mensagem}"</p>
          )}
        </div>
      </div>
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWaClick}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 sm:self-auto"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      )}
      {!waUrl && corretor.telefone && (
        <a
          href={`tel:${corretor.telefone}`}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Phone className="h-4 w-4" />
          {corretor.telefone}
        </a>
      )}
    </div>
  );
}

// ─── Card do snapshot (imóvel indisponível) ────────────────────────
function SnapshotCard({ data }: { data: SnapshotImovel }) {
  return (
    <div className="group block overflow-hidden rounded-xl border border-border bg-card opacity-75">
      <div className="relative bg-muted" style={{ aspectRatio: "4/3" }}>
        {data.foto_principal ? (
          <FotoImovel
            src={data.foto_principal}
            alt={data.titulo ?? ""}
            className="h-full w-full object-cover grayscale"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            Sem foto
          </div>
        )}
        <div className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold uppercase text-white">
          Indisponível
        </div>
      </div>
      <div className="p-4">
        {data.preco ? (
          <p className="text-lg font-bold text-foreground">{formatPreco(data.preco)}</p>
        ) : null}
        <h3 className="mt-1 line-clamp-1 text-sm font-medium text-foreground">{data.titulo}</h3>
        {data.bairro && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {data.bairro}
            {data.cidade && data.cidade !== "Porto Alegre" ? `, ${data.cidade}` : ""}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Este imóvel não está mais disponível no catálogo.
        </p>
      </div>
    </div>
  );
}

// ─── Card de imóvel ao vivo ────────────────────────────────────────
function VitrineCard({ imovel, prefixLink }: { imovel: Imovel; prefixLink: (p: string) => string }) {
  const [hovering, setHovering] = useState(false);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [lazyFotos, setLazyFotos] = useState<string[] | null>(null);
  const fotosLoadedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const link = prefixLink(`/imovel/${imovel.slug}`);

  const baseFotos = useMemo(() => {
    if (imovel.fotos && imovel.fotos.length > 0) {
      const urls = imovel.fotos.map((f: any) => f.url || f.src || f).filter(Boolean);
      if (urls.length > 0) return urls;
    }
    const fp = fotoPrincipal(imovel);
    return fp ? [fp] : [];
  }, [imovel]);

  const fotos = lazyFotos && lazyFotos.length > 0 ? lazyFotos : baseFotos;

  const loadFullFotos = useCallback(() => {
    if (fotosLoadedRef.current || baseFotos.length > 1) return;
    fotosLoadedRef.current = true;
    supabase
      .from("imoveis")
      .select("fotos")
      .eq("id", imovel.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.fotos && Array.isArray(data.fotos) && data.fotos.length > 0) {
          const urls = (data.fotos as any[])
            .sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0))
            .map((f: any) => f?.url || f?.src || f)
            .filter(Boolean)
            .slice(0, 8);
          if (urls.length > 0) setLazyFotos(urls);
        }
      });
  }, [imovel.id, baseFotos.length]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setFotoAtiva(idx);
    if (idx > 0) loadFullFotos();
  }, [loadFullFotos]);

  const area = imovel.area_util ?? imovel.area_total ?? 0;
  const statsArr = [
    area > 0 ? `${area} m²` : null,
    (imovel.quartos ?? 0) > 0 ? `${imovel.quartos} quarto${imovel.quartos! > 1 ? "s" : ""}` : null,
    (imovel.vagas ?? 0) > 0 ? `${imovel.vagas} vaga${imovel.vagas! > 1 ? "s" : ""}` : null,
  ].filter(Boolean);
  const stats = statsArr.join(" · ");

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener"
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md no-underline text-inherit"
      onMouseEnter={() => { setHovering(true); loadFullFotos(); }}
      onMouseLeave={() => { setHovering(false); setFotoAtiva(0); }}
    >
      {/* === MOBILE: swipe carousel === */}
      <div className="sm:hidden">
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide h-full"
            style={{ WebkitOverflowScrolling: "touch" }}
            onClick={(e) => e.stopPropagation()}
          >
            {fotos.slice(0, 7).map((foto, i) => (
              <div key={i} className="w-full shrink-0 snap-center">
                <FotoImovel src={foto} alt={`${imovel.titulo} - foto ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" style={{ aspectRatio: "4/3" }} />
              </div>
            ))}
          </div>
          {fotos.length > 1 && (
            <div className="pointer-events-none absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {fotos.slice(0, 7).map((_, i) => (
                <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: i === fotoAtiva ? "white" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* === DESKTOP: hover arrows === */}
      <div className="hidden sm:block">
        <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: "4/3" }}>
          <FotoImovel
            src={fotos[fotoAtiva] || ""}
            alt={imovel.titulo}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {hovering && fotos.length > 1 && (
            <>
              {fotoAtiva > 0 && (
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFotoAtiva(i => i - 1); }} aria-label="Foto anterior" className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm shadow hover:scale-105 active:scale-95 transition-transform">‹</button>
              )}
              {fotoAtiva < fotos.length - 1 && (
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFotoAtiva(i => i + 1); }} aria-label="Próxima foto" className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm shadow hover:scale-105 active:scale-95 transition-transform">›</button>
              )}
            </>
          )}
          {hovering && fotos.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {fotos.slice(0, 5).map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-200" style={{ width: i === fotoAtiva ? 18 : 5, height: 5, background: i === fotoAtiva ? "white" : "rgba(255,255,255,0.55)" }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-lg font-bold text-primary">{formatPreco(imovel.preco)}</p>
        {imovel.preco_condominio ? (
          <p className="text-xs text-muted-foreground">Cond. {formatPreco(imovel.preco_condominio)}/mês</p>
        ) : null}
        <h3 className="mt-1 line-clamp-1 text-sm font-medium text-foreground">{imovel.titulo}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {imovel.bairro}{imovel.cidade && imovel.cidade !== "Porto Alegre" ? `, ${imovel.cidade}` : ""}
        </p>
        {stats && <p className="mt-2 text-xs text-muted-foreground">{stats}</p>}
      </div>
    </a>
  );
}
