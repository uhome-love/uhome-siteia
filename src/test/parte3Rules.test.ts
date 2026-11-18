import {describe,it,expect} from 'vitest';
import {categoriasVisiveis,BUSCA_URLS,totalHome} from '../../supabase/functions/_shared/buscaConfig';
import {devePedirAviso,pedidoAviso,lerFavoritos,salvarFavoritos} from '@/lib/favoritosLocais';
import {mergeDadosSite} from '../../supabase/functions/_shared/pedidos';
import {xmlUrl} from '../../supabase/functions/_shared/sitemapPolicy';
describe('regras da Parte 3',()=>{
 it('categoria com 7 sai e com 8 permanece',()=>expect(categoriasVisiveis({apartamentos:7,studios:8}).map(c=>c.id)).toEqual(['studios']));
 it('home arredonda para baixo no milhar',()=>expect(totalHome(19239)).toBe('19 mil+'));
 it('lançamentos filtra a seção e a cidade',()=>expect(BUSCA_URLS['/lancamentos-porto-alegre'].filtros).toEqual({secao:'lancamentos',cidade:'Porto Alegre'}));
 it('apartamentos até 400 mil usa o limite exato',()=>expect(BUSCA_URLS['/apartamentos-ate-400-mil-porto-alegre'].filtros.precoMax).toBe(400000));
 it('casas em condomínio não vira casas avulsas',()=>expect(BUSCA_URLS['/casas-em-condominio-porto-alegre'].filtros.tipo).toBe('casa_condominio'));
 it('studios de investimento limita studios/lofts',()=>expect(BUSCA_URLS['/studios-para-investir-porto-alegre'].filtros).toEqual({secao:'investir',tipo:'studio,loft',cidade:'Porto Alegre'}));
 it('Canoas é a cidade da URL',()=>expect(BUSCA_URLS['/imoveis-canoas'].filtros.cidade).toBe('Canoas'));
 it('pede WhatsApp no terceiro favorito, não no segundo',()=>{expect(devePedirAviso(1,2,false)).toBe(false);expect(devePedirAviso(2,3,false)).toBe(true);expect(devePedirAviso(2,3,true)).toBe(false);});
 it('favoritos permanecem no aparelho sem login',()=>{salvarFavoritos(['a','b','a']);expect(lerFavoritos()).toEqual(['a','b']);localStorage.clear();});
 it('pedido aviso_preco conserva UUID e lista ao reenviar',()=>{const p=pedidoAviso('00000000-0000-4000-8000-000000000001',['a','b','c'],'/busca','2026-11-18T02:44:00Z');const data=mergeDadosSite({pedidos:[p]},{pedidos:[p]});expect(data.pedidos).toEqual([p]);expect(p.tipo).toBe('aviso_preco');expect(p.imoveis).toEqual(['a','b','c']);});
 it('sitemap omite data sem fonte e conserva publicação real',()=>{expect(xmlUrl('https://uhome.com.br/busca')).not.toContain('lastmod');expect(xmlUrl('https://uhome.com.br/imovel/a','2026-11-10T15:00:00Z')).toContain('<lastmod>2026-11-10</lastmod>');});
});