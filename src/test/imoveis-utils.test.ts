import { describe, it, expect } from "vitest";
import { tituloLimpo, fotoPrincipal, formatPreco } from "@/services/imoveis";

describe("tituloLimpo", () => {
  it("generates title with quartos", () => {
    const result = tituloLimpo({ tipo: "apartamento", finalidade: "venda", quartos: 2, bairro: "Moinhos de Vento" });
    expect(result).toBe("Apartamento 2 quartos — Moinhos de Vento");
  });

  it("generates title without quartos", () => {
    const result = tituloLimpo({ tipo: "casa", finalidade: "venda", quartos: null, bairro: "Petrópolis" });
    expect(result).toBe("Casa para Venda — Petrópolis");
  });

  it("singular quarto for 1", () => {
    const result = tituloLimpo({ tipo: "studio", finalidade: "venda", quartos: 1, bairro: "Centro" });
    expect(result).toBe("Studio 1 quarto — Centro");
  });
});

describe("fotoPrincipal", () => {
  it("returns placeholder when no photos", () => {
    const imovel = { fotos: [] } as any;
    const url = fotoPrincipal(imovel);
    expect(url).toContain("unsplash.com");
  });

  it("returns first photo url when available", () => {
    const imovel = { fotos: [{ url: "https://example.com/1.jpg", ordem: 0, principal: false }] } as any;
    const url = fotoPrincipal(imovel);
    expect(url).toBe("https://example.com/1.jpg");
  });

  it("returns principal photo when marked", () => {
    const imovel = {
      fotos: [
        { url: "https://example.com/1.jpg", ordem: 0, principal: false },
        { url: "https://example.com/2.jpg", ordem: 1, principal: true },
      ],
    } as any;
    const url = fotoPrincipal(imovel);
    expect(url).toBe("https://example.com/2.jpg");
  });

  it("uses foto_principal column when available", () => {
    const imovel = { foto_principal: "https://cdn.com/main.jpg", fotos: [] } as any;
    const url = fotoPrincipal(imovel);
    expect(url).toBe("https://cdn.com/main.jpg");
  });
});

describe("formatPreco", () => {
  it("formats price in BRL", () => {
    const result = formatPreco(350000);
    expect(result).toContain("350");
    expect(result).toContain("R$");
  });

  it("returns placeholder for zero", () => {
    const result = formatPreco(0);
    expect(result).toBeTruthy();
  });
});
