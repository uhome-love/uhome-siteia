import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FocoContactForm } from "@/components/foco/FocoContactForm";
import type { ProdutoFoco } from "@/lib/produtosFoco";
const mocks = vi.hoisted(() => ({ lead: vi.fn(), insert: vi.fn() }));
vi.mock("@/services/leads", () => ({ submitLead: mocks.lead }));
vi.mock("@/lib/supabaseLazy", () => ({ supabase: { from: () => ({ insert: mocks.insert }) } }));
vi.mock("@/lib/session", () => ({ getCorretorRef: () => null, getCorretorRefId: () => null }));
vi.mock("@/lib/leadTracking", () => ({ getLeadTracking: () => ({ colunas: {} }) }));
vi.mock("@/lib/trackEvent", () => ({ trackEvent: vi.fn() }));
const p = { slug: "open-bosque", nome: "Open Bosque", bairro: "Passo d'Areia", preco_a_partir: 247000 } as ProdutoFoco;
function montar(modo: "visita" | "informacoes") { return render(<FocoContactForm p={p} modo={modo} dia={new Date(2026, 10, 21, 12)} periodo="Manhã" planta="2 dormitórios" setDia={vi.fn()} setPeriodo={vi.fn()} onVisita={vi.fn()} />); }
function preencher() { fireEvent.change(screen.getByLabelText("Seu nome"), { target: { value: "Pessoa" } }); fireEvent.change(screen.getByLabelText("Seu WhatsApp"), { target: { value: "51999999999" } }); }
afterEach(() => { cleanup(); vi.resetAllMocks(); });
describe("pedidos locais com transporte simulado, sem CRM", () => {
  it("informações envia origem e planta escolhida", async () => {
    mocks.lead.mockResolvedValue(true); montar("informacoes"); preencher(); fireEvent.click(screen.getByRole("button", { name: "Receber informações" }));
    await waitFor(() => expect(mocks.lead).toHaveBeenCalledWith(expect.objectContaining({ tipo_interesse: "informacoes", contexto: expect.objectContaining({ origem: "informacoes", pedido: expect.objectContaining({ planta: "2 dormitórios", tipo: "informacoes_pedidas" }) }) })));
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("visita envia dia e período selecionados", async () => {
    mocks.insert.mockResolvedValue({ error: null }); mocks.lead.mockResolvedValue(true); montar("visita"); preencher(); fireEvent.click(screen.getByRole("button", { name: "Agendar visita" }));
    await waitFor(() => expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ data_visita: "2026-11-21", turno: "manhã" })));
    await waitFor(() => expect(mocks.lead).toHaveBeenCalledWith(expect.objectContaining({ tipo_interesse: "visita" })));
  });
  it("não confirma quando o salvamento falha", async () => {
    mocks.lead.mockRejectedValue(new Error("não salvo")); montar("informacoes"); preencher(); fireEvent.click(screen.getByRole("button", { name: "Receber informações" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument()); expect(screen.queryByRole("status")).toBeNull();
  });
  it("espera a resposta do salvamento para confirmar", async () => {
    let concluir: (value: boolean) => void = () => {}; mocks.lead.mockImplementation(() => new Promise<boolean>(resolve => { concluir = resolve; })); montar("informacoes"); preencher(); fireEvent.click(screen.getByRole("button", { name: "Receber informações" }));
    await waitFor(() => expect(mocks.lead).toHaveBeenCalled()); expect(screen.queryByRole("status")).toBeNull(); concluir(true); await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
  });
});