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

import { posParaPreco, precoParaPos, POS_MAX } from '@/components/search/SearchFilterDialog';
import { limparVazios } from '@/components/PilulaBusca';
import { proximaAltura } from '@/components/search/GavetaMapa';
import { RAPIDOS } from '@/lib/filtrosRapidos';
describe('faixa de preço com escala Airbnb', () => {
  it('passos de R$ 10 mil até 1 mi e de R$ 50 mil acima', () => {
    expect(posParaPreco(1)).toBe(10000);
    expect(posParaPreco(100)).toBe(1000000);
    expect(posParaPreco(101)).toBe(1050000);
    expect(posParaPreco(POS_MAX)).toBe(3000000);
    expect(precoParaPos(450000)).toBe(45);
    expect(precoParaPos(2000000)).toBe(120);
  });
});
describe('buscar sem filtro', () => {
  it('limpa cidade e campos vazios', () => {
    expect(limparVazios({ cidade: '', q: '', quartos: 0 })).toEqual({ secao: 'imoveis', ordem: 'recentes', cidade: '' });
  });
});
describe('gaveta do mapa', () => {
  it('sobe e desce uma altura por arraste', () => {
    expect(proximaAltura('meia', 120)).toBe('cheia');
    expect(proximaAltura('meia', -120)).toBe('baixa');
    expect(proximaAltura('meia', 10)).toBe('meia');
  });
});
describe('chips rápidos', () => {
  it('aceita pet liga e desliga mantendo outras comodidades', () => {
    const pet = RAPIDOS.find((r) => r.id === 'Pet friendly')!;
    const on = pet.alternar({ comodidades: 'Piscina' });
    expect(on.comodidades).toBe('Piscina,Pet friendly');
    expect(pet.alternar(on).comodidades).toBe('Piscina');
  });
});
