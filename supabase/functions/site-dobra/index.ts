// Primeira dobra pronta para o HTML: a borda (Worker "uhome-seo-bot-handler") injeta o que esta função devolve.
// GET ?path=/ | /busca | /em-foco/:slug | /campanha/:slug  →  { head, pre, script }
// "pre" com data-uh-alvo: o index.html troca pelo app quando o mesmo trecho monta (sem piscar nem duplicar).
// Qualquer erro devolve campos vazios: a página segue normal (fail open).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import * as NOVO from "./moldes.ts";
import { HERO_FOCO_V2, HEADER_FOCO_V2 } from "./moldes-foco-v2.ts";
import { tituloFoco } from "../_shared/focoPresentation.ts";
import { NAV, NAV_BUSCA, HERO, BUSCA_TOPO, BUSCA_GRADE, CABECALHO_FOCO, BOTOES_FOCO } from "./moldes-legado.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const LISTING_COLUMNS = "id,slug,tipo,finalidade,status,destaque,preco,preco_condominio,area_total,area_util,quartos,banheiros,vagas,bairro,cidade,uf,publicado_em,foto_principal,fase";
const LUZES = "/__l5e/assets-v1/39a8179b-4b31-44ad-abaf-1c29eb35cfec/luzes_varal_faixa_larga.svg";
const SELO = "/__l5e/assets-v1/f588f789-17e9-4ae1-b6c7-fcb6b4fb0e8c/selo_natal_chave_de_ouro.svg";

const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const json = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

/** O Worker não precisa mudar: o HTML publicado decide, antes de pintar, qual molde usar. */
function compativel(corpo: Corpo): Corpo {
  let novo = corpo.pre;
  const pares = [[NAV_BUSCA, NOVO.NAV_BUSCA], [NAV, NOVO.NAV], [HERO, NOVO.HERO], [BUSCA_TOPO, NOVO.BUSCA_TOPO], [BUSCA_GRADE, NOVO.BUSCA_GRADE], [CABECALHO_FOCO, NOVO.CABECALHO_FOCO], [BOTOES_FOCO, NOVO.BOTOES_FOCO]];
  // Valores dinâmicos são conservados; apenas os fragmentos de estrutura mudam.
  const camps = corpo.script.match(/window\.__UH_DOBRA__=(.*?);/);
  let campanhas: Camp[] = [];
  try { campanhas = camps ? JSON.parse(camps[1]).campanhas ?? [] : []; } catch { /* sem seed */ }
  for (const [velho, atual] of pares) {
    let v = velho, n = atual;
    if (v.includes('{{DESTAQUE}}')) { v = v.replace('{{DESTAQUE}}', linkDestaque(campanhas)); n = n.replace('{{DESTAQUE}}', linkDestaque(campanhas)); }
    if (v.includes('{{COUNT}}')) { const count = corpo.script.match(/"count":(\d+)/)?.[1]; if (count) { v=v.replace('{{COUNT}}', Number(count).toLocaleString('pt-BR')); n=n.replace('{{COUNT}}', Number(count).toLocaleString('pt-BR')); } }
    if (!v.includes('{{TOTAL}}')) novo = novo.replace(v,n);
  }
  // Capa home: conserva o botão e o total vindos do cálculo atual.
  if (corpo.pre.includes('gasometro-mobile.webp')) {
    const total = corpo.pre.match(/([\d.]+\+) imóveis com curadoria/)?.[1] ?? 'milhares de';
    const botao = corpo.pre.match(/<div class="hidden sm:block">([\s\S]*?)<\/div><\/div><a href="#corretor-busca"/)?.[1] ?? '';
    const inicio = novo.indexOf('<section class="relative flex'), fim = novo.indexOf('</section>',inicio);
    if (inicio >= 0 && fim >= 0) novo = novo.slice(0,inicio) + NOVO.HERO.replace('{{TOTAL}}',total).replace('{{BOTAO}}',botao) + novo.slice(fim+10);
  }
  novo = novo.replace('<main class="pt-14">','<main class="pt-[var(--uh-header-height)]">');
  const v2 = corpo.preV2 ?? novo;
  return { ...corpo, pre: corpo.pre ? `<script>var v=document.querySelector('meta[name="uh-dobra-versao"]')?.content;document.write(v === 'site-v2' ? ${json(v2)} : v === 'site-v1' ? ${json(novo)} : ${json(corpo.pre)});</script>` : "" };
}

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

async function calcularBusca() {
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
  if (!rows.length) return { head: "", pre: "", script: "" };
  const camps = await campanhasAtivas();
  const total = (count as number | null) ?? rows.length;
  const pre = `<div id="uh-pre" data-uh-alvo="a[href^='/imovel/'] img" data-uh-max="639"><div class="flex flex-col bg-background overflow-x-hidden min-h-screen lg:h-screen">${NAV_BUSCA.replace("{{DESTAQUE}}", linkDestaque(camps))}${BUSCA_TOPO.replace("{{COUNT}}", total.toLocaleString("pt-BR"))}${BUSCA_GRADE}${rows.slice(0, 4).map(cardBusca).join("")}</div></div></div></div></div></div>`;
  return { head, pre, script: `window.__UH_BUSCA__=${json({ rows, count: total })};window.__UH_DOBRA__=${json({ campanhas: camps })};` };
}

// ---------- Campanhas (mesma consulta e regras de src/lib/produtosFoco.ts) ----------
const CAMP_SELECT = "id, slug, nome, tema, titulo, subtitulo, descricao, banner_url, inicio, fim, destaque_home, config";
const CHAVE = "/__l5e/assets-v1/69b933e0-abb0-4141-801c-e6ecdc4df4a8/chave_de_ouro.svg";
type Camp = { slug: string; nome: string; tema?: string; inicio?: string; fim?: string; destaque_home?: boolean; config?: any };

async function campanhasAtivas(): Promise<Camp[]> {
  const { data } = await supabase.from("campanhas").select(CAMP_SELECT).eq("ativo", true).order("ordem");
  const d = hojeSP();
  return ((data ?? []) as Camp[]).filter((c) => !(c.inicio && d < c.inicio) && !(c.fim && d > c.fim));
}
function blackDe(c?: Camp | null) {
  const b = c?.config?.black; if (!b) return false;
  const d = hojeSP(); return d >= b.inicio && d <= b.fim;
}
const destaqueDe = (camps: Camp[]) => camps.find((c) => c.destaque_home) ?? null;
const STAR = `<svg ${'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'} class="lucide lucide-star h-3.5 w-3.5 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>`;
const SPARKLES = `<svg ${'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'} class="lucide lucide-sparkles h-4 w-4"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>`;

/** Link "destaque" do menu (Navbar): campanha em destaque ou Uhome em Foco. */
function linkDestaque(camps: Camp[]) {
  const c = destaqueDe(camps);
  const base = "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 font-body text-[13px] font-semibold transition-colors text-foreground hover:bg-secondary";
  return c
    ? `<a class="${base}" href="/campanha/${esc(c.slug)}"><img src="${CHAVE}" alt="" class="h-3 w-auto">${esc(blackDe(c) ? "Black Natal" : c.nome)}<span class="h-1.5 w-1.5 rounded-full bg-natal-gold" aria-hidden="true"></span></a>`
    : `<a class="${base}" href="/em-foco">${STAR}Uhome em Foco</a>`;
}

// ---------- Home: capa pronta (HeroSection) ----------
async function calcularHome() {
  const [camps, { count }] = await Promise.all([
    campanhasAtivas(),
    supabase.from("imoveis").select("*", { count: "exact", head: true }).eq("status", "disponivel"),
  ]);
  const c = destaqueDe(camps), black = blackDe(c);
  const botao = c
    ? `<div class="mt-7 flex flex-wrap gap-3"><a class="inline-flex h-12 items-center gap-2.5 rounded-full border border-natal-gold/60 px-6 font-body text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${black ? "bg-noir text-noir-foreground" : "bg-natal text-natal-gold"}" href="/campanha/${esc(c.slug)}"><img src="${CHAVE}" alt="" class="h-3.5 w-auto">${esc(black ? "Black Natal Uhome" : c.nome)}<span class="hidden font-normal text-natal-foreground/80 sm:inline">· até ${black ? "29/11" : "18/12"}</span></a>`
    : `<div class="mt-7 flex flex-wrap gap-3"><a class="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-body text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]" href="/em-foco">${SPARKLES} Uhome em Foco</a>`;
  const total = count && count > 0 ? count : null;
  const totalTxt = total ? `${(Math.floor(total / 100) * 100).toLocaleString("pt-BR")}+` : "milhares de";
  const pre = `<div id="uh-pre" data-uh-alvo="[data-uh-capa]"><div class="min-h-screen bg-background">${NAV.replace("{{DESTAQUE}}", linkDestaque(camps))}<main>${HERO.replace("{{TOTAL}}", totalTxt).replace("{{BOTAO}}", botao)}</main></div></div>`;
  // Título em Montserrat 800 já na primeira pintura (mesmo tamanho do título do app).
  return { head: `<link rel="preload" href="/fonts/mont-800.woff2" as="font" type="font/woff2" crossorigin>`, pre, script: `window.__UH_DOBRA__=${json({ campanhas: camps, total })};` };
}

// ---------- Busca: 4 primeiros cards (SearchPropertyCard, celular) ----------
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const CLOCK = `<svg ${'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'} class="lucide lucide-clock h-3 w-3"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
const SELO_CLS: Record<string, string> = {
  novo: "bg-white/95 text-foreground font-semibold shadow-sm backdrop-blur-sm",
  "em-obras": "bg-amber-500/90 text-white font-semibold shadow-sm",
  lancamento: "bg-emerald-500/90 text-white font-semibold shadow-sm",
  "novo-imovel": "bg-sky-500/90 text-white font-semibold shadow-sm",
};
const HEART = `<button aria-label="Adicionar aos favoritos" class="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="transparent" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart h-5 w-5 transition-colors"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg></button>`;

// deno-lint-ignore no-explicit-any
function cardBusca(r: any, i: number) {
  const foto = r.foto_principal as string;
  const set = [480, 768, 1024, 1280].map((w) => `${searchImageUrl(foto, w)} ${w}w`).join(", ");
  const tipo = String(r.tipo ?? "");
  const Tipo = tipo.charAt(0).toUpperCase() + tipo.slice(1);
  const area = r.area_util ?? r.area_total ?? 0;
  const q = r.quartos ?? 0, v = r.vagas ?? 0;
  const stats = [area > 0 ? `${area} m²` : null, q > 0 ? `${q} quarto${q > 1 ? "s" : ""}` : null, v > 0 ? `${v} vaga${v > 1 ? "s" : ""}` : null].filter(Boolean);
  if (!stats.length && tipo) stats.push(Tipo);
  const selos: { l: string; s: string }[] = [];
  if (r.fase === "em_construcao") selos.push({ l: "Em obras", s: "em-obras" });
  else if (r.fase === "na_planta") selos.push({ l: "Lançamento", s: "lancamento" });
  else if (r.fase === "novo") selos.push({ l: "Novo", s: "novo-imovel" });
  if (r.publicado_em && Math.floor((Date.now() - new Date(r.publicado_em).getTime()) / 86400000) <= 7) selos.push({ l: "Novo no site", s: "novo" });
  const preco = r.preco > 0 ? BRL.format(r.preco) : "Consulte";
  const alt = `${Tipo}${q > 0 ? ` ${q} quarto${q > 1 ? "s" : ""}` : ""} — ${r.bairro ?? ""} - foto 1`;
  return `<a class="relative block w-full min-w-0 cursor-pointer select-none outline-none [&amp;_*]:outline-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] no-underline text-inherit" href="/imovel/${esc(r.slug)}"><div class="sm:hidden"><div class="relative overflow-hidden rounded-xl"><div class="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide" style="aspect-ratio: 4 / 3;"><div class="w-full shrink-0 snap-center"><div class="relative h-full w-full overflow-hidden" style="aspect-ratio: 4 / 3;"><img src="${esc(searchImageUrl(foto, 768))}" srcset="${esc(set)}" sizes="(max-width: 639px) calc(100vw - 24px), 400px" alt="${esc(alt)}" loading="eager" decoding="async" fetchpriority="${i === 0 ? "high" : "auto"}" class="h-full w-full object-cover transition-opacity duration-300 opacity-100" style="aspect-ratio: 4 / 3;" width="400" height="300"></div></div></div><div class="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">${selos.slice(0, 2).map((b) => `<span class="inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-body text-[11px] ${SELO_CLS[b.s]}">${b.s === "novo" ? CLOCK : ""}${b.l}</span>`).join("")}</div>${HEART}</div><div class="px-1 pt-2.5 pb-1"><p class="font-body text-[17px] font-extrabold leading-tight text-foreground">${preco}</p>${(r.preco_condominio ?? 0) > 0 ? `<p class="mt-0.5 font-body text-[12px] text-muted-foreground">Cond. R$ ${Number(r.preco_condominio).toLocaleString("pt-BR")}</p>` : ""}${stats.length ? `<p class="mt-1.5 font-body text-[13px] text-foreground">${esc(stats.join(" · "))}</p>` : ""}<p class="mt-0.5 font-body text-[12px] text-muted-foreground truncate">${esc(`${r.bairro}, ${r.cidade || "Porto Alegre"}`)}</p></div></div></a>`;
}

type Corpo = { head: string; pre: string; script: string; preV2?: string };
const CALCULAR: Record<string, () => Promise<Corpo>> = { busca: calcularBusca, home: calcularHome };

/** Primeira dobra pré-calculada: lê uma linha pronta (rápido); renova em segundo plano se passou de 4 min. */
async function preCalculado(chave: "busca" | "home") {
  const { data } = await supabase.from("site_dobra_cache").select("corpo, atualizado_em").eq("chave", chave).maybeSingle();
  const idade = data ? Date.now() - new Date(data.atualizado_em).getTime() : Infinity;
  if (idade > 4 * 60_000) {
    // @ts-ignore EdgeRuntime existe no ambiente das funções
    const tarefa = renovar(chave).catch((e) => console.error("renovar", chave, e));
    // @ts-ignore
    if (globalThis.EdgeRuntime?.waitUntil) globalThis.EdgeRuntime.waitUntil(tarefa);
  }
  // Mais velho que 15 min (ou inexistente): não entrega, a página busca sozinha.
  return data && idade <= 15 * 60_000 ? data.corpo as { head: string; pre: string; script: string } : { head: "", pre: "", script: "" };
}

async function renovar(chave: "busca" | "home") {
  const corpo = await CALCULAR[chave]();
  if (corpo.script) await supabase.from("site_dobra_cache").upsert({ chave, corpo, atualizado_em: new Date().toISOString() });
  return corpo;
}

// ---------- Em foco: capa pronta (ProdutoFocoPage, mesmas regras) ----------
const PROD_SELECT = "id, slug, nome, incorporadora, bairro, cidade, endereco, segmento, tipo, status_obra, entrega, preco_a_partir, resumo, capa_url, logo_url, galeria, plantas, mapas, ficha, ordem";
const PIN = `<svg ${'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'} class="lucide lucide-map-pin mt-1 h-4 w-4 shrink-0"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
const BTN_FOTO = "rounded-full bg-background/90 px-3 py-1.5 font-body text-xs font-semibold text-foreground shadow";

function precoFoco(v?: number | null) {
  if (!v) return null;
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`;
  if (v % 1000 === 0) return `R$ ${(v / 1000).toLocaleString("pt-BR")} mil`;
  return BRL.format(v);
}
const semProvisoria = (t?: string | null) => t ? t.replace(/\s*\((imagem |foto )?provis[óo]ria\)/gi, "").trim() : t;

async function produto(slug: string, corretor: boolean) {
  const [{ data: p }, camps] = await Promise.all([
    supabase.from("produtos_foco").select(PROD_SELECT).eq("slug", slug).eq("ativo", true).maybeSingle(),
    campanhasAtivas(),
  ]);
  const galeria = Array.isArray(p?.galeria) ? p!.galeria : [];
  const f = galeria[0] || (p?.capa_url ? { url: p.capa_url } : null);
  if (!p || !f?.url) return { head: "", pre: "", script: "" };
  const mob = f.url_mobile as string | undefined;
  const sizes = "(min-width: 1152px) 1152px, 100vw";
  const set = mob ? `${mob} 800w, ${f.url} 1600w` : "";
  const head = mob
    ? `<link rel="preload" as="image" fetchpriority="high" href="${esc(mob)}" imagesrcset="${esc(set)}" imagesizes="${sizes}">`
    : `<link rel="preload" as="image" fetchpriority="high" href="${esc(f.url)}">`;
  if (corretor) return { head, pre: "", script: "" };

  const natal = camps.find((c) => c.tema === "natal");
  const black = blackDe(natal);
  const fi = p.ficha ?? {};
  const plantas = Array.isArray(p.plantas) ? p.plantas : [], mapas = Array.isArray(p.mapas) ? p.mapas : [];
  const tip: any[] = fi.tipologias ?? [];
  const nums = tip.flatMap((t) => (t.area?.split("(")[0].match(/\d+(?:,\d+)?/g) ?? []).map((n: string) => parseFloat(n.replace(",", ".")))).filter((n: number) => n > 15);
  const fmtM = (n: number) => `${Math.round(n)} m²`;
  const area = nums.length ? [fmtM(Math.min(...nums)), ...(Math.max(...nums) - Math.min(...nums) >= 1 ? [fmtM(Math.max(...nums))] : [])] : [];
  const dorms = Array.from(new Set(tip.map((t) => t.dorm).filter((x) => !!x))).sort() as number[];
  const vagas = tip.find((t) => t.vagas)?.vagas as string | undefined;
  const chips = [
    dorms.length ? `${dorms.join(" e ")} dormitório${dorms.length > 1 || dorms[0] > 1 ? "s" : ""}` : fi.segmento?.split(" (")[0] ?? p.tipo,
    area.length ? (area.length > 1 ? `${area[0]} a ${area[area.length - 1]}` : area[0]) : null,
    vagas ? (/vaga/i.test(vagas) ? vagas : `${vagas} ${vagas === "1" ? "vaga" : "vagas"}`) : null,
    p.entrega ? `entrega ${String(p.entrega).toLowerCase()}` : null,
  ].filter(Boolean) as string[];
  const condGerais: string[] = natal?.config?.condicoes_gerais ?? [];
  const mostrar: Record<string, boolean> = { fotos: galeria.length > 0, plantas: tip.length > 0 || plantas.length > 0, pagamento: (fi.precos ?? []).length > 0 || !!natal };
  let cab = CABECALHO_FOCO;
  for (const [id, ok] of Object.entries(mostrar)) if (!ok) cab = cab.replace(new RegExp(`<a [^>]*href="#${id}"[^>]*>[^<]*</a>`, "g"), "");
  let botoes = BOTOES_FOCO;
  if (!(natal && !black)) { cab = cab.replace("bg-natal-gold text-natal-deep", "bg-primary text-primary-foreground"); botoes = botoes.replace("bg-natal-gold text-natal-deep", "bg-primary text-primary-foreground"); }
  const preco = precoFoco(p.preco_a_partir);
  const foto = `<button type="button" aria-label="Abrir foto 1 de ${esc(p.nome)}" class="w-full shrink-0 snap-center"><img src="${esc(f.url)}"${set ? ` srcset="${esc(set)}" sizes="${sizes}"` : ""} alt="${esc(semProvisoria(f.legenda) ?? p.nome)}" fetchpriority="high" loading="eager" decoding="async" width="1600" height="1200" class="aspect-[4/3] w-full object-cover sm:aspect-[16/7]"></button>`;
  const capa = `<div class="relative overflow-hidden bg-muted sm:rounded-2xl"><div class="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]">${foto}</div>`
    + (natal ? `<a href="/campanha/${esc(natal.slug)}" class="absolute left-4 top-4 rounded-full px-3 py-1 font-body text-xs font-bold ${black ? "bg-noir text-noir-foreground" : "bg-natal-red text-natal-foreground"}">${black ? "Black Natal até 29/11" : "Condição de Natal até 18/12"}</a>` : "")
    + (galeria.length > 1 ? `<span class="absolute right-4 top-4 rounded-full bg-noir/70 px-2.5 py-1 font-body text-xs font-semibold text-noir-foreground">1/${galeria.length}</span>` : "")
    + `<div class="absolute bottom-3 left-3 flex flex-wrap gap-2">${galeria.length ? `<button type="button" class="${BTN_FOTO}">${galeria.length} fotos</button>` : ""}${plantas.length ? `<button type="button" class="${BTN_FOTO}">Plantas</button>` : ""}${mapas.length ? `<button type="button" class="${BTN_FOTO}">Mapa</button>` : ""}</div></div>`;
  const info = `<div class="px-5 pt-6 sm:px-0"><p class="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">${esc([p.incorporadora, p.status_obra].filter(Boolean).join(" · "))}</p><h1 class="mt-1 font-heading text-3xl font-bold text-foreground sm:text-5xl">${esc(p.nome)}</h1><p class="mt-2 flex items-start gap-1.5 font-body text-base text-muted-foreground">${PIN}${esc([p.bairro, p.cidade].filter(Boolean).join(", "))}</p>`
    + (fi.frase ? `<p class="mt-2 font-body text-lg font-semibold text-foreground">${esc(fi.frase[0].toUpperCase() + fi.frase.slice(1))}</p>` : "")
    + (chips.length ? `<ul class="mt-4 flex flex-wrap gap-2">${chips.map((c) => `<li class="rounded-full border border-border px-3 py-1 font-body text-sm text-foreground">${esc(c)}</li>`).join("")}</ul>` : "")
    + `<div class="mt-5 flex flex-wrap items-end justify-between gap-4"><div>${preco ? `<p class="font-heading text-3xl font-bold text-foreground sm:text-4xl"><span class="block font-body text-xs font-normal uppercase tracking-wider text-muted-foreground">a partir de</span>${esc(preco)}</p>` : ""}${natal && condGerais[0] ? `<p class="mt-1 font-body text-sm font-semibold text-primary">${esc(condGerais[0])}</p>` : ""}</div>${botoes}</div></div>`;
  const pre = `<div id="uh-pre" data-uh-alvo="[data-uh-capa]"><div class="min-h-screen bg-background pb-24 lg:pb-0">${cab}<main><section class="mx-auto max-w-6xl sm:px-8 sm:pt-6">${capa}${info}</section></main></div></div>`;
  const fotosV2 = galeria.slice(0, 5).map((g: any, i: number) => `<button type="button" aria-label="Abrir foto ${i + 1} de ${esc(p.nome)}" class="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold foco-photo ${i === 0 ? "foco-photo-main" : ""}"><img src="${esc(g.url)}"${g.url_mobile ? ` srcset="${esc(g.url_mobile)} 800w, ${esc(g.url)} 1600w" sizes="${i === 0 ? "(min-width:1024px) 640px, 100vw" : "(min-width:1024px) 320px, 100vw"}"` : ""} alt="${esc(g.legenda ?? p.nome)}" width="1600" height="1200" loading="${i === 0 ? "eager" : "lazy"}" fetchpriority="${i === 0 ? "high" : "low"}" decoding="async"></button>`).join("");
  let heroV2 = HERO_FOCO_V2.replace("{{FOTOS}}", fotosV2).replaceAll("{{NOME}}", esc(p.nome)).replaceAll("{{N}}", String(galeria.length));
  if (!natal) heroV2 = heroV2.replace(/<span[^>]*>Condição de Natal até 18\/12<\/span>/g, "");
  const headingV2 = `<div data-foco-title="true" class="foco-heading"><p class="text-sm font-semibold text-muted-foreground">${esc(p.nome)} · ${esc(p.incorporadora)}</p><div class="mt-3 flex flex-wrap gap-2"><span class="rounded-md bg-secondary px-3 py-1 text-xs font-semibold">${esc(p.status_obra ?? "Empreendimento")}</span>${natal ? '<span class="rounded-md bg-natal-red px-3 py-1 text-xs font-semibold text-natal-foreground">Condição de Natal até 18/12</span>' : ''}</div><h1 class="mt-3 text-3xl font-extrabold leading-tight lg:text-4xl">${esc(tituloFoco(p))}</h1><p class="mt-3 flex items-center gap-2 text-sm text-muted-foreground">${PIN}${esc(p.bairro)}, ${esc(p.cidade)}</p></div>`;
  const preV2 = `<div id="uh-pre" data-uh-alvo="[data-uh-capa]"><div class="foco-page min-h-screen bg-background">${HEADER_FOCO_V2}<main class="foco-container">${headingV2}${heroV2}<div class="foco-columns"><div class="foco-content"></div></div></main></div></div>`;
  return { head, pre, preV2, script: `window.__UH_DOBRA__=${json({ campanhas: camps, produto: p })};` };
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
    const q = new URL(req.url).searchParams;
    const corpoPost = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const bruto = String(corpoPost.path ?? q.get("path") ?? "");
    const renovarJa = corpoPost.renovar === true || q.get("renovar") === "1";
    const corretor = /^\/c\/[^/]+/.test(bruto);
    const path = bruto.replace(/^\/c\/[^/]+/, "").replace(/\/$/, "") || "/";
    if (renovarJa) { const [b] = await Promise.all([renovar("busca"), renovar("home")]); corpo = b; }
    else if (path === "/" && !corretor) corpo = await preCalculado("home");
    else if (path === "/busca") corpo = await preCalculado("busca");
    else if (path.startsWith("/em-foco/")) { corpo = await produto(decodeURIComponent(path.slice(9)), corretor); ttl = 600; }
    else if (path.startsWith("/campanha/") && !corretor) { corpo = await campanha(decodeURIComponent(path.slice(10))); ttl = 60; }
  } catch (e) {
    console.error("site-dobra", e);
    corpo = vazio; ttl = 30;
  }
  return new Response(JSON.stringify(compativel(corpo)), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${ttl}`, "access-control-allow-origin": "*" },
  });
});
