import { describe, it, expect } from "vitest";
import { normalizarTelefone, validarDataVisita, normalizarTurno, dividirBolhas } from "../../supabase/functions/lia-chat/regras";

describe("regras da LIA", () => {
  it("normaliza WhatsApp com DDD e rejeita inválido", () => {
    expect(normalizarTelefone("+55 (51) 99999-0001")).toBe("51999990001");
    expect(normalizarTelefone("9999")).toBeNull();
  });
  it("visita só entre hoje e 60 dias", () => {
    expect(validarDataVisita("2026-11-14", "2026-11-10")).toBe("2026-11-14");
    expect(validarDataVisita("2026-11-09", "2026-11-10")).toBeNull();
    expect(validarDataVisita("2027-02-01", "2026-11-10")).toBeNull();
  });
  it("entende o turno", () => {
    expect(normalizarTurno("Manhã")).toBe("manha");
    expect(normalizarTurno("de tarde")).toBe("tarde");
    expect(normalizarTurno("qualquer")).toBeNull();
  });
  it("máximo de 3 bolhas, sem markdown", () => {
    expect(dividirBolhas("**a**|||b|||c|||d")).toEqual(["a", "b", "c"]);
  });
});
