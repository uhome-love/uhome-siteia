export const ORIGIN_KEYS = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','gbraid','wbraid','fbclid','referrer','landing_url'] as const;
export function origemRef(origin: Record<string, unknown>, corretor?: unknown): string {
  if (corretor) return 'link_corretor';
  if (['gclid','gbraid','wbraid','fbclid'].some(k => Boolean(origin[k]))) return 'pago';
  return origin.utm_source ? 'campanha' : 'organico';
}
export function dadosSiteRecord(record: Record<string, any>) {
  const c = record.contexto || {};
  const pedidos = [...(Array.isArray(c.pedidos) ? c.pedidos : [])];
  for (const e of c.jornada?.site_events || []) if(e.tipo==='whatsapp_tocado' && !pedidos.some(p=>p.id===e.event_id)) pedidos.push({id:e.event_id,tipo:'whatsapp',dia:null,periodo:null,planta:null,assunto:null,empreendimento:e.imovel?.titulo??null,pagina:e.pagina,horario:e.quando,financiamento:null});
  return { site_lead_id: record.id, visitor_id: record.visitor_id ?? null,
    pedidos, pedido: c.pedido ?? null,
    primeira_origem: c.primeira_origem ?? Object.fromEntries(ORIGIN_KEYS.map(k => [k, record[k] ?? null])),
    ultima_origem: c.ultima_origem ?? {}, origem_ref: record.origem_ref ?? null,
    ...(c.pedido?.tipo==='visita' ? {agendamento:{dia:c.pedido.dia,periodo:c.pedido.periodo,...c.ultima_origem}} : {}),
    ...(c.jornada ? { jornada: c.jornada, site_events: c.jornada.site_events } : {}) };
}
export function mergeDadosSite(old: Record<string, any> = {}, next: Record<string, any> = {}): Record<string, any> {
  const pedidos = new Map<string, any>();
  for (const p of [...(old.pedidos || []), ...(next.pedidos || [])]) if (p?.id) pedidos.set(p.id, p);
  return { ...old, ...next, primeira_origem: old.primeira_origem ?? next.primeira_origem, pedidos: [...pedidos.values()] };
}
export async function saveDadosLead(crm: any, id: string, dados: Record<string, any>) {
  const { data, error } = await crm.from('leads').select('dados_site').eq('id', id).maybeSingle();
  // Additive CRM rollout: keep the current pipeline transport working until its column exists.
  if (error && (error.code === '42703' || error.code === 'PGRST204')) return false;
  if (error) throw error;
  if (!data) throw new Error('CRM lead missing');
  const result = await crm.from('leads').update({ dados_site: mergeDadosSite(data.dados_site || {}, dados) }).eq('id', id);
  if (result.error) throw result.error;
  return true;
}