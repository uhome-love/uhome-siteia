import { supabase } from "@/integrations/supabase/client";
import { getSessionId, getTrackingData, classifyOrigemCanal, getCorretorRef, getCorretorRefId } from "@/lib/session";
import { trackEvent } from "@/lib/trackEvent";
import { trackGenerateLead } from "@/lib/gtag";

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

  // Deduplicate: skip if same phone submitted in last 24h
  const digitsOnly = data.telefone.replace(/\D/g, "");
  if (digitsOnly.length >= 10) {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from("public_leads")
        .select("id", { count: "exact", head: true })
        .ilike("telefone", `%${digitsOnly.slice(-8)}%`)
        .gte("created_at", since);
      if (existing !== null) {
        trackEvent({
          tipo: "formulario_enviado",
          imovel_slug: data.imovel_slug,
          imovel_titulo: data.imovel_titulo,
        });
        return true;
      }
    } catch { /* if check fails, proceed with insert */ }
  }

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
    referrer: tracking.referrer || null,
    landing_page: tracking.landing_page || null,
    device: tracking.device || null,
    origem_canal,
    session_id,
    corretor_ref_id,
    corretor_ref_slug: refSlug || null,
    origem_ref: refSlug ? 'link_corretor' : 'organico',
  };

  const { error } = await supabase
    .from("public_leads")
    .insert(payload as any);

  if (error) throw error;

  trackEvent({
    tipo: "formulario_enviado",
    imovel_slug: data.imovel_slug,
    imovel_titulo: data.imovel_titulo,
  });

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
