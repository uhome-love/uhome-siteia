import { describe, it, expect } from 'vitest';
import { indiceDoScroll } from './fotosIndice';
describe('indiceDoScroll', () => {
  it('primeira foto no início', () => expect(indiceDoScroll(0, 390, 5)).toBe(0));
  it('arredonda para a foto mais próxima', () => expect(indiceDoScroll(600, 390, 5)).toBe(2));
  it('não passa da última', () => expect(indiceDoScroll(9999, 390, 5)).toBe(4));
  it('uma foto só fica em 0', () => expect(indiceDoScroll(300, 390, 1)).toBe(0));
});
import { decidirFoto, ehHorizontal } from './fotosIndice';
describe('decidirFoto', () => {
  it('arrastar para a esquerda mais de 20% vai para a próxima', () => expect(decidirFoto(-100, 390, 0, 0, 5)).toBe(1));
  it('arrastar pouco e devagar fica na mesma', () => expect(decidirFoto(-40, 390, 0.1, 2, 5)).toBe(2));
  it('gesto rápido curto troca', () => expect(decidirFoto(30, 390, 0.8, 2, 5)).toBe(1));
  it('não passa da última nem da primeira', () => { expect(decidirFoto(-200, 390, 0, 4, 5)).toBe(4); expect(decidirFoto(200, 390, 0, 0, 5)).toBe(0); });
});
describe('ehHorizontal', () => {
  it('lado vence cima', () => expect(ehHorizontal(30, 10)).toBe(true));
  it('vertical rola a lista', () => expect(ehHorizontal(10, 40)).toBe(false));
});
