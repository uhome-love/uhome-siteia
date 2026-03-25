import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://uhome.com.br";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const FN_BASE = `${SUPABASE_URL}/functions/v1/dynamic-sitemap`;

const supabase = createClient(
  SUPABASE_URL,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ── Bairros ──────────────────────────────────────────────
const BAIRRO_SLUGS = [
  "moinhos-de-vento", "bela-vista", "mont-serrat", "petropolis",
  "rio-branco", "auxiliadora", "tres-figueiras", "boa-vista",
  "higienopolis", "independencia", "floresta", "cidade-baixa",
  "menino-deus", "centro-historico", "jardim-botanico", "tristeza",
  "ipanema", "bom-fim", "cristal", "sarandi", "partenon",
  "morro-santana", "vila-ipiranga", "passo-d-areia", "santana",
  "chacara-das-pedras", "jardim-europa", "jardim-lindoia",
  "vila-jardim", "rubem-berta", "humaita", "navegantes",
  "gloria", "medianeira", "santa-cecilia", "teresopolis",
  "santo-antonio", "praia-de-belas", "farroupilha", "nonoai",
  "camaqua", "vila-assuncao", "pedra-redonda", "cavalhada",
];

// ── SEO category pages ──────────────────────────────────
const SEO_CATEGORY_PAGES = [
  "/apartamentos-porto-alegre",
  "/casas-porto-alegre",
  "/coberturas-porto-alegre",
  "/studios-porto-alegre",
  "/comerciais-porto-alegre",
];

// ── SEO intent pages ────────────────────────────────────
const SEO_INTENT_PAGES = [
  "/apartamentos-a-venda-porto-alegre",
  "/casas-a-venda-porto-alegre",
  "/coberturas-a-venda-porto-alegre",
  "/terrenos-a-venda-porto-alegre",
  "/imoveis-de-luxo-porto-alegre",
  "/investimento-imobiliario-porto-alegre",
  "/lancamentos-porto-alegre",
];

const SEO_TIPOS = ["apartamentos", "casas", "coberturas", "studios", "terrenos", "comerciais"];


// ── Blog ─────────────────────────────────────────────────
const BLOG_SLUGS = [
  "melhores-bairros-porto-alegre-2025",
  "preco-metro-quadrado-bairros-porto-alegre",
  "como-comprar-apartamento-porto-alegre",
  "financiamento-caixa-2026",
  "mercado-imobiliario-porto-alegre-2026",
];

// ── XML helpers ──────────────────────────────────────────
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>\n    <loc>${esc(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function wrapUrlset(entries: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;
}

function xmlResponse(xml: string) {
  return new Response(xml, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

// ══════════════════════════════════════════════════════════
// SITEMAP INDEX (root)
// ══════════════════════════════════════════════════════════
function buildSitemapIndex(today: string) {
  // Use SITE-based URLs so Google always sees uhome.com.br
  // The static sitemap.xml at uhome.com.br proxies to this edge function
  const sitemaps = [
    { loc: `${SITE}/sitemap-paginas.xml`, lastmod: today },
    { loc: `${SITE}/sitemap-imoveis.xml`, lastmod: today },
    { loc: `${SITE}/sitemap-bairros.xml`, lastmod: today },
    { loc: `${SITE}/sitemap-seo.xml`, lastmod: today },
    { loc: `${SITE}/sitemap-condominios.xml`, lastmod: today },
    { loc: `${SITE}/sitemap-empreendimentos.xml`, lastmod: today },
    { loc: `${SITE}/sitemap-blog.xml`, lastmod: today },
  ];

  const entries = sitemaps
    .map((s) => `  <sitemap>\n    <loc>${esc(s.loc)}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;
}

// ══════════════════════════════════════════════════════════
// PAGES SITEMAP (institutional + SEO categories)
// ══════════════════════════════════════════════════════════
function buildPagesSitemap(today: string) {
  const entries = [
    // Institutional — priority 1.0
    urlEntry(`${SITE}/`, today, "daily", "1.0"),
    urlEntry(`${SITE}/busca`, today, "daily", "0.9"),
    urlEntry(`${SITE}/bairros`, today, "weekly", "0.85"),
    urlEntry(`${SITE}/condominios`, today, "weekly", "0.85"),
    urlEntry(`${SITE}/avaliar-imovel`, today, "monthly", "0.7"),
    urlEntry(`${SITE}/faq`, today, "monthly", "0.6"),
    urlEntry(`${SITE}/anunciar`, today, "monthly", "0.6"),
    urlEntry(`${SITE}/carreiras`, today, "monthly", "0.4"),
    urlEntry(`${SITE}/politica-de-privacidade`, today, "yearly", "0.3"),
    // SEO category pages — priority 0.8
    ...SEO_CATEGORY_PAGES.map((path) =>
      urlEntry(`${SITE}${path}`, today, "daily", "0.8")
    ),
    // SEO intent pages — priority 0.8
    ...SEO_INTENT_PAGES.map((path) =>
      urlEntry(`${SITE}${path}`, today, "daily", "0.8")
    ),
  ];
  return wrapUrlset(entries);
}

// ══════════════════════════════════════════════════════════
// IMOVEIS SITEMAP (dynamic, paginated for >50k)
// ══════════════════════════════════════════════════════════
const MAX_URLS_PER_SITEMAP = 45000; // stay under 50k limit

async function buildImoveisSitemap(today: string, pageNum = 0) {
  const entries: string[] = [];
  let offset = pageNum * MAX_URLS_PER_SITEMAP;
  const maxEntries = MAX_URLS_PER_SITEMAP;
  const BATCH = 1000;

  while (entries.length < maxEntries) {
    const { data, error } = await supabase
      .from("imoveis")
      .select("slug, updated_at")
      .eq("status", "disponivel")
      .not("slug", "is", null)
      .order("publicado_em", { ascending: false })
      .range(offset, offset + BATCH - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      const lastmod = row.updated_at
        ? new Date(row.updated_at).toISOString().split("T")[0]
        : today;
      entries.push(urlEntry(`${SITE}/imovel/${row.slug}`, lastmod, "daily", "0.9"));
    }

    if (data.length < BATCH) break;
    offset += BATCH;
  }

  return wrapUrlset(entries);
}

// Check if we need multiple sitemap files for imoveis
async function getImoveisCount(): Promise<number> {
  const { count } = await supabase
    .from("imoveis")
    .select("id", { count: "exact", head: true })
    .eq("status", "disponivel");
  return count ?? 0;
}

// ══════════════════════════════════════════════════════════
// BAIRROS SITEMAP
// ══════════════════════════════════════════════════════════
async function buildBairrosSitemap(today: string) {
  // Get all unique bairros from DB for comprehensive coverage
  const { data: dbBairros } = await supabase.rpc("get_bairros_disponiveis");

  const slugify = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const slugSet = new Set(BAIRRO_SLUGS);

  // Add DB bairros not in static list
  if (dbBairros) {
    for (const b of dbBairros as { bairro: string; count: number }[]) {
      const slug = slugify(b.bairro);
      if (slug && b.count >= 3) slugSet.add(slug); // only bairros with 3+ properties
    }
  }

  const entries = Array.from(slugSet).sort().map((slug) =>
    urlEntry(`${SITE}/bairros/${slug}`, today, "daily", "0.85")
  );

  return wrapUrlset(entries);
}

// ══════════════════════════════════════════════════════════
// CONDOMINIOS SITEMAP (dynamic)
// ══════════════════════════════════════════════════════════
async function buildCondominiosSitemap(today: string) {
  const entries: string[] = [];
  const slugify = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Fetch unique condominio names with counts
  let offset = 0;
  const BATCH = 1000;
  const condoCount = new Map<string, number>();

  while (true) {
    const { data, error } = await supabase
      .from("imoveis")
      .select("condominio_nome")
      .eq("status", "disponivel")
      .not("condominio_nome", "is", null)
      .range(offset, offset + BATCH - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      const name = (row as any).condominio_nome?.trim();
      if (name) condoCount.set(name, (condoCount.get(name) || 0) + 1);
    }

    if (data.length < BATCH) break;
    offset += BATCH;
  }

  // Only include condominios with 2+ units
  for (const [name, count] of condoCount) {
    if (count < 2) continue;
    const slug = slugify(name);
    if (slug) {
      entries.push(urlEntry(`${SITE}/condominios/${slug}`, today, "weekly", "0.7"));
    }
  }

  return wrapUrlset(entries);
}

// ══════════════════════════════════════════════════════════
// EMPREENDIMENTOS SITEMAP (dynamic)
// ══════════════════════════════════════════════════════════
async function buildEmpreendimentosSitemap(today: string) {
  const { data } = await supabase
    .from("empreendimentos")
    .select("slug, updated_at")
    .eq("ativo", true);

  const entries = (data || []).map((row) => {
    const lastmod = row.updated_at
      ? new Date(row.updated_at).toISOString().split("T")[0]
      : today;
    return urlEntry(`${SITE}/empreendimentos/${row.slug}`, lastmod, "weekly", "0.8");
  });

  return wrapUrlset(entries);
}

// ══════════════════════════════════════════════════════════
// BLOG SITEMAP
// ══════════════════════════════════════════════════════════
function buildBlogSitemap(today: string) {
  const entries = [
    urlEntry(`${SITE}/blog`, today, "weekly", "0.7"),
    ...BLOG_SLUGS.map((slug) =>
      urlEntry(`${SITE}/blog/${slug}`, today, "monthly", "0.7")
    ),
  ];
  return wrapUrlset(entries);
}

// ══════════════════════════════════════════════════════════
// SEO PAGES SITEMAP (tipo+bairro, quartos+bairro combos)
// ══════════════════════════════════════════════════════════
async function buildSeoPagesSitemap(today: string) {
  const slugifyName = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Get bairros with 5+ properties
  const { data: dbBairros } = await supabase.rpc("get_bairros_disponiveis");
  const activeBairros = (dbBairros as { bairro: string; count: number }[] || [])
    .filter((b) => b.count >= 5)
    .map((b) => slugifyName(b.bairro));

  const entries: string[] = [];

  // tipo + bairro combos (6 tipos × ~80 bairros = ~480 pages)
  for (const tipo of SEO_TIPOS) {
    for (const bairroSlug of activeBairros) {
      entries.push(urlEntry(`${SITE}/${tipo}-${bairroSlug}`, today, "daily", "0.75"));
    }
  }

  // quartos combos for main types (3 tipos × 4 quartos × ~80 bairros = ~960 pages)
  const quartosTipos = ["apartamentos", "casas", "coberturas"];
  for (const tipo of quartosTipos) {
    for (const q of [1, 2, 3, 4]) {
      for (const bairroSlug of activeBairros) {
        entries.push(urlEntry(`${SITE}/${tipo}-${q}-quartos-${bairroSlug}`, today, "weekly", "0.7"));
      }
    }
  }

  return wrapUrlset(entries);
}

// ══════════════════════════════════════════════════════════
// REQUEST HANDLER
// ══════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const page = parseInt(url.searchParams.get("page") || "0", 10);
    const today = new Date().toISOString().split("T")[0];

    switch (type) {
      case "pages":
        return xmlResponse(buildPagesSitemap(today));

      case "imoveis": {
        // Check if we need a sitemap index for imoveis
        const totalImoveis = await getImoveisCount();
        if (totalImoveis > MAX_URLS_PER_SITEMAP && page === -1) {
          // Return a sitemap index that splits into pages
          const numPages = Math.ceil(totalImoveis / MAX_URLS_PER_SITEMAP);
          const sitemapEntries = Array.from({ length: numPages }, (_, i) =>
            `  <sitemap>\n    <loc>${SITE}/sitemap-imoveis-${i + 1}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`
          ).join("\n");
          return xmlResponse(
            `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</sitemapindex>`
          );
        }
        return xmlResponse(await buildImoveisSitemap(today, page));
      }

      case "bairros":
        return xmlResponse(await buildBairrosSitemap(today));

      case "blog":
        return xmlResponse(buildBlogSitemap(today));

      case "condominios":
        return xmlResponse(await buildCondominiosSitemap(today));

      case "empreendimentos":
        return xmlResponse(await buildEmpreendimentosSitemap(today));

      default:
        // Root = sitemap index
        return xmlResponse(buildSitemapIndex(today));
    }
  } catch (err) {
    console.error("Sitemap error:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
