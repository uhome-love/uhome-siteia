import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://uhome.com.br";
const FN_BASE = Deno.env.get("SUPABASE_URL") + "/functions/v1/dynamic-sitemap";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BAIRRO_SLUGS = [
  "moinhos-de-vento", "bela-vista", "mont-serrat", "petropolis",
  "rio-branco", "auxiliadora", "tres-figueiras", "boa-vista",
  "higienopolis", "independencia", "floresta", "cidade-baixa",
  "menino-deus", "centro-historico", "jardim-botanico", "tristeza",
  "ipanema", "bom-fim", "cristal", "sarandi", "partenon",
];

const BLOG_SLUGS = [
  "melhores-bairros-porto-alegre-2025",
  "preco-metro-quadrado-bairros-porto-alegre",
  "como-comprar-apartamento-porto-alegre",
  "financiamento-caixa-2026",
  "mercado-imobiliario-porto-alegre-2026",
];

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
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

// --- Sitemap Index (root) ---
function buildSitemapIndex(today: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${FN_BASE}?type=pages</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${FN_BASE}?type=imoveis</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${FN_BASE}?type=bairros</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${FN_BASE}?type=blog</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${FN_BASE}?type=condominios</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}

// --- Pages sitemap ---
function buildPagesSitemap(today: string) {
  const entries = [
    urlEntry(`${SITE}/`, today, "daily", "1.0"),
    urlEntry(`${SITE}/busca`, today, "daily", "0.9"),
    urlEntry(`${SITE}/bairros`, today, "weekly", "0.8"),
    urlEntry(`${SITE}/condominios`, today, "weekly", "0.8"),
    urlEntry(`${SITE}/avaliar-imovel`, today, "monthly", "0.7"),
    urlEntry(`${SITE}/faq`, today, "monthly", "0.6"),
    urlEntry(`${SITE}/anunciar`, today, "monthly", "0.5"),
    urlEntry(`${SITE}/carreiras`, today, "monthly", "0.4"),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
}

// --- Imoveis sitemap (dynamic, batched) ---
async function buildImoveisSitemap(today: string) {
  const entries: string[] = [];
  let offset = 0;
  const BATCH = 1000;

  while (true) {
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
      entries.push(urlEntry(`${SITE}/imovel/${row.slug}`, lastmod, "weekly", "0.6"));
    }

    if (data.length < BATCH) break;
    offset += BATCH;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
}

// --- Bairros sitemap ---
function buildBairrosSitemap(today: string) {
  const entries = BAIRRO_SLUGS.map((slug) =>
    urlEntry(`${SITE}/bairros/${slug}`, today, "daily", "0.8")
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
}

// --- Blog sitemap ---
function buildBlogSitemap(today: string) {
  const entries = [
    urlEntry(`${SITE}/blog`, today, "weekly", "0.7"),
    ...BLOG_SLUGS.map((slug) =>
      urlEntry(`${SITE}/blog/${slug}`, today, "monthly", "0.7")
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
}

// --- Condominios sitemap (dynamic) ---
async function buildCondominiosSitemap(today: string) {
  const entries: string[] = [];

  const { data: condoData } = await supabase
    .from("imoveis")
    .select("condominio_nome")
    .eq("status", "disponivel")
    .not("condominio_nome", "is", null);

  if (condoData) {
    const uniqueCondos = new Set<string>();
    for (const row of condoData) {
      const name = (row as any).condominio_nome?.trim();
      if (name) uniqueCondos.add(name);
    }
    for (const name of uniqueCondos) {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      entries.push(urlEntry(`${SITE}/condominios/${slug}`, today, "weekly", "0.7"));
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const today = new Date().toISOString().split("T")[0];

    switch (type) {
      case "pages":
        return xmlResponse(buildPagesSitemap(today));
      case "imoveis":
        return xmlResponse(await buildImoveisSitemap(today));
      case "bairros":
        return xmlResponse(buildBairrosSitemap(today));
      case "blog":
        return xmlResponse(buildBlogSitemap(today));
      case "condominios":
        return xmlResponse(await buildCondominiosSitemap(today));
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
