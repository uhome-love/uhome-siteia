/** Últimas buscas guardadas só neste aparelho (sem login). */
const CHAVE = 'uh_buscas_recentes';
export const MAX_BUSCAS = 5;
export interface BuscaRecente { filtros: Record<string, unknown>; rotulo: string; em: number }
const PADRAO = new Set(['secao', 'ordem', 'limit', 'offset', 'bounds']);
/** Só conta como busca se tiver algum filtro de verdade. */
export function filtrosUteis(f: Record<string, unknown>): Record<string, unknown> | null {
  const o: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f)) if (!PADRAO.has(k) && v !== '' && v != null && v !== 0) o[k] = v;
  return Object.keys(o).length ? o : null;
}
export function adicionarBusca(lista: BuscaRecente[], filtros: Record<string, unknown>, rotulo: string, em = Date.now()): BuscaRecente[] {
  const uteis = filtrosUteis(filtros); if (!uteis) return lista;
  const k = JSON.stringify(uteis);
  return [{ filtros: uteis, rotulo, em }, ...lista.filter((b) => JSON.stringify(b.filtros) !== k)].slice(0, MAX_BUSCAS);
}
export function lerBuscas(): BuscaRecente[] { try { const v = JSON.parse(localStorage.getItem(CHAVE) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } }
export function salvarBusca(filtros: Record<string, unknown>, rotulo: string) { try { localStorage.setItem(CHAVE, JSON.stringify(adicionarBusca(lerBuscas(), filtros, rotulo))); } catch { /* */ } }
export function limparBuscas() { try { localStorage.removeItem(CHAVE); } catch { /* */ } }
/** Endereço /busca para repetir a busca. */
export function urlDaBusca(f: Record<string, unknown>): string {
  const nomes: Record<string, string> = { precoMax: 'preco_max', precoMin: 'preco_min', areaMin: 'area_min', areaMax: 'area_max', areaUtilMin: 'area_util_min', areaUtilMax: 'area_util_max', condominioMax: 'condominio_max' };
  const p = new URLSearchParams(); for (const [k, v] of Object.entries(f)) p.set(nomes[k] ?? k, String(v));
  return `/busca?${p.toString()}`;
}
