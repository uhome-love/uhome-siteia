import { describe, it, expect } from "vitest";
import { tipoFoco, tituloFoco, numerosFoco } from "../../supabase/functions/_shared/focoPresentation";

describe("classificação da oferta principal", () => {
  it.each([
    ["Lotes de 160 a 547 m² (casa opcional com parceiro)", "Lotes"],
    ["Sobrados de 2 e 3 dormitórios com terraço", "Sobrados"],
    ["Casas em condomínio", "Casas"],
    ["Studio e 1 dormitório", "Studios"],
    ["Apartamentos 2 e 3 dormitórios", "Apartamentos"],
    ["Coberturas de 3 suítes", "Coberturas"],
    ["Apartamentos e coberturas de 3 e 4 suítes", "Apartamentos"],
  ])("%s classifica como %s", (tipo, esperado) => {
    expect(tipoFoco({ nome: "Produto", tipo })).toBe(esperado);
  });
  it("consulta segmento se tipo estiver ausente", () => {
    expect(tipoFoco({ nome: "Essence", segmento: "Lotes em condomínio clube" })).toBe("Lotes");
  });
  it("respeita o título manual por produto", () => {
    expect(tituloFoco({ nome: "Essence", tipo: "Lotes", ficha: { titulo_manual: "Oferta definida pela central" } })).toBe("Oferta definida pela central");
  });
});

describe("números visíveis", () => {
  it("omite suíte 0 e mantém os outros números preenchidos", () => {
    expect(numerosFoco({ entrega: "Março de 2029", ficha: { tipologias: [{ area: "31,4 a 52 m²", dorm: 2, suites: 0, vagas: "1" }] } }).map(n => n.label)).toEqual(["Área", "Quartos", "Vaga", "Entrega prevista"]);
  });
  it("omite todos os números zerados", () => {
    expect(numerosFoco({ entrega: "0", ficha: { tipologias: [{ area: "0 m²", dorm: 0, suites: 0, vagas: "0" }] } })).toEqual([]);
  });
  it("omite campos vazios", () => {
    expect(numerosFoco({ entrega: "  ", ficha: { tipologias: [{ vagas: " " }] } })).toEqual([]);
  });
  it("conserva suíte positiva sem incluir zero no intervalo", () => {
    expect(numerosFoco({ ficha: { tipologias: [{ suites: 0 }, { suites: 1 }] } })).toEqual([{ label: "Suíte", valor: "1" }]);
  });
});