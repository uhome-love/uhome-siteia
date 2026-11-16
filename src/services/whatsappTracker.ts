import { getSessionId, getCorretorRef, getCorretorRefId, getLeadIdentity } from "@/lib/session";
import { getLeadTracking } from "@/lib/leadTracking";
import { trackEvent } from "@/lib/trackEvent";
import { trackClickWhatsapp } from "@/lib/gtag";

interface WhatsAppClickData {
  imovel_id?: string;
  imovel_titulo?: string;
  imovel_slug?: string;
  origem_pagina?: string;
  origem_componente?: string;
  url?: string;
}

let ultimoClique = 0;
export const LIMITE_WA_MS = 5000;
/** Limita a 1 registro por sessão a cada 5s (também entre abas, via sessionStorage). */
export function podeRegistrar(agora: number, store: Pick<Storage, "getItem" | "setItem"> | null = typeof sessionStorage !== "undefined" ? sessionStorage : null): boolean {
  let ult = ultimoClique;
  try { ult = Math.max(ult, Number(store?.getItem("uhome_wa_ultimo") || 0)); } catch { /* */ }
  if (agora - ult < LIMITE_WA_MS) return false;
  try { store?.setItem("uhome_wa_ultimo", String(agora)); } catch { /* */ }
  return true;
}

/** Visitante anônimo deste navegador (mesmo id usado ao vincular identidade). */
export function getVisitorId(): string {
  try {
    let v = localStorage.getItem("uhome_visitor_id");
    if (!v) { v = crypto.randomUUID(); localStorage.setItem("uhome_visitor_id", v); }
    return v;
  } catch { return "sem-storage"; }
}

/** Extrai número e texto de um link wa.me / api.whatsapp.com. */
export function lerLinkWhatsApp(url?: string): { destino: string | null; mensagem: string | null } {
  if (!url) return { destino: null, mensagem: null };
  try {
    const u = new URL(url, "https://x.invalid");
    const destino = u.pathname.replace(/\D/g, "") || u.searchParams.get("phone") || null;
    return { destino, mensagem: u.searchParams.get("text") };
  } catch { return { destino: null, mensagem: null }; }
}

/** Monta o registro do clique (rastreamento + identidade conhecida). */
export function montarClique(data: WhatsAppClickData) {
  const { colunas, contexto } = getLeadTracking(data.origem_componente || "whatsapp_botao", "Clique no WhatsApp");
  const { destino, mensagem } = lerLinkWhatsApp(data.url);
  const id = getLeadIdentity();
  let nome: string | null = null;
  try { nome = localStorage.getItem("uhome_lead_nome"); } catch { /* */ }
  const refSlug = getCorretorRef();
  return {
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    imovel_id: data.imovel_id || null,
    imovel_titulo: data.imovel_titulo || (typeof document !== "undefined" ? document.title : null),
    imovel_slug: data.imovel_slug || null,
    origem_pagina: data.origem_pagina || window.location.pathname,
    corretor_ref_id: getCorretorRefId() || null,
    corretor_ref_slug: refSlug || null,
    origem_ref: refSlug ? "link_corretor" : "organico",
    mensagem, destino,
    ...colunas,
    fonte: contexto.rastreamento.fonte,
    nome, telefone: id.telefone || null, email: id.email || null,
    contexto,
  };
}

/** Envio "dispara e esquece" com keepalive: nunca atrasa a abertura do WhatsApp. */
let pendente: { data: WhatsAppClickData; t: number; timer: ReturnType<typeof setTimeout> } | null = null;

export function trackWhatsAppClick(data: WhatsAppClickData = {}): void {
  // Chamadas sem link (dados do imóvel) aguardam o link real que abre logo em seguida.
  if (!data.url) {
    if (pendente) clearTimeout(pendente.timer);
    pendente = { data, t: Date.now(), timer: setTimeout(() => { const p = pendente; pendente = null; if (p) enviar(p.data); }, 1500) };
    return;
  }
  if (pendente && Date.now() - pendente.t < 1500) {
    clearTimeout(pendente.timer);
    data = { ...pendente.data, ...Object.fromEntries(Object.entries(data).filter(([, v]) => v)) };
    pendente = null;
  }
  enviar(data);
}

function enviar(data: WhatsAppClickData): void {
  try {
    const agora = Date.now();
    if (!podeRegistrar(agora)) return; // no máximo 1 clique por sessão a cada 5s
    ultimoClique = agora;
    const registro = montarClique(data);
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/rest/v1/whatsapp_clicks`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal" },
      body: JSON.stringify(registro),
    }).catch(() => { /* silencioso */ });
    trackEvent({ tipo: "whatsapp_click", imovel_slug: data.imovel_slug, imovel_titulo: data.imovel_titulo });
    trackClickWhatsapp({
      origem_componente: registro.origem_componente,
      origem_pagina: registro.origem_pagina,
      imovel_titulo: data.imovel_titulo,
      imovel_slug: data.imovel_slug,
    });
  } catch { /* nunca bloqueia */ }
}

const ehWhatsApp = (u: string) => /^(https?:)?\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(u) || u.startsWith("whatsapp:");

/** Captura qualquer botão/link de WhatsApp do site (links e window.open). Chamar uma vez. */
export function instalarRastreioWhatsApp(): void {
  if (typeof window === "undefined" || (window as any).__uhomeWa) return;
  (window as any).__uhomeWa = true;
  document.addEventListener("click", (e) => {
    const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (a && ehWhatsApp(a.href)) trackWhatsAppClick({ url: a.href, origem_componente: a.dataset.origem || "whatsapp_link" });
  }, true);
  const abrir = window.open.bind(window);
  window.open = ((url?: string | URL, ...rest: any[]) => {
    try { const s = String(url ?? ""); if (ehWhatsApp(s)) trackWhatsAppClick({ url: s, origem_componente: "whatsapp_botao" }); } catch { /* */ }
    return abrir(url as any, ...rest);
  }) as typeof window.open;
}
