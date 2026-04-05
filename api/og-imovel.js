// Vercel Edge Function — Open Graph dinâmico para imóveis
// Detecta bots (WhatsApp, Facebook, Telegram, etc.) em /imovel/:slug
// Bots recebem HTML com meta tags OG corretas do imóvel.
// Usuários normais recebem o index.html do SPA (sem redirecionamento).

export const config = { runtime: "edge" };

const SUPABASE_URL = "https://huigglwvvzuwwyqvpmec.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1aWdnbHd2dnp1d3d5cXZwbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTMzNzcsImV4cCI6MjA4OTYyOTM3N30.mi8RveT9gYhxP-sfq0GIN1jog-vU3Sxq511LCq5hhw4";

const BOT_UA_PATTERNS = [
  "whatsapp", "facebookexternalhit", "facebot", "twitterbot", "telegrambot",
  "linkedinbot", "slackbot", "discordbot", "googlebot", "bingbot",
  "applebot", "ia_archiver", "embedly", "outbrain", "pinterest",
  "skypeuripreview", "vkshare", "w3c_validator", "curl", "wget",
];

function isBotUA(ua) {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOT_UA_PATTERNS.some((bot) => lower.includes(bot));
}

function formatPreco(preco) {
  if (!preco || preco <= 0) return "Consulte o preço";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(preco);
}

function getFotoPrincipal(row) {
  if (row.foto_principal) return row.foto_principal;
  try {
    const fotos = typeof row.fotos === "string" ? JSON.parse(row.fotos) : row.fotos;
    if (Array.isArray(fotos) && fotos.length > 0) {
      const principal = fotos.find((f) => f.principal);
      return (principal ?? fotos[0]).url;
    }
  } catch {}
  return "https://uhome.com.br/og-default.jpg";
}

function buildTitle(row) {
  const tipo = row.tipo
    ? row.tipo.charAt(0).toUpperCase() + row.tipo.slice(1)
    : "Imóvel";
  const quartos = row.quartos ?? 0;
  if (quartos > 0) {
    return `${tipo} ${quartos} quarto${quartos > 1 ? "s" : ""} — ${row.bairro} | Uhome`;
  }
  return `${tipo} à Venda — ${row.bairro} | Uhome`;
}

function buildDescription(row) {
  const preco = formatPreco(row.preco);
  const area = row.area_util ? `${row.area_util}m²` : null;
  const quartos = row.quartos
    ? `${row.quartos} quarto${row.quartos > 1 ? "s" : ""}`
    : null;
  const vagas = row.vagas
    ? `${row.vagas} vaga${row.vagas > 1 ? "s" : ""}`
    : null;
  const partes = [preco, area, quartos, vagas].filter(Boolean);
  return `${partes.join(" · ")} · ${row.bairro}, ${row.cidade ?? "Porto Alegre"}. Veja fotos e detalhes na Uhome.`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function handler(req) {
  const url = new URL(req.url);
  const ua = req.headers.get("user-agent") || "";

  // Extrair slug da URL: /imovel/:slug
  const match = url.pathname.match(/^\/imovel\/([^/]+)/);
  if (!match) {
    return new Response("Not found", { status: 404 });
  }
  const slug = match[1];

  // Se não for bot, servir o index.html do SPA normalmente
  if (!isBotUA(ua)) {
    // Buscar o index.html estático e retorná-lo
    const spaUrl = new URL("/index.html", url.origin);
    const spaRes = await fetch(spaUrl.toString());
    const spaHtml = await spaRes.text();
    return new Response(spaHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  // É um bot — buscar dados do imóvel no Supabase
  let imovel = null;
  try {
    const apiUrl = new URL(`${SUPABASE_URL}/rest/v1/imoveis`);
    apiUrl.searchParams.set("slug", `eq.${slug}`);
    apiUrl.searchParams.set(
      "select",
      "slug,titulo,tipo,quartos,vagas,bairro,cidade,preco,foto_principal,fotos,descricao,area_util"
    );
    apiUrl.searchParams.set("limit", "1");

    const res = await fetch(apiUrl.toString(), {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      imovel = data[0];
    }
  } catch {}

  // Construir meta tags
  const title = imovel
    ? buildTitle(imovel)
    : "Imóvel à Venda em Porto Alegre | Uhome";
  const description = imovel
    ? buildDescription(imovel)
    : "Encontre apartamentos, casas e coberturas em Porto Alegre. Busca inteligente por IA.";
  const image = imovel
    ? getFotoPrincipal(imovel)
    : "https://uhome.com.br/og-default.jpg";
  const pageUrl = `https://uhome.com.br/imovel/${slug}`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <!-- Open Graph (WhatsApp, Facebook, LinkedIn) -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Uhome Imóveis">
  <meta property="og:locale" content="pt_BR">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <a href="${escapeHtml(pageUrl)}">Ver imóvel completo</a>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
