import { getSessionId } from '@/lib/session';
import { getVisitorId } from '@/lib/visitor';
import { trackEvent } from '@/lib/trackEvent';
import { trackClickWhatsapp } from '@/lib/gtag';
import { canTrack } from '@/lib/consent';
export { getVisitorId };
interface WhatsAppClickData {imovel_id?:string;imovel_titulo?:string;imovel_slug?:string;origem_pagina?:string;origem_componente?:string;url?:string;button_key?:string}
export const LIMITE_WA_MS=2000;
const seen=new Map<string,number>();
export function podeRegistrar(agora:number,store:Pick<Storage,'getItem'|'setItem'>|null=typeof localStorage!=='undefined'?localStorage:null,key='whatsapp'):boolean {
 let last=seen.get(key)||0;try{last=Math.max(last,Number(store?.getItem(`uhs_wa:${key}`)||0));}catch{/* */}
 if(last&&agora-last<LIMITE_WA_MS)return false;
 seen.set(key,agora);try{store?.setItem(`uhs_wa:${key}`,String(agora));}catch{/* */}return true;
}
export function lerLinkWhatsApp(url?:string){if(!url)return {destino:null,mensagem:null};try{const u=new URL(url,'https://x.invalid');return {destino:u.pathname.replace(/\D/g,'')||u.searchParams.get('phone')||null,mensagem:u.searchParams.get('text')};}catch{return {destino:null,mensagem:null};}}
let pending:WhatsAppClickData|undefined;
let activeButton:string|undefined;
export function trackWhatsAppClick(data:WhatsAppClickData={}) {
 // Enrichment is not a click. Old render-time calls can no longer emit records.
 if(!data.url){pending=data;return;}
 const merged={...pending,...data};pending=undefined;
 const key=data.button_key||activeButton||`${location.pathname}:${data.origem_componente||'whatsapp'}:${data.imovel_slug||''}`;
 if(!podeRegistrar(Date.now(),localStorage,`${getSessionId()}:${key}`))return;
 void canTrack('analytics').then(allowed=>{if(allowed)void trackEvent({tipo:'whatsapp_tocado',imovel_slug:merged.imovel_slug,imovel_titulo:merged.imovel_titulo,dados:{button_key:key,imovel_id:merged.imovel_id}});});
 trackClickWhatsapp({origem_componente:merged.origem_componente||'whatsapp_botao',imovel_slug:merged.imovel_slug,imovel_titulo:merged.imovel_titulo});
}
const isWhatsApp=(url:string)=>/^(https?:)?\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(url)||url.startsWith('whatsapp:');
export function instalarRastreioWhatsApp(){
 const win=window as Window & {__uhomeWa?:boolean};if(win.__uhomeWa)return;win.__uhomeWa=true;
 document.addEventListener('click',e=>{
 if(!e.isTrusted)return;
 const el=(e.target as Element|null)?.closest('a,button');if(!el)return;
 const elements=Array.from(document.querySelectorAll('a,button'));
 activeButton=el.getAttribute('data-origem')||el.id||`${location.pathname}:button:${elements.indexOf(el)}`;
 queueMicrotask(()=>{activeButton=undefined;});
 const a=el.closest('a[href]') as HTMLAnchorElement|null;
 if(a&&isWhatsApp(a.href))trackWhatsAppClick({url:a.href,button_key:activeButton});
 },true);
 const original=window.open.bind(window);
 window.open=((url?:string|URL,...rest:any[])=>{if(navigator.userActivation?.isActive){const s=String(url||'');if(isWhatsApp(s))trackWhatsAppClick({url:s,button_key:activeButton});}return original(url as any,...rest);}) as typeof window.open;
}
