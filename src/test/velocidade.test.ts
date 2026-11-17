import { describe, it, expect } from "vitest";
import { isBotBrowser } from "@/lib/gtag";
import { fotoResponsiva } from "@/lib/produtosFoco";

const CEL = "Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36";

describe("robôs não contam em conversões", () => {
  it("visitante comum no celular carrega as tags", () => expect(isBotBrowser(CEL, false)).toBe(false));
  it("Googlebot é robô", () => expect(isBotBrowser("Mozilla/5.0 (compatible; Googlebot/2.1)", false)).toBe(true));
  it("navegador automatizado é robô", () => expect(isBotBrowser(CEL, true)).toBe(true));
  it("Chrome sem tela é robô", () => expect(isBotBrowser("Mozilla/5.0 HeadlessChrome/126.0", false)).toBe(true));
});

describe("foto leve no celular", () => {
  it("usa a versão de 800 px quando existe e mantém a original", () => {
    const r = fotoResponsiva({ url: "/a.webp", url_mobile: "/a-800.webp" });
    expect(r.src).toBe("/a.webp");
    expect(r.srcSet).toBe("/a-800.webp 800w, /a.webp 1600w");
  });
  it("sem versão leve, usa só a original", () => expect(fotoResponsiva({ url: "/b.webp" })).toEqual({ src: "/b.webp" }));
});
