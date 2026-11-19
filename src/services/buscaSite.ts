import { pedidosCedo, pedirBuscaCru } from '@/lib/buscaCedo';
import { supabase } from '@/lib/supabaseLazy';
import { tituloLimpo, type Imovel } from '@/services/imoveis';
export { BUSCA_URLS, CATEGORIAS, SECOES, categoriasVisiveis, CATEGORIAS_3D, categorias3dVisiveis, tituloBuscaComTotal } from '../../supabase/functions/_shared/buscaConfig';
export type { BuscaSecao } from '../../supabase/functions/_shared/buscaConfig';
export interface BuscaSiteResult { rows: Imovel[]; count: number; tipos: Record<string, number>; categorias: Record<string, number> }
export function normalizarBusca(data: any): BuscaSiteResult {
  return { ...data, rows: (data?.rows ?? []).map((r: any) => ({ ...r, fotos: [], diferenciais: [], titulo: r.fonte === 'produto' ? r.titulo : tituloLimpo(r) })), count: data?.count ?? 0, tipos: data?.tipos ?? {}, categorias: data?.categorias ?? {} };
}
export { buscarCedo } from '@/lib/buscaCedo';
export async function buscarSite(filtros: Record<string, unknown>): Promise<BuscaSiteResult> {
  const k = JSON.stringify(filtros), pronto = pedidosCedo.get(k);
  if (pronto) { pedidosCedo.delete(k); return normalizarBusca(await pronto); }
  return pedir(filtros);
}
async function pedir(filtros: Record<string, unknown>): Promise<BuscaSiteResult> {
  if (import.meta.env.VITE_SUPABASE_URL && typeof fetch === 'function') return normalizarBusca(await pedirBuscaCru(filtros));
  const { data, error } = await supabase.rpc('busca_site', { p: filtros as any });
  if (error) throw error;
  return normalizarBusca(data);
}