import { describe, it, expect } from 'vitest';
import { selosDoCard } from './novidade';
const agora = Date.parse('2026-11-18T12:00:00Z'); const dia = 864e5;
describe('selosDoCard', () => {
  it('novo e lançamento: Novo na foto, Lançamento na linha', () => {
    expect(selosDoCard(new Date(agora - 5 * dia).toISOString(), 'na_planta', undefined, agora)).toEqual({ foto: 'Novo', linha: 'Lançamento' });
  });
  it('antigo em obras: Em obras na foto', () => {
    expect(selosDoCard(new Date(agora - 40 * dia).toISOString(), 'em_construcao', undefined, agora)).toEqual({ foto: 'Em obras' });
  });
});
