import { comTipo } from "@/pages/SearchExperience";
it("título com tipo", () => {
  expect(comTipo("apartamento", "Mais de 1.000 imóveis à venda em Porto Alegre")).toBe("Mais de 1.000 apartamentos à venda em Porto Alegre");
  expect(comTipo(undefined, "61 imóveis à venda em Xangri-Lá")).toBe("61 imóveis à venda em Xangri-Lá");
});

import { tituloBuscaComTotal } from "@/services/buscaSite";
test("singular com 1 imóvel", () => {
  expect(comTipo("apartamento", tituloBuscaComTotal(1, "Porto Alegre"))).toBe("1 apartamento à venda em Porto Alegre");
  expect(comTipo(undefined, tituloBuscaComTotal(1, "Canoas"))).toBe("1 imóvel à venda em Canoas");
  expect(comTipo("casa", tituloBuscaComTotal(2, "Canoas"))).toBe("2 casas à venda em Canoas");
  expect(comTipo("casa", tituloBuscaComTotal(0, "Canoas"))).toBe("Nenhuma casa à venda em Canoas");
});
test("aluguel nunca aparece no título", () => {
  expect(tituloBuscaComTotal(5, "Porto Alegre")).toContain("à venda");
  expect(tituloBuscaComTotal(5, "Porto Alegre")).not.toMatch(/alug/i);
});
