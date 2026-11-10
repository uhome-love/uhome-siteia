import { describe, it, expect } from "vitest";
import { primeiraParcelaSAC, custoMensalFixo } from "@/lib/financiamento";

describe("financiamento", () => {
  it("primeira parcela SAC de R$ 500 mil (20% entrada, 30 anos, 10,5%)", () => {
    // 400.000/360 + 400.000*0,00875 = 1.111,11 + 3.500
    expect(Math.round(primeiraParcelaSAC(500000))).toBe(4611);
  });
  it("custo mensal converte IPTU anual", () => {
    expect(custoMensalFixo({ preco_condominio: 500, preco_iptu: 1200, iptu_periodicidade: "anual" })).toBe(600);
  });
});
