// Worker "uhome-seo-bot-handler" (Cloudflare). Formato ES module, pronto para upload pela API
// (PUT /accounts/{account_id}/workers/scripts/uhome-seo-bot-handler, main_module = este arquivo).
//
// 1) ROBÔS (comportamento da versão de 16/11, sem mudança): user-agent em BOT_UA e caminho em SSR_PATH
//    recebem o HTML do ssr-render, chamado com Accept: text/html e user-agent "WhatsApp/2.0",
//    respondido com Cache-Control public, s-maxage=3600.
// 2) PESSOAS: HTML com cache curto na borda; / (home), /busca (padrão), /em-foco/x e /campanha/x recebem
//    a primeira dobra do site-dobra, esperando no máximo 300 ms.
// 3) Arquivos (/assets, /fonts, /images) NÃO passam por aqui: cache longo é regra de cache da Cloudflare.
// Qualquer erro ou demora: a página normal passa direto (fail open).
//
// Rotas: as já existentes + uhome.com.br/busca* e www.uhome.com.br/busca*.

const FN = "https://huigglwvvzuwwyqvpmec.supabase.co/functions/v1/";

// ATENÇÃO: a lista que vale é a que está no ar (definida pela central). Ao atualizar o Worker, mantenha
// a BOT_UA do ar. Nunca incluir "instagram" solto: o navegador do app do Instagram traz essa palavra
// e quem abre anúncio receberia a página de robô.
const BOT_UA = /googlebot|bingbot|whatsapp|facebookexternalhit|facebot|meta-externalagent|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|pinterest|skypeuripreview/i;
// Mesmos caminhos de SSR da versão de 16/11: /, /imovel/, /em-foco/x, /campanha/x, /investir-studios, /c/...
const SSR_PATH = /^\/(?:$|imovel\/|em-foco\/[^/]+|campanha\/[^/]+|investir-studios|c\/)/;

const HTML_TTL = 120; // s de cache do HTML na borda
const ESPERA_DOBRA = 300; // ms máximos esperando o site-dobra

async function comTempo(url, ms, init) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctrl.signal }); } finally { clearTimeout(t); }
}

async function paraRobo(request, url) {
  const r = await fetch(FN + "ssr-render?path=" + encodeURIComponent(url.pathname), {
    headers: { Accept: "text/html", "User-Agent": "WhatsApp/2.0" },
  });
  if (!r.ok) return fetch(request);
  return new Response(r.body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=3600" },
  });
}

/** HTML de origem com cache curto na borda. `?__uh_novo` (recuperação de arquivo ausente) ignora e troca o cache. */
async function htmlOrigem(request, url, ctx) {
  const chave = new Request(url.origin + url.pathname + "?__uh_html");
  const cache = caches.default;
  const novo = url.searchParams.has("__uh_novo");
  if (!novo) { const salvo = await cache.match(chave); if (salvo) return salvo; }
  const r = await fetch(request);
  if (r.ok && (r.headers.get("content-type") || "").includes("text/html") && !r.headers.has("set-cookie")) {
    const h = new Headers(r.headers);
    h.set("cache-control", `public, max-age=${HTML_TTL}`);
    ctx.waitUntil(cache.put(chave, new Response(r.clone().body, { status: 200, headers: h })));
  }
  return r;
}

/** site-dobra com cache de borda: serve o último resultado na hora e renova em segundo plano. */
async function dobra(p, ctx) {
  const chave = new Request("https://uh-dobra.internal" + p);
  const cache = caches.default;
  const buscar = async () => {
    const r = await comTempo(FN + "site-dobra?path=" + encodeURIComponent(p), 3000);
    if (!r.ok) return null;
    const j = await r.json();
    await cache.put(chave, new Response(JSON.stringify(j), { headers: { "content-type": "application/json", "cache-control": "public, max-age=600", "x-uh-em": String(Date.now()) } }));
    return j;
  };
  const salvo = await cache.match(chave);
  if (salvo) {
    const idade = Date.now() - Number(salvo.headers.get("x-uh-em") || 0);
    if (idade > 60_000) ctx.waitUntil(buscar().catch(() => null));
    return salvo.json();
  }
  const tarefa = buscar().catch(() => null);
  ctx.waitUntil(tarefa);
  return Promise.race([tarefa, new Promise((ok) => setTimeout(() => ok(null), ESPERA_DOBRA))]);
}

function caminhoDobra(url) {
  const p = url.pathname;
  if (p === "/") return p; // capa da home (igual para qualquer parâmetro de anúncio)
  if (p === "/busca") return url.search ? null : p; // só a busca padrão, sem filtros
  return /^(\/c\/[^/]+)?\/(em-foco|campanha)\/[^/]+\/?$/.test(p) ? p : null;
}

export default {
  async fetch(request, env, ctx) {
    try {
      if (request.method !== "GET") return fetch(request);
      const url = new URL(request.url);
      const ua = request.headers.get("user-agent") || "";
      if (BOT_UA.test(ua)) return SSR_PATH.test(url.pathname) ? paraRobo(request, url) : fetch(request);

      const p = caminhoDobra(url);
      const [pagina, d] = await Promise.all([htmlOrigem(request, url, ctx), p ? dobra(p, ctx).catch(() => null) : null]);
      if (!d || !(d.head || d.pre || d.script)) return pagina;

      let rw = new HTMLRewriter();
      if (d.head) rw = rw.on("head", { element(e) { e.append(d.head, { html: true }); } });
      if (d.script) rw = rw.on("head", { element(e) { e.append(`<script>${d.script}</script>`, { html: true }); } });
      if (d.pre) {
        rw = rw
          .on("#root", { element(e) { e.before(d.pre, { html: true }); } })
          .on("#uh-splash", { element(e) { e.remove(); } })
          .on("link[data-uh-css]", { element(e) { e.setAttribute("rel", "stylesheet"); e.removeAttribute("as"); e.removeAttribute("onload"); } });
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
