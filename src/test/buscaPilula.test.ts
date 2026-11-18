import { describe, it, expect } from 'vitest';
import { lerPreco } from '@/components/search/SearchFilterDialog';
import { SECOES_DO_CAMPO, textosPilula } from '@/components/PilulaBusca';

describe('pílula de busca estilo Airbnb', () => {
  it('cada campo abre só a sua parte do painel', () => {
    expect(SECOES_DO_CAMPO.onde).toEqual(['onde']);
    expect(SECOES_DO_CAMPO.valor).toEqual(['preco']);
    expect(SECOES_DO_CAMPO.quartos).toEqual(['quartos']);
    expect(SECOES_DO_CAMPO.tipo[0]).toBe('tipo');
  });
  it('mostra faixa de valor com mínimo e máximo', () => {
    expect(textosPilula({ precoMin: 300000, precoMax: 1500000 })[3][2]).toBe('R$ 300 mil – R$ 1,5 mi');
  });
});

describe('preço digitado', () => {
  it('entende mil, mi e número cheio', () => {
    expect(lerPreco('500 mil')).toBe(500000);
    expect(lerPreco('1,2 mi')).toBe(1200000);
    expect(lerPreco('R$ 450.000')).toBe(450000);
    expect(lerPreco('')).toBe(0);
  });
});

import { rotuloChip } from '@/pages/SearchExperience';
describe('chips de filtros aplicados', () => {
  it('mostram valores legíveis', () => {
    expect(rotuloChip('precoMin', 400000)).toBe('A partir de R$ 400 mil');
    expect(rotuloChip('comodidades', 'Pet friendly,Piscina')).toBe('Aceita pet, Piscina');
    expect(rotuloChip('vagas', 2)).toBe('2+ vagas');
  });
});
