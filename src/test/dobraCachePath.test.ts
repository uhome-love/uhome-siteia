import { afterEach, describe, expect, it, vi } from 'vitest';
import { criarCacheDobra, pathDobra } from '../../supabase/functions/site-dobra/cacheDobra';

afterEach(() => vi.useRealTimers());
describe('chaves da primeira tela sem rastreio', () => {
  it.each(['gclid=abc123', 'gbraid=abc', 'wbraid=abc', 'gad_source=1&gad_campaignid=123', 'utm_source=ig&utm_medium=paid', 'fbclid=abc&msclkid=abc&_gl=abc', 'x=123'])('Home usa a mesma chave com %s', query => {
    expect(pathDobra(`/?${query}`)).toBe('/');
  });
  it('produto com rastreio mantém seu slug e prefixo do corretor', () => {
    expect(pathDobra('/em-foco/open-arvoredo?gclid=abc&gad_source=1')).toBe('/em-foco/open-arvoredo');
    expect(pathDobra('/c/lucas/em-foco/golden-lake/?gbraid=abc')).toBe('/c/lucas/em-foco/golden-lake');
  });
});
describe('cache curto da primeira tela', () => {
  const corpo = { head: 'preload', pre: 'foto', script: 'seed' };
  it('URLs com rastreio usam a mesma resposta e uma consulta', async () => {
    const cache = criarCacheDobra(); const carregar = vi.fn().mockResolvedValue(corpo);
    const a = await cache(pathDobra('/'), carregar);
    const b = await cache(pathDobra('/?utm_source=ig'), carregar);
    expect(a).toBe(b); expect(carregar).toHaveBeenCalledTimes(1);
  });
  it('deduplica consultas simultâneas durante a partida fria', async () => {
    const cache = criarCacheDobra(); const carregar = vi.fn().mockResolvedValue(corpo);
    await Promise.all([cache('/', carregar), cache('/', carregar), cache('/', carregar)]);
    expect(carregar).toHaveBeenCalledTimes(1);
  });
  it('não guarda respostas vazias ou erros', async () => {
    const cache = criarCacheDobra();
    const carregar = vi.fn().mockResolvedValueOnce({ head: '', pre: '', script: '' }).mockRejectedValueOnce(new Error('offline')).mockResolvedValue(corpo);
    await cache('/', carregar); await expect(cache('/', carregar)).rejects.toThrow('offline');
    expect(await cache('/', carregar)).toBe(corpo); expect(carregar).toHaveBeenCalledTimes(3);
  });
  it('renova depois de 60 segundos', async () => {
    vi.useFakeTimers(); const cache = criarCacheDobra(); const carregar = vi.fn().mockResolvedValue(corpo);
    await cache('/', carregar); vi.advanceTimersByTime(59_999); await cache('/', carregar);
    expect(carregar).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1); await cache('/', carregar); expect(carregar).toHaveBeenCalledTimes(2);
  });
});