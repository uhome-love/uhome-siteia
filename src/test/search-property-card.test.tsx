import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import type { Imovel } from "@/services/imoveis";

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));
vi.mock("@/contexts/CorretorContext", () => ({
  useCorretor: () => ({ prefixLink: (s: string) => s }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) }) },
}));

const mockImovel: Imovel = {
  id: "test-1",
  slug: "apartamento-teste",
  tipo: "apartamento",
  finalidade: "venda",
  status: "ativo",
  destaque: false,
  preco: 350000,
  preco_condominio: 500,
  preco_iptu: null,
  area_total: 65,
  area_util: null,
  quartos: 2,
  banheiros: 1,
  vagas: 1,
  andar: null,
  bairro: "Moinhos de Vento",
  cidade: "Porto Alegre",
  uf: "RS",
  latitude: null,
  longitude: null,
  titulo: "Apartamento 2 quartos — Moinhos de Vento",
  descricao: null,
  diferenciais: ["Churrasqueira", "Sacada"],
  fotos: [
    { url: "https://example.com/1.jpg", ordem: 0, principal: true },
    { url: "https://example.com/2.jpg", ordem: 1, principal: false },
  ],
  foto_principal: "https://example.com/1.jpg",
  video_url: null,
  condominio_nome: null,
  publicado_em: new Date().toISOString(),
};

function renderCard(props?: Partial<React.ComponentProps<typeof SearchPropertyCard>>) {
  return render(
    <MemoryRouter>
      <SearchPropertyCard imovel={mockImovel} index={0} {...props} />
    </MemoryRouter>
  );
}

describe("SearchPropertyCard", () => {
  it("renders property info", () => {
    renderCard();
    const bairroElements = screen.getAllByText(/Moinhos de Vento/);
    expect(bairroElements.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/350/).length).toBeGreaterThan(0);
  });

  it("renders stats with area, quartos, vagas", () => {
    renderCard();
    const stats = screen.getAllByText(/65 m²/);
    expect(stats.length).toBeGreaterThan(0);
  });

  it("renders heart button for favorites", () => {
    renderCard();
    const heartButtons = screen.getAllByLabelText("Adicionar aos favoritos");
    expect(heartButtons.length).toBeGreaterThan(0);
  });

  it("calls toggleFavorito on heart click without navigating", async () => {
    const toggle = vi.fn().mockResolvedValue(undefined);
    renderCard({ toggleFavorito: toggle });
    const heartButton = screen.getAllByLabelText("Adicionar aos favoritos")[0];
    fireEvent.click(heartButton);
    expect(toggle).toHaveBeenCalledWith("test-1");
  });

  it("renders badge for new property", () => {
    renderCard();
    const badges = screen.getAllByText("Novidade");
    expect(badges.length).toBeGreaterThan(0);
  });
});
