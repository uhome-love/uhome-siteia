import { journeyMediaEvent, metaEvent } from './gtag';
import { canTrack } from './consent';
import { journeyEnvelope, safePage } from './journeyIdentity';
import { getCorretorRef, getTrackingData } from './session';
import { fonteLegivel, classificarDevice } from './leadTracking';
export type JourneyTipo = 'pagina_vista'|'busca_feita'|'categoria_tocada'|'filtro_aplicado'|'imovel_visto'|'foto_aberta'|'favorito_salvo'|'aviso_preco_pedido'|'dia_escolhido'|'formulario_iniciado'|'visita_pedida'|'informacoes_pedidas'|'lia_aberta'|'lia_lead'|'whatsapp_tocado'|'simulacao_feita'|'pedido_corretor'|'rolagem_50'|'pagina_anuncio_vista';
export type FunilTipo = 'pagina_anuncio_vista'|'rolagem_50'|'galeria_aberta'|'formulario_iniciado';
export interface TrackEventParams {tipo:JourneyTipo|FunilTipo|'imovel_visualizado'|'busca_realizada'|'whatsapp_click'|'formulario_enviado';imovel_slug?:string|null;imovel_titulo?:string|null;imovel_bairro?:string|null;imovel_preco?:number|null;busca_query?:string|null;busca_filtros?:Record<string,unknown>|null;dados?:Record<string,unknown>}
export function origemResumo(){const t=getTrackingData();return {fonte:fonteLegivel(t,getCorretorRef()),utm_source:t.utm_source||null,utm_campaign:t.utm_campaign||null,tem_gclid:!!(t.gclid||t.gbraid||t.wbraid),device:classificarDevice(navigator.userAgent,window.innerWidth)};}
export async function postJourney(body:Record<string,unknown>) {
 const envelope=await journeyEnvelope();
 const r=await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/site-journey`,{method:'POST',headers:{'Content-Type':'application/json',apikey:import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify({...envelope,...body}),keepalive:true});
 if(!r.ok)throw new Error(`journey ${r.status}`);return r.json();
}
export async function trackEvent(params:TrackEventParams){
 metaEvent(params.tipo,{content_ids:params.imovel_slug?[params.imovel_slug]:undefined,content_type:params.imovel_slug?'home_listing':undefined});
 try {
 if(!(await canTrack('analytics')))return;
 await postJourney({action:'event',event:{event_key:crypto.randomUUID(),tipo:params.tipo,pagina:safePage(),imovel_slug:params.imovel_slug||null,imovel_titulo:params.imovel_titulo||null,dados:{imovel_bairro:params.imovel_bairro,imovel_preco:params.imovel_preco,...params.dados,...(params.busca_filtros?{filtros:params.busca_filtros,secao:'Imóveis'}:{})}},button_key:params.dados?.button_key});
 if (['visita_pedida','informacoes_pedidas'].includes(params.tipo)) journeyMediaEvent(params.tipo, { page_path: location.pathname });
 }catch{/* never blocks browsing; errors observable on delivery endpoint */}
}
