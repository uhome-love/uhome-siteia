import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { needsAnswer, onConsentChange, readChoice, saveChoices } from '@/lib/consent';
export function CookieNotice(){
 const [visible,setVisible]=useState(false),[settings,setSettings]=useState(false),[analytics,setAnalytics]=useState(false),[advertising,setAdvertising]=useState(false);
 const panel=useRef<HTMLDivElement>(null);
 const gpc=(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl===true;
 const open=()=>{setAnalytics(readChoice('analytics')==='granted');setAdvertising(readChoice('advertising')==='granted');setSettings(true);setVisible(true);};
 useEffect(()=>{void needsAnswer(['analytics','advertising']).then(setVisible);window.addEventListener('uhome:cookie-settings',open);return ()=>window.removeEventListener('uhome:cookie-settings',open);},[]);
 useEffect(()=>onConsentChange(()=>{setAnalytics(readChoice('analytics')==='granted');setAdvertising(readChoice('advertising')==='granted');}),[]);
 useEffect(()=>{if(visible)panel.current?.focus({preventScroll:true});},[visible]);
 const save=(a:boolean,d:boolean)=>{saveChoices({analytics:a?'granted':'denied',advertising:d?'granted':'denied'});setVisible(false);setSettings(false);};
 return <>
 <Button variant="link" size="sm" className="fixed bottom-1 left-1 z-[54] h-7 bg-background/95 text-xs text-muted-foreground" onClick={open}>Configurações de cookies</Button>
 {visible&&<div ref={panel} tabIndex={-1} role="region" aria-label="Preferências de privacidade" className="fixed inset-x-0 bottom-9 z-[110] mx-3 max-h-[40dvh] overflow-auto rounded-lg border border-border bg-background p-4 shadow-lg sm:left-4 sm:right-auto sm:mx-0 sm:w-[440px]">
 <p className="text-sm text-foreground">Contamos visitas sem cookies. Com análise permitida, medimos cliques e sua jornada; anúncios medem resultados de campanhas.</p>
 <a href="/politica-de-privacidade" className="text-xs text-primary underline">Política de privacidade</a>
 {settings&&<div className="my-3 space-y-3 text-sm">
 <p>Necessários · sempre ativos</p>
 {gpc&&<p>O sinal de privacidade do seu navegador recusa análise e publicidade.</p>}
 <label className="flex items-center justify-between gap-3">Análise, fornecida pela Uhome, Lovable e Google<Switch aria-label="Análise" checked={!gpc&&analytics} disabled={gpc} onCheckedChange={setAnalytics}/></label>
 <label className="flex items-center justify-between gap-3">Publicidade, fornecida por Google e Meta<Switch aria-label="Publicidade" checked={!gpc&&advertising} disabled={gpc} onCheckedChange={setAdvertising}/></label>
 <Button variant="outline" onClick={()=>save(analytics,advertising)}>Salvar preferências</Button>
 </div>}
 <div className="mt-3 grid grid-cols-2 gap-2"><Button variant="outline" onClick={()=>save(true,true)}>Aceitar tudo</Button><Button variant="outline" onClick={()=>save(false,false)}>Recusar tudo</Button></div>
 <Button variant="link" size="sm" className="mt-1" onClick={open}>Configurações de cookies</Button>
 </div>}
 </>;
}
