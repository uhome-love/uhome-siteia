/** Índice da foto visível a partir da rolagem do trilho. */
export function indiceDoScroll(scrollLeft: number, largura: number, total: number): number {
  if (largura <= 0 || total <= 1) return 0;
  return Math.min(total - 1, Math.max(0, Math.round(scrollLeft / largura)));
}

/** Ao soltar o dedo: qual foto mostrar. Troca se andou >20% da largura ou foi um gesto rápido. */
export function decidirFoto(dx: number, largura: number, vel: number, i: number, total: number): number {
  const passou = Math.abs(dx) > largura * 0.2 || (Math.abs(vel) > 0.4 && Math.abs(dx) > 15);
  if (!passou) return i;
  return Math.min(total - 1, Math.max(0, i + (dx < 0 ? 1 : -1)));
}
/** Gesto é para o lado (trocar foto) e não para cima/baixo (rolar a lista). */
export function ehHorizontal(dx: number, dy: number): boolean { return Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy); }
