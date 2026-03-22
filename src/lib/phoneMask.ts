/**
 * Formats a phone string into (XX) XXXXX-XXXX pattern.
 * Only keeps digits, max 11 (DDD + 9 digits).
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Strips formatting, returns raw digits */
export function rawPhone(value: string): string {
  return value.replace(/\D/g, "");
}
