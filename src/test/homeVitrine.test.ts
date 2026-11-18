import { describe, it, expect } from 'vitest';
import { urlBuscaHome, novoDesdeVisita, registrarVisitaHome } from '@/lib/homeVitrine';

describe('Home: busca da pílula', () => {
  it('leva Onde/Tipo/Quartos/Valor para /busca', () => {
    expect(urlBuscaHome({ onde: ' Petrópolis ', tipo: 'apartamento', quartos: '3', valor: '700000' })).toBe('/busca?q=Petr%C3%B3polis&tipo=apartamento&quartos=3&preco_max=700000');
  });
  it('sem nada escolhido vai para /busca', () => { expect(urlBuscaHome({ quartos: '0', valor: '' })).toBe('/busca'); });
});

describe('Home: novo desde a última visita', () => {
  const ultima = new Date('2026-11-10T12:00:00Z').getTime();
  it('marca só o que foi publicado depois', () => {
    expect(novoDesdeVisita('2026-11-11T00:00:00Z', ultima)).toBe(true);
    expect(novoDesdeVisita('2026-11-09T00:00:00Z', ultima)).toBe(false);
  });
  it('primeira visita não marca nada', () => { expect(novoDesdeVisita('2026-11-11T00:00:00Z', null)).toBe(false); });
  it('a visita anterior é a de antes, não a atual', () => {
    const m = new Map<string, string>(); const s = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
    expect(registrarVisitaHome(1_000, s)).toBe(null);
    expect(registrarVisitaHome(1_000 + 60 * 60_000, s)).toBe(1_000);
    expect(registrarVisitaHome(1_000 + 70 * 60_000, s)).toBe(1_000);
  });
});

import { tituloBuscaComTotal, categorias3dVisiveis } from '../../supabase/functions/_shared/buscaConfig';
describe('Busca: título com total', () => {
  it('0, 1, 999 e acima de 1.000', () => {
    expect(tituloBuscaComTotal(0)).toBe('Nenhum imóvel à venda em Porto Alegre');
    expect(tituloBuscaComTotal(1, 'Canoas')).toBe('1 imóvel à venda em Canoas');
    expect(tituloBuscaComTotal(999)).toBe('999 imóveis à venda em Porto Alegre');
    expect(tituloBuscaComTotal(1284)).toBe('Mais de 1.000 imóveis à venda em Porto Alegre');
  });
  it('categoria com menos de 8 imóveis não aparece', () => {
    const ids = categorias3dVisiveis({ studios: 8, terrenos: 7 }, { garden: 20, cobertura: 3 }).map((c) => c.id);
    expect(ids).toEqual(['garden', 'studios']);
  });
});

import { urlDeFiltros } from '@/lib/homeVitrine';
import { alternarComodidade } from '@/components/search/SearchFilterDialog';
describe('Painel de filtros', () => {
  it('leva comodidades, banheiros, vagas e faixa de preço para a busca', () => {
    expect(urlDeFiltros({ secao: 'imoveis', ordem: 'recentes', tipo: 'garden', precoMin: 300000, precoMax: 700000, banheiros: 2, vagas: 1, comodidades: 'Piscina,Sacada', quartos: 0 }))
      .toBe('/busca?tipo=garden&preco_min=300000&preco_max=700000&banheiros=2&vagas=1&comodidades=Piscina%2CSacada');
  });
  it('liga e desliga uma comodidade sem perder as outras', () => {
    expect(alternarComodidade('Piscina', 'Sacada')).toBe('Piscina,Sacada');
    expect(alternarComodidade('Piscina,Sacada', 'Piscina')).toBe('Sacada');
  });
});
