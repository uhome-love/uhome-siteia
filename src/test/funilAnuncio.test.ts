import { describe, it, expect } from "vitest";
import { ehPaginaAnuncio, primeiraVez } from "@/lib/funilAnuncio";
import { podeRegistrar } from "@/services/whatsappTracker";

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };

describe("funil das páginas de anúncio", () => {
  it("só nas 4 páginas de anúncio, com ou sem link de corretor", () => {
    for (const p of ["/em-foco/orygem", "/campanha/natal-chave-de-ouro", "/investir-studios", "/busca", "/c/joao/campanha/natal-chave-de-ouro"]) expect(ehPaginaAnuncio(p)).toBe(true);
    for (const p of ["/", "/em-foco", "/faq", "/imovel/x"]) expect(ehPaginaAnuncio(p)).toBe(false);
  });
  it("cada evento 1 vez por sessão e por página", () => {
    const s = mem();
    expect(primeiraVez("rolagem_50", "/busca", s)).toBe(true);
    expect(primeiraVez("rolagem_50", "/busca", s)).toBe(false);
    expect(primeiraVez("rolagem_50", "/em-foco/a", s)).toBe(true);
  });
  it("WhatsApp: no máximo 1 registro por sessão por botão a cada 2s", () => {
    const s = mem();
    expect(podeRegistrar(100000, s)).toBe(true);
    expect(podeRegistrar(101999, s)).toBe(false);
    expect(podeRegistrar(102000, s)).toBe(true);
  });
});
