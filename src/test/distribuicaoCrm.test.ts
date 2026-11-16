import { describe, it, expect } from "vitest";
import { decidirDistribuicao, variacoesTelefone } from "../../supabase/functions/sync-to-crm/distribuicao";

describe("distribuição de contato do site no CRM", () => {
  it("pessoa com corretor ativo: só acrescentar", () => {
    expect(decidirDistribuicao([{ corretor_id: "c1", arquivado: false, stage_tipo: "visita" }])).toBe("so_acrescentar");
  });
  it("sem corretor: Fila do CEO", () => {
    expect(decidirDistribuicao([{ corretor_id: null }])).toBe("fila_ceo");
  });
  it("descartada: Fila do CEO", () => {
    expect(decidirDistribuicao([{ corretor_id: "c1", stage_tipo: "descarte" }])).toBe("fila_ceo");
  });
  it("arquivada: Fila do CEO", () => {
    expect(decidirDistribuicao([{ corretor_id: "c1", arquivado: true }])).toBe("fila_ceo");
  });
  it("pessoa nova: Fila do CEO", () => {
    expect(decidirDistribuicao([])).toBe("fila_ceo");
  });
  it("telefone com e sem 55", () => {
    expect(variacoesTelefone("(51) 99259-7097")).toEqual(["51992597097", "5551992597097"]);
  });
});
