import { canTrack, onConsentChange } from './consent';
import { captureJourneyOrigin, clearJourneyAnalysis, getJourneySession, touchJourney } from './journeyIdentity';
import { postJourney, trackEvent } from './trackEvent';
export function instalarJornada() {
 let path='', interactionSession='', lastActivitySession='';
 const page=()=>{const next=location.pathname+location.search;if(next===path)return;path=next;void captureJourneyOrigin().then(()=>trackEvent({tipo:'pagina_vista'}));};
 for(const m of ['pushState','replaceState'] as const){const original=history[m].bind(history);history[m]=((...args:Parameters<History['pushState']>)=>{const r=original(...args);queueMicrotask(page);return r;}) as History['pushState'];}
 addEventListener('popstate',page);page();
 const interaction=(e:Event)=>{
 if(!e.isTrusted)return;
 const previous=lastActivitySession;touchJourney();const current=getJourneySession().id;lastActivitySession=current;
 if(current!==previous)void trackEvent({tipo:'pagina_vista'});
 if(interactionSession!==current){interactionSession=current;void canTrack('analytics').then(allowed=>{if(allowed)void postJourney({action:'interaction'}).catch(()=>{});});}
 };
 for(const type of ['pointerdown','touchstart','scroll','keydown'])addEventListener(type,interaction,{passive:true,capture:true});
 onConsentChange(()=>{void canTrack('analytics').then(async allowed=>{
   try{await postJourney({action:'consent',analytics_allowed:allowed});}catch{/* */}
   if(!allowed)clearJourneyAnalysis();else{await captureJourneyOrigin();path='';page();}
 });});
}
