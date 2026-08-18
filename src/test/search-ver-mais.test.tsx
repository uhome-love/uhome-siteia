import React, { useRef, useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { Imovel } from "@/services/imoveis";

// Mock heavy children — we only care about the pagination shell behavior
vi.mock("@/components/SearchPropertyCard", () => ({
  SearchPropertyCard: ({ imovel }: { imovel: Imovel }) => (
    <div data-testid="property-card" data-id={imovel.id}>
      {imovel.titulo}
    </div>
  ),
}));
vi.mock("@/components/SearchCTACard", () => ({
  default: () => <div data-testid="cta-card" />,
  SearchCTACard: () => <div data-testid="cta-card" />,
}));

import { ProgressiveGrid } from "@/pages/Search";

function makeImoveis(count: number, offset = 0): Imovel[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${offset + i}`,
    slug: `slug-${offset + i}`,
    tipo: "apartamento",
    finalidade: "venda",
    status: "ativo",
    destaque: false,
    preco: 100000 + i,
    preco_condominio: null,
    preco_iptu: null,
  iptu_periodicidade: null,
    area_total: 50,
    area_util: null,
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    andar: null,
    bairro: "Centro",
    cidade: "Porto Alegre",
    uf: "RS",
    latitude: null,
    longitude: null,
    titulo: `Imóvel ${offset + i}`,
    descricao: null,
    diferenciais: [],
    fotos: [],
    foto_principal: null,
    video_url: null,
    condominio_nome: null,
    publicado_em: new Date().toISOString(),
    fase: "usado",
    endereco_completo: null,
  })) as unknown as Imovel[];
}

function Harness({
  initial,
  total,
  fetchMore,
  isMobile = false,
}: {
  initial: Imovel[];
  total: number;
  fetchMore: (existing: Imovel[]) => Imovel[];
  isMobile?: boolean;
}) {
  const [imoveis, setImoveis] = useState(initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    setLoadingMore(true);
    await Promise.resolve();
    const next = fetchMore(imoveis);
    setImoveis((prev) => [...prev, ...next]);
    setLoadingMore(false);
  };

  return (
    <ProgressiveGrid
      imoveis={imoveis}
      total={total}
      hoveredId={null}
      setHoveredId={() => {}}
      loadMore={loadMore}
      loadingMore={loadingMore}
      isMobile={isMobile}
      sentinelRef={sentinelRef}
    />
  );
}

describe("ProgressiveGrid — Ver mais regression", () => {
  it("renders all loaded property cards", () => {
    render(
      <Harness
        initial={makeImoveis(12)}
        total={30}
        fetchMore={() => makeImoveis(12, 12)}
      />
    );
    expect(screen.getAllByTestId("property-card")).toHaveLength(12);
  });

  it("shows Ver mais button with current/total count when more results exist", () => {
    render(
      <Harness
        initial={makeImoveis(12)}
        total={30}
        fetchMore={() => makeImoveis(12, 12)}
      />
    );
    expect(
      screen.getByRole("button", { name: /Ver mais imóveis \(12 de 30\)/i })
    ).toBeInTheDocument();
  });

  it("appends new properties when Ver mais is clicked (does not replace)", async () => {
    render(
      <Harness
        initial={makeImoveis(12)}
        total={30}
        fetchMore={() => makeImoveis(12, 12)}
      />
    );

    const button = screen.getByRole("button", { name: /Ver mais imóveis/i });

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
      await Promise.resolve();
    });

    const cards = screen.getAllByTestId("property-card");
    expect(cards).toHaveLength(24);
    // First 12 must still be present (no reset)
    expect(cards[0].getAttribute("data-id")).toBe("id-0");
    expect(cards[11].getAttribute("data-id")).toBe("id-11");
    // New 12 appended after
    expect(cards[12].getAttribute("data-id")).toBe("id-12");
    expect(cards[23].getAttribute("data-id")).toBe("id-23");
    // Button updated
    expect(
      screen.getByRole("button", { name: /Ver mais imóveis \(24 de 30\)/i })
    ).toBeInTheDocument();
  });

  it("hides Ver mais button when all results are loaded", () => {
    render(
      <Harness
        initial={makeImoveis(30)}
        total={30}
        fetchMore={() => []}
      />
    );
    expect(
      screen.queryByRole("button", { name: /Ver mais imóveis/i })
    ).not.toBeInTheDocument();
  });

  it("hides Ver mais when loadedCount reached total even if some cards are hidden (broken photos)", () => {
    const sentinelRef = React.createRef<HTMLDivElement>();
    render(
      <ProgressiveGrid
        imoveis={makeImoveis(9)}
        total={19}
        loadedCount={19}
        hoveredId={null}
        setHoveredId={() => {}}
        loadMore={() => {}}
        loadingMore={false}
        isMobile={false}
        sentinelRef={sentinelRef}
      />
    );
    expect(
      screen.queryByRole("button", { name: /Ver mais imóveis/i })
    ).not.toBeInTheDocument();
  });

  it("disables button and shows Carregando state while fetching", async () => {
    let resolveFetch: (v: Imovel[]) => void = () => {};
    const pending = new Promise<Imovel[]>((r) => {
      resolveFetch = r;
    });

    function PendingHarness() {
      const [imoveis, setImoveis] = useState(makeImoveis(12));
      const [loadingMore, setLoadingMore] = useState(false);
      const sentinelRef = useRef<HTMLDivElement>(null);
      const loadMore = async () => {
        setLoadingMore(true);
        const next = await pending;
        setImoveis((p) => [...p, ...next]);
        setLoadingMore(false);
      };
      return (
        <ProgressiveGrid
          imoveis={imoveis}
          total={30}
          hoveredId={null}
          setHoveredId={() => {}}
          loadMore={loadMore}
          loadingMore={loadingMore}
          isMobile={false}
          sentinelRef={sentinelRef}
        />
      );
    }

    render(<PendingHarness />);
    const button = screen.getByRole("button", { name: /Ver mais imóveis/i });
    fireEvent.click(button);

    // Wait a microtask for state flush
    await act(async () => { await Promise.resolve(); });

    const loadingBtn = screen.getByRole("button");
    expect(loadingBtn).toBeDisabled();
    expect(loadingBtn.textContent).toMatch(/Carregando/i);

    await act(async () => {
      resolveFetch(makeImoveis(12, 12));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getAllByTestId("property-card")).toHaveLength(24);
  });

  it("renders a sentinel div for mobile infinite scroll", () => {
    const { container } = render(
      <Harness
        initial={makeImoveis(12)}
        total={30}
        fetchMore={() => makeImoveis(12, 12)}
        isMobile
      />
    );
    // Mobile sentinel wrapper present
    expect(container.querySelector(".sm\\:hidden")).toBeInTheDocument();
  });
});
