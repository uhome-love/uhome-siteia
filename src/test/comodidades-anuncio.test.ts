import { describe, it, expect } from "vitest";
import { comodidadesDoAnuncio } from "@/services/imoveis";
describe("comodidades do anúncio", () => {
  it("mostra comodidades cadastradas mesmo sem diferenciais", () => {
    expect(comodidadesDoAnuncio(["Piscina", "Churrasqueira"], [])).toEqual(["Piscina", "Churrasqueira"]);
  });
  it("não repete itens iguais com acento ou caixa diferentes", () => {
    expect(comodidadesDoAnuncio(["Área de serviço"], ["area de servico", "Sacada"])).toEqual(["Área de serviço", "Sacada"]);
  });
});
