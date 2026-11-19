import { describe, it, expect } from 'vitest';
import { resumoEtapa } from './BuscaEtapas';
import { textoMostrar } from './SearchFilterDialog';
describe('busca em etapas', () => {
  it('resume o local escolhido', () => { expect(resumoEtapa('onde', { bairro: 'Blue Xangri-Lá' })).toBe('Blue Xangri-Lá'); expect(resumoEtapa('onde', {})).toBe('Qualquer lugar'); });
  it('resume vários tipos', () => { expect(resumoEtapa('tipo', { tipo: 'casa,cobertura' })).toBe('Casa, Cobertura'); });
  it('botão no singular com 1 imóvel', () => { expect(textoMostrar(false, { count: 1 } as any)).toBe('Mostrar 1 imóvel'); });
  it('resume mais filtros', () => { expect(resumoEtapa('mais', { quartos: 2, comodidades: 'Piscina' })).toBe('2+ quartos · Piscina'); expect(resumoEtapa('mais', {})).toBe('Opcional'); });
});
