// Worker "uhome-previa" — roda só nas rotas cadastradas na Cloudflare.
// 1) Robôs de prévia de link (WhatsApp, Facebook...) recebem a prévia da função ssr-render.
// 2) Pessoas: HTML da home/páginas em cache curto na borda; busca, produto e campanha
//    recebem a primeira dobra pronta (foto pré-carregada, dados da busca, topo da campanha).
// 3) /assets/* e /fonts/* (arquivos com hash): cache de 1 ano; /images/*: 7 dias.
// Qualquer erro ou demora: a página normal passa direto (fail open).
const FN = "https://huigglwvvzuwwyqvpmec.supabase.co/functions/v1/";
const BOTS = /whatsapp|facebookexternalhit|facebot|meta-externalagent|instagram|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|pinterest|skypeuripreview/i;
const HTML_TTL = 120; // segundos de cache do HTML na borda (depois de publicar, no máximo 2 min para atualizar)

async function comTempo(url, ms, ttl) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, cf: { cacheTtl: ttl, cacheEverything: true } });
  } finally {
    clearTimeout(t);
  }
}

async function previa(request, url) {
  const r = await comTempo(FN + "ssr-render?path=" + encodeURIComponent(url.pathname), 3000, 600);
  if (!r.ok) return fetch(request);
  return new Response(r.body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=600", "x-uhome-previa": "1" },
  });
}

async function comCacheLongo(request, maxAge) {
  const r = await fetch(request);
  if (!r.ok) return r;
  const h = new Headers(r.headers);
  h.set("cache-control", maxAge >= 31536000 ? `public, max-age=${maxAge}, immutable` : `public, max-age=${maxAge}`);
  return new Response(r.body, { status: r.status, headers: h });
}

/** HTML de origem com cache curto na borda (por caminho, sem a query de anúncios). */
async function htmlOrigem(request, url, ctx) {
  const chave = new Request(url.origin + url.pathname + "?__uh_html", { method: "GET" });
  const cache = caches.default;
  const salvo = await cache.match(chave);
  if (salvo) return salvo;
  const r = await fetch(request);
  if (r.ok && (r.headers.get("content-type") || "").includes("text/html") && !r.headers.has("set-cookie")) {
    const h = new Headers(r.headers);
    h.set("cache-control", `public, max-age=${HTML_TTL}`);
    const copia = new Response(r.clone().body, { status: 200, headers: h });
    ctx.waitUntil(cache.put(chave, copia));
  }
  return r;
}

function precisaDobra(p) {
  return p === "/busca" || /^(\/c\/[^/]+)?\/(em-foco|campanha)\/[^/]+\/?$/.test(p);
}

export default {
  async fetch(request, env, ctx) {
    try {
      if (request.method !== "GET") return fetch(request);
      const url = new URL(request.url);
      const p = url.pathname;
      if (p.startsWith("/assets/") || p.startsWith("/fonts/")) return comCacheLongo(request, 31536000);
      if (p.startsWith("/images/")) return comCacheLongo(request, 604800);

      const ua = request.headers.get("user-agent") || "";
      if (BOTS.test(ua)) return previa(request, url);

      // Busca com filtros na URL não usa os dados prontos (só a busca padrão).
      const dobraUrl = precisaDobra(p) && !(p === "/busca" && url.search)
        ? FN + "site-dobra?path=" + encodeURIComponent(p)
        : null;
      const [pagina, dobra] = await Promise.all([
        htmlOrigem(request, url, ctx),
        dobraUrl ? comTempo(dobraUrl, 800, p === "/busca" ? 120 : 60).then((r) => (r.ok ? r.json() : null)).catch(() => null) : null,
      ]);
      if (!dobra || !(dobra.head || dobra.pre || dobra.script)) return pagina;

      let rw = new HTMLRewriter();
      if (dobra.head) rw = rw.on("head", { element(e) { e.append(dobra.head, { html: true }); } });
      if (dobra.script) rw = rw.on("head", { element(e) { e.append(`<script>${dobra.script}</script>`, { html: true }); } });
      if (dobra.pre) {
        rw = rw
          .on("#root", { element(e) { e.before(dobra.pre, { html: true }); } })
          .on("#uh-splash", { element(e) { e.remove(); } })
          // O topo pronto precisa do CSS já aplicado na primeira pintura.
          .on('link[data-uh-css]', { element(e) { e.setAttribute("rel", "stylesheet"); e.removeAttribute("as"); e.removeAttribute("onload"); } });
      }
      const h = new Headers(pagina.headers);
      h.delete("content-length");
      h.set("cache-control", "public, max-age=0, must-revalidate");
      return rw.transform(new Response(pagina.body, { status: pagina.status, headers: h }));
    } catch (e) {
      return fetch(request);
    }
  },
};
