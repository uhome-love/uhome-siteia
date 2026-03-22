import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCorretorRef, getCorretorRefId, getCorretorRefNome, clearCorretorRef } from "@/lib/session";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

describe("session.ts - Corretor ref system", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("returns null when no ref is stored", () => {
    expect(getCorretorRef()).toBeNull();
    expect(getCorretorRefId()).toBeNull();
    expect(getCorretorRefNome()).toBeNull();
  });

  it("returns stored ref data", () => {
    localStorage.setItem("uhome_corretor_ref", "lucas-silva");
    localStorage.setItem("corretor_ref_id", "abc-123");
    localStorage.setItem("corretor_ref_nome", "Lucas Silva");
    localStorage.setItem("corretor_ref_ts", Date.now().toString());

    expect(getCorretorRef()).toBe("lucas-silva");
    expect(getCorretorRefId()).toBe("abc-123");
    expect(getCorretorRefNome()).toBe("Lucas Silva");
  });

  it("expires ref after 30 days", () => {
    const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
    localStorage.setItem("uhome_corretor_ref", "old-slug");
    localStorage.setItem("corretor_ref_id", "old-id");
    localStorage.setItem("corretor_ref_ts", thirtyOneDaysAgo.toString());

    expect(getCorretorRef()).toBeNull();
    expect(getCorretorRefId()).toBeNull();
    // Should have cleared localStorage
    expect(localStorage.getItem("uhome_corretor_ref")).toBeNull();
  });

  it("clearCorretorRef removes all keys", () => {
    localStorage.setItem("uhome_corretor_ref", "slug");
    localStorage.setItem("corretor_ref_id", "id");
    localStorage.setItem("corretor_ref_slug", "slug");
    localStorage.setItem("corretor_ref_nome", "Nome");
    localStorage.setItem("corretor_ref_ts", "123");

    clearCorretorRef();

    expect(localStorage.getItem("uhome_corretor_ref")).toBeNull();
    expect(localStorage.getItem("corretor_ref_id")).toBeNull();
    expect(localStorage.getItem("corretor_ref_nome")).toBeNull();
  });
});

describe("whatsapp.ts - buildWhatsAppUrl", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("generates basic URL without corretor", () => {
    const url = buildWhatsAppUrl();
    expect(url).toContain("wa.me/");
    expect(url).toContain("Uhome");
    expect(url).not.toContain("Atendimento");
  });

  it("includes corretor name when ref is stored", () => {
    localStorage.setItem("uhome_corretor_ref", "lucas");
    localStorage.setItem("corretor_ref_nome", "Lucas Silva");
    localStorage.setItem("corretor_ref_ts", Date.now().toString());

    const url = buildWhatsAppUrl();
    expect(decodeURIComponent(url)).toContain("Atendimento: Lucas Silva");
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

  it("does not include corretor without valid ref", () => {
    localStorage.setItem("corretor_ref_nome", "Orphan Name");
    // No slug set — getCorretorRef() returns null
    const url = buildWhatsAppUrl();
    expect(decodeURIComponent(url)).not.toContain("Atendimento");
  });
});
