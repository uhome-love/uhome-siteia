// Passos do funil nas páginas que recebem anúncio. Leve: tudo adiado, sem dados pessoais,
// no máximo 1 vez por sessão e por página.
import { getSessionId } from "./session";
import { trackEvent, type FunilTipo } from "@/lib/trackEvent";

const PAGINAS = /^(\/c\/[^/]+)?(\/em-foco\/[^/]+|\/campanha\/natal-chave-de-ouro|\/investir-studios|\/busca)\/?$/;

export function ehPaginaAnuncio(path: string): boolean {
  return PAGINAS.test(path);
}

/** true na primeira vez da sessão para este tipo+página; marca como gravado. */
export function primeiraVez(tipo: string, path: string, store: Pick<Storage, "getItem" | "setItem"> = sessionStorage): boolean {
  const k = `uhome_funil:${getSessionId()}:${tipo}:${path}`;
  try {
    if (store.getItem(k)) return false;
    store.setItem(k, "1");
    return true;
  } catch { return false; }
}

const ocioso = (fn: () => void) =>
  ((window as any).requestIdleCallback ? (window as any).requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1500));

export function funilEvento(tipo: FunilTipo, dados: Record<string, unknown> = {}): void {
  try {
    const path = window.location.pathname;
    if (!ehPaginaAnuncio(path) || !primeiraVez(tipo, path)) return;
    ocioso(() => { trackEvent({ tipo, dados }); });
  } catch { /* nunca atrapalha a página */ }
}

/** Instala uma vez: abertura de página, rolagem até a metade e primeiro toque em formulário. */
export function instalarFunilAnuncio(): void {
  if (typeof window === "undefined" || (window as any).__uhomeFunil) return;
  (window as any).__uhomeFunil = true;

  let ultimo = "";
  const verPagina = () => {
    const p = window.location.pathname;
    if (p === ultimo) return;
    ultimo = p;
    funilEvento("pagina_anuncio_vista");
  };
  for (const m of ["pushState", "replaceState"] as const) {
    const orig = history[m].bind(history);
    history[m] = ((...a: Parameters<History["pushState"]>) => { const r = orig(...a); setTimeout(verPagina, 0); return r; }) as History["pushState"];
  }
  window.addEventListener("popstate", () => setTimeout(verPagina, 0));
  verPagina();

  let agendado = false;
  window.addEventListener("scroll", () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => {
      agendado = false;
      const d = document.documentElement;
      if (window.scrollY + window.innerHeight >= d.scrollHeight / 2 && d.scrollHeight > window.innerHeight * 1.2) funilEvento("rolagem_50");
    });
  }, { passive: true });

  document.addEventListener("focusin", (e) => {
    const t = e.target as HTMLElement | null;
    if (t?.matches?.("input, textarea, select") && t.closest("form")) funilEvento("formulario_iniciado", { formulario: t.closest("form")?.getAttribute("data-formulario") || t.closest("form")?.id || window.location.pathname });
  }, true);
}
