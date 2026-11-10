import { describe, it, expect, vi, beforeEach } from "vitest";
import markup from "@/features/investir-studios/markup.html?raw";
import { LP_DATA } from "@/features/investir-studios/data";
import { simular } from "@/features/investir-studios/calc";
import {
  initLanding,
  mascaraTelefone,
  telefoneValido,
  prioridadeDe,
  type LeadQualificado,
} from "@/features/investir-studios/controller";
import { contextoLead, qualificacaoCRM, tituloInteresse } from "@/features/investir-studios/lead";

const connect = LP_DATA.produtos.find((p) => p.id === "connect")!;

describe("calc (mesmos números do estudo)", () => {
  it("Connect no cenário base: R$ 43,6 mil para começar, parcela de R$ 2.707 e quitado em 7,7 anos", () => {
    const r = simular({ ...LP_DATA.base, preco: connect.preco, faturamentoMes: 20 * LP_DATA.diaria, horizonteAnos: 30 });
    expect(Math.round(r.capitalInicial)).toBe(43558);
    expect(Math.round(r.parcelaComSeguro)).toBe(Math.round(connect.parcela));
    expect(r.quitadoEm).not.toBeNull();
    expect(((r.quitadoEm as number) / 12).toFixed(1)).toBe("7.7");
  });
});

describe("telefone e prioridade", () => {
  it("formata e valida WhatsApp brasileiro", () => {
    expect(mascaraTelefone("51999998888")).toBe("(51) 99999-8888");
    expect(mascaraTelefone("+55 51 99999-8888")).toBe("(51) 99999-8888");
    expect(telefoneValido("51999998888")).toBe(true);
    expect(telefoneValido("5133334444")).toBe(true);
    expect(telefoneValido("11111111111")).toBe(false);
    expect(telefoneValido("51899998888")).toBe(false);
    expect(telefoneValido("519999")).toBe(false);
  });
  it("classifica a prioridade pela pontuação", () => {
    expect(prioridadeDe(7)).toBe("Alta");
    expect(prioridadeDe(6)).toBe("Alta");
    expect(prioridadeDe(5)).toBe("Média");
    expect(prioridadeDe(3)).toBe("Baixa");
  });
});

describe("texto da qualificação para o CRM", () => {
  const base: LeadQualificado = {
    nome: "Ana",
    digitos: "51999998888",
    telefone: "(51) 99999-8888",
    studioId: "connect",
    studioNome: connect.nome,
    produto: connect,
    entrada: "De R$ 50 a 100 mil",
    momento: "Nos próximos 3 meses",
    formato: "Visita aos studios",
    dia: "Sáb 14/11",
    periodo: "Tarde",
    score: 6,
    prioridade: "Alta",
    origem: "simulador",
    simulacao: { studio: connect.nome, noites: 24, sobraMenosParcela: 500, quitadoAnos: 6.1 },
    clique: { gclid: "abc123", utm_source: "google", utm_campaign: "studios" },
  };
  it("leva prioridade, respostas e simulação para as observações do CRM", () => {
    const q = qualificacaoCRM(base);
    expect(q.Prioridade).toBe("Alta (6 de 7)");
    expect(q.Studio).toBe("Connect João Wallig");
    expect(q.Prefere).toBe("Visita aos studios, Sáb 14/11, tarde");
    expect(q.Simulou).toBe("Connect João Wallig com 24 noites por mês, quitado em 6,1 anos");
    expect(q["Anúncio"]).toBe("google / studios");
  });
  it("monta o contexto com campanha, produto e o gclid do clique (prioridade sobre o salvo)", () => {
    const c = contextoLead(base, { paginas: ["/investir-studios"], gclid: "antigo", utm_term: "x" });
    expect(c.canal).toBe("landing");
    expect(c.campanha).toContain("Studios Cyrela");
    expect(c.produto).toBe("Connect João Wallig (Cyrela)");
    expect(c.gclid).toBe("abc123");
    expect(c.utm_term).toBe("x");
    expect((c as Record<string, unknown>).paginas).toEqual(["/investir-studios"]);
    expect(c.qualificacao.Entrada).toBe("De R$ 50 a 100 mil");
  });
  it("nomeia o interesse com o studio ou o pedido de ajuda", () => {
    expect(tituloInteresse(base)).toBe("Connect João Wallig · studio 26 m² · Cyrela");
    expect(tituloInteresse({ ...base, produto: null, studioId: "ajuda" })).toContain("quer ajuda para escolher");
  });
});

describe("formulário da landing", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    Element.prototype.scrollIntoView = vi.fn();
  });

  function montar(onLead = vi.fn().mockResolvedValue(true)) {
    const root = document.createElement("div");
    root.className = "lpi";
    root.innerHTML = markup;
    document.body.appendChild(root);
    const track = vi.fn();
    const cleanup = initLanding(root, { data: LP_DATA, onLead, onWhatsApp: vi.fn(), track });
    const card = root.querySelector<HTMLElement>('[data-form="topo"]')!;
    const clicar = (sel: string) => card.querySelector<HTMLElement>(sel)!.click();
    return { root, card, clicar, onLead, track, cleanup };
  }

  async function preencherAteContato(clicar: (s: string) => void, card: HTMLElement) {
    clicar('[data-k="studio"][data-v="skyglass"]');
    clicar('[data-k="entrada"][data-v="Mais de R$ 100 mil"]');
    clicar('[data-k="momento"]');
    clicar('[data-k="formato"][data-v="Visita aos studios"]');
    clicar('[data-k="dia"]');
    clicar('[data-k="periodo"][data-v="Manhã"]');
    expect(card.querySelector("input[name=nome]")).not.toBeNull();
  }

  function digitar(card: HTMLElement, nome: string, fone: string) {
    const n = card.querySelector<HTMLInputElement>("input[name=nome]")!;
    const w = card.querySelector<HTMLInputElement>("input[name=fone]")!;
    n.value = nome;
    n.dispatchEvent(new Event("input", { bubbles: true }));
    w.value = fone;
    w.dispatchEvent(new Event("input", { bubbles: true }));
    card.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  }

  it("mostra as opções e o simulador", () => {
    const { root, cleanup } = montar();
    expect(root.querySelectorAll("#ops .op").length).toBe(4);
    expect(root.querySelector("#s-ini")!.textContent).toMatch(/^R\$ /);
    expect(root.querySelector("#cal")!.children.length).toBe(12);
    cleanup();
  });

  it("não envia com WhatsApp inválido", async () => {
    const { card, clicar, onLead, cleanup } = montar();
    await preencherAteContato(clicar, card);
    digitar(card, "Ana Souza", "(51) 1234");
    await Promise.resolve();
    expect(onLead).not.toHaveBeenCalled();
    expect(card.querySelector('[aria-invalid="true"]')).not.toBeNull();
    cleanup();
  });

  it("envia o lead qualificado e mostra a confirmação", async () => {
    const { card, clicar, onLead, track, cleanup } = montar();
    await preencherAteContato(clicar, card);
    digitar(card, "  Ana   Souza ", "51 99999-8888");
    await vi.waitFor(() => expect(card.querySelector(".done")).not.toBeNull());
    const lead = onLead.mock.calls[0][0] as LeadQualificado;
    expect(lead.nome).toBe("Ana Souza");
    expect(lead.telefone).toBe("(51) 99999-8888");
    expect(lead.studioNome).toBe("Skyglass Parque Moinhos");
    expect(lead.formato).toBe("Visita aos studios");
    expect(lead.periodo).toBe("Manhã");
    expect(lead.score).toBe(7);
    expect(lead.prioridade).toBe("Alta");
    expect(card.textContent).toContain("Pronto, Ana!");
    expect(track).toHaveBeenCalledWith("lpi_lead", expect.objectContaining({ prioridade: "Alta" }));
    cleanup();
  });

  it("se o registro falhar, oferece o WhatsApp com a mensagem pronta", async () => {
    const { card, clicar, cleanup } = montar(vi.fn().mockResolvedValue(false));
    await preencherAteContato(clicar, card);
    digitar(card, "Ana", "51999998888");
    await vi.waitFor(() => expect(card.querySelector(".done")).not.toBeNull());
    const a = card.querySelector<HTMLAnchorElement>("[data-wa-done]")!;
    expect(a.textContent).toContain("Enviar pelo WhatsApp");
    expect(decodeURIComponent(a.href)).toContain("Skyglass Parque Moinhos");
    cleanup();
  });
});
