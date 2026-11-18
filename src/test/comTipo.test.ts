import { comTipo } from "@/pages/SearchExperience";
it("título com tipo", () => {
  expect(comTipo("apartamento", "Mais de 1.000 imóveis à venda em Porto Alegre")).toBe("Mais de 1.000 apartamentos à venda em Porto Alegre");
  expect(comTipo(undefined, "61 imóveis à venda em Xangri-Lá")).toBe("61 imóveis à venda em Xangri-Lá");
});
