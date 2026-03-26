import { describe, it, expect, beforeEach } from "vitest";
import { getCorretorRef, getCorretorRefId, setCorretorCache } from "@/lib/session";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

describe("session.ts - Corretor ref system", () => {
  beforeEach(() => {
    setCorretorCache(null, null);
  });

  it("returns null when no corretor is active", () => {
    expect(getCorretorRef()).toBeNull();
    expect(getCorretorRefId()).toBeNull();
  });

  it("returns cached ref data", () => {
    setCorretorCache("lucas-silva", "abc-123");
    expect(getCorretorRef()).toBe("lucas-silva");
    expect(getCorretorRefId()).toBe("abc-123");
  });

  it("returns null after clearing cache", () => {
    setCorretorCache("lucas-silva", "abc-123");
    setCorretorCache(null, null);
    expect(getCorretorRef()).toBeNull();
    expect(getCorretorRefId()).toBeNull();
  });
});

describe("whatsapp.ts - buildWhatsAppUrl", () => {
  beforeEach(() => {
    setCorretorCache(null, null);
  });

  it("generates basic URL without corretor", () => {
    const url = buildWhatsAppUrl();
    expect(url).toContain("wa.me/");
    expect(url).toContain("Uhome");
    expect(url).not.toContain("Atendimento");
  });

  it("includes imovel data when provided", () => {
    const url = buildWhatsAppUrl(undefined, {
      titulo: "Apto Moinhos",
      bairro: "Moinhos de Vento",
      slug: "apto-moinhos",
    });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("Apto Moinhos");
    expect(decoded).toContain("Moinhos de Vento");
    expect(decoded).toContain("uhome.com.br/imovel/apto-moinhos");
  });
});
