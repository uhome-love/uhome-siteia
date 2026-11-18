import { describe, it, expect } from 'vitest';
import { criarPasta, alternarNaPasta, apagarPasta, definirNota, removerImovel, juntarPastas, linkPasta } from '@/lib/favoritosPastas';
const base = () => alternarNaPasta(alternarNaPasta(criarPasta(criarPasta({ pastas: [], notas: {} }, 'Visitar', 'a'), 'Família', 'b'), 'a', 'x'), 'b', 'x');
describe('favoritos em pastas', () => {
  it('um imóvel fica em mais de uma pasta', () => { const e = base(); expect(e.pastas.map(p => p.itens)).toEqual([['x'], ['x']]); });
  it('apagar pasta não apaga o imóvel das outras pastas', () => { const e = apagarPasta(base(), 'a'); expect(e.pastas).toHaveLength(1); expect(e.pastas[0].itens).toEqual(['x']); });
  it('desfavoritar tira o imóvel de todas as pastas e da nota', () => { const e = removerImovel(definirNota(base(), 'x', 'perto da escola'), 'x'); expect(e.pastas.every(p => p.itens.length === 0)).toBe(true); expect(e.notas.x).toBeUndefined(); });
  it('nota vazia é removida', () => { expect(definirNota(definirNota(base(), 'x', 'oi'), 'x', '  ').notas).toEqual({}); });
  it('ao entrar na conta junta pastas e itens sem perder nada', () => {
    const j = juntarPastas({ pastas: [{ id: 'a', nome: 'Visitar', ordem: 0, itens: ['x'] }], notas: { x: 'local' } }, { pastas: [{ id: 'a', nome: 'Visitar', ordem: 0, itens: ['y'] }, { id: 'c', nome: 'Conta', ordem: 1, itens: [] }], notas: { y: 'conta' } });
    expect(j.pastas.find(p => p.id === 'a')!.itens.sort()).toEqual(['x', 'y']); expect(j.pastas).toHaveLength(2); expect(j.notas).toEqual({ x: 'local', y: 'conta' });
  });
  it('link compartilhado só leitura', () => { expect(linkPasta('https://uhome.com.br', 't1')).toBe('https://uhome.com.br/favoritos/p/t1'); });
});
