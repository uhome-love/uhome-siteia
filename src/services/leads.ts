import { supabase } from "@/lib/supabaseLazy";
import { getSessionId, getTrackingData, classifyOrigemCanal, getCorretorRef, getCorretorRefId, setLeadIdentity, getUltimoEnvio } from "@/lib/session";
import { getVisitorId } from "@/lib/visitor";
import { postJourney, trackEvent } from "@/lib/trackEvent";
import { trackGenerateLead } from "@/lib/gtag";
import { getLeadTracking } from "@/lib/leadTracking";

interface LeadData {
  nome: string;
  telefone: string;
  email?: string;
  tipo_interesse?: string;
  imovel_id?: string;
  imovel_slug?: string;
  imovel_titulo?: string;
  imovel_bairro?: string;
  imovel_preco?: number;
  origem_pagina?: string;
  origem_componente: string;
  /** Nome legível do formulário (opcional; senão vem do origem_componente). */
  formulario?: string;
  /** Contexto livre (qualificação, campanha, clique do anúncio); o sync-to-crm escreve nas observações do CRM. */
  contexto?: Record<string, unknown>;
}

export async function submitLead(data: LeadData) {
  const tracking = getTrackingData();
  const session_id = getSessionId();
  const refSlug = getCorretorRef();

  // Resolve corretor ref to profile id
  let corretor_ref_id: string | null = getCorretorRefId();
  if (!corretor_ref_id && refSlug) {
    try {
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('slug_ref', refSlug)
        .maybeSingle();
      corretor_ref_id = profile?.id || null;
    } catch { /* silent */ }
  }

  const rastreio = getLeadTracking(data.origem_componente, data.formulario);
  const origem_canal = classifyOrigemCanal(tracking);

  const payload = {
    nome: data.nome,
    telefone: data.telefone,
    email: data.email || null,
    tipo_interesse: data.tipo_interesse || null,
    imovel_id: data.imovel_id || null,
    imovel_slug: data.imovel_slug || null,
    imovel_titulo: data.imovel_titulo || null,
    imovel_bairro: data.imovel_bairro || null,
    imovel_preco: data.imovel_preco || null,
    origem_pagina: data.origem_pagina || window.location.href,
    origem_componente: data.origem_componente,
    utm_source: tracking.utm_source || null,
    utm_medium: tracking.utm_medium || null,
    utm_campaign: tracking.utm_campaign || null,
    utm_term: tracking.utm_term || null,
    utm_content: tracking.utm_content || null,
    referrer: rastreio.colunas.referrer,
    landing_page: tracking.landing_page || null,
    device: rastreio.colunas.device,
    pagina_url: rastreio.colunas.pagina_url,
    formulario: rastreio.colunas.formulario,
    gclid: rastreio.colunas.gclid,
    gbraid: rastreio.colunas.gbraid,
    wbraid: rastreio.colunas.wbraid,
    fbclid: rastreio.colunas.fbclid,
    landing_url: rastreio.colunas.landing_url,
    origem_canal,
    session_id,
    corretor_ref_id,
    corretor_ref_slug: refSlug || null,
    origem_ref: rastreio.colunas.origem_ref,
    contexto: { ...(data.contexto ?? {}), ...rastreio.contexto, ...(getUltimoEnvio() ? { retorno_envio: getUltimoEnvio() } : {}) },
  };

  const pedido = (data.contexto?.pedido as Record<string, unknown> | undefined) || {};
  const tipo = pedido.tipo === 'aviso_preco' ? 'aviso_preco_pedido' : typeof pedido.tipo === "string" ? pedido.tipo : /agendamento|agendar_visita/.test(data.origem_componente) ? "visita_pedida" : /informac/.test(data.origem_componente) ? "informacoes_pedidas" : "pedido_corretor";
  const result = await postJourney({ action: "lead", lead: { ...payload, visitor_id: getVisitorId(), email: data.email || undefined } });
  if (!result.ok) throw new Error("Contato não registrado");
  setLeadIdentity({ telefone: data.telefone, email: data.email, nome: data.nome }, data.origem_componente);
  await trackEvent({ tipo: tipo as import("@/lib/trackEvent").JourneyTipo, imovel_slug: data.imovel_slug, imovel_titulo: data.imovel_titulo, dados: { ...pedido, formulario: data.origem_componente } });

  // GA4 dataLayer event
  trackGenerateLead({
    origem_componente: data.origem_componente,
    origem_pagina: data.origem_pagina,
    imovel_titulo: data.imovel_titulo,
    imovel_slug: data.imovel_slug,
    imovel_bairro: data.imovel_bairro,
  });

  return true;
}

export async function trackView(imovel_id: string) {
  const session_id = getSessionId();
  await supabase.from("imovel_views").insert({ imovel_id, session_id });
}

export async function getViewCount(imovel_id: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("imovel_views")
    .select("*", { count: "exact", head: true })
    .eq("imovel_id", imovel_id)
    .gte("viewed_at", today.toISOString());

  return count || 0;
}
