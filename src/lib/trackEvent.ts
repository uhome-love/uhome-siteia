import { supabase } from "@/integrations/supabase/client";
import { getVisitorId } from "./visitor";
import { getSessionId, getCorretorRef, getCorretorRefId, getLeadIdentity, getTrackingData } from "./session";
import { fonteLegivel, classificarDevice } from "./leadTracking";

const UHOMESALES_SITE_EVENTS_URL =
  "https://hunbxqzhvuemgntklyzb.supabase.co/functions/v1/site-events";

// UhomeSales anon key — public/publishable, safe to embed
const UHOMESALES_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1bmJ4cXpodnVlbWdudGtseXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODI2NTUsImV4cCI6MjA4ODE1ODY1NX0.giwij9kxlColZF21iBHZO8in86kGNJIHWXHqtdik6oY";

type EventTipo =
  | "imovel_visualizado"
  | "busca_realizada"
  | "whatsapp_click"
  | "formulario_enviado"
  | FunilTipo;

export type FunilTipo = "pagina_anuncio_vista" | "rolagem_50" | "galeria_aberta" | "formulario_iniciado";

/** Origem e aparelho, sem nenhum dado pessoal. */
export function origemResumo() {
  const t = getTrackingData() as Record<string, any>;
  return {
    fonte: fonteLegivel(t, getCorretorRef()),
    utm_source: t.utm_source || null,
    utm_campaign: t.utm_campaign || null,
    tem_gclid: !!(t.gclid || t.gbraid || t.wbraid),
    device: classificarDevice(navigator.userAgent, window.innerWidth),
  };
}

interface TrackEventParams {
  tipo: EventTipo;
  imovel_slug?: string | null;
  imovel_titulo?: string | null;
  imovel_bairro?: string | null;
  imovel_preco?: number | null;
  busca_query?: string | null;
  busca_filtros?: Record<string, unknown> | null;
}

/**
 * Fire-and-forget: POST event to UhomeSales CRM site-events edge function.
 * Runs async, never blocks the caller.
 */
function postToCRM(params: TrackEventParams, identidade: { telefone?: string; email?: string }) {
  if (!UHOMESALES_ANON_KEY) return; // skip if key is empty
  // Só vale para o CRM quando sabemos quem é a pessoa; visitante anônimo fica só no site.
  if (!identidade.telefone && !identidade.email) return;

  const tiposCRM: Record<string, string> = {
    'busca_realizada': 'buscou_ia',
    'imovel_visualizado': 'visitou_imovel',
    'imovel_favoritado': 'favoritou_imovel',
    'whatsapp_click': 'clicou_contato',
    'simulador_aberto': 'abriu_simulador',
  };
  const tipoCRM = tiposCRM[params.tipo] || params.tipo;

  const body = {
    tipo: tipoCRM,
    dados: {
      imovel_codigo: params.imovel_slug || null,
      imovel_titulo: params.imovel_titulo || null,
      imovel_bairro: params.imovel_bairro || null,
      imovel_preco: params.imovel_preco || null,
    },
    identidade: {
      telefone: identidade.telefone || null,
      email: identidade.email || null,
    },
    pagina: window.location.href,
  };


  fetch(UHOMESALES_SITE_EVENTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: UHOMESALES_ANON_KEY,
      Authorization: `Bearer ${UHOMESALES_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      console.log('[CRM POST] response:', res.status, res.statusText);
      if (!res.ok) res.text().then((t) => console.warn('[CRM POST] error body:', t));
    })
    .catch((err) => {
      console.warn('[CRM POST] fetch error:', err);
    });
}

/**
 * Fire-and-forget event tracking.
 * Inserts into lead_events and, when a corretor is active,
 * also creates a real-time notification for the corretor.
 * Additionally POSTs to UhomeSales CRM site-events.
 */
const FUNIL = new Set<string>(["pagina_anuncio_vista", "rolagem_50", "galeria_aberta", "formulario_iniciado"]);

export async function trackEvent(params: TrackEventParams) {
  try {
    const visitor_id = getVisitorId();
    const session_id = getSessionId();
    const corretor_slug = getCorretorRef();
    const corretor_id = getCorretorRefId();
    const identidade = getLeadIdentity();
    const funil = FUNIL.has(params.tipo);

    // 1. Local insert (lead_events)
    await (supabase as any).from("lead_events").insert({
      visitor_id,
      session_id,
      tipo: params.tipo,
      corretor_slug: corretor_slug || null,
      corretor_id: corretor_id || null,
      pagina: window.location.href,
      imovel_slug: params.imovel_slug || null,
      imovel_titulo: params.imovel_titulo || null,
      busca_query: params.busca_query || null,
      busca_filtros: params.busca_filtros || null,
      origem: origemResumo(),
      identidade: !funil && (identidade.telefone || identidade.email)
        ? { telefone: identidade.telefone || null, email: identidade.email || null }
        : null,
    });

    if (funil) return; // passos do funil ficam só no site
    // 2. Async POST to UhomeSales CRM (non-blocking)
    postToCRM(params, identidade);

    // 3. Real-time notification for corretor on high-value events
    if (
      corretor_id &&
      (params.tipo === "imovel_visualizado" || params.tipo === "whatsapp_click")
    ) {
      const titulo =
        params.tipo === "whatsapp_click"
          ? "Lead clicou no WhatsApp!"
          : "Lead está vendo um imóvel";
      const mensagem = params.imovel_titulo
        ? `Alguém está vendo "${params.imovel_titulo}" agora.`
        : "Um visitante está navegando no site pelo seu link.";

      await (supabase as any).from("notificacoes").insert({
        user_id: corretor_id,
        tipo: params.tipo === "whatsapp_click" ? "whatsapp_click" : "visitante_no_site",
        titulo,
        mensagem,
        imovel_slug: params.imovel_slug || null,
        lida: false,
      });
    }
  } catch {
    // Silent — never block user flow
  }
}
