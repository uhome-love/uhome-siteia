import { afterEach, describe, expect, it, vi } from 'vitest';
import { iniciarDetalheCedo, pedidosDetalheCedo, DETAIL_COLUMNS } from '@/lib/detalheCedo';
import { capaResponsiva } from '@/lib/imagemCapa';
import { fetchImovelBySlug } from '@/services/imoveis';

afterEach(() => { vi.unstubAllGlobals(); pedidosDetalheCedo.clear(); document.querySelectorAll('link[data-uh-detalhe-foto]').forEach(l => l.remove()); history.replaceState({}, '', '/'); });

describe('foto do detalhe antes do pacote principal', () => {
  it('inicia uma só consulta e o detalhe lê os mesmos dados sem repetir o download', async () => {
    const slug = 'apartamento-3-quartos-santa-cecilia-61277-LFC';
    const foto = 'https://s01.jetimgs.com/capa/.jpg';
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ slug, tipo: 'apartamento', bairro: 'Santa Cecília', finalidade: 'venda', quartos: 3, fotos: [{ url: foto, ordem: 0, principal: true }] }])));
    vi.stubGlobal('fetch', fetch);
    history.replaceState({}, '', `/imovel/${slug}`);
    iniciarDetalheCedo(); iniciarDetalheCedo();
    await pedidosDetalheCedo.get(slug);
    const result = await fetchImovelBySlug(slug);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(new URL(fetch.mock.calls[0][0]).searchParams.get('select')).toBe(DETAIL_COLUMNS);
    expect(result?.slug).toBe(slug);
    const link = document.querySelector<HTMLLinkElement>('link[data-uh-detalhe-foto]');
    expect(link?.href).toBe(capaResponsiva(foto).src);
    expect(link?.imageSrcset).toBe(capaResponsiva(foto).srcSet);
    expect(link?.imageSizes).toBe(capaResponsiva(foto).sizes);
    expect(pedidosDetalheCedo.size).toBe(0);
  });
  it.each(['/busca', '/', '/imovel/85149-UH', '/imovel/%ZZ'])('não abre consultas de detalhe desnecessárias: %s', path => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch); history.replaceState({}, '', path);
    iniciarDetalheCedo(); expect(fetch).not.toHaveBeenCalled();
  });
  it('falha de rede não deixa promessa rejeitada bloqueando uma nova tentativa', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    history.replaceState({}, '', '/imovel/falha'); iniciarDetalheCedo();
    await pedidosDetalheCedo.get('falha')?.catch(() => {});
    await Promise.resolve();
    expect(pedidosDetalheCedo.has('falha')).toBe(false);
    expect(document.querySelector('link[data-uh-detalhe-foto]')).toBeNull();
  });
});