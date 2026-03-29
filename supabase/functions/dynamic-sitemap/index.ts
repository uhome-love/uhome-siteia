import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://uhome.com.br";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

const supabase = createClient(
  SUPABASE_URL,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

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

// Map sitemap tipo slugs to DB tipo values
const TIPO_DB_MAP: Record<string, string> = {
  apartamentos: "apartamento",
  casas: "casa",
  coberturas: "cobertura",
  studios: "studio",
  terrenos: "terreno",
  comerciais: "comercial",
};

// ── Blog slugs (must match src/data/blog.ts) ────────────
const BLOG_SLUGS = [
  "melhores-bairros-para-morar-em-porto-alegre-2026",
  "guia-completo-comprar-apartamento-2026",
  "quanto-custa-metro-quadrado-porto-alegre-2026",
  "apartamento-ou-casa-porto-alegre",
  "financiamento-imobiliario-2026-taxas-e-dicas",
  "como-negociar-preco-imovel",
  "guia-compra-primeiro-imovel-porto-alegre",
  "checklist-vistoria-imovel-usado",
  "documentos-necessarios-compra-imovel",
  "morar-em-porto-alegre-vale-a-pena",
];

// ── Preço ranges ────────────────────────────────────────
const PRECO_RANGES: { slug: string; min?: number; max?: number }[] = [
  { slug: "ate-300-mil", max: 300000 },
  { slug: "ate-400-mil", max: 400000 },
  { slug: "ate-500-mil", max: 500000 },
  { slug: "ate-600-mil", max: 600000 },
  { slug: "ate-700-mil", max: 700000 },
  { slug: "ate-800-mil", max: 800000 },
  { slug: "ate-1-milhao", max: 1000000 },
  { slug: "de-500-mil-a-1-milhao", min: 500000, max: 1000000 },
  { slug: "de-1-a-2-milhoes", min: 1000000, max: 2000000 },
  { slug: "acima-1-milhao", min: 1000000 },
  { slug: "acima-2-milhoes", min: 2000000 },
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

const slugify = (name: string) =>
  name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ══════════════════════════════════════════════════════════
// SITEMAP INDEX (root)
// ══════════════════════════════════════════════════════════
function buildSitemapIndex(today: string) {
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
    urlEntry(`${SITE}/`, today, "daily", "1.0"),
    urlEntry(`${SITE}/busca`, today, "daily", "0.9"),
    urlEntry(`${SITE}/bairros`, today, "weekly", "0.85"),
    urlEntry(`${SITE}/condominios`, today, "weekly", "0.85"),
    urlEntry(`${SITE}/avaliar-imovel`, today, "monthly", "0.7"),
    urlEntry(`${SITE}/faq`, today, "monthly", "0.6"),
    urlEntry(`${SITE}/anunciar`, today, "monthly", "0.6"),
    urlEntry(`${SITE}/carreiras`, today, "monthly", "0.4"),
    urlEntry(`${SITE}/politica-de-privacidade`, today, "yearly", "0.3"),
    ...SEO_CATEGORY_PAGES.map((path) =>
      urlEntry(`${SITE}${path}`, today, "daily", "0.8")
    ),
    ...SEO_INTENT_PAGES.map((path) =>
      urlEntry(`${SITE}${path}`, today, "daily", "0.8")
    ),
  ];
  return wrapUrlset(entries);
}

// ══════════════════════════════════════════════════════════
// IMOVEIS SITEMAP (dynamic, paginated for >50k)
// ══════════════════════════════════════════════════════════
const MAX_URLS_PER_SITEMAP = 45000;

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

async function getImoveisCount(): Promise<number> {
  const { count } = await supabase
    .from("imoveis")
    .select("id", { count: "exact", head: true })
    .eq("status", "disponivel");
  return count ?? 0;
}

// ══════════════════════════════════════════════════════════
// BAIRROS SITEMAP — only bairros with 3+ active properties
// ══════════════════════════════════════════════════════════
async function buildBairrosSitemap(today: string) {
  const { data: dbBairros } = await supabase.rpc("get_bairros_disponiveis");

  const entries: string[] = [];
  if (dbBairros) {
    for (const b of dbBairros as { bairro: string; count: number }[]) {
      if (b.count < 3) continue;
      const slug = slugify(b.bairro);
      if (slug) {
        entries.push(urlEntry(`${SITE}/bairros/${slug}`, today, "daily", "0.85"));
      }
    }
  }

  return wrapUrlset(entries);
}

// ══════════════════════════════════════════════════════════
// CONDOMINIOS SITEMAP (dynamic)
// ══════════════════════════════════════════════════════════
async function buildCondominiosSitemap(today: string) {
  const entries: string[] = [];
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
// SEO PAGES SITEMAP — validated against DB to avoid soft 404s
// Only includes combos that have at least 1 active property
// ══════════════════════════════════════════════════════════
async function buildSeoPagesSitemap(today: string) {
  // Get bairros with 5+ properties and their counts per tipo
  const { data: dbBairros } = await supabase.rpc("get_bairros_disponiveis");
  const activeBairros = (dbBairros as { bairro: string; count: number }[] || [])
    .filter((b) => b.count >= 5)
    .map((b) => ({ nome: b.bairro, slug: slugify(b.bairro), count: b.count }));

  // Fetch tipo+bairro counts to validate combinations
  const { data: tipoBairroData } = await supabase
    .from("imoveis")
    .select("tipo, bairro")
    .eq("status", "disponivel");

  // Build a map of tipo+bairro → count
  const tipoBairroCount = new Map<string, number>();
  const tipoBairroQuartos = new Map<string, Set<number>>();
  if (tipoBairroData) {
    for (const row of tipoBairroData) {
      const key = `${row.tipo}|${slugify(row.bairro)}`;
      tipoBairroCount.set(key, (tipoBairroCount.get(key) || 0) + 1);
    }
  }

  // Also fetch quartos distribution for validated combos
  const { data: quartosData } = await supabase
    .from("imoveis")
    .select("tipo, bairro, quartos")
    .eq("status", "disponivel")
    .not("quartos", "is", null);

  if (quartosData) {
    for (const row of quartosData) {
      if (!row.quartos) continue;
      const key = `${row.tipo}|${slugify(row.bairro)}`;
      if (!tipoBairroQuartos.has(key)) tipoBairroQuartos.set(key, new Set());
      tipoBairroQuartos.get(key)!.add(row.quartos);
    }
  }

  const entries: string[] = [];

  // tipo + bairro combos — only if at least 1 property exists
  for (const tipo of SEO_TIPOS) {
    const dbTipo = TIPO_DB_MAP[tipo];
    for (const b of activeBairros) {
      const key = `${dbTipo}|${b.slug}`;
      if ((tipoBairroCount.get(key) || 0) >= 1) {
        entries.push(urlEntry(`${SITE}/${tipo}-${b.slug}`, today, "daily", "0.75"));
      }
    }
  }

  // quartos combos — only if properties with that quartos count exist
  const quartosTipos = ["apartamentos", "casas", "coberturas"];
  for (const tipo of quartosTipos) {
    const dbTipo = TIPO_DB_MAP[tipo];
    for (const q of [1, 2, 3, 4]) {
      // tipo + quartos + cidade (always include if tipo has properties)
      entries.push(urlEntry(`${SITE}/${tipo}-${q}-quartos-porto-alegre`, today, "daily", "0.75"));

      // tipo + quartos + bairro — validate
      for (const b of activeBairros) {
        const key = `${dbTipo}|${b.slug}`;
        const quartosSet = tipoBairroQuartos.get(key);
        if (quartosSet && quartosSet.has(q)) {
          entries.push(urlEntry(`${SITE}/${tipo}-${q}-quartos-${b.slug}`, today, "weekly", "0.7"));
        }
      }
    }
  }

  // tipo + preço — only include preço combos for main types
  const precoTipos = ["apartamentos", "casas", "coberturas"];
  for (const tipo of precoTipos) {
    for (const range of PRECO_RANGES) {
      entries.push(urlEntry(`${SITE}/${tipo}-${range.slug}-porto-alegre`, today, "daily", "0.75"));
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
        const totalImoveis = await getImoveisCount();
        if (totalImoveis > MAX_URLS_PER_SITEMAP && page === -1) {
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

      case "seo":
        return xmlResponse(await buildSeoPagesSitemap(today));

      case "blog":
        return xmlResponse(buildBlogSitemap(today));

      case "condominios":
        return xmlResponse(await buildCondominiosSitemap(today));

      case "empreendimentos":
        return xmlResponse(await buildEmpreendimentosSitemap(today));

      default:
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
