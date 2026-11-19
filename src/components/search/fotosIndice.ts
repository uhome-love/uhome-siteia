/** Índice da foto visível a partir da rolagem do trilho. */
export function indiceDoScroll(scrollLeft: number, largura: number, total: number): number {
  if (largura <= 0 || total <= 1) return 0;
  return Math.min(total - 1, Math.max(0, Math.round(scrollLeft / largura)));
}
