import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";
import { useCorretor } from "@/contexts/CorretorContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FotoImovel } from "@/components/FotoImovel";
import { Bed, Bath, Car, Maximize, MapPin, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/trackEvent";
import { Helmet } from "react-helmet-async";

interface VitrineData {
  id: string;
  corretor_slug: string | null;
  corretor_id: string | null;
  lead_nome: string | null;
  titulo: string | null;
  mensagem: string | null;
  imovel_codigos: string[];
}

export default function Vitrine() {
  const { id } = useParams<{ id: string }>();
  const { prefixLink } = useCorretor();
  const [vitrine, setVitrine] = useState<VitrineData | null>(null);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);

      // Fetch vitrine record
      const { data: v } = await (supabase as any)
        .from("vitrines")
        .select("id, corretor_slug, corretor_id, lead_nome, titulo, mensagem, imovel_codigos")
        .eq("id", id)
        .maybeSingle();

      if (!v) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setVitrine(v);

      // Fetch properties by jetimob_id (codigo)
      if (v.imovel_codigos?.length) {
        const { data: props } = await supabase
          .from("imoveis")
          .select("*")
          .in("jetimob_id", v.imovel_codigos)
          .eq("status", "disponivel");

        setImoveis((props as Imovel[]) || []);
      }

      // Track vitrine view
      trackEvent({
        tipo: "imovel_visualizado",
        imovel_slug: `vitrine-${v.id}`,
        imovel_titulo: v.titulo || `Vitrine ${v.lead_nome || ""}`,
      });

      // Increment view count (fire-and-forget)
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
    if (imoveis.length > 0) return fotoPrincipal(imoveis[0]);
    return "https://uhome.com.br/og-image.png";
  }, [imoveis]);

  const ogDescription = useMemo(() => {
    if (!vitrine) return "";
    return `${imoveis.length} imóveis selecionados especialmente para você. Confira preços, fotos e detalhes.`;
  }, [vitrine, imoveis]);

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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {vitrine.titulo || (vitrine.lead_nome
                ? `Seleção especial para ${vitrine.lead_nome}`
                : "Vitrine personalizada")}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {imoveis.length} {imoveis.length === 1 ? "imóvel selecionado" : "imóveis selecionados"} para você
            </p>
            {vitrine.mensagem && (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground italic">
                "{vitrine.mensagem}"
              </p>
            )}
          </div>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </button>
        </div>

        {/* Grid */}
        {imoveis.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 p-12 text-center">
            <p className="text-lg text-muted-foreground">
              Os imóveis desta vitrine não estão mais disponíveis.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {imoveis.map((imovel) => (
              <VitrineCard key={imovel.id} imovel={imovel} prefixLink={prefixLink} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

function VitrineCard({ imovel, prefixLink }: { imovel: Imovel; prefixLink: (p: string) => string }) {
  const foto = fotoPrincipal(imovel);
  const link = prefixLink(`/imovel/${imovel.slug}`);

  return (
    <Link
      to={link}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <FotoImovel
          src={foto}
          alt={imovel.titulo}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-lg font-bold text-primary">
          {formatPreco(imovel.preco)}
        </p>

        {imovel.preco_condominio ? (
          <p className="text-xs text-muted-foreground">
            Cond. {formatPreco(imovel.preco_condominio)}/mês
          </p>
        ) : null}

        <h3 className="mt-1 line-clamp-1 text-sm font-medium text-foreground">
          {imovel.titulo}
        </h3>

        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {imovel.bairro}{imovel.cidade && imovel.cidade !== "Porto Alegre" ? `, ${imovel.cidade}` : ""}
        </p>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          {imovel.quartos != null && imovel.quartos > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" /> {imovel.quartos}
            </span>
          )}
          {imovel.banheiros != null && imovel.banheiros > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {imovel.banheiros}
            </span>
          )}
          {imovel.vagas != null && imovel.vagas > 0 && (
            <span className="flex items-center gap-1">
              <Car className="h-3.5 w-3.5" /> {imovel.vagas}
            </span>
          )}
          {imovel.area_total != null && imovel.area_total > 0 && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" /> {imovel.area_total}m²
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
