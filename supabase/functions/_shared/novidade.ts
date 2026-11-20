/** Dias em que um imóvel publicado conta como "Novo" (selo e filtro Novidades). */
export const DIAS_NOVIDADE = 30;
export function ehNovo(publicadoEm: string | null | undefined, agora: number = Date.now()): boolean {
  if (!publicadoEm) return false;
  const t = new Date(publicadoEm).getTime();
  return Number.isFinite(t) && t <= agora && agora - t <= DIAS_NOVIDADE * 864e5;
}
const FASES: Record<string, string> = { na_planta: 'Lançamento', em_construcao: 'Em obras', novo: 'Pronto pra morar' };
export function selosDoCard(publicadoEm: string | null | undefined, fase: string | null | undefined, personalizado?: string, agora = Date.now()): { foto?: string; linha?: string } {
  const f = fase ? FASES[fase] : undefined;
  const fotoPrincipal = personalizado ?? (ehNovo(publicadoEm, agora) ? 'Novo' : undefined);
  if (fotoPrincipal) return { foto: fotoPrincipal, linha: f && f !== 'Pronto pra morar' ? f : undefined };
  return { foto: f };
}