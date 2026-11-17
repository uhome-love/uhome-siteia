import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { useCampanha } from "@/lib/produtosFoco";

const from = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from } }));

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;
}

describe("carregamento do catálogo da campanha", () => {
  it("busca os produtos ativos na relação ordenada sem uma terceira requisição", async () => {
    const campanha = { id: "natal", inicio: null, fim: null };
    const produto1 = { id: "bosque", slug: "open-bosque" };
    const produto2 = { id: "arvoredo", slug: "open-arvoredo" };
    const catalogo = { select: vi.fn(), eq: vi.fn(), order: vi.fn().mockResolvedValue({ data: [{ produto: produto1 }, { produto: produto2 }], error: null }) };
    catalogo.select.mockReturnValue(catalogo);
    catalogo.eq.mockReturnValue(catalogo);
    const metadata = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn().mockResolvedValue({ data: campanha, error: null }) };
    metadata.select.mockReturnValue(metadata);
    metadata.eq.mockReturnValue(metadata);
    from.mockReset().mockReturnValueOnce(metadata).mockReturnValueOnce(catalogo);
    const { result } = renderHook(() => useCampanha("natal-chave-de-ouro"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(from.mock.calls).toEqual([["campanhas"], ["campanha_produtos"]]);
    expect(catalogo.select).toHaveBeenCalledWith(expect.stringContaining("produto:produtos_foco!inner("));
    expect(catalogo.eq).toHaveBeenCalledWith("produto.ativo", true);
    expect(catalogo.order).toHaveBeenCalledWith("ordem");
    expect(result.current.data?.produtos).toEqual([produto1, produto2]);
  });
});