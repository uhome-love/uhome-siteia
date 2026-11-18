function agoraSP(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = (key: string) => Number(parts.find(p => p.type === key)?.value ?? 0);
  return new Date(value("year"), value("month") - 1, value("day"), 12);
}
export function proximosDiasFoco(now = agoraSP()): Date[] {
  const dias: Date[] = [];
  for (let i = 1; dias.length < 5; i++) {
    const d = new Date(now); d.setDate(d.getDate() + i); d.setHours(12, 0, 0, 0);
    if (d.getDay() !== 0) dias.push(d);
  }
  return dias;
}
export const diaInicialFoco = (dias: Date[]) => dias.find(d => d.getDay() === 6) ?? dias[0];
export const dataLocalFoco = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function erroTelefoneFoco(t: string): string | null {
  const n = t.replace(/\D/g, "").length;
  if (n < 10) return `Confira o número: faltam ${11 - n} dígitos.`;
  return n > 11 ? "Confira o número: use DDD e telefone, sem código do país." : null;
}