import { describe, it, expect } from 'vitest';
import { formatPreco } from './imoveis';
describe('formatPreco', () => {
  it('valor simbólico vira Consulte', () => { expect(formatPreco(0.1)).toBe('Consulte'); expect(formatPreco(0)).toBe('Consulte'); });
  it('valor real aparece em reais', () => { expect(formatPreco(535000)).toMatch(/535\.000/); });
});
