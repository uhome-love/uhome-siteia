import { describe, it, expect } from 'vitest';
import { usarSementeHome } from '@/lib/buscaCedo';
import { buscarSite } from '@/services/buscaSite';
import { HOME_NOVOS } from '@/lib/buscaCedo';
describe('semente da Home', () => {
  it('Novos no site usa os dados vindos no HTML sem nova consulta', async () => {
    usarSementeHome({ rows: [{ id: 'a', titulo: 'X', fonte: 'produto' }], count: 1 });
    const r = await buscarSite({ ...HOME_NOVOS });
    expect(r.rows[0].id).toBe('a');
  });
});
