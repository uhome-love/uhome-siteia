import { describe, it, expect, vi } from "vitest";
import { lerLinkWhatsApp, instalarRastreioWhatsApp } from "@/services/whatsappTracker";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

describe("rastreio de clique no WhatsApp", () => {
  it("usa o WhatsApp oficial 51 99259-7097", () => {
    expect(WHATSAPP_NUMBER).toBe("5551992597097");
  });
  it("lê número e mensagem do link", () => {
    expect(lerLinkWhatsApp("https://wa.me/5551992597097?text=Ol%C3%A1")).toEqual({ destino: "5551992597097", mensagem: "Olá" });
  });
  it("abre o WhatsApp mesmo se o envio ao CRM falhar", () => {
    const abrir = vi.fn(() => null);
    window.open = abrir as any;
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("rede"))) as any;
    instalarRastreioWhatsApp();
    window.open("https://wa.me/5551992597097?text=oi", "_blank");
    expect(abrir).toHaveBeenCalledWith("https://wa.me/5551992597097?text=oi", "_blank");
  });
});
