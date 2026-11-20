import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { catalogoPublico, itemPublico } from '@/lib/catalogoPublico';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
beforeEach(() => { vi.stubEnv('VITE_SUPABASE_URL', 'https://catalogo.example'); vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'public-test-key'); });
describe('catálogo público sem cliente de autenticação', () => {
  it('mantém ativo, em_foco, ordem e as permissões anônimas', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://catalogo.example');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'public-test-key');
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([{ id: 'produto' }])));
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    const data = await catalogoPublico('produtos_foco', { select: 'id', ativo: 'eq.true', em_foco: 'eq.true', order: 'ordem.asc' }, controller.signal);
    const [url, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(new URL(url).searchParams.get('ativo')).toBe('eq.true');
    expect(new URL(url).searchParams.get('em_foco')).toBe('eq.true');
    expect(new URL(url).searchParams.get('order')).toBe('ordem.asc');
    expect(options).toMatchObject({ credentials: 'omit', signal: controller.signal, headers: { apikey: 'public-test-key', Authorization: 'Bearer public-test-key', 'Accept-Profile': 'public', Range: '0-1999' } });
    expect(data).toEqual([{ id: 'produto' }]);
  });
  it('mantém a relação ordenada dos produtos da campanha', async () => {
    const fetchMock = vi.fn(async () => new Response('[]')); vi.stubGlobal('fetch', fetchMock);
    await catalogoPublico('campanha_produtos', { select: 'ordem,produto:produtos_foco!inner(id)', campanha_id: 'eq.campanha', 'produto.ativo': 'eq.true', order: 'ordem.asc' });
    const [url] = fetchMock.mock.calls[0] as unknown as [string];
    const params = new URL(url).searchParams;
    expect(params.get('select')).toBe('ordem,produto:produtos_foco!inner(id)');
    expect(params.get('produto.ativo')).toBe('eq.true');
    expect(params.get('campanha_id')).toBe('eq.campanha');
  });
  it('devolve null para produto inexistente', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('[]')));
    expect(await itemPublico('produtos_foco', { slug: 'eq.open-arvoredo' })).toBeNull();
  });
  it('não escolhe um produto arbitrário se houver duplicação', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('[{},{}]')));
    await expect(itemPublico('produtos_foco', { slug: 'eq.open-arvoredo' })).rejects.toThrow('Mais de um item');
  });
  it('propaga falha da consulta em vez de esconder a oferta', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })));
    await expect(catalogoPublico('campanhas', {})).rejects.toThrow('503');
  });
});