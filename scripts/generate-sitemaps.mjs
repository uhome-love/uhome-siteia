#!/usr/bin/env node
/**
 * Generates a single sitemap.xml in public/ by querying Supabase.
 * Run: node scripts/generate-sitemaps.mjs
 * Max 50,000 URLs per sitemap spec.
 * Validates tipo+bairro combos against DB to avoid soft 404s.
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

// ── DB tipo mapping ──
const TIPO_DB_MAP = {
  apartamentos: "Apartamento",
  casas: "Casa",
  coberturas: "Cobertura",
  studios: "Studio",
  terrenos: "Terreno",
  comerciais: "Comercial",
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

const precoRanges = [
  "ate-300-mil", "ate-400-mil", "ate-500-mil", "ate-600-mil", "ate-700-mil",
  "ate-800-mil", "ate-1-milhao", "de-500-mil-a-1-milhao", "de-1-a-2-milhoes",
  "acima-1-milhao", "acima-2-milhoes",
];

// ══════════════════════════════════════════════════════════
async function main() {
  console.log(`\n🗺️  Generating sitemap.xml for ${SITE} (${TODAY})\n`);

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

  // 5. Bairros — only those with 3+ properties
  console.log("  Fetching bairros...");
  const { data: dbBairros } = await supabase.rpc("get_bairros_disponiveis");
  const activeBairros = [];
  if (dbBairros) {
    for (const b of dbBairros) {
      const s = slugify(b.bairro);
      if (s && b.count >= 3) {
        add(`/bairros/${s}`, TODAY, "daily", "0.85");
        if (b.count >= 5) activeBairros.push({ nome: b.bairro, slug: s, count: b.count });
      }
    }
  }
  console.log(`  ✓ ${activeBairros.length} bairros ativos para SEO`);

  // 6. Fetch tipo+bairro counts for validation
  console.log("  Validating tipo+bairro combos...");
  const tipoBairroCount = new Map();
  const tipoBairroQuartos = new Map();
  offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("imoveis")
      .select("tipo, bairro, quartos")
      .eq("status", "disponivel")
      .range(offset, offset + BATCH - 1);
    if (error || !data || data.length === 0) break;
    for (const row of data) {
      const key = `${row.tipo}|${slugify(row.bairro)}`;
      tipoBairroCount.set(key, (tipoBairroCount.get(key) || 0) + 1);
      if (row.quartos) {
        if (!tipoBairroQuartos.has(key)) tipoBairroQuartos.set(key, new Set());
        tipoBairroQuartos.get(key).add(row.quartos);
      }
    }
    if (data.length < BATCH) break;
    offset += BATCH;
  }

  // 7. Páginas SEO dinâmicas (tipo + bairro) — validated
  let seoValidated = 0;
  let seoSkipped = 0;
  for (const tipo of SEO_TIPOS) {
    const dbTipo = TIPO_DB_MAP[tipo];
    for (const b of activeBairros) {
      const key = `${dbTipo}|${b.slug}`;
      if ((tipoBairroCount.get(key) || 0) >= 1) {
        add(`/${tipo}-${b.slug}`, TODAY, "daily", "0.75");
        seoValidated++;
      } else {
        seoSkipped++;
      }
    }
  }
  console.log(`  ✓ ${seoValidated} tipo+bairro (${seoSkipped} skipped — no results)`);

  // 8. Páginas SEO dinâmicas (tipo + quartos + bairro) — validated
  const quartosTipos = ["apartamentos", "casas", "coberturas"];
  let quartosValidated = 0;
  let quartosSkipped = 0;
  for (const tipo of quartosTipos) {
    const dbTipo = TIPO_DB_MAP[tipo];
    for (const q of [1, 2, 3, 4]) {
      add(`/${tipo}-${q}-quartos-porto-alegre`, TODAY, "daily", "0.75");
      for (const b of activeBairros) {
        const key = `${dbTipo}|${b.slug}`;
        const quartosSet = tipoBairroQuartos.get(key);
        if (quartosSet && quartosSet.has(q)) {
          add(`/${tipo}-${q}-quartos-${b.slug}`, TODAY, "weekly", "0.7");
          quartosValidated++;
        } else {
          quartosSkipped++;
        }
      }
    }
  }
  console.log(`  ✓ ${quartosValidated} tipo+quartos+bairro (${quartosSkipped} skipped)`);

  // 9. Páginas SEO dinâmicas (tipo + faixa de preço)
  const precoTipos = ["apartamentos", "casas", "coberturas"];
  for (const tipo of precoTipos) {
    for (const range of precoRanges) {
      add(`/${tipo}-${range}-porto-alegre`, TODAY, "daily", "0.75");
    }
  }
  console.log(`  ✓ ${precoTipos.length * precoRanges.length} páginas tipo+preço`);

  // 10. Condomínios
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

  // 11. Empreendimentos
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
