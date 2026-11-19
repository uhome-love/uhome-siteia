import { urlFiltros } from '@/lib/buscaUrl';
import { cardFotoUrl } from '@/lib/searchImages';
import { BUSCA_URLS } from '../../supabase/functions/_shared/buscaConfig';
/** Pedidos da busca começados no início do site (dados crus), reaproveitados pela página. */
export const pedidosCedo = new Map<string, Promise<unknown>>();
export function pedirBuscaCru(filtros: Record<string, unknown>): Promise<unknown> {
  const url = import.meta.env.VITE_SUPABASE_URL, chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return fetch(`${url}/rest/v1/rpc/busca_site`, { method: 'POST', headers: { apikey: chave, Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p: filtros }) })
    .then((r) => { if (!r.ok) throw new Error(`busca_site ${r.status}`); return r.json(); });
}
export function buscarCedo(filtros: Record<string, unknown>) {
  const k = JSON.stringify(filtros); if (pedidosCedo.has(k)) return;
  const pr = pedirBuscaCru(filtros);
  // Assim que os dados chegam, já baixa a 1ª foto, antes da página desenhar o card.
  pr.then((d: any) => { const f = d?.rows?.[0]?.foto_principal; if (f) { const im = new Image(); (im as any).fetchPriority = 'high'; im.src = cardFotoUrl(f); } }).catch(() => {}); pr.catch(() => pedidosCedo.delete(k)); pedidosCedo.set(k, pr); setTimeout(() => pedidosCedo.delete(k), 20000);
}
/** Fileira "Novos no site" da Home: mesmo objeto (mesma chave) no início do site e na página. */
export const HOME_NOVOS = { secao: 'imoveis', cidade: 'Porto Alegre', ordem: 'recentes', novidades: 30, limit: 5 } as const;
/** Na busca, pede os imóveis junto com o resto do site, sem esperar a página carregar. */
export function iniciarBuscaCedo() {
  try {
    const path = location.pathname.replace(/^\/c\/[^/]+/, '');
    const preset = BUSCA_URLS[path as keyof typeof BUSCA_URLS] as { filtros?: Record<string, unknown> } | undefined;
    if (path === '/') { buscarCedo({ ...HOME_NOVOS }); return; }
    if (path !== '/busca' && !preset) return;
    const params = new URLSearchParams(location.search);
    if (params.get('modo') === 'ia') return;
    const seed = (window as any).__UH_BUSCA_V3__;
    if (seed?.path === path && !params.toString()) return;
    buscarCedo({ ...urlFiltros(params, preset?.filtros), limit: 40 });
  } catch { /* a página pede normalmente */ }
}
