import { supabase } from "@/integrations/supabase/client";
import { getVisitorId } from "./visitor";
import { getSessionId, getCorretorRef, getCorretorRefId, getLeadIdentity } from "./session";

const UHOMESALES_SITE_EVENTS_URL =
  "https://hunbxqzhvuemgntklyzb.supabase.co/functions/v1/site-events";

// UhomeSales anon key — public/publishable, safe to embed
const UHOMESALES_ANON_KEY =
  "COLE_A_ANON_KEY_AQUI";

type EventTipo =
  | "imovel_visualizado"
  | "busca_realizada"
  | "whatsapp_click"
  | "formulario_enviado";

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
  if (UHOMESALES_ANON_KEY === "COLE_A_ANON_KEY_AQUI") return; // skip until key is set

  const body = {
    tipo: params.tipo,
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
  }).catch(() => {
    // Silent — CRM sync must never block the user
  });
}

/**
 * Fire-and-forget event tracking.
 * Inserts into lead_events and, when a corretor is active,
 * also creates a real-time notification for the corretor.
 * Additionally POSTs to UhomeSales CRM site-events.
 */
export async function trackEvent(params: TrackEventParams) {
  try {
    const visitor_id = getVisitorId();
    const session_id = getSessionId();
    const corretor_slug = getCorretorRef();
    const corretor_id = getCorretorRefId();
    const identidade = getLeadIdentity();

    // 1. Local insert (lead_events)
    await (supabase as any).from("lead_events").insert({
      visitor_id,
      session_id,
      tipo: params.tipo,
      corretor_slug: corretor_slug || null,
      corretor_id: corretor_id || null,
      pagina: window.location.pathname,
      imovel_slug: params.imovel_slug || null,
      imovel_titulo: params.imovel_titulo || null,
      busca_query: params.busca_query || null,
      busca_filtros: params.busca_filtros || null,
      identidade: (identidade.telefone || identidade.email)
        ? { telefone: identidade.telefone || null, email: identidade.email || null }
        : null,
    });

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
