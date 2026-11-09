import { describe, it, expect } from "vitest";
import { formatTotal } from "@/hooks/useTotalImoveis";

describe("total de imóveis exibido", () => {
  it("arredonda para baixo na centena com +", () => {
    expect(formatTotal(21493)).toBe("21.400+");
  });
  it("não inventa número enquanto não carregou", () => {
    expect(formatTotal(null)).toBe("milhares de");
  });
});
