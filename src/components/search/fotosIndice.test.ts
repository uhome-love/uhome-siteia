import { describe, it, expect } from 'vitest';
import { indiceDoScroll } from './fotosIndice';
describe('indiceDoScroll', () => {
  it('primeira foto no início', () => expect(indiceDoScroll(0, 390, 5)).toBe(0));
  it('arredonda para a foto mais próxima', () => expect(indiceDoScroll(600, 390, 5)).toBe(2));
  it('não passa da última', () => expect(indiceDoScroll(9999, 390, 5)).toBe(4));
  it('uma foto só fica em 0', () => expect(indiceDoScroll(300, 390, 1)).toBe(0));
});
