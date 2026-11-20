import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ lead: vi.fn() }));
vi.mock("@/services/leads", () => ({ submitLead: mocks.lead }));
vi.mock("@/lib/supabaseLazy", () => ({ supabase: { from: () => ({ insert: async () => ({ error: null }) }) } }));

import { veioDeAnuncio, resumoBusca } from "@/lib/visitanteAnuncio";
import { BuscaSelecaoCard, SelecaoAnuncio } from "@/components/busca/BuscaSelecaoCard";
import { conversaoDoEvento } from "@/lib/gtag";
import { provaFoco } from "@/components/foco/FocoContactForm";

afterEach(() => { cleanup(); vi.resetAllMocks(); });
const vazio = { primeira_origem: {}, ultima_origem: {} };

describe("visitante de anúncio", () => {
  it("vale por gclid, gbraid, wbraid ou utm_source=google na URL", () => {
    for (const q of ["?gclid=x", "?gbraid=x", "?wbraid=x", "?utm_source=google"]) expect(veioDeAnuncio(q, vazio)).toBe(true);
  });
  it("vale pela primeira ou última origem com gclid/gbraid", () => {
    expect(veioDeAnuncio("", { primeira_origem: { gclid: "a" }, ultima_origem: {} })).toBe(true);
    expect(veioDeAnuncio("", { primeira_origem: {}, ultima_origem: { gbraid: "b" } })).toBe(true);
  });
  it("orgânico, direto ou outra fonte não é anúncio", () => {
    expect(veioDeAnuncio("?utm_source=facebook", vazio)).toBe(false);
    expect(veioDeAnuncio("", vazio)).toBe(false);
  });
});

describe("cartão de seleção na busca", () => {
  it("aparece acima dos resultados só para visitante de anúncio", () => {
    const { container, unmount } = render(<SelecaoAnuncio anuncio resumo="Cidade: Porto Alegre" />);
    expect(container.querySelectorAll("[data-busca-selecao]").length).toBe(1);
    unmount();
    const outro = render(<SelecaoAnuncio anuncio={false} resumo="Cidade: Porto Alegre" />);
    expect(outro.container.querySelectorAll("[data-busca-selecao]").length).toBe(0);
  });
  it("envia com formulário e origem corretos e o resumo da busca", async () => {
    mocks.lead.mockResolvedValue(true);
    render(<BuscaSelecaoCard resumo="Cidade: Porto Alegre · Quartos: 2+" />);
    fireEvent.change(screen.getByLabelText("Seu nome"), { target: { value: "Pessoa" } });
    fireEvent.change(screen.getByLabelText("Seu WhatsApp"), { target: { value: "51999999999" } });
    fireEvent.click(screen.getByRole("button", { name: "Quero receber" }));
    await waitFor(() => expect(mocks.lead).toHaveBeenCalledTimes(1));
    const d = mocks.lead.mock.calls[0][0];
    expect(d.formulario).toBe("Busca - seleção (anúncio)");
    expect(d.origem_componente).toBe("busca_selecao_anuncio");
    expect(d.contexto.resumo_busca).toBe("Cidade: Porto Alegre · Quartos: 2+");
    expect(await screen.findByRole("button", { name: "Agendar visita" })).toBeTruthy();
  });
  it("o envio conta como Lead site e a visita como Visita agendada", () => {
    expect(conversaoDoEvento("generate_lead", { lead_source: "busca_selecao_anuncio" })).toBe("lead");
    expect(conversaoDoEvento("generate_lead", { lead_source: "agendamento_visita_busca" })).toBe("visita");
  });
  it("resume os filtros ativos", () => {
    expect(resumoBusca({ cidade: "Canoas", bairro: "Centro", tipo: "apartamento", quartos: 2, precoMin: 300000, precoMax: 1200000 })).toBe("Cidade: Canoas · Bairro: Centro · Tipo: apartamento · Quartos: 2+ · Preço: de R$ 300 mil até R$ 1,2 mi");
  });
});

describe("em-foco", () => {
  it("barra fixa na ordem Mais informações, Agendar visita, WhatsApp (app e molde)", () => {
    const app = readFileSync("src/pages/ProdutoFocoPage.tsx", "utf8");
    const barra = app.slice(app.indexOf("data-barra-baixo"));
    expect(barra.indexOf("Mais informações")).toBeLessThan(barra.indexOf("Agendar visita"));
    expect(barra.indexOf("Agendar visita")).toBeLessThan(barra.indexOf('aria-label="WhatsApp"'));
    const molde = readFileSync("supabase/functions/site-dobra/index.ts", "utf8");
    const mb = molde.slice(molde.indexOf("const barraV2"));
    expect(mb.indexOf("Mais informações")).toBeLessThan(mb.indexOf("Agendar visita"));
  });
  it("prova usa só dados reais e cai para o CRECI sem dado", () => {
    expect(provaFoco({ nota: 4.9, total: 37 })).toBe("★ 4,9 · 37 avaliações no Google · CRECI-RS 25682J");
    expect(provaFoco(null)).toBe("CRECI-RS 25682J");
    expect(provaFoco({ nota: 0, total: 0 })).toBe("CRECI-RS 25682J");
  });
});

describe("textos novos", () => {
  it("não usam 'tabela' nem 'simulação'", () => {
    for (const f of ["src/components/busca/BuscaSelecaoCard.tsx", "src/lib/visitanteAnuncio.ts", "src/components/foco/FocoContactForm.tsx", "supabase/functions/_shared/focoPresentation.ts"]) {
      expect(readFileSync(f, "utf8")).not.toMatch(/tabela|simula[çc][ãa]o/i);
    }
  });
});

import { tituloPreviaFoco, descricaoSeoFoco } from "../../supabase/functions/_shared/focoPresentation";
describe("SEO do em-foco", () => {
  it("title no formato pedido e description com preço real", () => {
    const p = { nome: "Open Arvoredo", bairro: "Passo d'Areia", cidade: "Porto Alegre", preco_a_partir: 329000 };
    expect(tituloPreviaFoco(p)).toBe("Open Arvoredo em Passo d'Areia: valores, plantas e condições | Uhome");
    expect(descricaoSeoFoco(p)).toContain("a partir de R$ 329 mil");
    expect(descricaoSeoFoco({ ...p, preco_a_partir: null })).not.toContain("R$");
  });
});
