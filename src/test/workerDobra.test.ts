import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const source = readFileSync('cloudflare/uhome-seo-bot-handler.js', 'utf8').split('export default')[0].replace('export function caminhoDobra', 'function caminhoDobra');
const factory = new Function('fetch', 'caches', `${source};return {caminhoDobra,dobra,ESPERA_DOBRA};`);

describe('roteamento e tolerância da borda', () => {
  it.each(['', '?gclid=abc', '?utm_source=ig&utm_medium=paid', '?x=123', '?gbraid=abc&wbraid=abc', '?gad_source=1&gad_campaignid=abc', '?fbclid=a&msclkid=b&_gl=c'])('Home recebe molde com qualquer parâmetro: %s', query => {
    const worker = factory(vi.fn(), {});
    expect(worker.caminhoDobra(new URL(`https://uhome.com.br/${query}`))).toBe('/');
  });
  it('produto com gclid recebe molde; busca filtrada segue sem ele', () => {
    const worker = factory(vi.fn(), {});
    expect(worker.caminhoDobra(new URL('https://uhome.com.br/em-foco/open-arvoredo?gclid=abc'))).toBe('/em-foco/open-arvoredo');
    expect(worker.caminhoDobra(new URL('https://uhome.com.br/busca?utm_source=google'))).toBeNull();
  });
  it('tolera 3000 ms no primeiro pedido, sem atrasar cache quente', () => {
    expect(factory(vi.fn(), {}).ESPERA_DOBRA).toBe(3000);
  });
  it('não grava corpo vazio no cache da borda', async () => {
    const put = vi.fn();
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ head: '', pre: '', script: '' })));
    const worker = factory(fetch, { default: { match: vi.fn().mockResolvedValue(undefined), put } });
    const ctx = { waitUntil: vi.fn() };
    expect(await worker.dobra('/', ctx)).toBeNull(); expect(put).not.toHaveBeenCalled();
  });
});