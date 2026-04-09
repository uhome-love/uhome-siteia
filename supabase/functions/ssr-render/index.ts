import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://uhome.com.br";
const LOGO = `${SITE}/uhome-logo.svg`;
const OG_DEFAULT = `${SITE}/og-default.jpg`;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/* ── helpers ─────────────────────────────────────────── */

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Strip HTML tags, Jetimob internal codes, and normalize whitespace */
function stripHtml(text: string): string {
  if (!text) return "";
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, " ")
    // Remove Jetimob codes like [REF:123], #COD-456, etc.
    .replace(/\[?(?:REF|COD|ID|cod|ref|id)[:\s#-]*[\w-]+\]?/gi, "")
    // Remove lone codes that look like property IDs (e.g. "JET-12345", "AP1234")
    .replace(/\b[A-Z]{2,4}[-]?\d{3,8}\b/g, "")
    // Remove HTML entities
    .replace(/&[a-z]+;/gi, " ")
    .replace(/&#\d+;/g, " ")
    // Remove excessive whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate text to maxLen chars at word boundary, add ellipsis */
function truncateDesc(text: string, maxLen = 160): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLen) return clean;
  const truncated = clean.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? truncated.slice(0, lastSpace) : truncated) + "…";
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

function ogImageUrl(rawUrl: string): string {
  if (!rawUrl) return OG_DEFAULT;
  if (rawUrl === OG_DEFAULT) return rawUrl;
  if (rawUrl.endsWith(".svg")) return OG_DEFAULT;
  // Proxy through wsrv.nl to serve optimized JPEG for social crawlers
  // This converts heavy PNGs (1MB+) to ~50-100KB JPEGs at 1200x630
  try {
    const encoded = encodeURIComponent(rawUrl);
    return `https://wsrv.nl/?url=${encoded}&w=1200&h=630&fit=cover&output=jpg&q=80`;
  } catch {
    return rawUrl;
  }
}

function fotoPrincipal(fotos: ReturnType<typeof parseFotos>): string {
  if (!fotos.length) return OG_DEFAULT;
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

function slugify(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function stripCorretorPrefix(path: string): { cleanPath: string; corretorSlug?: string } {
  const m = path.match(/^\/c\/([^/]+)(\/.*)?$/);
  if (m) {
    return { cleanPath: m[2] || "/", corretorSlug: m[1] };
  }
  return { cleanPath: path };
}

const TIPO_MAP: Record<string, { label: string; plural: string; dbTipo: string }> = {
  apartamentos: { label: "Apartamento", plural: "Apartamentos", dbTipo: "apartamento" },
  casas: { label: "Casa", plural: "Casas", dbTipo: "casa" },
  coberturas: { label: "Cobertura", plural: "Coberturas", dbTipo: "cobertura" },
  studios: { label: "Studio", plural: "Studios", dbTipo: "studio" },
  terrenos: { label: "Terreno", plural: "Terrenos", dbTipo: "terreno" },
  comerciais: { label: "Comercial", plural: "Comerciais", dbTipo: "comercial" },
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
    sameAs: ["https://www.instagram.com/uhome.imoveis"],
  });
}

function websiteJsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Uhome Imóveis",
    url: SITE,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE}/busca?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  });
}

function localBusinessJsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Uhome Imóveis",
    image: LOGO,
    "@id": SITE,
    url: SITE,
    telephone: "+5551991898989",
    address: { "@type": "PostalAddress", streetAddress: "Porto Alegre", addressLocality: "Porto Alegre", addressRegion: "RS", postalCode: "90000-000", addressCountry: "BR" },
    geo: { "@type": "GeoCoordinates", latitude: -30.0346, longitude: -51.2177 },
    openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "18:00" },
    priceRange: "$$",
  });
}

function html(title: string, description: string, rawOgImage: string, canonical: string, jsonLdBlocks: string[], bodyHtml: string) {
  const ogImage = ogImageUrl(rawOgImage);
  const isJpeg = ogImage.includes(".jpg") || ogImage.includes(".jpeg") || ogImage.includes("unsplash.com") || ogImage.includes("output=jpg");
  const imgType = isJpeg ? "image/jpeg" : "image/png";
  // Sanitize description for meta tags
  const cleanDesc = truncateDesc(description, 160);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(cleanDesc)}" />
  <link rel="canonical" href="${esc(canonical)}" />
  <link rel="alternate" hreflang="pt-BR" href="${esc(canonical)}" />
  <link rel="alternate" hreflang="x-default" href="${esc(canonical)}" />
  <meta name="geo.region" content="BR-RS" />
  <meta name="geo.placename" content="Porto Alegre" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(cleanDesc)}" />
  <meta property="og:image" content="${esc(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="${imgType}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:site_name" content="Uhome Imóveis" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(cleanDesc)}" />
  <meta name="twitter:image" content="${esc(ogImage)}" />
  <meta name="robots" content="index, follow" />
  ${jsonLdBlocks.map((j) => `<script type="application/ld+json">${j}</script>`).join("\n  ")}
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-5838J9Z');</script>
  <!-- End Google Tag Manager -->
</head>
<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5838J9Z"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
  ${bodyHtml}
  <script>
    // Redirect human visitors to canonical URL (bots don't execute JS)
    if (window.location.hostname !== 'uhome.com.br') {
      window.location.replace('${esc(canonical)}');
    }
  </script>
</body>
</html>`;
}

async function renderHome() {
  const title = "Imóveis à Venda em Porto Alegre | Uhome Imóveis";
  const desc = "Encontre apartamentos, casas e coberturas à venda em Porto Alegre. Busca inteligente com IA, mais de 14.600 imóveis nos melhores bairros. Uhome — imobiliária digital.";

  const homeFaqs = [
    { q: "Quanto custa um apartamento em Porto Alegre?", a: "O preço varia de R$ 250 mil em bairros como Cidade Baixa até R$ 5 milhões+ em Moinhos de Vento e Três Figueiras." },
    { q: "Quais os melhores bairros para morar em Porto Alegre?", a: "Moinhos de Vento (alto padrão), Petrópolis (famílias), Bela Vista (modernidade), Três Figueiras (exclusividade), Menino Deus (vista Guaíba)." },
    { q: "Como funciona a busca por IA da Uhome?", a: "Descreva em linguagem natural o que procura e a IA encontra os resultados mais relevantes automaticamente." },
    { q: "Como financiar um imóvel em Porto Alegre?", a: "Financiamento cobre até 80% do valor com prazos de até 35 anos. Taxas entre 8% e 12% ao ano. Entrada mínima de 20%." },
  ];

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });

  const seoText = `<p>A Uhome é uma imobiliária digital em Porto Alegre especializada na venda de apartamentos, casas, coberturas e studios. Com mais de 14.600 imóveis disponíveis e tecnologia de busca inteligente por IA, ajudamos você a encontrar o imóvel perfeito nos melhores bairros: Moinhos de Vento, Petrópolis, Bela Vista, Três Figueiras, Auxiliadora e Mont'Serrat.</p>`;

  const faqHtml = homeFaqs.map((f) => `<h2>${esc(f.q)}</h2><p>${esc(f.a)}</p>`).join("");

  return html(title, desc, OG_DEFAULT, SITE, [orgJsonLd(), websiteJsonLd(), localBusinessJsonLd(), faqSchema],
    `<h1>Imóveis à Venda em Porto Alegre</h1><p>${esc(desc)}</p>${seoText}${faqHtml}`);
}

/* ── GAP 2 FIX: Dynamic bairros from DB instead of hardcoded ── */

async function renderBairro(slug: string) {
  // First try bairro_descricoes table (has all bairros with content)
  const { data: descRow } = await supabase
    .from("bairro_descricoes")
    .select("bairro_nome, bairro_slug, descricao_seo, descricao_curta, infraestrutura, por_que_investir")
    .eq("bairro_slug", slug)
    .maybeSingle();

  // If no description, try to find by bairro name from imoveis
  let bairroNome: string | null = descRow?.bairro_nome ?? null;

  if (!bairroNome) {
    // Try to find a bairro with properties matching this slug
    const { data: dbBairros } = await supabase.rpc("get_bairros_disponiveis");
    if (dbBairros) {
      const match = (dbBairros as { bairro: string; count: number }[]).find(
        (b) => slugify(b.bairro) === slug && b.count > 0
      );
      if (match) bairroNome = match.bairro;
    }
  }

  if (!bairroNome) return null;

  // Get count and price stats
  const { data: statsData } = await supabase
    .from("imoveis")
    .select("preco")
    .eq("status", "disponivel")
    .eq("finalidade", "venda")
    .ilike("bairro", `%${bairroNome}%`)
    .gt("preco", 50000);

  const total = statsData?.length ?? 0;
  const precos = (statsData || []).map((r: any) => r.preco).filter(Boolean);
  const precoMin = precos.length ? Math.min(...precos) : 0;
  const precoMax = precos.length ? Math.max(...precos) : 0;
  const precoMedio = precos.length ? Math.round(precos.reduce((a: number, b: number) => a + b, 0) / precos.length) : 0;

  const aiDesc = descRow as any;
  const longDesc = aiDesc?.descricao_seo || `${bairroNome} é um dos bairros mais buscados de Porto Alegre para compra de imóveis. Confira apartamentos, casas e coberturas à venda.`;
  const title = `Imóveis à Venda em ${bairroNome} — Porto Alegre | Uhome`;
  const shortDesc = aiDesc?.descricao_curta || `Encontre imóveis à venda em ${bairroNome}, Porto Alegre.`;
  const desc = `${shortDesc.slice(0, 140)}. Veja ${total} apartamentos, casas e coberturas à venda em ${bairroNome} com a Uhome.`;
  const canonical = `${SITE}/bairros/${slug}`;

  const breadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Uhome", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Bairros", item: `${SITE}/bairros` },
      { "@type": "ListItem", position: 3, name: bairroNome, item: canonical },
    ],
  });

  const itemList = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Imóveis à Venda em ${bairroNome}, Porto Alegre`,
    description: longDesc.slice(0, 300),
    url: canonical,
    numberOfItems: total,
    itemListElement: {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Place",
        name: bairroNome,
        address: { "@type": "PostalAddress", addressLocality: "Porto Alegre", addressRegion: "RS", addressCountry: "BR", streetAddress: bairroNome },
      },
    },
  });

  // GAP 6: AggregateOffer schema for bairro pages
  const schemas = [breadcrumb, itemList, orgJsonLd()];
  if (precoMin > 0 && precoMax > 0) {
    schemas.push(JSON.stringify({
      "@context": "https://schema.org",
      "@type": "AggregateOffer",
      name: `Imóveis à Venda em ${bairroNome}`,
      url: canonical,
      lowPrice: precoMin,
      highPrice: precoMax,
      priceCurrency: "BRL",
      offerCount: total,
    }));
  }

  let bodyHtml = `<h1>Imóveis à Venda em ${esc(bairroNome)}</h1>`;
  bodyHtml += `<p>${esc(desc)}</p>`;
  bodyHtml += `<p>${total} imóveis disponíveis em ${esc(bairroNome)}, Porto Alegre.`;
  if (precoMedio > 0) bodyHtml += ` Preço médio: ${formatBRL(precoMedio)}. De ${formatBRL(precoMin)} a ${formatBRL(precoMax)}.`;
  bodyHtml += `</p>`;

  bodyHtml += `<h2>Sobre ${esc(bairroNome)}</h2>`;
  bodyHtml += longDesc.split("\n\n").map((p: string) => `<p>${esc(p)}</p>`).join("");

  if (aiDesc?.infraestrutura) {
    bodyHtml += `<h2>Infraestrutura de ${esc(bairroNome)}</h2>`;
    bodyHtml += aiDesc.infraestrutura.split("\n\n").map((p: string) => `<p>${esc(p)}</p>`).join("");
  }

  if (aiDesc?.por_que_investir) {
    bodyHtml += `<h2>Por que investir em ${esc(bairroNome)}?</h2>`;
    bodyHtml += aiDesc.por_que_investir.split("\n\n").map((p: string) => `<p>${esc(p)}</p>`).join("");
  }

  // GAP 4: Internal linking — tipo cross-links
  bodyHtml += `<h2>Buscar por tipo em ${esc(bairroNome)}</h2><ul>`;
  bodyHtml += `<li><a href="${SITE}/apartamentos-${slug}">Apartamentos em ${esc(bairroNome)}</a></li>`;
  bodyHtml += `<li><a href="${SITE}/casas-${slug}">Casas em ${esc(bairroNome)}</a></li>`;
  bodyHtml += `<li><a href="${SITE}/coberturas-${slug}">Coberturas em ${esc(bairroNome)}</a></li>`;
  bodyHtml += `</ul>`;

  // Link to pillar page
  bodyHtml += `<p><a href="${SITE}/imoveis-porto-alegre">← Ver todos os imóveis em Porto Alegre</a></p>`;

  return html(title, desc, OG_DEFAULT, canonical, schemas, bodyHtml);
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
  const title = `${titulo} | ${preco} | Uhome Imóveis`;
  const descParts = [`${cap(row.tipo)}`];
  if ((row.quartos ?? 0) > 0) descParts.push(`com ${row.quartos} quartos`);
  if (row.area_total) descParts.push(`${row.area_total}m²`);
  descParts.push(`em ${row.bairro}, Porto Alegre`);
  descParts.push(`por ${preco}`);
  const desc = descParts.join(" ") + ". Fotos, planta e detalhes na Uhome.";

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

  // Sanitize description for structured data
  const cleanDescForSchema = truncateDesc(row.descricao ?? desc, 300);

  const listing = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: titulo,
    description: cleanDescForSchema,
    url: canonical,
    datePosted: row.publicado_em,
    image: fotos.length ? fotos.map((f: any) => f.url) : [imgUrl],
    offers: {
      "@type": "Offer",
      price: row.preco,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      itemCondition: row.tipo === "terreno" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
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

  // Product schema for rich results
  const productSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: titulo,
    description: cleanDescForSchema,
    image: fotos.length ? fotos.map((f: any) => f.url) : [imgUrl],
    url: canonical,
    brand: { "@type": "Organization", name: "Uhome Imóveis" },
    offers: {
      "@type": "Offer",
      price: row.preco,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Uhome Imóveis" },
      itemCondition: row.tipo === "terreno" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    },
  });

  const statsHtml = [
    row.quartos && `${row.quartos} quartos`,
    row.banheiros && `${row.banheiros} banheiros`,
    row.area_total && `${row.area_total}m²`,
    row.vagas && `${row.vagas} vagas`,
  ].filter(Boolean).join(" · ");

  // GAP 4: Fetch similar properties for internal linking in SSR
  let similarHtml = "";
  try {
    const minPreco = Math.round(row.preco * 0.6);
    const maxPreco = Math.round(row.preco * 1.5);
    const { data: similar } = await supabase
      .from("imoveis")
      .select("slug, titulo, bairro, preco, quartos, tipo, foto_principal")
      .eq("status", "disponivel")
      .eq("finalidade", "venda")
      .ilike("bairro", `%${row.bairro}%`)
      .gte("preco", minPreco)
      .lte("preco", maxPreco)
      .neq("id", row.id)
      .limit(6);

    if (similar && similar.length > 0) {
      similarHtml = `<h2>Imóveis similares em ${esc(row.bairro)}</h2><ul>`;
      for (const s of similar) {
        const t = tituloLimpo(s);
        similarHtml += `<li><a href="${SITE}/imovel/${esc(s.slug)}">${esc(t)} — ${formatBRL(s.preco)}</a></li>`;
      }
      similarHtml += `</ul>`;
    }
  } catch { /* ignore */ }

  // Internal links to bairro and tipo pages
  const bairroSlug = slugify(row.bairro);
  const crossLinks = `<p><a href="${SITE}/bairros/${bairroSlug}">Ver todos os imóveis em ${esc(row.bairro)}</a> · <a href="${SITE}/imoveis-porto-alegre">Imóveis em Porto Alegre</a></p>`;

  // Sanitize description for body HTML
  const bodyDesc = row.descricao ? truncateDesc(row.descricao, 500) : desc;

  return html(title, desc, imgUrl, canonical, [breadcrumb, listing, productSchema, orgJsonLd()],
    `<h1>${esc(titulo)}</h1><p>${esc(preco)} — ${esc(statsHtml)}</p><p>${esc(bodyDesc)}</p><img src="${esc(imgUrl)}" alt="${esc(titulo)}" width="800" height="600" />${similarHtml}${crossLinks}`);
}

/* ── blog data from DB + static fallback ─────────────── */

const STATIC_BLOG_POSTS: Record<string, { titulo: string; resumo: string; imagem: string; publicadoEm: string; autor: string }> = {
  "melhores-bairros-para-morar-em-porto-alegre-2026": { titulo: "Melhores bairros para morar em Porto Alegre em 2026", resumo: "Ranking completo dos bairros mais desejados de Porto Alegre em 2026.", imagem: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop", publicadoEm: "2026-03-20", autor: "Equipe Uhome" },
  "guia-completo-comprar-apartamento-2026": { titulo: "Guia completo para comprar apartamento em 2026", resumo: "Passo a passo atualizado.", imagem: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop", publicadoEm: "2026-03-15", autor: "Equipe Uhome" },
  "quanto-custa-metro-quadrado-porto-alegre-2026": { titulo: "Preço do metro quadrado em Porto Alegre em 2026", resumo: "Análise por bairro.", imagem: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop", publicadoEm: "2026-03-10", autor: "Equipe Uhome" },
  "apartamento-ou-casa-porto-alegre": { titulo: "Apartamento ou casa em Porto Alegre?", resumo: "Comparativo honesto.", imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=450&fit=crop", publicadoEm: "2026-02-28", autor: "Equipe Uhome" },
  "financiamento-imobiliario-2026-taxas-e-dicas": { titulo: "Financiamento imobiliário em 2026", resumo: "Taxas e dicas.", imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop", publicadoEm: "2026-02-20", autor: "Equipe Uhome" },
  "como-negociar-preco-imovel": { titulo: "Como negociar o preço de um imóvel", resumo: "8 técnicas.", imagem: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop", publicadoEm: "2026-02-10", autor: "Equipe Uhome" },
  "guia-compra-primeiro-imovel-porto-alegre": { titulo: "Guia completo para comprar seu primeiro imóvel em Porto Alegre", resumo: "Tudo que você precisa saber.", imagem: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop", publicadoEm: "2025-03-15", autor: "Equipe Uhome" },
  "melhores-bairros-para-investir-2025": { titulo: "Os 5 bairros de Porto Alegre com maior valorização em 2025", resumo: "Dados do mercado.", imagem: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop", publicadoEm: "2025-02-28", autor: "Equipe Uhome" },
};

async function getAllBlogPosts(): Promise<Record<string, { titulo: string; resumo: string; imagem: string; publicadoEm: string; autor: string }>> {
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, titulo, resumo, imagem, publicado_em, autor")
    .eq("ativo", true)
    .order("publicado_em", { ascending: false })
    .limit(100);

  const combined = { ...STATIC_BLOG_POSTS };
  if (data) {
    for (const p of data as any[]) {
      combined[p.slug] = {
        titulo: p.titulo,
        resumo: p.resumo,
        imagem: p.imagem || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop",
        publicadoEm: p.publicado_em,
        autor: p.autor,
      };
    }
  }
  return combined;
}

async function renderBlog() {
  const allPosts = await getAllBlogPosts();
  const title = "Blog | Mercado Imobiliário em Porto Alegre — Uhome";
  const desc = "Artigos, guias e análises sobre o mercado imobiliário de Porto Alegre. Dicas para comprar, investir e financiar seu imóvel.";
  const canonical = `${SITE}/blog`;

  const blogSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Uhome Blog",
    description: desc,
    url: canonical,
    publisher: { "@type": "Organization", name: "Uhome", url: SITE },
    blogPost: Object.entries(allPosts).map(([slug, p]) => ({
      "@type": "BlogPosting",
      headline: p.titulo,
      description: p.resumo,
      url: `${SITE}/blog/${slug}`,
      datePublished: p.publicadoEm,
      author: { "@type": "Organization", name: p.autor },
      image: p.imagem,
    })),
  });

  const bodyHtml = Object.entries(allPosts).map(([slug, p]) =>
    `<article><h2><a href="${SITE}/blog/${slug}">${esc(p.titulo)}</a></h2><p>${esc(p.resumo)}</p></article>`
  ).join("");

  return html(title, desc, OG_DEFAULT, canonical, [blogSchema, orgJsonLd()], `<h1>${esc(title)}</h1>${bodyHtml}`);
}

async function renderBlogPost(slug: string) {
  const { data: dbPost } = await supabase
    .from("blog_posts")
    .select("titulo, resumo, conteudo, imagem, publicado_em, autor")
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();

  const post = dbPost
    ? { titulo: (dbPost as any).titulo, resumo: (dbPost as any).resumo, imagem: (dbPost as any).imagem, publicadoEm: (dbPost as any).publicado_em, autor: (dbPost as any).autor }
    : STATIC_BLOG_POSTS[slug];

  if (!post) return null;

  const title = `${post.titulo} | Blog Uhome`;
  const canonical = `${SITE}/blog/${slug}`;

  const postSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titulo,
    description: post.resumo,
    image: post.imagem,
    url: canonical,
    datePublished: post.publicadoEm,
    author: { "@type": "Organization", name: post.autor },
    publisher: { "@type": "Organization", name: "Uhome", url: SITE, logo: LOGO },
    mainEntityOfPage: canonical,
  });

  const breadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Uhome", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: post.titulo, item: canonical },
    ],
  });

  const postImg = post.imagem || OG_DEFAULT;
  return html(title, post.resumo, postImg, canonical, [postSchema, breadcrumb, orgJsonLd()],
    `<h1>${esc(post.titulo)}</h1><p>${esc(post.resumo)}</p><img src="${esc(postImg)}" alt="${esc(post.titulo)}" width="800" height="450" />`);
}


async function renderFaq() {
  const faqs = [
    { q: "Quanto custa um apartamento em Porto Alegre?", a: "O preço varia conforme bairro, tamanho e padrão. Em bairros como Moinhos de Vento e Três Figueiras, apartamentos partem de R$ 800 mil. Em regiões como Cidade Baixa, opções a partir de R$ 350 mil." },
    { q: "Quais são os melhores bairros para morar em Porto Alegre?", a: "Moinhos de Vento (alto padrão), Petrópolis (famílias), Bela Vista (condomínios modernos), Três Figueiras (exclusividade), Menino Deus (vista Guaíba), Tristeza (zona sul)." },
    { q: "Como funciona o financiamento imobiliário?", a: "Cobre até 80% do valor do imóvel, prazos até 35 anos, taxas entre 8% e 12% ao ano. Entrada mínima de 20%. Use nosso simulador para calcular." },
    { q: "Posso usar o FGTS para comprar imóvel?", a: "Sim, desde que o imóvel seja residencial, avaliado em até R$ 1,5 milhão pelo SFH, e você tenha 3+ anos de contribuição." },
    { q: "O que é a Uhome e como funciona?", a: "A Uhome é uma imobiliária digital em Porto Alegre com busca por IA, curadoria especializada e mais de 14.600 imóveis. Catálogo atualizado diariamente." },
    { q: "Como funciona a busca por IA da Uhome?", a: "Nossa busca inteligente entende linguagem natural. Descreva o que procura e a IA aplica os filtros automaticamente." },
    { q: "Qual a documentação necessária para comprar um imóvel?", a: "RG, CPF, comprovante de renda, comprovante de residência, certidão de estado civil e IR. O vendedor apresenta matrícula atualizada e certidões negativas." },
  ];

  const title = "Perguntas Frequentes sobre Imóveis em Porto Alegre | Uhome";
  const desc = "Tire suas dúvidas sobre compra de imóveis, financiamento, bairros e mercado imobiliário em Porto Alegre.";
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
  return html(title, desc, OG_DEFAULT, canonical, [faqSchema, orgJsonLd()], `<h1>${esc(title)}</h1>${bodyHtml}`);
}

/* ── SEO landing page renderer ───────────────────────── */

async function renderSeoLanding(path: string) {
  const cleanPath = path.replace(/^\//, "");
  let tipo: string | null = null;
  let tipoConfig: typeof TIPO_MAP[string] | null = null;

  for (const [key, config] of Object.entries(TIPO_MAP)) {
    if (cleanPath.startsWith(key)) {
      tipo = key;
      tipoConfig = config;
      break;
    }
  }

  if (!tipo || !tipoConfig) return null;

  const remainder = cleanPath.slice(tipo.length);

  if (remainder === "-porto-alegre") {
    const { count } = await supabase.from("imoveis").select("*", { count: "exact", head: true })
      .eq("status", "disponivel").eq("tipo", tipoConfig.dbTipo);
    const total = count ?? 0;
    const title = `${tipoConfig.plural} à Venda em Porto Alegre | Uhome Imóveis`;
    const desc = `Encontre ${total}+ ${tipoConfig.plural.toLowerCase()} à venda em Porto Alegre. Busca com IA, fotos e detalhes. Uhome Imóveis.`;
    const canonical = `${SITE}/${cleanPath}`;
    return html(title, desc, OG_DEFAULT, canonical, [orgJsonLd()],
      `<h1>${tipoConfig.plural} à Venda em Porto Alegre</h1><p>${esc(desc)}</p><p>${total} imóveis disponíveis</p><p><a href="${SITE}/imoveis-porto-alegre">Ver todos os imóveis em Porto Alegre</a></p>`);
  }

  const quartosMatch = remainder.match(/^-(\d)-quartos-porto-alegre$/);
  if (quartosMatch) {
    const quartos = parseInt(quartosMatch[1]);
    const { count } = await supabase.from("imoveis").select("*", { count: "exact", head: true })
      .eq("status", "disponivel").eq("tipo", tipoConfig.dbTipo).eq("quartos", quartos);
    const total = count ?? 0;
    const title = `${tipoConfig.plural} ${quartos} Quartos em Porto Alegre | Uhome`;
    const desc = `${total}+ ${tipoConfig.plural.toLowerCase()} com ${quartos} quartos à venda em Porto Alegre. Fotos, preços e detalhes.`;
    const canonical = `${SITE}/${cleanPath}`;
    return html(title, desc, OG_DEFAULT, canonical, [orgJsonLd()],
      `<h1>${tipoConfig.plural} ${quartos} Quartos em Porto Alegre</h1><p>${esc(desc)}</p>`);
  }

  const precoMatch = remainder.match(/^-(ate|acima|de)-(.+)-porto-alegre$/);
  if (precoMatch) {
    const title = `${tipoConfig.plural} ${cap(precoMatch[1])} ${precoMatch[2].replace(/-/g, " ")} em Porto Alegre | Uhome`;
    const desc = `Encontre ${tipoConfig.plural.toLowerCase()} ${precoMatch[1]} ${precoMatch[2].replace(/-/g, " ")} em Porto Alegre. Uhome Imóveis.`;
    const canonical = `${SITE}/${cleanPath}`;
    return html(title, desc, OG_DEFAULT, canonical, [orgJsonLd()],
      `<h1>${esc(title.split("|")[0].trim())}</h1><p>${esc(desc)}</p>`);
  }

  const bairroSlug = remainder.replace(/^-/, "");
  if (bairroSlug) {
    const bairroNome = bairroSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const { count } = await supabase.from("imoveis").select("*", { count: "exact", head: true })
      .eq("status", "disponivel").eq("tipo", tipoConfig.dbTipo).ilike("bairro", `%${bairroNome}%`);
    const total = count ?? 0;
    if (total === 0) return null;
    const title = `${tipoConfig.plural} em ${bairroNome}, Porto Alegre | Uhome`;
    const desc = `${total} ${tipoConfig.plural.toLowerCase()} à venda em ${bairroNome}. Preços, fotos e detalhes na Uhome Imóveis.`;
    const canonical = `${SITE}/${cleanPath}`;
    return html(title, desc, OG_DEFAULT, canonical, [orgJsonLd()],
      `<h1>${tipoConfig.plural} em ${esc(bairroNome)}</h1><p>${esc(desc)}</p><p>${total} imóveis disponíveis</p><p><a href="${SITE}/bairros/${bairroSlug}">Ver ${esc(bairroNome)}</a> · <a href="${SITE}/imoveis-porto-alegre">Todos os imóveis</a></p>`);
  }

  return null;
}

/* ── condominios renderer ────────────────────────────── */

async function renderCondominio(slug: string) {
  const { data: rows } = await supabase
    .from("imoveis")
    .select("condominio_nome, bairro, preco, foto_principal, quartos, area_total")
    .eq("status", "disponivel")
    .not("condominio_nome", "is", null)
    .limit(1000);

  if (!rows) return null;

  const condoMap = new Map<string, { nome: string; bairro: string; count: number; minPreco: number; maxPreco: number; foto: string }>();
  for (const row of rows) {
    const nome = row.condominio_nome?.trim();
    if (!nome) continue;
    const s = slugify(nome);
    if (!condoMap.has(s)) {
      condoMap.set(s, { nome, bairro: row.bairro, count: 0, minPreco: row.preco, maxPreco: row.preco, foto: row.foto_principal || "" });
    }
    const c = condoMap.get(s)!;
    c.count++;
    if (row.preco < c.minPreco) c.minPreco = row.preco;
    if (row.preco > c.maxPreco) c.maxPreco = row.preco;
    if (!c.foto && row.foto_principal) c.foto = row.foto_principal;
  }

  const condo = condoMap.get(slug);
  if (!condo || condo.count < 1) return null;

  const title = `${condo.nome} — ${condo.bairro} | Uhome Imóveis`;
  const desc = `${condo.count} imóveis disponíveis no ${condo.nome}, ${condo.bairro}. A partir de ${formatBRL(condo.minPreco)}. Veja fotos e detalhes.`;
  const canonical = `${SITE}/condominios/${slug}`;

  return html(title, desc, condo.foto || OG_DEFAULT, canonical, [orgJsonLd()],
    `<h1>${esc(condo.nome)}</h1><p>${esc(condo.bairro)} · ${condo.count} imóveis</p><p>${esc(desc)}</p>`);
}

/* ── empreendimentos renderer ────────────────────────── */

async function renderEmpreendimento(slug: string) {
  const { data: emp } = await supabase
    .from("empreendimentos")
    .select("*")
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();

  if (!emp) return null;

  const title = emp.meta_title || `${emp.nome} — ${emp.bairro || "Porto Alegre"} | Uhome`;
  const desc = emp.meta_description || `${emp.nome} em ${emp.bairro || "Porto Alegre"}. ${emp.preco_a_partir ? `A partir de ${formatBRL(emp.preco_a_partir)}.` : ""} Detalhes, tipologias e condições.`;
  const canonical = `${SITE}/empreendimentos/${slug}`;

  return html(title, desc, emp.imagem_principal || OG_DEFAULT, canonical, [orgJsonLd()],
    `<h1>${esc(emp.nome)}</h1><p>${esc(desc)}</p>${emp.imagem_principal ? `<img src="${esc(emp.imagem_principal)}" alt="${esc(emp.nome)}" width="800" height="600" />` : ""}`);
}

/* ── bairros list page ───────────────────────────────── */

async function renderBairros() {
  const title = "Bairros de Porto Alegre — Imóveis à Venda | Uhome";
  const desc = "Explore os principais bairros de Porto Alegre para comprar seu imóvel. Compare preços, infraestrutura e qualidade de vida.";
  const canonical = `${SITE}/bairros`;

  // Dynamic: fetch all bairros with properties
  const { data: dbBairros } = await supabase.rpc("get_bairros_disponiveis");
  const bairroLinks = (dbBairros as { bairro: string; count: number }[] || [])
    .filter((b) => b.count >= 3)
    .sort((a, b) => b.count - a.count)
    .map((b) => {
      const s = slugify(b.bairro);
      return `<li><a href="${SITE}/bairros/${s}">${esc(b.bairro)}</a> — ${b.count} imóveis à venda</li>`;
    })
    .join("");

  return html(title, desc, OG_DEFAULT, canonical, [orgJsonLd()],
    `<h1>Bairros de Porto Alegre</h1><p>${esc(desc)}</p><ul>${bairroLinks}</ul><p><a href="${SITE}/imoveis-porto-alegre">Ver todos os imóveis em Porto Alegre</a></p>`);
}

/* ── condominios list page ───────────────────────────── */

async function renderCondominios() {
  const title = "Condomínios em Porto Alegre — Imóveis à Venda | Uhome";
  const desc = "Encontre os melhores condomínios de Porto Alegre com imóveis à venda. Compare opções por bairro, preço e infraestrutura.";
  const canonical = `${SITE}/condominios`;

  return html(title, desc, OG_DEFAULT, canonical, [orgJsonLd()],
    `<h1>Condomínios em Porto Alegre</h1><p>${esc(desc)}</p>`);
}

/* ── vitrine renderer ────────────────────────────────── */

async function renderVitrine(vitrineId: string, corretorSlug?: string) {
  const { data: v } = await supabase
    .from("vitrines")
    .select("id, lead_nome, titulo, mensagem, imovel_codigos, corretor_slug")
    .eq("id", vitrineId)
    .maybeSingle();

  if (!v) return null;

  const slug = corretorSlug || v.corretor_slug;
  const prefix = slug ? `/c/${slug}` : "";

  let ogImage = OG_DEFAULT;
  let bodyCards = "";

  if (v.imovel_codigos?.length) {
    const { data: props } = await supabase
      .from("imoveis")
      .select("titulo, bairro, preco, foto_principal, slug, quartos")
      .in("jetimob_id", v.imovel_codigos)
      .eq("status", "disponivel");

    if (props?.length) {
      ogImage = props[0].foto_principal || OG_DEFAULT;
      bodyCards = props.map((p: any) => `
        <div><a href="${SITE}${prefix}/imovel/${esc(p.slug)}">
          <img src="${esc(p.foto_principal || "")}" alt="${esc(p.titulo)}" width="400" height="300" />
          <h3>${esc(p.titulo)}</h3>
          <p>${esc(p.bairro)} · ${p.quartos || 0} dorms · ${formatBRL(p.preco)}</p>
        </a></div>`).join("");
    }
  }

  const title = v.titulo || (v.lead_nome ? `Vitrine personalizada para ${v.lead_nome}` : "Vitrine personalizada | Uhome");
  const desc = `${v.imovel_codigos?.length || 0} imóveis selecionados especialmente para você. Confira preços, fotos e detalhes.`;
  const canonical = `${SITE}${prefix}/vitrine/${v.id}`;

  return html(title, desc, ogImage, canonical, [orgJsonLd()], `<h1>${esc(title)}</h1>${bodyCards}`);
}

/* ── intent pages renderer ────────────────────────── */

const INTENT_PAGES: Record<string, { title: string; desc: string }> = {
  "apartamentos-a-venda-porto-alegre": { title: "Apartamentos à Venda em Porto Alegre", desc: "Encontre apartamentos à venda nos melhores bairros de Porto Alegre. Preços, fotos e detalhes na Uhome." },
  "casas-a-venda-porto-alegre": { title: "Casas à Venda em Porto Alegre", desc: "Encontre casas à venda em Porto Alegre com jardim, piscina e garagem. Uhome Imóveis." },
  "coberturas-a-venda-porto-alegre": { title: "Coberturas à Venda em Porto Alegre", desc: "Coberturas duplex e triplex à venda em Porto Alegre. Terraço, churrasqueira e vista privilegiada." },
  "terrenos-a-venda-porto-alegre": { title: "Terrenos à Venda em Porto Alegre", desc: "Terrenos à venda em Porto Alegre para construção residencial e comercial." },
  "imoveis-de-luxo-porto-alegre": { title: "Imóveis de Luxo à Venda em Porto Alegre", desc: "Os melhores imóveis de alto padrão em Porto Alegre. Moinhos de Vento, Três Figueiras e mais." },
  "investimento-imobiliario-porto-alegre": { title: "Investimento Imobiliário em Porto Alegre", desc: "Os melhores imóveis para investir em Porto Alegre. Rentabilidade, valorização e oportunidades." },
  "lancamentos-porto-alegre": { title: "Lançamentos Imobiliários em Porto Alegre", desc: "Novos empreendimentos e lançamentos em Porto Alegre. Conheça as novidades do mercado." },
};

function renderIntentPage(slug: string) {
  const page = INTENT_PAGES[slug];
  if (!page) return null;
  const title = `${page.title} | Uhome Imóveis`;
  const canonical = `${SITE}/${slug}`;
  return html(title, page.desc, OG_DEFAULT, canonical, [orgJsonLd()],
    `<h1>${esc(page.title)}</h1><p>${esc(page.desc)}</p><p><a href="${SITE}/imoveis-porto-alegre">Ver todos os imóveis em Porto Alegre</a></p>`);
}

/* ── static pages ─────────────────────────────────────── */

function renderAnunciar() {
  const title = "Anuncie seu Imóvel em Porto Alegre | Uhome";
  const desc = "Anuncie seu imóvel em Porto Alegre com a Uhome. Alcance milhares de compradores qualificados com tecnologia e curadoria especializada.";
  return html(title, desc, OG_DEFAULT, `${SITE}/anunciar`, [orgJsonLd()],
    `<h1>Anuncie seu Imóvel</h1><p>${esc(desc)}</p>`);
}

function renderAvaliarImovel() {
  const title = "Avaliação Gratuita de Imóvel em Porto Alegre | Uhome";
  const desc = "Descubra quanto vale seu imóvel em Porto Alegre. Avaliação gratuita baseada em dados reais do mercado.";
  return html(title, desc, OG_DEFAULT, `${SITE}/avaliar-imovel`, [orgJsonLd()],
    `<h1>Avaliação de Imóvel</h1><p>${esc(desc)}</p>`);
}

function renderCarreiras() {
  const title = "Carreiras na Uhome | Trabalhe Conosco";
  const desc = "Faça parte da Uhome, a imobiliária digital de Porto Alegre. Vagas para corretores, desenvolvedores e marketing.";
  return html(title, desc, OG_DEFAULT, `${SITE}/carreiras`, [orgJsonLd()],
    `<h1>Carreiras na Uhome</h1><p>${esc(desc)}</p>`);
}

function renderPrivacidade() {
  const title = "Política de Privacidade | Uhome Imóveis";
  const desc = "Política de privacidade da Uhome. Saiba como tratamos seus dados pessoais.";
  return html(title, desc, OG_DEFAULT, `${SITE}/politica-de-privacidade`, [orgJsonLd()],
    `<h1>Política de Privacidade</h1><p>${esc(desc)}</p>`);
}

function renderBusca() {
  const title = "Buscar Imóveis em Porto Alegre | Uhome";
  const desc = "Busque imóveis à venda em Porto Alegre com filtros de bairro, preço, tipo e quartos. Mais de 14.600 opções com busca inteligente por IA.";
  return html(title, desc, OG_DEFAULT, `${SITE}/busca`, [orgJsonLd()],
    `<h1>Buscar Imóveis em Porto Alegre</h1><p>${esc(desc)}</p>`);
}

function renderFavoritos() {
  const title = "Meus Favoritos | Uhome Imóveis";
  const desc = "Seus imóveis favoritos salvos na Uhome.";
  return html(title, desc, OG_DEFAULT, `${SITE}/favoritos`, [orgJsonLd()],
    `<h1>Meus Favoritos</h1><p>${esc(desc)}</p>`);
}

function renderSobre() {
  const title = "Sobre a Uhome | Imobiliária Digital em Porto Alegre";
  const desc = "Conheça a Uhome, imobiliária digital de Porto Alegre. Equipe especializada, CRECI-RS 25682J, tecnologia de busca com IA e curadoria de imóveis nos melhores bairros.";
  return html(title, desc, OG_DEFAULT, `${SITE}/sobre`, [orgJsonLd()],
    `<h1>Sobre a Uhome — Imobiliária Digital de Porto Alegre</h1>
     <p>${esc(desc)}</p>
     <h2>Nossa história</h2>
     <p>A Uhome nasceu com a missão de transformar a experiência de comprar imóvel em Porto Alegre. Combinamos tecnologia de busca com inteligência artificial, curadoria especializada e atendimento humanizado.</p>
     <h2>Dados da empresa</h2>
     <ul><li>Razão social: Uhome Imóveis LTDA</li><li>CRECI: RS 25682J</li><li>Localização: Porto Alegre, RS</li></ul>
     <h2>Nossos valores</h2>
     <ul><li>Inovação — Busca inteligente com IA</li><li>Transparência — Preços reais e fotos verificadas</li><li>Curadoria — Qualidade acima de quantidade</li><li>Excelência — Corretores certificados CRECI</li></ul>`);
}

function renderGuiaBairros() {
  const title = "Guia de Bairros de Porto Alegre | Comparativo de Preços | Uhome";
  const desc = "Compare todos os bairros de Porto Alegre: preço médio, quantidade de imóveis, perfil de moradia e infraestrutura. Guia completo para escolher onde morar.";
  return html(title, desc, OG_DEFAULT, `${SITE}/guia-bairros`, [orgJsonLd()],
    `<h1>Guia de Bairros de Porto Alegre</h1>
     <p>${esc(desc)}</p>
     <h2>Como escolher o melhor bairro</h2>
     <p>Porto Alegre conta com mais de 80 bairros, cada um com perfil, infraestrutura e faixa de preço distintos. Use nosso comparativo para analisar preço médio e quantidade de imóveis por bairro.</p>`);
}

async function renderEmpreendimentos() {
  const title = "Empreendimentos em Porto Alegre | Uhome";
  const desc = "Lançamentos e empreendimentos imobiliários em Porto Alegre. Conheça os melhores projetos com a Uhome.";
  const canonical = `${SITE}/empreendimentos`;

  const { data: emps } = await supabase
    .from("empreendimentos")
    .select("nome, slug, bairro, preco_a_partir")
    .eq("ativo", true)
    .order("ordem", { ascending: true })
    .limit(50);

  const empHtml = emps?.map((e: any) =>
    `<li><a href="${SITE}/empreendimentos/${esc(e.slug)}">${esc(e.nome)}</a> — ${esc(e.bairro || "Porto Alegre")}${e.preco_a_partir ? ` a partir de ${formatBRL(e.preco_a_partir)}` : ""}</li>`
  ).join("") || "";

  return html(title, desc, OG_DEFAULT, canonical, [orgJsonLd()],
    `<h1>Empreendimentos em Porto Alegre</h1><p>${esc(desc)}</p><ul>${empHtml}</ul>`);
}

/* ── GAP 7: Pillar page /imoveis-porto-alegre ────────── */

async function renderPillarPage() {
  const title = "Imóveis à Venda em Porto Alegre — Apartamentos, Casas e Coberturas | Uhome";
  const desc = "O maior acervo de imóveis à venda em Porto Alegre. Apartamentos, casas, coberturas e studios nos melhores bairros. Busca com IA, preços reais e fotos verificadas. Uhome Imóveis.";
  const canonical = `${SITE}/imoveis-porto-alegre`;

  // Fetch stats
  const [totalResult, bairrosResult, tipoData] = await Promise.all([
    supabase.from("imoveis").select("*", { count: "exact", head: true }).eq("status", "disponivel").eq("finalidade", "venda"),
    supabase.rpc("get_bairros_disponiveis"),
    supabase.from("imoveis").select("tipo, preco").eq("status", "disponivel").eq("finalidade", "venda").gt("preco", 50000),
  ]);

  const totalImoveis = totalResult.count ?? 0;
  const bairros = (bairrosResult.data as { bairro: string; count: number }[] || [])
    .filter((b) => b.count >= 3)
    .sort((a, b) => b.count - a.count);

  // Tipo stats
  const tipoStats: Record<string, { count: number; total: number }> = {};
  for (const row of (tipoData.data || []) as any[]) {
    if (!tipoStats[row.tipo]) tipoStats[row.tipo] = { count: 0, total: 0 };
    tipoStats[row.tipo].count++;
    tipoStats[row.tipo].total += row.preco;
  }

  const allPrecos = ((tipoData.data || []) as any[]).map((r: any) => r.preco);
  const precoMedio = allPrecos.length ? Math.round(allPrecos.reduce((a: number, b: number) => a + b, 0) / allPrecos.length) : 0;
  const precoMin = allPrecos.length ? Math.min(...allPrecos) : 0;
  const precoMax = allPrecos.length ? Math.max(...allPrecos) : 0;

  // AggregateOffer schema
  const aggregateOffer = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "AggregateOffer",
    name: "Imóveis à Venda em Porto Alegre",
    url: canonical,
    lowPrice: precoMin,
    highPrice: precoMax,
    priceCurrency: "BRL",
    offerCount: totalImoveis,
  });

  const breadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Uhome", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Imóveis em Porto Alegre", item: canonical },
    ],
  });

  const faqs = [
    { q: "Quantos imóveis estão à venda em Porto Alegre?", a: `Atualmente temos ${totalImoveis.toLocaleString("pt-BR")} imóveis à venda em Porto Alegre, atualizados diariamente.` },
    { q: "Qual o preço médio dos imóveis em Porto Alegre?", a: `O preço médio dos imóveis à venda em Porto Alegre é de ${formatBRL(precoMedio)}, variando de ${formatBRL(precoMin)} a ${formatBRL(precoMax)}.` },
    { q: "Quais os bairros com mais imóveis à venda?", a: `Os bairros com mais opções são: ${bairros.slice(0, 5).map((b) => `${b.bairro} (${b.count})`).join(", ")}.` },
    { q: "Como funciona a busca com IA da Uhome?", a: "Nossa busca inteligente entende linguagem natural. Basta descrever o que procura — tipo, bairro, preço, características — e a IA encontra os melhores resultados." },
    { q: "Posso financiar um imóvel encontrado na Uhome?", a: "Sim! Nossos corretores auxiliam em todo o processo de financiamento, incluindo simulação, documentação e aprovação bancária." },
  ];

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });

  // Build body
  let body = `<h1>Imóveis à Venda em Porto Alegre</h1>`;
  body += `<p>${esc(desc)}</p>`;

  // Stats
  body += `<h2>Mercado Imobiliário de Porto Alegre em Números</h2>`;
  body += `<ul>`;
  body += `<li><strong>${totalImoveis.toLocaleString("pt-BR")}</strong> imóveis à venda</li>`;
  body += `<li>Preço médio: <strong>${formatBRL(precoMedio)}</strong></li>`;
  body += `<li><strong>${bairros.length}</strong> bairros com imóveis disponíveis</li>`;
  body += `</ul>`;

  // Tipos
  body += `<h2>Buscar por Tipo de Imóvel</h2><ul>`;
  for (const [key, config] of Object.entries(TIPO_MAP)) {
    const stats = tipoStats[config.dbTipo];
    const count = stats?.count || 0;
    if (count > 0) {
      body += `<li><a href="${SITE}/${key}-porto-alegre">${config.plural} em Porto Alegre</a> — ${count} disponíveis</li>`;
    }
  }
  body += `</ul>`;

  // Top bairros
  body += `<h2>Bairros Mais Buscados de Porto Alegre</h2>`;
  body += `<p>Porto Alegre possui mais de 80 bairros, cada um com características únicas de infraestrutura, lazer e qualidade de vida. Abaixo, os bairros com mais imóveis disponíveis:</p>`;
  body += `<ul>`;
  for (const b of bairros.slice(0, 30)) {
    const s = slugify(b.bairro);
    body += `<li><a href="${SITE}/bairros/${s}">${esc(b.bairro)}</a> — ${b.count} imóveis</li>`;
  }
  body += `</ul>`;
  body += `<p><a href="${SITE}/bairros">Ver todos os bairros</a> · <a href="${SITE}/guia-bairros">Guia comparativo de bairros</a></p>`;

  // Faixas de preço
  body += `<h2>Buscar por Faixa de Preço</h2><ul>`;
  const faixas = [
    { label: "Até R$ 300 mil", path: "apartamentos-ate-300-mil-porto-alegre" },
    { label: "Até R$ 500 mil", path: "apartamentos-ate-500-mil-porto-alegre" },
    { label: "Até R$ 1 milhão", path: "apartamentos-ate-1-milhao-porto-alegre" },
    { label: "De R$ 1 a 2 milhões", path: "apartamentos-de-1-a-2-milhoes-porto-alegre" },
    { label: "Acima de R$ 2 milhões", path: "apartamentos-acima-2-milhoes-porto-alegre" },
  ];
  for (const f of faixas) {
    body += `<li><a href="${SITE}/${f.path}">${f.label}</a></li>`;
  }
  body += `</ul>`;

  // Quartos
  body += `<h2>Buscar por Número de Quartos</h2><ul>`;
  for (const q of [1, 2, 3, 4]) {
    body += `<li><a href="${SITE}/apartamentos-${q}-quartos-porto-alegre">Apartamentos ${q} quarto${q > 1 ? "s" : ""} em Porto Alegre</a></li>`;
  }
  body += `</ul>`;

  // Content about Porto Alegre real estate
  body += `<h2>Sobre o Mercado Imobiliário de Porto Alegre</h2>`;
  body += `<p>Porto Alegre é a capital do Rio Grande do Sul e um dos principais mercados imobiliários do sul do Brasil. A cidade oferece uma diversidade de bairros para todos os perfis: desde o alto padrão de Moinhos de Vento e Três Figueiras até opções mais acessíveis em bairros como Cidade Baixa, Santana e Partenon.</p>`;
  body += `<p>O mercado imobiliário porto-alegrense tem se destacado pela valorização constante dos bairros nobres, pela modernização de regiões como o 4º Distrito (bairros Floresta e São Geraldo), e pela crescente oferta de studios e apartamentos compactos voltados para investidores e jovens profissionais.</p>`;
  body += `<h3>Principais Tendências do Mercado</h3>`;
  body += `<ul>`;
  body += `<li><strong>Bairros em valorização:</strong> Floresta, Petrópolis, Bela Vista e Jardim Botânico apresentam crescimento acima da média</li>`;
  body += `<li><strong>Imóveis compactos:</strong> Studios e apartamentos de 1 dormitório são a categoria que mais cresce, impulsionados por investidores</li>`;
  body += `<li><strong>Sustentabilidade:</strong> Novos empreendimentos investem em certificações ambientais e eficiência energética</li>`;
  body += `<li><strong>Tecnologia:</strong> Busca com inteligência artificial e visitas virtuais são diferenciais das imobiliárias digitais</li>`;
  body += `</ul>`;
  body += `<h3>Como Escolher o Imóvel Ideal</h3>`;
  body += `<p>Para encontrar o imóvel perfeito em Porto Alegre, considere: localização (proximidade do trabalho, escolas e serviços), infraestrutura do bairro, perfil do condomínio, potencial de valorização e condições de financiamento. Na Uhome, nossa busca com IA ajuda você a filtrar entre milhares de opções com linguagem natural.</p>`;

  // FAQ
  body += `<h2>Perguntas Frequentes</h2>`;
  for (const f of faqs) {
    body += `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`;
  }

  // Empreendimentos link
  body += `<p><a href="${SITE}/empreendimentos">Ver empreendimentos e lançamentos</a> · <a href="${SITE}/blog">Ler artigos sobre o mercado</a></p>`;

  return html(title, desc, OG_DEFAULT, canonical, [aggregateOffer, breadcrumb, faqSchema, orgJsonLd(), websiteJsonLd()], body);
}

/* ── main handler ────────────────────────────────────── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const rawPath = url.searchParams.get("path") ?? "/";
    const { cleanPath: path, corretorSlug } = stripCorretorPrefix(rawPath);

    let rendered: string | null = null;

    if (path === "/" || path === "") {
      rendered = await renderHome();
    } else if (path === "/imoveis-porto-alegre") {
      rendered = await renderPillarPage();
    } else if (path === "/faq") {
      rendered = await renderFaq();
    } else if (path === "/bairros") {
      rendered = await renderBairros();
    } else if (path === "/condominios") {
      rendered = await renderCondominios();
    } else if (path === "/empreendimentos") {
      rendered = await renderEmpreendimentos();
    } else if (path === "/blog") {
      rendered = await renderBlog();
    } else if (path === "/busca") {
      rendered = renderBusca();
    } else if (path === "/anunciar") {
      rendered = renderAnunciar();
    } else if (path === "/avaliar-imovel") {
      rendered = renderAvaliarImovel();
    } else if (path === "/carreiras") {
      rendered = renderCarreiras();
    } else if (path === "/politica-de-privacidade") {
      rendered = renderPrivacidade();
    } else if (path === "/favoritos") {
      rendered = renderFavoritos();
    } else if (path === "/sobre") {
      rendered = renderSobre();
    } else if (path === "/guia-bairros") {
      rendered = renderGuiaBairros();
    } else if (path.startsWith("/blog/")) {
      const slug = path.replace("/blog/", "").replace(/\/$/, "");
      rendered = await renderBlogPost(slug);
    } else if (path.startsWith("/bairros/")) {
      const slug = path.replace("/bairros/", "").replace(/\/$/, "");
      rendered = await renderBairro(slug);
    } else if (path.startsWith("/imovel/")) {
      const slug = path.replace("/imovel/", "").replace(/\/$/, "");
      rendered = await renderImovel(slug);
    } else if (path.startsWith("/condominios/")) {
      const slug = path.replace("/condominios/", "").replace(/\/$/, "");
      rendered = await renderCondominio(slug);
    } else if (path.startsWith("/empreendimentos/")) {
      const slug = path.replace("/empreendimentos/", "").replace(/\/$/, "");
      rendered = await renderEmpreendimento(slug);
    } else if (path.match(/\/vitrine\/[a-f0-9-]+/)) {
      const parts = path.split("/").filter(Boolean);
      if (parts[0] === "vitrine") {
        rendered = await renderVitrine(parts[1], corretorSlug);
      }
    } else {
      // Try intent pages
      const cleanSlug = path.replace(/^\//, "").replace(/\/$/, "");
      rendered = renderIntentPage(cleanSlug);

      // Try SEO landing pages (tipo + bairro/quartos/preço)
      if (!rendered) {
        rendered = await renderSeoLanding(path);
      }
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
