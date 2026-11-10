// Regras puras da LIA no site (validadas por testes).

export const TURNOS = ["manha", "tarde", "noite"] as const;
export type Turno = (typeof TURNOS)[number];

export const TURNO_LABEL: Record<Turno, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Começo da noite",
};

/** Normaliza telefone BR para só dígitos com DDD (10 ou 11 dígitos). Retorna null se inválido. */
export function normalizarTelefone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  if (d.length === 11 && d[2] !== "9") return null;
  return d;
}

/** Data de visita precisa ser YYYY-MM-DD entre hoje e 60 dias à frente. */
export function validarDataVisita(data: unknown, hojeISO: string): string | null {
  if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
  const d = Date.parse(data + "T12:00:00Z");
  const h = Date.parse(hojeISO + "T12:00:00Z");
  if (Number.isNaN(d)) return null;
  const dias = Math.round((d - h) / 86400000);
  if (dias < 0 || dias > 60) return null;
  return data;
}

export function normalizarTurno(t: unknown): Turno | null {
  if (typeof t !== "string") return null;
  const s = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (s.includes("manh")) return "manha";
  if (s.includes("tard")) return "tarde";
  if (s.includes("noit")) return "noite";
  return null;
}

/** Divide a resposta da LIA em bolhas (separador |||), no máximo 3, sem markdown. */
export function dividirBolhas(texto: string): string[] {
  return texto
    .replace(/\*\*|__|^#+\s*/gm, "")
    .replace(/\s—\s/g, ", ")
    .split("|||")
    .map((b) => b.trim())
    .filter(Boolean)
    .slice(0, 3);
}
