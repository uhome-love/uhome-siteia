import { createClient } from 'npm:@supabase/supabase-js@2';
import { saveDadosLead, mergeDadosSite, dadosSiteRecord } from './pedidos.ts';
export const BOT_UA = /bot|crawler|spider|headless|slurp|facebookexternalhit|whatsapp|telegrambot|preview|lighthouse/i;
export const EVENT_NAMES = ['pagina_vista','busca_feita','categoria_tocada','filtro_aplicado','imovel_visto','foto_aberta','favorito_salvo','dia_escolhido','formulario_iniciado','visita_pedida','informacoes_pedidas','lia_aberta','lia_lead','whatsapp_tocado','simulacao_feita','pedido_corretor','rolagem_50','pagina_anuncio_vista'] as const;
export const LEGACY: Record<string,string> = { imovel_visualizado:'imovel_visto',busca_realizada:'busca_feita',whatsapp_click:'whatsapp_tocado',galeria_aberta:'foto_aberta',formulario_enviado:'pedido_corretor' };
export const ALIAS_UNTIL = '2026-12-17T05:06:00.000Z';
export function siteClient() {
  const url=Deno.env.get('SUPABASE_URL'), key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!key) throw new Error('Site environment missing');
  return createClient(url,key);
}
export async function digest(value:string) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join(''); }
export async function tokenFor(id:string) {
  const secret=Deno.env.get('SYNC_SECRET'); if(!secret) throw new Error('Journey signing unavailable');
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('journey-v1:'+id))),v=>v.toString(16).padStart(2,'0')).join('');
}
export async function tokenValid(id:string,token:string) {
  const expected=await tokenFor(id); if(expected.length!==token.length)return false;
  let diff=0; for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^token.charCodeAt(i); return diff===0;
}
// Positive list: no contact fields, search prose, arbitrary URLs or nested text can enter events.
const SAFE_FIELDS=new Set(['secao','bairros','bairro','tipo','quartos','preco_min','preco_max','faixa_valor','tipos','filtros','categoria','foto_index','formulario','dia','periodo','horario','assunto','planta','button_key','imovel_id','imovel_slug','imovel_bairro','imovel_preco','entrada_percentual','prazo_anos','taxa_anual','studio','noites','event_source','pedido_tipo']);
export function safeDetails(input:unknown):Record<string,unknown> {
  if(!input||typeof input!=='object'||Array.isArray(input))return {};
  const out:Record<string,unknown>={};
  for(const [k,v] of Object.entries(input)) {
    if(!SAFE_FIELDS.has(k))continue;
    if(v===null||typeof v==='boolean'||typeof v==='number')out[k]=v;
    else if(typeof v==='string'&&!/@|\b\d{10,13}\b/.test(v))out[k]=v.slice(0,200);
    else if(Array.isArray(v))out[k]=v.filter(x=>typeof x==='string'&&!/@|\b\d{10,13}\b/.test(x)).slice(0,30).map(x=>x.slice(0,100));
    else if(k==='filtros')out[k]=safeDetails(v);
  }
  return out;
}
export function safePath(value:string) { try { const u=new URL(value,'https://uhome.com.br');return u.pathname; }catch{return '/';} }
export async function allEvents(sb:any, visitorIds:string[], since:string) {
  const out:any[]=[];
  for(let offset=0;;offset+=1000) {
    const {data,error}=await sb.from('lead_events').select('id,visitor_id,session_id,tipo,canonical_tipo,pagina,imovel_slug,imovel_titulo,dados,created_at,is_bot').in('visitor_id',visitorIds).gte('created_at',since).eq('is_bot',false).order('created_at').order('id').range(offset,offset+999);
    if(error)throw new Error(error.message); if(!data?.length)break;
    out.push(...data.filter((e:any)=>!e.canonical_tipo||e.canonical_tipo===e.tipo)); if(data.length<1000)break;
  }
  return out;
}
export async function buildJourney(sb:any, visitorId:string, leadId?:string) {
  const {data:visitors,error}=await sb.from('site_visitors').select('*').eq(leadId?'lead_id':'id',leadId||visitorId);if(error)throw error;
  const permitted=(visitors||[]).filter((v:any)=>v.analytics_allowed);
  if(!permitted.length)return null;
  const ids=permitted.map((v:any)=>v.id), since=new Date(Date.now()-90*864e5).toISOString();
  const ev=await allEvents(sb,ids,since);
  let sessions:any[]=[];
  for(let n=0;;n+=1000) {const {data,error}=await sb.from('site_sessions').select('id,started_at').in('visitor_id',ids).eq('is_bot',false).order('started_at').range(n,n+999);if(error)throw error;sessions.push(...(data||[]));if((data||[]).length<1000)break;}
  const first=[...permitted].sort((a:any,b:any)=>a.primeira_visita.localeCompare(b.primeira_visita))[0];
  const last=[...permitted].sort((a:any,b:any)=>b.updated_at.localeCompare(a.updated_at))[0];
  const counts=new Map<string,any>();
  for(const e of ev.filter((e:any)=>e.tipo==='imovel_visto'||e.tipo==='imovel_visualizado')) {const k=e.imovel_slug||e.dados?.imovel_id;if(!k)continue;const r=counts.get(k)||{slug:e.imovel_slug,titulo:e.imovel_titulo,vezes:0};r.vezes++;counts.set(k,r);}
  const timeline=ev.map((e:any)=>({event_id:e.id,visitor_id:e.visitor_id,session_id:e.session_id,tipo:LEGACY[e.tipo]||e.tipo,pagina:e.pagina,imovel:{slug:e.imovel_slug,titulo:e.imovel_titulo},dados:safeDetails(e.dados),quando:e.created_at,is_bot:false}));
  const pedidos=timeline.filter((e:any)=>['visita_pedida','informacoes_pedidas','lia_lead','simulacao_feita','pedido_corretor','whatsapp_tocado'].includes(e.tipo));
  return {schema_version:1,visitor_id:visitorId,visitor_ids:ids,janela_dias:90,primeira_origem:first.primeira_origem,ultima_origem:last.ultima_origem,numero_visitas:sessions.length,primeira_visita:sessions[0]?.started_at||first.primeira_visita,imoveis_vistos:[...counts.values()],buscas:timeline.filter((e:any)=>e.tipo==='busca_feita').map((e:any)=>({quando:e.quando,...e.dados})),filtros:timeline.filter((e:any)=>e.tipo==='filtro_aplicado').map((e:any)=>({quando:e.quando,...e.dados})),favoritos:timeline.filter((e:any)=>e.tipo==='favorito_salvo').map((e:any)=>({imovel:e.imovel,...e.dados})),pedido:pedidos.at(-1)||null,pedidos,site_events:timeline};
}
export async function deliverJourney(sb:any,crm:any,visitorId:string,eventId?:string) {
  const {data:v}=await sb.from('site_visitors').select('lead_id,analytics_allowed').eq('id',visitorId).maybeSingle();
  if(!v?.lead_id||!v.analytics_allowed)return {ok:true,skipped:true};
  const {data:lead}=await sb.from('public_leads').select('id,uhomesales_lead_id,is_bot,contexto').eq('id',v.lead_id).maybeSingle();
  if(!lead?.uhomesales_lead_id||lead.is_bot)return {ok:false,error:'lead_not_synced'};
  const journey=await buildJourney(sb,visitorId,lead.id);if(!journey)return {ok:true,skipped:true};
  const dados={...dadosSiteRecord({...lead,visitor_id:visitorId,contexto:{...lead.contexto,jornada:journey}}),jornada:journey,site_events:journey.site_events};
  const {data:crmLead,error:readError}=await crm.from('leads').select('id,pipeline_lead_id').eq('id',lead.uhomesales_lead_id).maybeSingle();
  if(readError)throw readError;
  let error:any=null;
  if(crmLead) {
    try {
      const saved=await saveDadosLead(crm, crmLead.id, dados);
      if(!saved && !crmLead.pipeline_lead_id) error={message:'CRM leads.dados_site column not yet available'};
    } catch(e) { error=e; }
  } else error={message:'CRM lead not yet available'};
  if(!error && crmLead?.pipeline_lead_id) {
    const {data:row,error:read}=await crm.from('pipeline_leads').select('dados_site').eq('id',crmLead.pipeline_lead_id).maybeSingle();if(read)throw read;
    const result=await crm.from('pipeline_leads').update({dados_site:mergeDadosSite(row?.dados_site||{},dados),updated_at:new Date().toISOString()}).eq('id',crmLead.pipeline_lead_id);error=result.error;
  }
  const delivery={visitor_id:visitorId,lead_id:lead.id,event_id:eventId||null,status:error?'pending':'sent',attempts:1,event_count:journey.site_events.length,crm_lead_id:crmLead?.id,http_status:error?null:200,error:error?.message||null,sent_at:error?null:new Date().toISOString()};
  await sb.from('site_journey_deliveries').insert(delivery);
  if (!error) await sb.from('site_journey_deliveries').update({status:'sent',sent_at:new Date().toISOString(),error:null}).eq('visitor_id',visitorId).eq('status','pending');
  return {ok:!error,error:error?.message,crm_lead_id:crmLead?.id,event_count:journey.site_events.length};
}
export async function retryPendingJourneys(sb:any,crm:any) {
  const {data,error}=await sb.from('site_journey_deliveries').select('id,visitor_id,attempts').eq('status','pending').order('created_at').limit(100);
  if(error)throw error;
  const visitors=[...new Set<string>((data||[]).map((r:any)=>r.visitor_id))];
  for(const visitor of visitors) {
    for(const row of (data||[]).filter((r:any)=>r.visitor_id===visitor)) await sb.from('site_journey_deliveries').update({attempts:row.attempts+1}).eq('id',row.id);
    try { await deliverJourney(sb,crm,visitor); } catch(e) {
      await sb.from('site_journey_deliveries').update({error:(e as Error).message}).eq('visitor_id',visitor).eq('status','pending');
    }
  }
  return {retried:visitors.length};
}
