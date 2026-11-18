import { describe, expect, it } from "vitest";
import { proximosDiasFoco, diaInicialFoco, erroTelefoneFoco, dataLocalFoco } from "@/lib/focoVisit";
describe("dias de visita", () => {
  it("oferece cinco próximos dias", () => { expect(proximosDiasFoco(new Date(2026, 10, 17))).toHaveLength(5); });
  it("não oferece domingo", () => { expect(proximosDiasFoco(new Date(2026, 10, 20)).map(dataLocalFoco)).toEqual(["2026-11-21", "2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26"]); });
  it("marca o próximo sábado", () => { const d = diaInicialFoco(proximosDiasFoco(new Date(2026, 10, 17))); expect(d && dataLocalFoco(d)).toBe("2026-11-21"); });
});
describe("telefone", () => {
  it("informa quantos dígitos faltam", () => { expect(erroTelefoneFoco("(51) 999")).toBe("Confira o número: faltam 6 dígitos."); });
  it("aceita WhatsApp completo com DDD", () => { expect(erroTelefoneFoco("(51) 99999-9999")).toBeNull(); });
});