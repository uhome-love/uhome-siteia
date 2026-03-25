#!/usr/bin/env node
/**
 * Generates a single sitemap.xml in public/ by querying Supabase.
 * Run: node scripts/generate-sitemaps.mjs
 * Max 50,000 URLs per sitemap spec.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "..", "public");

const SITE = "https://uhome.com.br";
const TODAY = new Date().toISOString().split("T")[0];
const MAX_URLS = 50000;

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
const slugify = (name) =>
  name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
// Collect all entries into a single Set (dedup by URL)
// ══════════════════════════════════════════════════════════
async function main() {
  console.log(`\n🗺️  Generating sitemap.xml for ${SITE} (${TODAY})\n`);

  /** @type {Map<string, {lastmod:string, changefreq:string, priority:string}>} */
  const urls = new Map();

  const add = (path, lastmod, changefreq, priority) => {
    if (urls.size >= MAX_URLS) return;
    const loc = `${SITE}${path}`;
    if (!urls.has(loc)) urls.set(loc, { lastmod, changefreq, priority });
  };

  // 1. Páginas principais
  add("/", TODAY, "daily", "1.0");
  add("/busca", TODAY, "daily", "0.9");
  add("/bairros", TODAY, "weekly", "0.85");
  add("/condominios", TODAY, "weekly", "0.85");
  add("/avaliar-imovel", TODAY, "monthly", "0.7");
  add("/faq", TODAY, "monthly", "0.6");
  add("/anunciar", TODAY, "monthly", "0.6");
  add("/carreiras", TODAY, "monthly", "0.4");
  add("/politica-de-privacidade", TODAY, "yearly", "0.3");

  // 2. Páginas SEO de categoria e intenção
  for (const p of SEO_CATEGORY_PAGES) add(p, TODAY, "daily", "0.8");
  for (const p of SEO_INTENT_PAGES) add(p, TODAY, "daily", "0.8");

  // 3. Blog
  add("/blog", TODAY, "weekly", "0.7");
  for (const s of BLOG_SLUGS) add(`/blog/${s}`, TODAY, "monthly", "0.7");

  // 4. Imóveis
  console.log("  Fetching imóveis...");
  let offset = 0;
  const BATCH = 1000;
  let imoveisCount = 0;
  while (urls.size < MAX_URLS) {
    const { data, error } = await supabase
      .from("imoveis")
      .select("slug, updated_at")
      .eq("status", "disponivel")
      .not("slug", "is", null)
      .order("publicado_em", { ascending: false })
      .range(offset, offset + BATCH - 1);
    if (error) { console.error("  Imoveis error:", error.message); break; }
    if (!data || data.length === 0) break;
    for (const row of data) {
      const lm = row.updated_at ? new Date(row.updated_at).toISOString().split("T")[0] : TODAY;
      add(`/imovel/${row.slug}`, lm, "daily", "0.9");
      imoveisCount++;
    }
    if (data.length < BATCH) break;
    offset += BATCH;
  }
  console.log(`  ✓ ${imoveisCount} imóveis`);

  // 5. Bairros
  console.log("  Fetching bairros...");
  const { data: dbBairros } = await supabase.rpc("get_bairros_disponiveis");
  const activeBairros = [];
  if (dbBairros) {
    for (const b of dbBairros) {
      const s = slugify(b.bairro);
      if (s && b.count >= 3) {
        add(`/bairros/${s}`, TODAY, "daily", "0.85");
        if (b.count >= 5) activeBairros.push(s);
      }
    }
  }
  console.log(`  ✓ ${activeBairros.length} bairros ativos para SEO`);

  // 6. Páginas SEO dinâmicas (tipo + bairro)
  for (const tipo of SEO_TIPOS) {
    for (const bs of activeBairros) {
      add(`/${tipo}-${bs}`, TODAY, "daily", "0.75");
    }
  }

  // 7. Páginas SEO dinâmicas (tipo + quartos + bairro)
  const quartosTipos = ["apartamentos", "casas", "coberturas"];
  for (const tipo of quartosTipos) {
    for (const q of [1, 2, 3, 4]) {
      for (const bs of activeBairros) {
        add(`/${tipo}-${q}-quartos-${bs}`, TODAY, "weekly", "0.7");
      }
    }
  }

  // 8. Condomínios
  console.log("  Fetching condomínios...");
  const condoCount = new Map();
  offset = 0;
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
  let condosAdded = 0;
  for (const [name, count] of condoCount) {
    if (count < 2) continue;
    const s = slugify(name);
    if (s) { add(`/condominios/${s}`, TODAY, "weekly", "0.7"); condosAdded++; }
  }
  console.log(`  ✓ ${condosAdded} condomínios`);

  // 9. Empreendimentos
  console.log("  Fetching empreendimentos...");
  const { data: empData } = await supabase.from("empreendimentos").select("slug, updated_at").eq("ativo", true);
  for (const row of empData || []) {
    const lm = row.updated_at ? new Date(row.updated_at).toISOString().split("T")[0] : TODAY;
    add(`/empreendimentos/${row.slug}`, lm, "weekly", "0.8");
  }
  console.log(`  ✓ ${(empData || []).length} empreendimentos`);

  // ── Build XML ──
  const entries = [];
  for (const [loc, meta] of urls) {
    entries.push(entry(loc, meta.lastmod, meta.changefreq, meta.priority));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;
  const outPath = path.join(PUBLIC, "sitemap.xml");
  fs.writeFileSync(outPath, xml, "utf-8");

  console.log(`\n✅ sitemap.xml generated: ${urls.size} URLs (${(xml.length / 1024).toFixed(1)} KB)\n`);
  if (urls.size >= MAX_URLS) {
    console.warn(`⚠️  Hit ${MAX_URLS} URL limit — some URLs were omitted.`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
