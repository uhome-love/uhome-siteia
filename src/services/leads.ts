import { supabase } from "@/integrations/supabase/client";
import { getSessionId, getUtmParams } from "@/lib/session";
import { syncToCRM } from "./syncCRM";

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
  const utm = getUtmParams();
  const session_id = getSessionId();

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
    origem_pagina: data.origem_pagina || window.location.pathname,
    origem_componente: data.origem_componente,
    utm_source: utm.utm_source || null,
    utm_medium: utm.utm_medium || null,
    utm_campaign: utm.utm_campaign || null,
    session_id,
  };

  const { data: inserted, error } = await supabase
    .from("public_leads")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  // Fire-and-forget sync to CRM
  if (inserted) {
    syncToCRM("lead", inserted);
  }

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
