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

function slugify(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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

/* ── SEO tipo mapping ──────────────────────────────── */

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

function html(title: string, description: string, ogImage: string, canonical: string, jsonLdBlocks: string[], bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta name="geo.region" content="BR-RS" />
  <meta name="geo.placename" content="Porto Alegre" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(ogImage)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:site_name" content="Uhome Imóveis" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
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
  
</body>
</html>`;
}

async function renderHome() {
  const title = "Uhome Imóveis | Apartamentos e Casas à Venda em Porto Alegre";
  const desc = "Encontre apartamentos, casas e coberturas à venda em Porto Alegre com curadoria e tecnologia. Uhome — imobiliária digital com mais de 14.600 imóveis.";

  const seoText = `<p>A Uhome é uma imobiliária digital em Porto Alegre especializada na venda de apartamentos, casas, coberturas e studios. Com mais de 14.600 imóveis disponíveis e tecnologia de busca inteligente por IA, ajudamos você a encontrar o imóvel perfeito nos melhores bairros: Moinhos de Vento, Petrópolis, Bela Vista, Três Figueiras, Auxiliadora e Mont'Serrat.</p>`;

  return html(title, desc, LOGO, SITE, [orgJsonLd(), websiteJsonLd(), localBusinessJsonLd()],
    `<h1>${esc(title)}</h1><p>${esc(desc)}</p>${seoText}`);
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
  const desc = `${bairro.descricao.slice(0, 140)}. Veja ${total} apartamentos, casas e coberturas à venda em ${bairro.nome} com a Uhome.`;
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

  const statsHtml = [
    row.quartos && `${row.quartos} quartos`,
    row.banheiros && `${row.banheiros} banheiros`,
    row.area_total && `${row.area_total}m²`,
    row.vagas && `${row.vagas} vagas`,
  ].filter(Boolean).join(" · ");

  return html(title, desc, imgUrl, canonical, [breadcrumb, listing, orgJsonLd()],
    `<h1>${esc(titulo)}</h1><p>${esc(preco)} — ${esc(statsHtml)}</p><p>${esc(desc)}</p><img src="${esc(imgUrl)}" alt="${esc(titulo)}" width="800" height="600" />`);
}

/* ── blog data (mirror from codebase) ───────────────── */

const BLOG_POSTS: Record<string, { titulo: string; resumo: string; imagem: string; publicadoEm: string; autor: string }> = {
  "guia-compra-primeiro-imovel-porto-alegre": { titulo: "Guia completo para comprar seu primeiro imóvel em Porto Alegre", resumo: "Tudo que você precisa saber antes de dar o primeiro passo: documentação, financiamento, bairros e dicas práticas.", imagem: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop", publicadoEm: "2025-03-15", autor: "Equipe Uhome" },
  "melhores-bairros-para-investir-2025": { titulo: "Os 5 bairros de Porto Alegre com maior valorização em 2025", resumo: "Dados do mercado mostram quais regiões estão se valorizando mais rápido e por quê.", imagem: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop", publicadoEm: "2025-02-28", autor: "Equipe Uhome" },
  "financiamento-imobiliario-tudo-que-voce-precisa-saber": { titulo: "Financiamento imobiliário: taxas, prazos e como se preparar", resumo: "Entenda como funciona o financiamento bancário, quais as melhores taxas do mercado.", imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop", publicadoEm: "2025-02-10", autor: "Equipe Uhome" },
  "checklist-vistoria-imovel-usado": { titulo: "Checklist: 15 itens para verificar na vistoria de um imóvel usado", resumo: "Não feche negócio sem conferir esses pontos. Um guia prático para identificar problemas ocultos.", imagem: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=450&fit=crop", publicadoEm: "2025-01-22", autor: "Equipe Uhome" },
  "morar-em-porto-alegre-vale-a-pena": { titulo: "Morar em Porto Alegre em 2025: custo de vida, qualidade e o que esperar", resumo: "Uma análise honesta sobre o custo de vida, mobilidade, segurança e qualidade dos bairros.", imagem: "https://images.unsplash.com/photo-1598971861713-54ad09c93b3e?w=800&h=450&fit=crop", publicadoEm: "2025-01-08", autor: "Equipe Uhome" },
  "documentos-necessarios-compra-imovel": { titulo: "Lista completa de documentos para comprar um imóvel em 2025", resumo: "Do comprador ao vendedor, do imóvel ao cartório: todos os documentos organizados por etapa.", imagem: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop", publicadoEm: "2024-12-18", autor: "Equipe Uhome" },
};

async function renderBlog() {
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
    blogPost: Object.entries(BLOG_POSTS).map(([slug, p]) => ({
      "@type": "BlogPosting",
      headline: p.titulo,
      description: p.resumo,
      url: `${SITE}/blog/${slug}`,
      datePublished: p.publicadoEm,
      author: { "@type": "Organization", name: p.autor },
      image: p.imagem,
    })),
  });

  const bodyHtml = Object.entries(BLOG_POSTS).map(([slug, p]) =>
    `<article><h2><a href="${SITE}/blog/${slug}">${esc(p.titulo)}</a></h2><p>${esc(p.resumo)}</p></article>`
  ).join("");

  return html(title, desc, LOGO, canonical, [blogSchema, orgJsonLd()], `<h1>${esc(title)}</h1>${bodyHtml}`);
}

function renderBlogPost(slug: string) {
  const post = BLOG_POSTS[slug];
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

  return html(title, post.resumo, post.imagem, canonical, [postSchema, breadcrumb, orgJsonLd()],
    `<h1>${esc(post.titulo)}</h1><p>${esc(post.resumo)}</p><img src="${esc(post.imagem)}" alt="${esc(post.titulo)}" width="800" height="450" />`);
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
  return html(title, desc, LOGO, canonical, [faqSchema, orgJsonLd()], `<h1>${esc(title)}</h1>${bodyHtml}`);
}

/* ── SEO landing page renderer ───────────────────────── */

async function renderSeoLanding(path: string) {
  // Parse tipo from the beginning of the path
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

  // Pattern: /apartamentos-porto-alegre (tipo + cidade)
  if (remainder === "-porto-alegre") {
    const { count } = await supabase.from("imoveis").select("*", { count: "exact", head: true })
      .eq("status", "disponivel").eq("tipo", tipoConfig.dbTipo);
    const total = count ?? 0;
    const title = `${tipoConfig.plural} à Venda em Porto Alegre | Uhome Imóveis`;
    const desc = `Encontre ${total}+ ${tipoConfig.plural.toLowerCase()} à venda em Porto Alegre. Busca com IA, fotos e detalhes. Uhome Imóveis.`;
    const canonical = `${SITE}/${cleanPath}`;
    return html(title, desc, LOGO, canonical, [orgJsonLd()],
      `<h1>${tipoConfig.plural} à Venda em Porto Alegre</h1><p>${esc(desc)}</p><p>${total} imóveis disponíveis</p>`);
  }

  // Pattern: /apartamentos-2-quartos-porto-alegre
  const quartosMatch = remainder.match(/^-(\d)-quartos-porto-alegre$/);
  if (quartosMatch) {
    const quartos = parseInt(quartosMatch[1]);
    const { count } = await supabase.from("imoveis").select("*", { count: "exact", head: true })
      .eq("status", "disponivel").eq("tipo", tipoConfig.dbTipo).eq("quartos", quartos);
    const total = count ?? 0;
    const title = `${tipoConfig.plural} ${quartos} Quartos em Porto Alegre | Uhome`;
    const desc = `${total}+ ${tipoConfig.plural.toLowerCase()} com ${quartos} quartos à venda em Porto Alegre. Fotos, preços e detalhes.`;
    const canonical = `${SITE}/${cleanPath}`;
    return html(title, desc, LOGO, canonical, [orgJsonLd()],
      `<h1>${tipoConfig.plural} ${quartos} Quartos em Porto Alegre</h1><p>${esc(desc)}</p>`);
  }

  // Pattern: /apartamentos-ate-500-mil-porto-alegre (preço)
  const precoMatch = remainder.match(/^-(ate|acima|de)-(.+)-porto-alegre$/);
  if (precoMatch) {
    const title = `${tipoConfig.plural} ${cap(precoMatch[1])} ${precoMatch[2].replace(/-/g, " ")} em Porto Alegre | Uhome`;
    const desc = `Encontre ${tipoConfig.plural.toLowerCase()} ${precoMatch[1]} ${precoMatch[2].replace(/-/g, " ")} em Porto Alegre. Uhome Imóveis.`;
    const canonical = `${SITE}/${cleanPath}`;
    return html(title, desc, LOGO, canonical, [orgJsonLd()],
      `<h1>${esc(title.split("|")[0].trim())}</h1><p>${esc(desc)}</p>`);
  }

  // Pattern: /apartamentos-bairro-slug (tipo + bairro)
  const bairroSlug = remainder.replace(/^-/, "");
  if (bairroSlug) {
    // Deslugify
    const bairroNome = bairroSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const { count } = await supabase.from("imoveis").select("*", { count: "exact", head: true })
      .eq("status", "disponivel").eq("tipo", tipoConfig.dbTipo).ilike("bairro", `%${bairroNome}%`);
    const total = count ?? 0;
    if (total === 0) return null;
    const title = `${tipoConfig.plural} em ${bairroNome}, Porto Alegre | Uhome`;
    const desc = `${total} ${tipoConfig.plural.toLowerCase()} à venda em ${bairroNome}. Preços, fotos e detalhes na Uhome Imóveis.`;
    const canonical = `${SITE}/${cleanPath}`;
    return html(title, desc, LOGO, canonical, [orgJsonLd()],
      `<h1>${tipoConfig.plural} em ${esc(bairroNome)}</h1><p>${esc(desc)}</p><p>${total} imóveis disponíveis</p>`);
  }

  return null;
}

/* ── condominios renderer ────────────────────────────── */

async function renderCondominio(slug: string) {
  // Find condominio by slug match
  const { data: rows } = await supabase
    .from("imoveis")
    .select("condominio_nome, bairro, preco, foto_principal, quartos, area_total")
    .eq("status", "disponivel")
    .not("condominio_nome", "is", null)
    .limit(1000);

  if (!rows) return null;

  // Group by condominio and find matching slug
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

  return html(title, desc, condo.foto || LOGO, canonical, [orgJsonLd()],
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

  return html(title, desc, emp.imagem_principal || LOGO, canonical, [orgJsonLd()],
    `<h1>${esc(emp.nome)}</h1><p>${esc(desc)}</p>${emp.imagem_principal ? `<img src="${esc(emp.imagem_principal)}" alt="${esc(emp.nome)}" width="800" height="600" />` : ""}`);
}

/* ── bairros list page ───────────────────────────────── */

async function renderBairros() {
  const title = "Bairros de Porto Alegre — Imóveis à Venda | Uhome";
  const desc = "Explore os principais bairros de Porto Alegre para comprar seu imóvel. Compare preços, infraestrutura e qualidade de vida.";
  const canonical = `${SITE}/bairros`;

  const bairroLinks = Object.entries(BAIRROS).map(([slug, b]) =>
    `<li><a href="${SITE}/bairros/${slug}">${esc(b.nome)}</a> — ${esc(b.descricao.slice(0, 100))}</li>`
  ).join("");

  return html(title, desc, LOGO, canonical, [orgJsonLd()],
    `<h1>Bairros de Porto Alegre</h1><p>${esc(desc)}</p><ul>${bairroLinks}</ul>`);
}

/* ── condominios list page ───────────────────────────── */

async function renderCondominios() {
  const title = "Condomínios em Porto Alegre — Imóveis à Venda | Uhome";
  const desc = "Encontre os melhores condomínios de Porto Alegre com imóveis à venda. Compare opções por bairro, preço e infraestrutura.";
  const canonical = `${SITE}/condominios`;

  return html(title, desc, LOGO, canonical, [orgJsonLd()],
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

  let ogImage = LOGO;
  let bodyCards = "";

  if (v.imovel_codigos?.length) {
    const { data: props } = await supabase
      .from("imoveis")
      .select("titulo, bairro, preco, foto_principal, slug, quartos")
      .in("jetimob_id", v.imovel_codigos)
      .eq("status", "disponivel");

    if (props?.length) {
      ogImage = props[0].foto_principal || LOGO;
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
  return html(title, page.desc, LOGO, canonical, [orgJsonLd()],
    `<h1>${esc(page.title)}</h1><p>${esc(page.desc)}</p>`);
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
    } else if (path === "/bairros") {
      rendered = await renderBairros();
    } else if (path === "/condominios") {
      rendered = await renderCondominios();
    } else if (path === "/blog") {
      rendered = await renderBlog();
    } else if (path.startsWith("/blog/")) {
      const slug = path.replace("/blog/", "").replace(/\/$/, "");
      rendered = renderBlogPost(slug);
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
      if (parts[0] === "c" && parts[2] === "vitrine") {
        rendered = await renderVitrine(parts[3], parts[1]);
      } else if (parts[0] === "vitrine") {
        rendered = await renderVitrine(parts[1]);
      }
    } else {
      // Try intent pages
      const cleanPath = path.replace(/^\//, "").replace(/\/$/, "");
      rendered = renderIntentPage(cleanPath);

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
