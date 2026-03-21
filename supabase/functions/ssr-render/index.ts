import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://uhome.com.br";
const LOGO = `${SITE}/uhome-logo.svg`;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/* ── helpers ─────────────────────────────────────────── */

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function parseFotos(raw: unknown): Array<{ url: string; ordem: number; principal: boolean }> {
  if (!raw) return [];
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  if (Array.isArray(raw)) return raw as any;
  return [];
}

function fotoPrincipal(fotos: ReturnType<typeof parseFotos>): string {
  if (!fotos.length) return "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=630&fit=crop";
  const p = fotos.find((f) => f.principal);
  return (p ?? fotos[0]).url;
}

function tituloLimpo(row: any): string {
  const tipo = cap(row.tipo);
  const q = row.quartos ?? 0;
  if (q > 0) return `${tipo} ${q} quarto${q > 1 ? "s" : ""} — ${row.bairro}`;
  const label = row.finalidade === "locacao" ? "para Alugar" : "para Venda";
  return `${tipo} ${label} — ${row.bairro}`;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── bairros static data (mirror from codebase) ────── */

const BAIRROS: Record<string, { nome: string; descricao: string; foto: string; lat: number; lng: number }> = {
  "moinhos-de-vento": { nome: "Moinhos de Vento", descricao: "Moinhos de Vento é o bairro mais nobre de Porto Alegre.", foto: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&h=500&fit=crop", lat: -30.0277, lng: -51.1937 },
  "bela-vista": { nome: "Bela Vista", descricao: "Bela Vista combina infraestrutura moderna com tradição.", foto: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=500&fit=crop", lat: -30.0417, lng: -51.1877 },
  "mont-serrat": { nome: "Mont'Serrat", descricao: "Mont'Serrat é sinônimo de tradição e elegância.", foto: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&h=500&fit=crop", lat: -30.0233, lng: -51.2037 },
  "petropolis": { nome: "Petrópolis", descricao: "Petrópolis encanta por sua atmosfera residencial tranquila.", foto: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=500&fit=crop", lat: -30.0377, lng: -51.1717 },
  "rio-branco": { nome: "Rio Branco", descricao: "Rio Branco é um dos bairros mais tradicionais de Porto Alegre.", foto: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=500&fit=crop", lat: -30.0297, lng: -51.2017 },
  "auxiliadora": { nome: "Auxiliadora", descricao: "Auxiliadora une localização estratégica com qualidade de vida.", foto: "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&h=500&fit=crop", lat: -30.0217, lng: -51.1897 },
  "tres-figueiras": { nome: "Três Figueiras", descricao: "Três Figueiras é o refúgio verde da zona norte de Porto Alegre.", foto: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=500&fit=crop", lat: -30.0157, lng: -51.1677 },
  "boa-vista": { nome: "Boa Vista", descricao: "Boa Vista se destaca pela proximidade com a natureza.", foto: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&h=500&fit=crop", lat: -30.0137, lng: -51.1797 },
  "higienopolis": { nome: "Higienópolis", descricao: "Higienópolis combina charme residencial com praticidade.", foto: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop", lat: -30.0337, lng: -51.1957 },
  "independencia": { nome: "Independência", descricao: "Independência é um dos bairros mais centrais e conectados de Porto Alegre.", foto: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop", lat: -30.0287, lng: -51.2077 },
  "floresta": { nome: "Floresta", descricao: "Floresta é o bairro que mais cresce em Porto Alegre.", foto: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=500&fit=crop", lat: -30.0187, lng: -51.2077 },
  "cidade-baixa": { nome: "Cidade Baixa", descricao: "Cidade Baixa é o coração boêmio de Porto Alegre.", foto: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=500&fit=crop", lat: -30.0417, lng: -51.2177 },
  "menino-deus": { nome: "Menino Deus", descricao: "Menino Deus combina a tranquilidade residencial com a praticidade urbana.", foto: "https://images.unsplash.com/photo-1527576539890-dfa815648363?w=800&h=500&fit=crop", lat: -30.0477, lng: -51.2217 },
  "centro-historico": { nome: "Centro Histórico", descricao: "O Centro Histórico é onde a história de Porto Alegre pulsa.", foto: "https://images.unsplash.com/photo-1551038247-3d9af20df552?w=800&h=500&fit=crop", lat: -30.0317, lng: -51.2297 },
  "jardim-botanico": { nome: "Jardim Botânico", descricao: "Jardim Botânico é o refúgio verde de Porto Alegre.", foto: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=500&fit=crop", lat: -30.0527, lng: -51.1777 },
};

/* ── page renderers ──────────────────────────────────── */

function orgJsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Uhome",
    url: SITE,
    logo: LOGO,
    description: "Imobiliária digital em Porto Alegre. Apartamentos, casas e coberturas à venda com curadoria e tecnologia.",
    address: { "@type": "PostalAddress", addressLocality: "Porto Alegre", addressRegion: "RS", addressCountry: "BR" },
    areaServed: { "@type": "City", name: "Porto Alegre" },
  });
}

function html(title: string, description: string, ogImage: string, canonical: string, jsonLdBlocks: string[], bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(ogImage)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:site_name" content="Uhome" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(ogImage)}" />
  <meta name="robots" content="index, follow" />
  ${jsonLdBlocks.map((j) => `<script type="application/ld+json">${j}</script>`).join("\n  ")}
</head>
<body>
  ${bodyHtml}
  <script>window.location.replace("${esc(canonical)}");</script>
</body>
</html>`;
}

async function renderHome() {
  const title = "Uhome Imóveis | Apartamentos e Casas à Venda em Porto Alegre";
  const desc = "Encontre apartamentos, casas e coberturas à venda em Porto Alegre com curadoria e tecnologia. Uhome — imobiliária digital.";
  return html(title, desc, LOGO, SITE, [orgJsonLd()], `<h1>${esc(title)}</h1><p>${esc(desc)}</p>`);
}

async function renderBairro(slug: string) {
  const bairro = BAIRROS[slug];
  if (!bairro) return null;

  const { count } = await supabase
    .from("imoveis")
    .select("*", { count: "exact", head: true })
    .eq("status", "disponivel")
    .ilike("bairro", `%${bairro.nome}%`);

  const total = count ?? 0;
  const title = `Imóveis à Venda em ${bairro.nome} — Porto Alegre | Uhome`;
  const desc = `${bairro.descricao.slice(0, 140)}. Veja apartamentos, casas e coberturas à venda em ${bairro.nome} com a Uhome.`;
  const canonical = `${SITE}/bairros/${slug}`;

  const breadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Uhome", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Bairros", item: `${SITE}/bairros` },
      { "@type": "ListItem", position: 3, name: bairro.nome, item: canonical },
    ],
  });

  const itemList = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Imóveis à Venda em ${bairro.nome}, Porto Alegre`,
    description: bairro.descricao.slice(0, 300),
    url: canonical,
    numberOfItems: total,
    itemListElement: {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Place",
        name: bairro.nome,
        address: { "@type": "PostalAddress", addressLocality: "Porto Alegre", addressRegion: "RS", addressCountry: "BR", streetAddress: bairro.nome },
        geo: { "@type": "GeoCoordinates", latitude: bairro.lat, longitude: bairro.lng },
      },
    },
  });

  return html(title, desc, bairro.foto, canonical, [breadcrumb, itemList, orgJsonLd()],
    `<h1>Imóveis à Venda em ${esc(bairro.nome)}</h1><p>${esc(desc)}</p><p>${total} imóveis disponíveis</p>`);
}

async function renderImovel(slug: string) {
  const { data: row, error } = await supabase
    .from("imoveis")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !row) return null;

  const fotos = parseFotos(row.fotos);
  const titulo = tituloLimpo(row);
  const preco = formatBRL(row.preco);
  const imgUrl = fotoPrincipal(fotos);
  const canonical = `${SITE}/imovel/${slug}`;
  const title = `${titulo} | Uhome Imóveis`;
  const desc = `${cap(row.tipo)} ${(row.quartos ?? 0) > 0 ? `com ${row.quartos} quartos` : ""} em ${row.bairro}, Porto Alegre. ${preco}.`;

  const breadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Uhome", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Buscar", item: `${SITE}/busca` },
      { "@type": "ListItem", position: 3, name: row.bairro, item: `${SITE}/busca?bairros=${encodeURIComponent(row.bairro)}` },
      { "@type": "ListItem", position: 4, name: titulo, item: canonical },
    ],
  });

  const listing = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: titulo,
    description: (row.descricao ?? desc).slice(0, 300),
    url: canonical,
    datePosted: row.publicado_em,
    image: fotos.length ? fotos.map((f: any) => f.url) : [imgUrl],
    offers: {
      "@type": "Offer",
      price: row.preco,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
    about: {
      "@type": row.tipo === "apartamento" ? "Apartment" : row.tipo === "casa" ? "House" : "Residence",
      name: titulo,
      numberOfRooms: row.quartos ?? undefined,
      numberOfBathroomsTotal: row.banheiros ?? undefined,
      ...(row.area_total && {
        floorSize: { "@type": "QuantitativeValue", value: row.area_total, unitCode: "MTK" },
      }),
      address: {
        "@type": "PostalAddress",
        addressLocality: "Porto Alegre",
        addressRegion: "RS",
        addressCountry: "BR",
        ...(row.bairro && { streetAddress: row.bairro }),
      },
      ...(row.latitude && row.longitude && {
        geo: { "@type": "GeoCoordinates", latitude: row.latitude, longitude: row.longitude },
      }),
    },
  });

  return html(title, desc, imgUrl, canonical, [breadcrumb, listing, orgJsonLd()],
    `<h1>${esc(titulo)}</h1><p>${esc(desc)}</p><img src="${esc(imgUrl)}" alt="${esc(titulo)}" />`);
}

async function renderFaq() {
  const faqs = [
    { q: "Quais documentos preciso para comprar um imóvel em Porto Alegre?", a: "RG, CPF, comprovante de renda, certidões negativas de débitos, comprovante de estado civil e extrato do FGTS (se aplicável)." },
    { q: "Como funciona o financiamento imobiliário?", a: "Você financia até 80% do valor do imóvel em até 35 anos, com parcelas decrescentes (SAC) ou fixas (PRICE)." },
    { q: "Qual o custo total além do preço do imóvel?", a: "ITBI (3% em Porto Alegre), escritura (1-2%), registro (1-2%), e eventualmente corretagem." },
    { q: "Como a Uhome ajuda na busca por imóveis?", a: "A Uhome é uma imobiliária digital com busca inteligente com IA, filtros avançados e atendimento personalizado." },
  ];

  const title = "Perguntas Frequentes sobre Imóveis em Porto Alegre | Uhome";
  const desc = "Tire suas dúvidas sobre compra, financiamento e documentação de imóveis em Porto Alegre.";
  const canonical = `${SITE}/faq`;

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });

  const bodyHtml = faqs.map((f) => `<h2>${esc(f.q)}</h2><p>${esc(f.a)}</p>`).join("");
  return html(title, desc, LOGO, canonical, [faqSchema, orgJsonLd()], `<h1>${esc(title)}</h1>${bodyHtml}`);
}

/* ── main handler ────────────────────────────────────── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") ?? "/";

    let rendered: string | null = null;

    if (path === "/" || path === "") {
      rendered = await renderHome();
    } else if (path === "/faq") {
      rendered = await renderFaq();
    } else if (path.startsWith("/bairros/")) {
      const slug = path.replace("/bairros/", "").replace(/\/$/, "");
      rendered = await renderBairro(slug);
    } else if (path.startsWith("/imovel/")) {
      const slug = path.replace("/imovel/", "").replace(/\/$/, "");
      rendered = await renderImovel(slug);
    }

    if (!rendered) {
      return new Response("Not Found", {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    return new Response(rendered, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("SSR render error:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
