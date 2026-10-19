import { describe, it, expect } from "vitest";
import { isCodigoSlug, normalizarCodigo } from "@/services/imoveis";

describe("link curto por código Jetimob", () => {
  it("reconhece /imovel/55880-UH como código", () => {
    expect(isCodigoSlug("55880-UH")).toBe(true);
  });
  it("não trata o link completo como código", () => {
    expect(isCodigoSlug("apartamento-1-quarto-passo-da-areia-16366-UH")).toBe(false);
  });
  it("normaliza o código para busca exata", () => {
    expect(normalizarCodigo(" 55880 - uh")).toBe("55880-UH");
  });
});
