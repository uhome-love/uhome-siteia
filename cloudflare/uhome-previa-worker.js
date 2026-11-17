// Worker "uhome-previa": entrega a prévia certa para robôs de link (WhatsApp, Facebook...).
// Pessoas e robôs de busca passam direto. Qualquer erro: página normal (fail open).
const FN = "https://huigglwvvzuwwyqvpmec.supabase.co/functions/v1/ssr-render?path=";
const BOTS = /whatsapp|facebookexternalhit|facebot|meta-externalagent|instagram|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|pinterest|skypeuripreview/i;

export default {
  async fetch(request, env, ctx) {
    try {
      const ua = request.headers.get("user-agent") || "";
      if (request.method !== "GET" || !BOTS.test(ua)) return fetch(request);
      const url = new URL(request.url);
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3000);
      const r = await fetch(FN + encodeURIComponent(url.pathname), {
        signal: ctrl.signal,
        cf: { cacheTtl: 600, cacheEverything: true },
      });
      clearTimeout(t);
      if (!r.ok) return fetch(request);
      return new Response(r.body, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=600", "x-uhome-previa": "1" },
      });
    } catch (e) {
      return fetch(request);
    }
  },
};
