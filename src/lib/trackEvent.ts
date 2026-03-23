import { supabase } from "@/integrations/supabase/client";
import { getVisitorId } from "./visitor";
import { getSessionId, getCorretorRef, getCorretorRefId } from "./session";

type EventTipo =
  | "imovel_visualizado"
  | "busca_realizada"
  | "whatsapp_click"
  | "formulario_enviado";

interface TrackEventParams {
  tipo: EventTipo;
  imovel_slug?: string | null;
  imovel_titulo?: string | null;
  busca_query?: string | null;
  busca_filtros?: Record<string, unknown> | null;
}

/**
 * Fire-and-forget event tracking.
 * Inserts into lead_events and, when a corretor is active,
 * also creates a real-time notification for the corretor.
 */
export async function trackEvent(params: TrackEventParams) {
  try {
    const visitor_id = getVisitorId();
    const session_id = getSessionId();
    const corretor_slug = getCorretorRef();
    const corretor_id = getCorretorRefId();

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
    });

    // Real-time notification for corretor on high-value events
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
