import { supabase } from "@/integrations/supabase/client";
import { getSessionId, getCorretorRef, getCorretorRefId } from "@/lib/session";
import { trackEvent } from "@/lib/trackEvent";

interface WhatsAppClickData {
  imovel_id?: string;
  imovel_titulo?: string;
  imovel_slug?: string;
  origem_pagina?: string;
}

/**
 * Track WhatsApp button clicks, especially when the user came via a corretor link.
 * Fire-and-forget — never blocks UI.
 */
export async function trackWhatsAppClick(data: WhatsAppClickData = {}) {
  try {
    const refSlug = getCorretorRef();
    const refId = getCorretorRefId();

    await (supabase as any).from('whatsapp_clicks').insert({
      session_id: getSessionId(),
      imovel_id: data.imovel_id || null,
      imovel_titulo: data.imovel_titulo || null,
      imovel_slug: data.imovel_slug || null,
      origem_pagina: data.origem_pagina || window.location.pathname,
      corretor_ref_id: refId || null,
      corretor_ref_slug: refSlug || null,
      origem_ref: refSlug ? 'link_corretor' : 'organico',
    });

    // Also track in lead_events + notify corretor
    trackEvent({
      tipo: "whatsapp_click",
      imovel_slug: data.imovel_slug,
      imovel_titulo: data.imovel_titulo,
    });
  } catch {
    // silent — never block user flow
  }
}
