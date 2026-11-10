import { describe, it, expect } from "vitest";
import { montarLinksNatal, validarCorretor } from "../../supabase/functions/_shared/natalLinks";

describe("links de Natal do corretor", () => {
  it("monta link da campanha e de cada produto com o slug do corretor", () => {
    const r = montarLinksNatal("junior-padilha", "natal", [{ slug: "open-arvoredo", nome: "Open Arvoredo" }]);
    expect(r.campanha_url).toBe("https://uhome.com.br/c/junior-padilha/campanha/natal");
    expect(r.produtos[0].url).toBe("https://uhome.com.br/c/junior-padilha/em-foco/open-arvoredo");
  });
  it("corretor inativo não recebe link", () => {
    expect(validarCorretor({ slug_ref: "x", ativo: false })).toBe("Corretor inativo no site");
  });
  it("corretor sem slug não recebe link", () => {
    expect(validarCorretor({ slug_ref: null, ativo: true })).not.toBeNull();
  });
});
