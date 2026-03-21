import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://uhome.com.br";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BAIRRO_SLUGS = [
  "moinhos-de-vento", "bela-vista", "mont-serrat", "petropolis",
  "rio-branco", "auxiliadora", "tres-figueiras", "boa-vista",
  "higienopolis", "independencia", "floresta", "cidade-baixa",
  "menino-deus", "centro-historico", "jardim-botanico",
];

const BLOG_SLUGS = [
  "guia-compra-primeiro-imovel-porto-alegre",
  "melhores-bairros-para-investir-2025",
  "financiamento-imobiliario-tudo-que-voce-precisa-saber",
  "checklist-vistoria-imovel-usado",
  "morar-em-porto-alegre-vale-a-pena",
  "documentos-necessarios-compra-imovel",
];

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    // Static pages
    const entries: string[] = [
      urlEntry(`${SITE}/`, today, "daily", "1.0"),
      urlEntry(`${SITE}/busca`, today, "daily", "0.9"),
      urlEntry(`${SITE}/bairros`, today, "weekly", "0.8"),
      urlEntry(`${SITE}/faq`, today, "monthly", "0.6"),
      urlEntry(`${SITE}/anunciar`, today, "monthly", "0.5"),
      urlEntry(`${SITE}/carreiras`, today, "monthly", "0.4"),
    ];

    // Bairro pages
    for (const slug of BAIRRO_SLUGS) {
      entries.push(urlEntry(`${SITE}/bairros/${slug}`, today, "weekly", "0.7"));
    }

    // All available properties
    let offset = 0;
    const PAGE_SIZE = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("imoveis")
        .select("slug, updated_at")
        .eq("status", "disponivel")
        .order("publicado_em", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      for (const row of data) {
        const lastmod = row.updated_at
          ? new Date(row.updated_at).toISOString().split("T")[0]
          : today;
        entries.push(urlEntry(`${SITE}/imovel/${row.slug}`, lastmod, "weekly", "0.8"));
      }

      if (data.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("Sitemap error:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
