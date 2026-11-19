import { describe, it, expect } from 'vitest';
import { adicionarBusca, filtrosUteis, urlDaBusca } from './buscasRecentes';
describe('buscas recentes', () => {
  it('guarda no máximo 5, a mais nova primeiro', () => {
    let l: any[] = []; for (let i = 1; i <= 7; i++) l = adicionarBusca(l, { cidade: `C${i}` }, `C${i}`, i);
    expect(l).toHaveLength(5); expect(l[0].rotulo).toBe('C7'); expect(l[4].rotulo).toBe('C3');
  });
  it('não repete a mesma busca, só sobe para o topo', () => {
    let l = adicionarBusca([], { cidade: 'Canoas' }, 'Canoas', 1); l = adicionarBusca(l, { bairro: 'Moinhos' }, 'Moinhos', 2); l = adicionarBusca(l, { cidade: 'Canoas', ordem: 'recentes' }, 'Canoas', 3);
    expect(l.map((b) => b.rotulo)).toEqual(['Canoas', 'Moinhos']);
  });
  it('busca sem filtro não é guardada', () => { expect(filtrosUteis({ secao: 'imoveis', cidade: '', ordem: 'recentes' })).toBeNull(); });
  it('monta o endereço com os nomes da URL', () => { expect(urlDaBusca({ cidade: 'Canoas', precoMax: 800000 })).toBe('/busca?cidade=Canoas&preco_max=800000'); });
});
