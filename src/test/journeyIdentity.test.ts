import { beforeEach, describe, expect, it } from 'vitest';
import { saveChoices } from '@/lib/consent';
import { captureJourneyOrigin, clearJourneyAnalysis, getJourneyVisitorId, incomingOrigin, origins, sessionAt, SESSION_IDLE_MS, VISITOR_MONTHS, safePage } from '@/lib/journeyIdentity';
import { podeRegistrar, trackWhatsAppClick } from '@/services/whatsappTracker';
import { vi } from 'vitest';
describe('jornada própria do visitante',()=>{
 beforeEach(()=>{clearJourneyAnalysis();localStorage.clear();saveChoices({analytics:'granted',advertising:'granted'});});
 it('mantém o visitante em cookie e localStorage por 13 meses',async()=>{await captureJourneyOrigin();const id=getJourneyVisitorId();expect(localStorage.getItem('uhs_vid')).toBe(id);expect(document.cookie).toContain(`uhs_vid=${id}`);expect(VISITOR_MONTHS).toBe(13);});
 it('cria uma sessão após 30 minutos parado, não antes',()=>{const one=sessionAt(undefined,1000);expect(sessionAt(one,1000+SESSION_IDLE_MS-1).id).toBe(one.id);expect(sessionAt(one,1000+30*60*1000).id).not.toBe(one.id);});
 it('preserva primeira origem e muda somente a última',async()=>{history.replaceState({},'', '/?utm_source=google&utm_campaign=primeira&gclid=G1');await captureJourneyOrigin();history.replaceState({},'', '/busca?utm_source=meta&utm_campaign=ultima&fbclid=F2');await captureJourneyOrigin();expect(origins().primeira_origem.utm_campaign).toBe('primeira');expect(origins().ultima_origem.utm_campaign).toBe('ultima');expect(origins().primeira_origem.gclid).toBe('G1');});
 it('recusa análise sem gravar código persistente',async()=>{saveChoices({analytics:'denied'});await captureJourneyOrigin();expect(localStorage.getItem('uhs_vid')).toBeNull();expect(document.cookie).not.toContain('uhs_vid=');});
 it('não guarda identificadores publicitários sem publicidade permitida',()=>{history.replaceState({},'', '/?gclid=G&fbclid=F');expect(incomingOrigin(false).gclid).toBeUndefined();expect(incomingOrigin(false).fbclid).toBeUndefined();});
 it('remove contato de URL de evento',()=>{expect(safePage('https://uhome.com.br/busca?telefone=51999999999&email=a@b.com')).toBe('https://uhome.com.br/busca');});
 it('WhatsApp aceita outro botão, mas o mesmo só depois de 2s',()=>{const m=new Map<string,string>(),s={getItem:(k:string)=>m.get(k)||null,setItem:(k:string,v:string)=>void m.set(k,v)};expect(podeRegistrar(1000000,s,'s:a')).toBe(true);expect(podeRegistrar(1001999,s,'s:a')).toBe(false);expect(podeRegistrar(1000001,s,'s:b')).toBe(true);expect(podeRegistrar(1002000,s,'s:a')).toBe(true);});
 it('gerar/enriquecer link nunca registra clique',()=>{const fetch=vi.spyOn(globalThis,'fetch');trackWhatsAppClick({imovel_slug:'em-foco/open-bosque'});expect(fetch).not.toHaveBeenCalled();fetch.mockRestore();});
});
