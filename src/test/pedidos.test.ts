import {describe,it,expect,vi} from 'vitest';
import {origemRef,mergeDadosSite,dadosSiteRecord,saveDadosLead} from '../../supabase/functions/_shared/pedidos';
describe('pedidos e origem aprovados pelo Lucas',()=>{
 it('corretor tem prioridade sobre anúncios',()=>expect(origemRef({gclid:'g',utm_source:'central'},'lucas')).toBe('link_corretor'));
 for(const key of ['gclid','gbraid','wbraid','fbclid']) it(`${key} é pago`,()=>expect(origemRef({[key]:'id',utm_source:'central'})).toBe('pago'));
 it('central sem clique é campanha',()=>expect(origemRef({utm_source:'central'})).toBe('campanha'));
 it('sem origem é orgânico',()=>expect(origemRef({})).toBe('organico'));
 it('reenvio mantém os ids e os dois pedidos',()=>{
  const visita={id:'00000000-0000-4000-8000-000000000001',tipo:'visita'};
  const info={id:'00000000-0000-4000-8000-000000000002',tipo:'informacoes'};
  const result=mergeDadosSite({pedidos:[visita],primeira_origem:{utm_source:'primeira'}},{pedidos:[visita,info],primeira_origem:{utm_source:'central'},ultima_origem:{utm_source:'central'}});
  expect(result.pedidos).toEqual([visita,info]);expect(result.primeira_origem.utm_source).toBe('primeira');expect(result.ultima_origem.utm_source).toBe('central');
 });
 it('WhatsApp usa o id persistido do evento',()=>{
  const result=dadosSiteRecord({id:'lead',contexto:{jornada:{site_events:[{event_id:'uuid-evento',tipo:'whatsapp_tocado',pagina:'/em-foco/open-bosque',quando:'2026-11-18T00:36:00Z'}]}}});
  expect(result.pedidos[0]).toMatchObject({id:'uuid-evento',tipo:'whatsapp',horario:'2026-11-18T00:36:00Z'});
 });
 it('salva jornada no lead mesmo sem cartão',async()=>{
  const update=vi.fn(()=>({eq:async()=>({error:null})}));
  const crm={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{dados_site:{pedidos:[]}},error:null})})}),update})};
  expect(await saveDadosLead(crm,'lead',{jornada:{numero_visitas:2}})).toBe(true);
  expect(update).toHaveBeenCalledWith({dados_site:expect.objectContaining({jornada:{numero_visitas:2}})});
 });
 it('coluna CRM ausente não quebra o transporte publicado',async()=>{
  const crm={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({error:{code:'42703'}})})})})};
  expect(await saveDadosLead(crm,'lead',{})).toBe(false);
 });
});