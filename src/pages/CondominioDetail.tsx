import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FotoImovel } from "@/components/FotoImovel";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { LeadFormInline } from "@/components/LeadFormInline";
import { supabase } from "@/integrations/supabase/client";
import { useCanonical } from "@/hooks/useCanonical";
import { type Imovel } from "@/services/imoveis";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronRight,
  Loader2,
  Building2,
  MapPin,
  Home,
  Car,
  Bath,
  Maximize2,
} from "lucide-react";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatPreco(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (v >= 1_000) return `R$ ${Math.round(v / 1000)}mil`;
  return `R$ ${v.toLocaleString("pt-BR")}`;
}

interface CondoStats {
  totalUnidades: number;
  precoMin: number;
  precoMax: number;
  areaMin: number;
  areaMax: number;
  quartosSet: Set<number>;
  vagasSet: Set<number>;
  banheirosSet: Set<number>;
  tiposSet: Set<string>;
  bairro: string;
  cidade: string;
  foto: string;
}

function buildStats(imoveis: Imovel[]): CondoStats {
  const stats: CondoStats = {
    totalUnidades: imoveis.length,
    precoMin: Infinity,
    precoMax: 0,
    areaMin: Infinity,
    areaMax: 0,
    quartosSet: new Set(),
    vagasSet: new Set(),
    banheirosSet: new Set(),
    tiposSet: new Set(),
    bairro: imoveis[0]?.bairro || "",
    cidade: imoveis[0]?.cidade || "Porto Alegre",
    
    foto: "",
  };

  for (const im of imoveis) {
    if (im.preco < stats.precoMin) stats.precoMin = im.preco;
    if (im.preco > stats.precoMax) stats.precoMax = im.preco;
    const area = im.area_total ?? im.area_util ?? 0;
    if (area > 0) {
      if (area < stats.areaMin) stats.areaMin = area;
      if (area > stats.areaMax) stats.areaMax = area;
    }
    if (im.quartos) stats.quartosSet.add(im.quartos);
    if (im.vagas) stats.vagasSet.add(im.vagas);
    if (im.banheiros) stats.banheirosSet.add(im.banheiros);
    stats.tiposSet.add(im.tipo);
    if (!stats.foto && im.fotos.length > 0) stats.foto = im.fotos[0].url;
  }

  if (stats.areaMin === Infinity) stats.areaMin = 0;
  return stats;
}

function rangeLabel(min: number, max: number, suffix = "") {
  if (min === max) return `${min}${suffix}`;
  return `${min} a ${max}${suffix}`;
}

function setLabel(s: Set<number>) {
  const arr = Array.from(s).sort((a, b) => a - b);
  if (arr.length <= 2) return arr.join(" ou ");
  return `${arr[0]} a ${arr[arr.length - 1]}`;
}

function formatPrecoFull(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function buildFaqItems(name: string, stats: CondoStats, diferenciais: string[]): { pergunta: string; resposta: string }[] {
  const faqs: { pergunta: string; resposta: string }[] = [];

  // Price
  faqs.push({
    pergunta: `Qual o preço dos imóveis no ${name}?`,
    resposta: stats.precoMin === stats.precoMax
      ? `As unidades disponíveis no ${name} estão com valor de ${formatPrecoFull(stats.precoMin)}.`
      : `Os imóveis no ${name} variam de ${formatPrecoFull(stats.precoMin)} a ${formatPrecoFull(stats.precoMax)}, dependendo da metragem e configuração da unidade.`,
  });

  // Units available
  faqs.push({
    pergunta: `Quantas unidades estão disponíveis no ${name}?`,
    resposta: `Atualmente há ${stats.totalUnidades} ${stats.totalUnidades === 1 ? "unidade disponível" : "unidades disponíveis"} no ${name}, incluindo ${Array.from(stats.tiposSet).join(" e ")}.`,
  });

  // Location
  faqs.push({
    pergunta: `Onde fica o ${name}?`,
    resposta: `O ${name} está localizado no bairro ${stats.bairro}, em ${stats.cidade}. A região é conhecida por sua infraestrutura completa com fácil acesso a comércio, serviços e transporte público.`,
  });

  // Area
  if (stats.areaMin > 0) {
    faqs.push({
      pergunta: `Qual a metragem dos apartamentos no ${name}?`,
      resposta: stats.areaMin === stats.areaMax
        ? `As unidades possuem ${stats.areaMin} m² de área.`
        : `As unidades variam de ${stats.areaMin} m² a ${stats.areaMax} m², oferecendo opções para diferentes perfis de moradores.`,
    });
  }

  // Bedrooms
  if (stats.quartosSet.size > 0) {
    const q = Array.from(stats.quartosSet).sort((a, b) => a - b);
    faqs.push({
      pergunta: `Quantos quartos têm os imóveis do ${name}?`,
      resposta: q.length === 1
        ? `As unidades do ${name} possuem ${q[0]} ${q[0] === 1 ? "quarto" : "quartos"}.`
        : `O empreendimento oferece opções de ${q.join(", ")} quartos, atendendo desde casais até famílias maiores.`,
    });
  }

  // Parking
  if (stats.vagasSet.size > 0) {
    const v = Array.from(stats.vagasSet).sort((a, b) => a - b);
    faqs.push({
      pergunta: `O ${name} tem vaga de garagem?`,
      resposta: `Sim, as unidades contam com ${v.length === 1 ? `${v[0]} ${v[0] === 1 ? "vaga" : "vagas"}` : `${v[0]} a ${v[v.length - 1]} vagas`} de garagem.`,
    });
  }

  // Diferenciais / infrastructure
  if (diferenciais.length > 0) {
    faqs.push({
      pergunta: `Quais são os diferenciais e a infraestrutura do ${name}?`,
      resposta: `O ${name} conta com: ${diferenciais.slice(0, 10).join(", ")}. Esses diferenciais tornam o empreendimento uma excelente opção de moradia no bairro ${stats.bairro}.`,
    });
  }

  return faqs;
}

const CondominioDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  useCanonical(slug);
  const [condoName, setCondoName] = useState<string | null>(null);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [descricao, setDescricao] = useState<string | null>(null);
  const [descLoading, setDescLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      setLoading(true);

      // First, find the condominio_nome that matches this slug
      // We do a lightweight query to get unique condo names
      const { data: nameData } = await supabase
        .from("imoveis")
        .select("condominio_nome")
        .eq("status", "disponivel")
        .not("condominio_nome", "is", null)
        .limit(1000);

      if (!nameData) {
        setLoading(false);
        return;
      }

      // Find matching name by slug
      const uniqueNames = [...new Set(nameData.map((r: any) => r.condominio_nome?.trim()).filter(Boolean))];
      const matchedName = uniqueNames.find((n: string) => slugify(n) === slug);

      if (!matchedName) {
        setLoading(false);
        return;
      }

      setCondoName(matchedName);

      // Now fetch ONLY properties for this condominium with needed columns
      const CONDO_COLUMNS = "id,slug,tipo,finalidade,status,destaque,preco,preco_condominio,preco_iptu,area_total,area_util,quartos,banheiros,vagas,andar,bairro,cidade,uf,latitude,longitude,titulo,diferenciais,fotos,video_url,condominio_nome,publicado_em,endereco_completo";
      
      const { data: matched, error } = await supabase
        .from("imoveis")
        .select(CONDO_COLUMNS)
        .eq("status", "disponivel")
        .eq("condominio_nome", matchedName);

      if (error || !matched || matched.length === 0) {
        setLoading(false);
        return;
      }

      setImoveis(matched.map((row: any) => ({
        ...row,
        fotos: Array.isArray(row.fotos) ? row.fotos : [],
        diferenciais: row.diferenciais || [],
        destaque: row.destaque ?? false,
        cidade: row.cidade ?? "Porto Alegre",
        uf: row.uf ?? "RS",
        condominio_nome: row.condominio_nome?.trim() || null,
      })));
      setLoading(false);

      // Fetch AI description
      setDescLoading(true);
      supabase.functions.invoke("generate-condo-description", {
        body: { condominio_nome: matchedName },
      }).then(({ data: descData }) => {
        if (descData?.descricao) setDescricao(descData.descricao);
      }).catch(console.error).finally(() => setDescLoading(false));

      // SEO
      document.title = `${matchedName} — Imóveis à Venda | Uhome Imóveis`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute(
          "content",
          `Veja ${matched.length} unidades disponíveis no ${name}. Fotos, preços e planta baixa do empreendimento em Porto Alegre.`
        );
      }

      // JSON-LD Residence
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Residence",
        name: matchedName,
        description: `Empreendimento ${matchedName} com ${matched.length} unidades à venda.`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Porto Alegre",
          addressRegion: "RS",
          addressCountry: "BR",
        },
      };
      let ldScript = document.getElementById("condo-jsonld");
      if (!ldScript) {
        ldScript = document.createElement("script");
        ldScript.id = "condo-jsonld";
        ldScript.setAttribute("type", "application/ld+json");
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(jsonLd);

      return () => {
        document.getElementById("condo-jsonld")?.remove();
        document.getElementById("condo-faq-jsonld")?.remove();
      };
    })();
  }, [slug]);

  const stats = imoveis.length > 0 ? buildStats(imoveis) : null;

  // Hero images — up to 5 unique photos from the condo's units
  const heroImages = imoveis
    .flatMap((im) => im.fotos.map((f) => f.url))
    .filter(Boolean)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !condoName || !stats ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Building2 className="h-12 w-12 text-muted-foreground/40" />
          <p className="font-body text-sm text-muted-foreground">Condomínio não encontrado.</p>
          <Link to="/condominios" className="font-body text-sm text-primary hover:underline">
            ← Voltar para condomínios
          </Link>
        </div>
      ) : (
        <>
          {/* Hero with photo grid */}
          <section className="relative bg-muted pt-20">
            {heroImages.length > 0 && (
              <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
                {/* Desktop grid */}
                <div className="hidden sm:grid sm:grid-cols-4 sm:grid-rows-2 gap-2 rounded-xl overflow-hidden" style={{ height: 380 }}>
                  <div className="col-span-2 row-span-2 relative">
                    <FotoImovel src={heroImages[0]} alt={condoName} className="h-full w-full object-cover" />
                  </div>
                  {heroImages.slice(1, 5).map((img, i) => (
                    <div key={i} className="relative">
                      <FotoImovel src={img} alt={`${condoName} foto ${i + 2}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>

                {/* Mobile — single hero */}
                <div className="sm:hidden aspect-[16/9] overflow-hidden rounded-xl">
                  <FotoImovel src={heroImages[0]} alt={condoName} className="h-full w-full object-cover" />
                </div>
              </div>
            )}

            <div className="mx-auto max-w-6xl px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-12">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 font-body text-xs text-muted-foreground mb-4">
                <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/condominios" className="hover:text-foreground transition-colors">Condomínios</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">{condoName}</span>
              </nav>

              <h1 className="font-body text-2xl font-extrabold text-foreground leading-tight sm:text-3xl" style={{ textWrap: "balance" as any }}>
                {condoName}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {stats.bairro}, {stats.cidade}
                </span>
                <span>{stats.totalUnidades} {stats.totalUnidades === 1 ? "unidade disponível" : "unidades disponíveis"}</span>
              </div>
            </div>
          </section>

          {/* Stats pills */}
          <section className="border-b border-border">
            <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
              <div className="flex flex-wrap gap-3">
                <StatPill icon={<Home className="h-4 w-4" />} label="Tipos" value={Array.from(stats.tiposSet).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")} />
                {stats.areaMin > 0 && (
                  <StatPill icon={<Maximize2 className="h-4 w-4" />} label="Área" value={rangeLabel(stats.areaMin, stats.areaMax, " m²")} />
                )}
                {stats.quartosSet.size > 0 && (
                  <StatPill icon={<Home className="h-4 w-4" />} label="Quartos" value={setLabel(stats.quartosSet)} />
                )}
                {stats.vagasSet.size > 0 && (
                  <StatPill icon={<Car className="h-4 w-4" />} label="Vagas" value={setLabel(stats.vagasSet)} />
                )}
                {stats.banheirosSet.size > 0 && (
                  <StatPill icon={<Bath className="h-4 w-4" />} label="Banheiros" value={setLabel(stats.banheirosSet)} />
                )}
              </div>

              <p className="mt-4 font-body text-sm text-muted-foreground">
                A partir de <span className="font-bold text-foreground">{formatPreco(stats.precoMin)}</span>
                {stats.precoMin !== stats.precoMax && <> até <span className="font-bold text-foreground">{formatPreco(stats.precoMax)}</span></>}
              </p>
            </div>
          </section>

          {/* AI Description */}
          {(descricao || descLoading) && (
            <section className="border-b border-border">
              <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                <h2 className="font-body text-base font-bold text-foreground mb-3">
                  Sobre o {condoName}
                </h2>
                {descLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
                  </div>
                ) : (
                  <div className="font-body text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {descricao}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Property grid */}
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            <h2 className="font-body text-lg font-extrabold text-foreground sm:text-xl mb-6">
              Unidades disponíveis ({stats.totalUnidades})
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {imoveis.map((im, i) => (
                <motion.div
                  key={im.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.2) }}
                >
                  <SearchPropertyCard imovel={im} index={i} />
                </motion.div>
              ))}
            </div>

            {/* Lead form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="mt-12 mx-auto max-w-lg"
            >
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h3 className="font-body text-base font-bold text-foreground text-center mb-1">
                  Quer saber mais sobre o {condoName}?
                </h3>
                <p className="font-body text-xs text-muted-foreground text-center mb-5">
                  Deixe seus dados e um corretor entrará em contato.
                </p>
                <LeadFormInline
                  isOpen={true}
                  imovelTitulo={condoName}
                  imovelBairro={stats.bairro}
                  onClose={() => {}}
                />
              </div>
            </motion.div>
          </main>

          <Footer />
        </>
      )}
    </div>
  );
};

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-body text-xs text-muted-foreground">{label}:</span>
      <span className="font-body text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default CondominioDetail;
