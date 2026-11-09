import { describe, it, expect } from "vitest";
import { blackAtiva, campanhaVigente, formatPreco, mensagemProduto } from "@/lib/produtosFoco";

const natal = { inicio: "2026-11-02", fim: "2026-12-18", config: { black: { inicio: "2026-11-23", fim: "2026-11-29", titulo: "", texto: "" } } };

describe("campanha Natal Chave de Ouro", () => {
  it("vale até 18/12 no horário de Brasília e sai do ar em 19/12", () => {
    expect(campanhaVigente(natal, new Date("2026-12-19T02:00:00Z"))).toBe(true); // 23h de 18/12 em SP
    expect(campanhaVigente(natal, new Date("2026-12-19T04:00:00Z"))).toBe(false);
  });
  it("Black Natal só de 23 a 29/11", () => {
    expect(blackAtiva(natal, new Date("2026-11-22T15:00:00Z"))).toBe(false);
    expect(blackAtiva(natal, new Date("2026-11-23T15:00:00Z"))).toBe(true);
    expect(blackAtiva(natal, new Date("2026-11-29T15:00:00Z"))).toBe(true);
    expect(blackAtiva(natal, new Date("2026-11-30T15:00:00Z"))).toBe(false);
  });
});

describe("preços e links", () => {
  it("formata Golden Lake Baikal como R$ 3,6 mi", () => {
    expect(formatPreco(3_600_000)).toBe("R$ 3,6 mi");
    expect(formatPreco(240_000)).toBe("R$ 240 mil");
  });
  it("link do corretor leva para a página dele", () => {
    const m = mensagemProduto({ nome: "Open Bosque", bairro: "Passo d'Areia", slug: "open-bosque" }, "lucas-sarmento", "Lucas Sarmento");
    expect(m).toContain("https://uhome.com.br/c/lucas-sarmento/em-foco/open-bosque");
    expect(m.startsWith("Olá Lucas!")).toBe(true);
  });
});
