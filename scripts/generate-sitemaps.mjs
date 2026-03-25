#!/usr/bin/env node
/**
 * Generates static sitemap XML files in public/ by querying Supabase.
 * Run: node scripts/generate-sitemaps.mjs
 * Add to package.json: "prebuild": "node scripts/generate-sitemaps.mjs"
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "..", "public");

const SITE = "https://uhome.com.br";
const TODAY = new Date().toISOString().split("T")[0];

// ── Supabase client ──
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Helpers ──
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const entry = (loc, lastmod, changefreq, priority) =>
  `  <url>\n    <loc>${esc(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
const wrap = (entries) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;
const slugify = (name) =>
  name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const write = (name, xml) => {
  const p = path.join(PUBLIC, name);
  fs.writeFileSync(p, xml, "utf-8");
  console.log(`✓ ${name} (${(xml.length / 1024).toFixed(1)} KB)`);
};

// ── Static data ──
const SEO_CATEGORY_PAGES = [
  "/apartamentos-porto-alegre", "/casas-porto-alegre", "/coberturas-porto-alegre",
  "/studios-porto-alegre", "/comerciais-porto-alegre",
];
const SEO_INTENT_PAGES = [
  "/apartamentos-a-venda-porto-alegre", "/casas-a-venda-porto-alegre",
  "/coberturas-a-venda-porto-alegre", "/terrenos-a-venda-porto-alegre",
  "/imoveis-de-luxo-porto-alegre", "/investimento-imobiliario-porto-alegre",
  "/lancamentos-porto-alegre",
];
const SEO_TIPOS = ["apartamentos", "casas", "coberturas", "studios", "terrenos", "comerciais"];
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

// ══════════════════════════════════════════════════════════
// 1. sitemap-paginas.xml
// ══════════════════════════════════════════════════════════
function buildPages() {
  const entries = [
    entry(`${SITE}/`, TODAY, "daily", "1.0"),
    entry(`${SITE}/busca`, TODAY, "daily", "0.9"),
    entry(`${SITE}/bairros`, TODAY, "weekly", "0.85"),
    entry(`${SITE}/condominios`, TODAY, "weekly", "0.85"),
    entry(`${SITE}/avaliar-imovel`, TODAY, "monthly", "0.7"),
    entry(`${SITE}/faq`, TODAY, "monthly", "0.6"),
    entry(`${SITE}/anunciar`, TODAY, "monthly", "0.6"),
    entry(`${SITE}/carreiras`, TODAY, "monthly", "0.4"),
    entry(`${SITE}/politica-de-privacidade`, TODAY, "yearly", "0.3"),
    ...SEO_CATEGORY_PAGES.map((p) => entry(`${SITE}${p}`, TODAY, "daily", "0.8")),
    ...SEO_INTENT_PAGES.map((p) => entry(`${SITE}${p}`, TODAY, "daily", "0.8")),
  ];
  write("sitemap-paginas.xml", wrap(entries));
}

// ══════════════════════════════════════════════════════════
// 2. sitemap-imoveis.xml
// ══════════════════════════════════════════════════════════
async function buildImoveis() {
  const entries = [];
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
    if (error) { console.error("Imoveis error:", error.message); break; }
    if (!data || data.length === 0) break;
    for (const row of data) {
      const lm = row.updated_at ? new Date(row.updated_at).toISOString().split("T")[0] : TODAY;
      entries.push(entry(`${SITE}/imovel/${row.slug}`, lm, "daily", "0.9"));
    }
    if (data.length < BATCH) break;
    offset += BATCH;
  }
  write("sitemap-imoveis.xml", wrap(entries));
  return entries.length;
}

// ══════════════════════════════════════════════════════════
// 3. sitemap-bairros.xml
// ══════════════════════════════════════════════════════════
async function buildBairros() {
  const { data: dbBairros } = await supabase.rpc("get_bairros_disponiveis");
  const slugSet = new Set();
  if (dbBairros) {
    for (const b of dbBairros) {
      const s = slugify(b.bairro);
      if (s && b.count >= 3) slugSet.add(s);
    }
  }
  const entries = Array.from(slugSet).sort().map((s) =>
    entry(`${SITE}/bairros/${s}`, TODAY, "daily", "0.85")
  );
  write("sitemap-bairros.xml", wrap(entries));
  return entries.length;
}

// ══════════════════════════════════════════════════════════
// 4. sitemap-seo.xml
// ══════════════════════════════════════════════════════════
async function buildSeo() {
  const { data: dbBairros } = await supabase.rpc("get_bairros_disponiveis");
  const activeBairros = (dbBairros || []).filter((b) => b.count >= 5).map((b) => slugify(b.bairro));
  const entries = [];
  for (const tipo of SEO_TIPOS) {
    for (const bs of activeBairros) {
      entries.push(entry(`${SITE}/${tipo}-${bs}`, TODAY, "daily", "0.75"));
    }
  }
  const quartosTipos = ["apartamentos", "casas", "coberturas"];
  for (const tipo of quartosTipos) {
    for (const q of [1, 2, 3, 4]) {
      for (const bs of activeBairros) {
        entries.push(entry(`${SITE}/${tipo}-${q}-quartos-${bs}`, TODAY, "weekly", "0.7"));
      }
    }
  }
  write("sitemap-seo.xml", wrap(entries));
  return entries.length;
}

// ══════════════════════════════════════════════════════════
// 5. sitemap-condominios.xml
// ══════════════════════════════════════════════════════════
async function buildCondominios() {
  const condoCount = new Map();
  let offset = 0;
  const BATCH = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("imoveis")
      .select("condominio_nome")
      .eq("status", "disponivel")
      .not("condominio_nome", "is", null)
      .range(offset, offset + BATCH - 1);
    if (error || !data || data.length === 0) break;
    for (const row of data) {
      const n = row.condominio_nome?.trim();
      if (n) condoCount.set(n, (condoCount.get(n) || 0) + 1);
    }
    if (data.length < BATCH) break;
    offset += BATCH;
  }
  const entries = [];
  for (const [name, count] of condoCount) {
    if (count < 2) continue;
    const s = slugify(name);
    if (s) entries.push(entry(`${SITE}/condominios/${s}`, TODAY, "weekly", "0.7"));
  }
  write("sitemap-condominios.xml", wrap(entries));
  return entries.length;
}

// ══════════════════════════════════════════════════════════
// 6. sitemap-empreendimentos.xml
// ══════════════════════════════════════════════════════════
async function buildEmpreendimentos() {
  const { data } = await supabase.from("empreendimentos").select("slug, updated_at").eq("ativo", true);
  const entries = (data || []).map((row) => {
    const lm = row.updated_at ? new Date(row.updated_at).toISOString().split("T")[0] : TODAY;
    return entry(`${SITE}/empreendimentos/${row.slug}`, lm, "weekly", "0.8");
  });
  write("sitemap-empreendimentos.xml", wrap(entries));
  return entries.length;
}

// ══════════════════════════════════════════════════════════
// 7. sitemap-blog.xml
// ══════════════════════════════════════════════════════════
function buildBlog() {
  const entries = [
    entry(`${SITE}/blog`, TODAY, "weekly", "0.7"),
    ...BLOG_SLUGS.map((s) => entry(`${SITE}/blog/${s}`, TODAY, "monthly", "0.7")),
  ];
  write("sitemap-blog.xml", wrap(entries));
}

// ══════════════════════════════════════════════════════════
// INDEX
// ══════════════════════════════════════════════════════════
function buildIndex() {
  const sitemaps = [
    "sitemap-paginas.xml", "sitemap-imoveis.xml", "sitemap-bairros.xml",
    "sitemap-seo.xml", "sitemap-condominios.xml", "sitemap-empreendimentos.xml",
    "sitemap-blog.xml",
  ];
  const entries = sitemaps.map((f) =>
    `  <sitemap>\n    <loc>${esc(`${SITE}/${f}`)}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>`
  ).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;
  write("sitemap.xml", xml);
}

// ══════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════
async function main() {
  console.log(`\n🗺️  Generating sitemaps for ${SITE} (${TODAY})\n`);

  buildPages();
  const [nImoveis, nBairros, nSeo, nCondos, nEmpreendimentos] = await Promise.all([
    buildImoveis(),
    buildBairros(),
    buildSeo(),
    buildCondominios(),
    buildEmpreendimentos(),
  ]);
  buildBlog();
  buildIndex();

  console.log(`\n✅ Done! ${nImoveis} imóveis, ${nBairros} bairros, ${nSeo} SEO pages, ${nCondos} condominios, ${nEmpreendimentos} empreendimentos\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
