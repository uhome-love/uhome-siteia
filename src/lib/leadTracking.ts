// Rastreamento enviado em todo lead ao CRM: primeira visita (UTM, cliques de anúncio, referrer),
// página/formulário da conversão, aparelho e um resumo do comportamento do visitante.
import { canTrack } from "./consent";
import { getSessionId } from "./session";
import { safePage } from "./journeyIdentity";
import { origins } from "./journeyIdentity";
import { origemRef } from "../../supabase/functions/_shared/pedidos";
import { getTrackingData, classifyOrigemCanal, getCorretorRef } from "@/lib/session";

export const FORMULARIO_LABELS: Record<string, string> = {
  detalhe_sidebar: "Formulário da página do imóvel",
  detalhe_mobile_sticky: "Barra fixa do imóvel (celular)",
  sticky_cta: "Barra fixa do imóvel",
  busca_cta: "Cartão de contato da busca",
  floating_whatsapp: "Botão flutuante do WhatsApp",
  exit_intent: "Pop-up de saída",
  retargeting_popup: "Pop-up de retorno",
  banner_corretor: "Banner do corretor",
  agendamento_visita: "Agendamento de visita",
  empreendimento_lead: "Formulário do empreendimento",
  lead_inline: "Formulário na página",
  hero_form: "Formulário do topo",
  busca_alerta: "Alerta de busca",
  alerta_busca_modal: "Alerta de busca",
  wizard_onboarding: "Cadastro guiado",
  lia_chat: "Conversa com a LIA",
  lp_studios_cyrela: "Formulário Studios Cyrela",
};

export function nomeFormulario(origem: string, informado?: string): string {
  if (informado) return informado;
  return FORMULARIO_LABELS[origem] ?? origem.replace(/_/g, " ");
}

export function classificarDevice(ua: string, largura: number): "mobile" | "tablet" | "desktop" {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "mobile";
  if (largura > 0 && largura < 768) return "mobile";
  if (largura > 0 && largura < 1024 && navigatorTouch()) return "tablet";
  return "desktop";
}
function navigatorTouch() {
  try { return typeof navigator !== "undefined" && (navigator.maxTouchPoints ?? 0) > 1; } catch { return false; }
}

/** Fonte legível para a tela do lead (nunca vazia). */
export function fonteLegivel(t: Record<string, any>, corretor?: string | null): string {
  if (corretor) return `Link do corretor (${corretor})`;
  const src = String(t.utm_source || "").toLowerCase();
  if (t.gclid || t.gbraid || t.wbraid || (src.includes("google") && t.utm_medium === "cpc")) {
    return t.utm_campaign ? `Google Ads — ${t.utm_campaign}` : "Google Ads";
  }
  if (t.fbclid || ["facebook", "fb", "instagram", "ig", "meta"].includes(src)) {
    const base = src.startsWith("i") ? "Instagram" : "Facebook/Instagram";
    return t.utm_campaign ? `${base} — ${t.utm_campaign}` : base;
  }
  const canal = classifyOrigemCanal(t);
  if (canal === "Direto") return "Acesso direto";
  if (canal === "Referral") {
    try { return `Indicação de ${new URL(t.referrer).hostname.replace(/^www\./, "")}`; } catch { return "Outro site"; }
  }
  return canal;
}

const VISITAS_KEY = "uhome_visitas";
/** Conta visitas (uma por sessão do navegador). Chamar uma vez na abertura do site. */
export function registrarVisita(): void { void canTrack("analytics").then(allowed => {
  if (!allowed) return;
  try {
    if (sessionStorage.getItem("uhome_visita_contada") === getSessionId()) return;
    sessionStorage.setItem("uhome_visita_contada", getSessionId());
    sessionStorage.setItem("uhome_sessao_inicio", String(Date.now()));
    const n = Number(localStorage.getItem(VISITAS_KEY) || "0") + 1;
    localStorage.setItem(VISITAS_KEY, String(n));
  } catch { /* silencioso */ }
}); }

function lerJSON<T>(s: Storage, k: string, f: T): T {
  try { const v = s.getItem(k); return v ? (JSON.parse(v) as T) : f; } catch { return f; }
}

function comportamento(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  try {
    out.numero_visitas = Number(localStorage.getItem(VISITAS_KEY) || "1");
    const ini = Number(sessionStorage.getItem("uhome_sessao_inicio") || "0");
    if (ini) out.tempo_no_site_min = Math.max(0, Math.round((Date.now() - ini) / 60000));
    const vistos = lerJSON<any[]>(localStorage, "imoveis_vistos", []);
    if (Array.isArray(vistos) && vistos.length) {
      out.imoveis_vistos = vistos.slice(-5).map((v) => (typeof v === "string" ? v : v?.titulo || v?.slug)).filter(Boolean);
    }
    const favs = lerJSON<any[]>(localStorage, "favoritos_anonimos", []);
    if (Array.isArray(favs) && favs.length) out.favoritos = favs.length;
    const paginas = lerJSON<string[]>(sessionStorage, "uhome_lia_paginas", []);
    const buscas = paginas.filter((p) => p.startsWith("/busca")).slice(-3);
    if (buscas.length) out.buscas = buscas;
    out.conversou_com_lia = lerJSON<unknown[]>(sessionStorage, "uhome_lia_conversa", []).length > 0;
    out.ja_enviou_contato_antes = Boolean(localStorage.getItem("uhome_lead_telefone") || localStorage.getItem("uhome_lead_email"));
  } catch { /* silencioso */ }
  return out;
}

/** Campos de rastreamento (colunas) + resumo para o `contexto` de cada lead. */
export function getLeadTracking(origem_componente: string, formulario?: string) {
  const t = getTrackingData() as Record<string, any>;
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const largura = typeof window !== "undefined" ? window.innerWidth : 0;
  const device = classificarDevice(ua, largura);
  const corretor = getCorretorRef();
  const colunas = {
    origem_ref: origemRef(origins().ultima_origem, corretor),
    pagina_url: safePage(),
    origem_componente,
    formulario: nomeFormulario(origem_componente, formulario),
    device,
    utm_source: t.utm_source || null,
    utm_medium: t.utm_medium || null,
    utm_campaign: t.utm_campaign || null,
    utm_content: t.utm_content || null,
    utm_term: t.utm_term || null,
    gclid: t.gclid || null,
    gbraid: t.gbraid || null,
    wbraid: t.wbraid || null,
    fbclid: t.fbclid || null,
    referrer: typeof t.referrer === "string" ? t.referrer : "",
    landing_url: t.landing_url || (t.landing_page ? `${window.location.origin}${t.landing_page}` : null),
  };
  const contexto = {
    primeira_origem: origins().primeira_origem,
    ultima_origem: origins().ultima_origem,
    rastreamento: {
      fonte: fonteLegivel(t, corretor),
      palavra_pesquisada: t.utm_term || null,
      primeira_visita_em: t.first_visit_at || null,
      ...comportamento(),
    },
  };
  return { colunas, contexto };
}

export interface CaptacaoInfo {
  tipo_imovel?: string | null; bairro?: string | null; cidade?: string | null; endereco?: string | null;
  valor_pretendido?: string | null; quartos?: number | null; area?: number | null; mensagem?: string | null;
  [k: string]: unknown;
}

/** Campos extras da captação de imóvel: rastreamento + dados do imóvel (vão ao CRM em dados_site.captacao). */
export function getCaptacaoTracking(origem_componente: string, formulario: string, info: CaptacaoInfo) {
  const { colunas, contexto } = getLeadTracking(origem_componente, formulario);
  const captacao = { finalidade: "venda", ...info };
  return {
    ...colunas,
    finalidade: "venda",
    cidade: info.cidade ?? null,
    endereco: info.endereco ?? null,
    quartos: info.quartos ?? null,
    area: info.area ?? null,
    dados_imovel: captacao,
    contexto: { ...contexto, captacao },
  };
}
