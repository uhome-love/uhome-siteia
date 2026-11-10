import { describe, it, expect } from "vitest";
import { filtrarProdutosCampanha } from "@/lib/campanhaFilters";
import type { ProdutoFoco } from "@/lib/produtosFoco";
const produtos = [400_000, 1_000_000, 3_600_000, null].map((preco_a_partir, i) => ({ id: String(i), preco_a_partir, cidade: i === 2 ? "Canela" : "Porto Alegre" } as ProdutoFoco));
describe("Filtros da campanha", () => {
 it("inclui 400 mil no limite até 400 mil", () => expect(filtrarProdutosCampanha(produtos, "todas", "ate400").map(p => p.id)).toEqual(["0"]));
 it("inclui um milhão apenas na faixa intermediária", () => expect(filtrarProdutosCampanha(produtos, "todas", "400a1m").map(p => p.id)).toEqual(["1"]));
 it("acima de um milhão exclui o limite e preços desconhecidos", () => expect(filtrarProdutosCampanha(produtos, "todas", "1m").map(p => p.id)).toEqual(["2"]));
 it("sem faixa mantém os preços desconhecidos", () => expect(filtrarProdutosCampanha(produtos, "todas", "todos")).toHaveLength(4));
 it("combina cidade e preço", () => expect(filtrarProdutosCampanha(produtos, "Porto Alegre", "1m")).toHaveLength(0));
});
