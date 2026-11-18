export interface BuscaHome { onde?: string; tipo?: string; quartos?: string; valor?: string; cidade?: string }

/** URL de /busca a partir da pílula da Home (Onde · Tipo · Quartos · Valor até). */
export function urlBuscaHome(b: BuscaHome): string {
  const p = new URLSearchParams();
  if (b.onde?.trim()) p.set('q', b.onde.trim());
  if (b.tipo) p.set('tipo', b.tipo);
  if (b.quartos && Number(b.quartos) > 0) p.set('quartos', String(Number(b.quartos)));
  if (b.valor && Number(b.valor) > 0) p.set('preco_max', String(Number(b.valor)));
  if (b.cidade) p.set('cidade', b.cidade);
  const s = p.toString();
  return s ? `/busca?${s}` : '/busca';
}

/** URL de uma categoria da faixa (mesmos filtros da busca). */
export function urlCategoria(filtros: Record<string, unknown>): string {
  const nomes: Record<string, string> = { precoMax: 'preco_max' };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filtros)) p.set(nomes[k] ?? k, String(v));
  return `/busca?${p.toString()}`;
}

const CHAVE = 'uh_home_ultima_visita';
/** Guarda esta visita e devolve a anterior (ms) — só conta visita nova após 30 min. */
export function registrarVisitaHome(agora = Date.now(), store: Pick<Storage, 'getItem' | 'setItem'> = localStorage): number | null {
  try {
    const salvo = JSON.parse(store.getItem(CHAVE) || 'null') as { anterior: number | null; atual: number } | null;
    if (salvo && agora - salvo.atual < 30 * 60_000) { store.setItem(CHAVE, JSON.stringify({ ...salvo, atual: agora })); return salvo.anterior; }
    const anterior = salvo?.atual ?? null;
    store.setItem(CHAVE, JSON.stringify({ anterior, atual: agora }));
    return anterior;
  } catch { return null; }
}

/** "Novo desde a sua última visita": só quando há visita anterior e o imóvel entrou depois dela. */
export function novoDesdeVisita(publicadoEm: string | null | undefined, ultimaVisita: number | null): boolean {
  if (!ultimaVisita || !publicadoEm) return false;
  const t = new Date(publicadoEm).getTime();
  return Number.isFinite(t) && t > ultimaVisita;
}

/** URL de /busca a partir dos filtros do painel (mesmos nomes de parâmetro da busca). */
export function urlDeFiltros(f: Record<string, unknown>, base = '/busca'): string {
  const nomes: Record<string, string> = { precoMax: 'preco_max', precoMin: 'preco_min', areaMin: 'area_min', areaMax: 'area_max', areaUtilMin: 'area_util_min', areaUtilMax: 'area_util_max' };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) { if (!v || k === 'bounds' || k === 'limit' || k === 'offset' || (k === 'secao' && v === 'imoveis') || (k === 'ordem' && v === 'recentes')) continue; p.set(nomes[k] ?? k, String(v)); }
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}
