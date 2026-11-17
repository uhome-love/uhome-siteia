// Primeira dobra pronta para o HTML: a borda (Worker "uhome-previa") injeta o que esta função devolve.
// GET ?path=/busca | /em-foco/:slug | /campanha/:slug  →  { head, pre, script }
// Qualquer erro devolve campos vazios: a página segue normal (fail open).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const LISTING_COLUMNS = "id,slug,tipo,finalidade,status,destaque,preco,preco_condominio,area_total,area_util,quartos,banheiros,vagas,bairro,cidade,uf,publicado_em,foto_principal,fase";
const LUZES = "/__l5e/assets-v1/39a8179b-4b31-44ad-abaf-1c29eb35cfec/luzes_varal_faixa_larga.svg";
const SELO = "/__l5e/assets-v1/f588f789-17e9-4ae1-b6c7-fcb6b4fb0e8c/selo_natal_chave_de_ouro.svg";

const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const json = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

/** Igual a src/lib/searchImages.ts */
function searchImageUrl(src: string, width: number): string {
  try {
    const o = new URL(src);
    if (o.protocol !== "https:" || o.hostname === "uhome.com.br" || o.hostname.endsWith(".uhome.com.br") || o.pathname.startsWith("/__l5e/")) return src;
    const u = new URL("https://wsrv.nl/");
    u.search = new URLSearchParams({ url: src, w: String(width), output: "webp", q: "82", withoutenlargement: "" }).toString();
    return u.toString();
  } catch { return src; }
}

async function busca() {
  const [{ data }, { data: count }] = await Promise.all([
    supabase.from("imoveis").select(LISTING_COLUMNS)
      .eq("status", "disponivel").eq("finalidade", "venda").not("fotos", "is", null).neq("fotos", "[]")
      .not("foto_principal", "is", null).neq("foto_principal", "").eq("cidade", "Porto Alegre")
      .order("publicado_em", { ascending: false }).range(0, 39),
    supabase.rpc("count_imoveis", { p_cidade: "Porto Alegre" }),
  ]);
  const rows = data ?? [];
  let head = "";
  const foto = rows[0]?.foto_principal as string | undefined;
  if (foto) {
    const set = searchImageUrl(foto, 768) === foto ? "" : [480, 768, 1024, 1280].map(w => `${searchImageUrl(foto, w)} ${w}w`).join(", ");
    head = set
      ? `<link rel="preload" as="image" fetchpriority="high" href="${esc(searchImageUrl(foto, 768))}" imagesrcset="${esc(set)}" imagesizes="(max-width: 639px) calc(100vw - 24px), 400px">`
      : `<link rel="preload" as="image" fetchpriority="high" href="${esc(foto)}">`;
  }
  return { head, pre: "", script: rows.length ? `window.__UH_BUSCA__=${json({ rows, count: count ?? rows.length })};` : "" };
}

async function produto(slug: string) {
  const { data: p } = await supabase.from("produtos_foco").select("galeria, capa_url").eq("slug", slug).eq("ativo", true).maybeSingle();
  const f = (Array.isArray(p?.galeria) && p!.galeria[0]) || (p?.capa_url ? { url: p.capa_url } : null);
  if (!f?.url) return { head: "", pre: "", script: "" };
  const head = f.url_mobile
    ? `<link rel="preload" as="image" fetchpriority="high" href="${esc(f.url)}" imagesrcset="${esc(`${f.url_mobile} 800w, ${f.url} 1600w`)}" imagesizes="(min-width: 1152px) 1152px, 100vw">`
    : `<link rel="preload" as="image" fetchpriority="high" href="${esc(f.url)}">`;
  return { head, pre: "", script: "" };
}

function hojeSP(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

const ICON = 'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const BTN = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 active:scale-[0.97]";

async function campanha(slug: string) {
  const { data: c } = await supabase.from("campanhas").select("subtitulo, descricao, inicio, fim, config").eq("slug", slug).eq("ativo", true).maybeSingle();
  if (!c) return { head: "", pre: "", script: "" };
  const d = hojeSP();
  if ((c.inicio && d < c.inicio) || (c.fim && d > c.fim)) return { head: "", pre: "", script: "" };
  const b = c.config?.black;
  const black = !!b && d >= b.inicio && d <= b.fim;
  const fim = black ? b.fim : c.fim;
  const ms = fim ? Math.max(0, new Date(`${fim}T23:59:59-03:00`).getTime() - Date.now()) : 0;
  const dias = Math.floor(ms / 86_400_000), horas = Math.floor((ms / 3_600_000) % 24), min = Math.floor((ms / 60_000) % 60);
  const ouro = (t: string) => `<span class="bg-clip-text text-transparent" style="background-image: var(--natal-gold-grad);">${t}</span>`;
  const tema = black ? "bg-noir text-noir-foreground" : "bg-[radial-gradient(ellipse_at_top_right,hsl(var(--natal-glow)),hsl(var(--natal))_45%,hsl(var(--natal-deep)))] text-natal-foreground";
  const pre = `<div id="uh-pre"><main class="pt-14"><section class="relative overflow-hidden ${tema}"><div aria-hidden="true" class="pointer-events-none h-[30px] w-full bg-repeat-x bg-contain " style="background-image: url(&quot;${LUZES}&quot;); background-position: left top;"></div><div class="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10"><img src="${SELO}" alt="Natal Chave de Ouro" class="h-10 w-auto sm:h-12"><p class="mt-4 inline-flex items-center gap-2 rounded-full border border-natal-gold/40 px-4 py-1.5 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-natal-gold sm:text-xs"><svg ${ICON} class="lucide lucide-key-round h-3.5 w-3.5"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></svg> ${black ? "Semana Black · 23 a 29/11" : "Campanha de Natal Uhome"}</p><h1 class="mt-5 max-w-3xl font-natal text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">${black ? `Black Natal ${ouro("Uhome")}` : `Natal ${ouro("Chave de Ouro")}`}</h1><p class="mt-4 max-w-xl font-body text-lg opacity-90">${esc(c.subtitulo)}</p><p class="mt-3 max-w-xl font-body text-sm opacity-75">${esc(c.descricao)}</p><div class="mt-6 flex flex-wrap gap-3"><a href="#contato" class="${BTN} hover:shadow-[0_4px_16px_rgba(91,108,249,0.35)] hover:-translate-y-px h-12 px-8 bg-natal-gold text-natal-deep hover:bg-natal-gold/90"><svg ${ICON} class="lucide lucide-calendar-days"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg> Agendar visita</a><a href="#contato" class="${BTN} h-12 px-8 border border-natal-gold/40 text-natal-foreground hover:bg-natal-foreground/10 hover:text-natal-foreground">Receber informações</a></div><p class="mt-5 flex items-center gap-2 font-body text-sm text-natal-gold"><svg ${ICON} class="lucide lucide-clock3 h-4 w-4"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16.5 12"></polyline></svg> Faltam <span class="tabular-nums font-semibold">${dias} dias · ${String(horas).padStart(2, "0")}h · ${String(min).padStart(2, "0")}min</span></p></div></section></main></div>`;
  return { head: `<link rel="preload" as="image" href="${SELO}">`, pre, script: "" };
}

Deno.serve(async (req) => {
  const vazio = { head: "", pre: "", script: "" };
  let corpo = vazio, ttl = 120;
  try {
    const bruto = new URL(req.url).searchParams.get("path") ?? "";
    const corretor = /^\/c\/[^/]+/.test(bruto);
    const path = bruto.replace(/^\/c\/[^/]+/, "").replace(/\/$/, "") || "/";
    if (path === "/busca") corpo = await busca();
    else if (path.startsWith("/em-foco/")) { corpo = await produto(decodeURIComponent(path.slice(9))); ttl = 600; }
    else if (path.startsWith("/campanha/") && !corretor) { corpo = await campanha(decodeURIComponent(path.slice(10))); ttl = 60; }
  } catch (e) {
    console.error("site-dobra", e);
    corpo = vazio; ttl = 30;
  }
  return new Response(JSON.stringify(corpo), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${ttl}`, "access-control-allow-origin": "*" },
  });
});
