import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";

// Mock contexts
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, signOut: vi.fn() }),
  AuthProvider: ({ children }: any) => children,
}));
vi.mock("@/contexts/CorretorContext", () => ({
  useCorretor: () => ({ prefixLink: (s: string) => s, corretor: null }),
  CorretorProvider: ({ children }: any) => children,
}));

function renderNavbar(path = "/") {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <Navbar />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as any;
describe("ações do cabeçalho", () => {
  it.each(['/busca', '/lancamentos-porto-alegre', '/imoveis-canoas'])('abre os filtros do catálogo em %s', path => {
    const abrir = vi.fn(); window.addEventListener('uhome:abrir-filtros', abrir);
    renderNavbar(path);
    fireEvent.click(screen.getByRole('button', {name: 'Abrir filtros'}));
    expect(abrir).toHaveBeenCalledTimes(1);
    window.removeEventListener('uhome:abrir-filtros', abrir);
  });
  it("abre a busca em etapas e permite digitar um bairro", async () => {
    renderNavbar();
    fireEvent.click(screen.getAllByRole("button", {name: /Onde vai ser seu novo lar\?/})[0]);
    const onde = await screen.findByLabelText("Onde", {}, {timeout: 5000});
    fireEvent.change(onde, {target: {value: "Moinhos de Vento"}});
    expect(onde).toHaveValue("Moinhos de Vento");
  });
  it.each(['/busca', '/imoveis-canoas'])('no catálogo a pílula abre os filtros da página em %s', path => {
    const abrir = vi.fn(); window.addEventListener('uhome:abrir-filtros', abrir);
    renderNavbar(path);
    fireEvent.click(screen.getAllByRole('button', {name: /Onde vai ser seu novo lar\?/})[0]);
    expect(abrir).toHaveBeenCalledTimes(1);
    window.removeEventListener('uhome:abrir-filtros', abrir);
  });
  it("Lia somente abre por ação", () => {
    const abrir = vi.fn(); window.addEventListener("uhome:abrir-lia", abrir);
    renderNavbar(); expect(abrir).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", {name: "Falar com a Lia"}));
    expect(abrir).toHaveBeenCalledTimes(1); window.removeEventListener("uhome:abrir-lia", abrir);
  });
});
