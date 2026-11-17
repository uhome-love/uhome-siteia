import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { siteClient, tokenFor, tokenValid, digest, safeDetails, safePath, BOT_UA, EVENT_NAMES, LEGACY, ALIAS_UNTIL, buildJourney } from '../_shared/journey.ts';
const Origin=z.object({utm_source:z.string().max(200).optional(),utm_medium:z.string().max(200).optional(),utm_campaign:z.string().max(200).optional(),utm_content:z.string().max(200).optional(),utm_term:z.string().max(200).optional(),gclid:z.string().max(200).optional(),gbraid:z.string().max(200).optional(),wbraid:z.string().max(200).optional(),fbclid:z.string().max(200).optional(),referrer:z.string().max(1000).optional(),landing_page:z.string().max(1000).optional(),landing_url:z.string().max(1000).optional(),at:z.string().datetime().optional()});
const Lead=z.object({nome:z.string().trim().min(2).max(120),telefone:z.string().min(10).max(30),email:z.string().email().optional().nullable(),tipo_interesse:z.string().max(60).optional().nullable(),imovel_id:z.string().max(100).optional().nullable(),imovel_slug:z.string().max(300).optional().nullable(),imovel_titulo:z.string().max(300).optional().nullable(),imovel_bairro:z.string().max(200).optional().nullable(),imovel_preco:z.number().nonnegative().optional().nullable(),origem_pagina:z.string().max(1000).optional(),origem_componente:z.string().max(100),corretor_ref_id:z.string().uuid().optional().nullable(),corretor_ref_slug:z.string().max(200).optional().nullable(),origem_ref:z.string().max(100).optional(),pagina_url:z.string().max(1000).optional(),formulario:z.string().max(200).optional(),device:z.string().max(30).optional(),contexto:z.record(z.unknown()).optional()});
const Body=z.object({action:z.enum(['bootstrap','event','interaction','lead','consent']),visitor_id:z.string().uuid(),session_id:z.string().uuid().optional(),token:z.string().length(64).optional(),interacted:z.boolean().optional(),analytics_allowed:z.boolean().optional(),primeira_origem:Origin.optional(),ultima_origem:Origin.optional(),event:z.object({event_key:z.string().uuid(),tipo:z.string().max(60),pagina:z.string().max(1000),imovel_slug:z.string().max(300).nullable().optional(),imovel_titulo:z.string().max(300).nullable().optional(),dados:z.record(z.unknown()).optional()}).optional(),lead:Lead.optional(),button_key:z.string().max(300).optional()});
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
 if(req.method!=='POST')return json({error:'method'},405);
 try {
 const parsed=Body.safeParse(await req.json());if(!parsed.success)return json({error:'invalid input'},400);
 const b=parsed.data,sb=siteClient(),ua=req.headers.get('user-agent')||'',uaBot=BOT_UA.test(ua);
 if(b.action==='bootstrap') {
   const token=await tokenFor(b.visitor_id);
   const {data:existing}=await sb.from('site_visitors').select('id').eq('id',b.visitor_id).maybeSingle();
   if(existing && (!b.token || !(await tokenValid(b.visitor_id,b.token))))return json({error:'visitor capability required'},401);
   if(!existing){const {error}=await sb.from('site_visitors').upsert({id:b.visitor_id,capability_hash:await digest(token),primeira_origem:b.primeira_origem||{},ultima_origem:b.ultima_origem||{},analytics_allowed:b.analytics_allowed!==false},{onConflict:'id',ignoreDuplicates:true});if(error)throw error;}
   return json({token});
 }
 if(!b.token||!(await tokenValid(b.visitor_id,b.token)))return json({error:'invalid visitor capability'},401);
 const {data:v}=await sb.from('site_visitors').select('*').eq('id',b.visitor_id).maybeSingle();if(!v)return json({error:'visitor missing'},404);
 if(b.action==='consent'){await sb.from('site_visitors').update({analytics_allowed:b.analytics_allowed===true,updated_at:new Date().toISOString()}).eq('id',v.id);return json({ok:true});}
 if(!b.session_id)return json({error:'session required'},400);
 const {data:session}=await sb.from('site_sessions').select('*').eq('id',b.session_id).maybeSingle();
 if(session&&session.visitor_id!==b.visitor_id)return json({error:'session mismatch'},403);
 const human=!uaBot&&(b.interacted===true||Boolean(session?.interacted_at));
 const is_bot=!human,reason=uaBot?'user_agent':human?null:'sem_interacao';
 const now=new Date().toISOString();
 if(b.analytics_allowed!==false && v.analytics_allowed){
 const {error}=await sb.from('site_sessions').upsert({id:b.session_id,visitor_id:b.visitor_id,started_at:session?.started_at||now,last_active_at:now,interacted_at:human?(session?.interacted_at||now):null,is_bot,bot_reason:reason,user_agent:ua.slice(0,500)});if(error)throw error;
 if(human){await sb.from('site_sessions').update({interacted_at:now,is_bot:false,bot_reason:null}).eq('id',b.session_id);await sb.from('lead_events').update({is_bot:false,bot_reason:null}).eq('session_id',b.session_id).eq('bot_reason','sem_interacao');}
 await sb.from('site_visitors').update({ultima_origem:b.ultima_origem||v.ultima_origem,updated_at:now}).eq('id',v.id);
 }
 if(b.action==='interaction')return json({ok:true,is_bot});
 if(b.action==='lead'){
 if(!b.lead)return json({error:'lead required'},400);
 if(uaBot)return json({error:'automated contact ignored'},403);
 const journey=await buildJourney(sb,b.visitor_id,v.lead_id||undefined);
 const payload={...b.lead,...v.primeira_origem,session_id:b.session_id,visitor_id:b.visitor_id,is_bot:false,contexto:{...b.lead.contexto,jornada:journey}};
 const {data:id,error}=await sb.rpc('journey_upsert_lead',{p_payload:payload});if(error)throw error;
 return json({ok:true,lead_id:id});
 }
 if(!v.analytics_allowed||b.analytics_allowed===false)return json({ok:true,skipped:'analytics_denied'});
 if(!b.event)return json({error:'event required'},400);
 const canonical=LEGACY[b.event.tipo]||b.event.tipo;if(!(EVENT_NAMES as readonly string[]).includes(canonical))return json({error:'unknown event'},400);
 const {data:already}=await sb.from('lead_events').select('id').eq('event_key',b.event.event_key).maybeSingle();if(already)return json({ok:true,deduplicated:true});
 const dados=safeDetails(b.event.dados),pagina=safePath(b.event.pagina);
 if(canonical==='whatsapp_tocado'){
 const key=b.button_key||String(dados.button_key||pagina+':whatsapp');
 // A transaction-scoped lock serializes the two instrumentation paths for the same button.
 const {data:accepted,error}=await sb.rpc('journey_accept_whatsapp',{p_session:b.session_id,p_button:key});if(error)throw error;if(!accepted)return json({ok:true,deduplicated:true});
 dados.button_key=key;
 }
 const {data:finalSession}=await sb.from('site_sessions').select('interacted_at,is_bot').eq('id',b.session_id).maybeSingle();
 const base={visitor_id:b.visitor_id,session_id:b.session_id,tipo:canonical,canonical_tipo:canonical,pagina,imovel_slug:b.event.imovel_slug||null,imovel_titulo:b.event.imovel_titulo||null,dados,is_bot:uaBot||!finalSession?.interacted_at,bot_reason:uaBot?'user_agent':finalSession?.interacted_at?null:'sem_interacao',identidade:null,event_key:b.event.event_key};
 const {error}=await sb.from('lead_events').upsert(base,{onConflict:'event_key',ignoreDuplicates:true});if(error)throw error;
 const alias=['visita_pedida','informacoes_pedidas','lia_lead','pedido_corretor'].includes(canonical) ? 'formulario_enviado' : Object.entries(LEGACY).find(([,name])=>name===canonical)?.[0];
 if(alias&&Date.now()<Date.parse(ALIAS_UNTIL))await sb.from('lead_events').insert({...base,event_key:crypto.randomUUID(),tipo:alias,dados:{...dados,event_source:'compatibility_alias'}});
 if(canonical==='whatsapp_tocado'){
 await sb.from('whatsapp_clicks').insert({visitor_id:b.visitor_id,session_id:b.session_id,button_key:dados.button_key,is_bot,bot_reason:reason,imovel_slug:base.imovel_slug,imovel_titulo:base.imovel_titulo,origem_pagina:pagina,origem_componente:'journey_whatsapp',pagina_url:pagina});
 }
 return json({ok:true,event_key:base.event_key,is_bot});
 }catch(e){console.error('[site-journey]',(e as Error).message);return json({error:'journey unavailable'},500);}
});
