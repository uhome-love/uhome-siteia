import { describe, it, expect, vi } from 'vitest';
import { buscarCedo } from '@/lib/buscaCedo';
import { buscarSite } from '@/services/buscaSite';
describe('busca antecipada', () => {
  it('a página reaproveita o pedido feito no início, sem pedir duas vezes', async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ rows: [], count: 7 }), { status: 200 }));
    vi.stubGlobal('fetch', f);
    const filtros = { secao: 'imoveis', cidade: 'Canoas', ordem: 'recentes', limit: 40 };
    buscarCedo(filtros);
    const r = await buscarSite({ ...filtros });
    expect(r.count).toBe(7);
    expect(f).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
