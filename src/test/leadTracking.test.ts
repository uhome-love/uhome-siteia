import { describe, it, expect, beforeEach } from "vitest";
import { saveChoices } from "@/lib/consent";
import { captureJourneyOrigin, clearJourneyAnalysis } from "@/lib/journeyIdentity";
import { captureUtmParams, getTrackingData } from "@/lib/session";
import { classificarDevice, fonteLegivel, getLeadTracking, nomeFormulario } from "@/lib/leadTracking";

async function visitar(url: string, referrer = "") {
  window.history.replaceState({}, "", url);
  Object.defineProperty(document, "referrer", { value: referrer, configurable: true });
  await captureJourneyOrigin();
}

describe("rastreamento de leads", () => {
  beforeEach(() => { clearJourneyAnalysis(); localStorage.clear(); sessionStorage.clear(); saveChoices({analytics:"granted",advertising:"granted"}); });

  it("guarda gclid, gbraid, wbraid e fbclid da primeira visita", async () => {
    await visitar("/em-foco/x?utm_source=google&gclid=G1&gbraid=B1&wbraid=W1&fbclid=F1");
    const t = getTrackingData();
    expect([t.gclid, t.gbraid, t.wbraid, t.fbclid]).toEqual(["G1", "B1", "W1", "F1"]);
    expect(t.landing_url).toContain("/em-foco/x");
  });

  it("não sobrescreve a origem da primeira visita", async () => {
    await visitar("/?utm_source=google&utm_campaign=natal&gclid=G1");
    await visitar("/?utm_source=facebook&utm_campaign=outra&gclid=G2");
    const t = getTrackingData();
    expect(t.utm_source).toBe("google");
    expect(t.utm_campaign).toBe("natal");
    expect(t.gclid).toBe("G1");
  });

  it("referrer vazio é enviado como texto vazio (acesso direto)", async () => {
    await visitar("/");
    expect(getLeadTracking("exit_intent").colunas.referrer).toBe("");
  });
  it("última origem central fica separada da primeira e classifica campanha", async()=>{
    await visitar('/?utm_source=antiga');
    await visitar('/em-foco/open-bosque?utm_source=central&utm_campaign=teste-parte2');
    const t=getLeadTracking('agendamento_visita_foco');
    expect(t.colunas.utm_source).toBe('antiga');
    expect(t.colunas.origem_ref).toBe('campanha');
    expect(t.contexto.ultima_origem.utm_source).toBe('central');
  });

  it("classifica o aparelho", () => {
    expect(classificarDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17) Mobile", 390)).toBe("mobile");
    expect(classificarDevice("Mozilla/5.0 (iPad; CPU OS 17)", 820)).toBe("tablet");
    expect(classificarDevice("Mozilla/5.0 (Windows NT 10.0)", 1440)).toBe("desktop");
  });

  it("nomeia o formulário e a fonte", () => {
    expect(nomeFormulario("exit_intent")).toBe("Pop-up de saída");
    expect(fonteLegivel({ gclid: "x", utm_campaign: "Natal" })).toBe("Google Ads — Natal");
    expect(fonteLegivel({ referrer: "" })).toBe("Acesso direto");
  });
});
