/**
 * Formats a numeric string into Brazilian Real display: 800000 → "800.000"
 * Only keeps digits. Returns raw string for input display (without R$ prefix).
 */
export function formatCurrency(value: string | number): string {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("pt-BR");
}

/** Strips formatting, returns raw number */
export function rawCurrency(value: string): number {
  return Number(value.replace(/\D/g, "")) || 0;
}
