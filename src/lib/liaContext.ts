// Contexto do visitante enviado à LIA e ao CRM: páginas vistas, imóveis, busca, origem do anúncio.
import { getTrackingData } from "@/lib/session";

const TRAIL_KEY = "uhome_lia_paginas";
const GCLID_KEY = "uhome_gclid";

/** Guarda o gclid (clique do Google Ads) da primeira visita com anúncio. */
export function captureGclid(search = window.location.search) {
  const g = new URLSearchParams(search).get("gclid");
  if (g) {
    try { localStorage.setItem(GCLID_KEY, g); } catch { /* silencioso */ }
  }
}

export function getGclid(): string | null {
  try { return localStorage.getItem(GCLID_KEY); } catch { return null; }
}

/** Registra a página na trilha da sessão (sem repetir a última, máximo 20). */
export function registrarPagina(path: string) {
  try {
    const arr: string[] = JSON.parse(sessionStorage.getItem(TRAIL_KEY) || "[]");
    if (arr[arr.length - 1] !== path) arr.push(path);
    sessionStorage.setItem(TRAIL_KEY, JSON.stringify(arr.slice(-20)));
  } catch { /* silencioso */ }
}

function lerJSON<T>(storage: Storage, key: string, fallback: T): T {
  try { const v = storage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}

export function montarContextoLia(pathname: string, corretorSlug: string | null) {
  const t = getTrackingData();
  const ctx: Record<string, unknown> = {
    pagina: pathname,
    paginas: lerJSON<string[]>(sessionStorage, TRAIL_KEY, []),
    corretor_slug: corretorSlug,
    gclid: getGclid(),
    ...t,
  };
  const vistos = lerJSON<unknown[]>(localStorage, "imoveis_vistos", []);
  if (Array.isArray(vistos)) {
    ctx.imoveis_vistos = vistos
      .slice(-8)
      .map((v: any) => (typeof v === "string" ? v : v?.slug || v?.titulo))
      .filter(Boolean);
  }
  const h1 = document.querySelector("h1")?.textContent?.trim();
  const imovel = pathname.match(/\/imovel\/([^/?#]+)/);
  if (imovel) {
    const preco = document.querySelector("[data-price]")?.getAttribute("data-price");
    const codigo = imovel[1].match(/(\d+-UH)$/i)?.[1];
    ctx.imovel = { slug: imovel[1], titulo: h1, preco: preco ? Number(preco) : undefined, codigo };
  }
  if (/\/em-foco\/[^/]+/.test(pathname) && h1) ctx.produto = h1;
  if (/\/campanha\//.test(pathname)) ctx.campanha = h1 || "Natal Chave de Ouro";
  if (pathname.startsWith("/investir-studios")) ctx.campanha = "Studios Cyrela para investir (condição de fim de ano)";
  if (pathname.startsWith("/busca")) ctx.ultima_busca = window.location.search.slice(1) || "busca geral";
  return ctx;
}
