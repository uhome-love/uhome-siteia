import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("Navbar", () => {
  it("renders logo and main navigation links", () => {
    renderNavbar();
    expect(screen.getByText("Comprar")).toBeInTheDocument();
    expect(screen.getByText("Proprietários")).toBeInTheDocument();
    expect(screen.getByText("Ajuda")).toBeInTheDocument();
  });

  it("renders login button when not authenticated", () => {
    renderNavbar();
    const buttons = screen.getAllByText("Entrar");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("highlights Comprar on search page", () => {
    renderNavbar("/busca");
    const comprar = screen.getByText("Comprar").closest("button")!;
    expect(comprar.className).toContain("bg-secondary");
  });

  it("links to correct routes", () => {
    renderNavbar();
    expect(screen.getByText("Ajuda").closest("a")).toHaveAttribute("href", "/faq");
    // Sem campanha em destaque, o menu mostra "Uhome em Foco".
    expect(screen.getByText("Uhome em Foco").closest("a")).toHaveAttribute("href", "/em-foco");
  });
});
