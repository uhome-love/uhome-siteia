/** Dias em que um imóvel publicado conta como "Novo" (selo e filtro Novidades). */
export const DIAS_NOVIDADE = 30;
/** Novo = publicado há até 30 dias. Sem data, não é novo. */
export function ehNovo(publicadoEm: string | null | undefined, agora: number = Date.now()): boolean {
  if (!publicadoEm) return false;
  const t = new Date(publicadoEm).getTime();
  return Number.isFinite(t) && t <= agora && agora - t <= DIAS_NOVIDADE * 864e5;
}
