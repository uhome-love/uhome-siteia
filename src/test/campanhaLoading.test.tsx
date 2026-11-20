import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { useCampanha } from "@/lib/produtosFoco";

afterEach(() => vi.unstubAllGlobals());

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;
}

describe("carregamento do catálogo da campanha", () => {
  it("busca os produtos ativos na relação ordenada sem uma terceira requisição", async () => {
    const campanha = { id: "natal", inicio: null, fim: null };
    const produto1 = { id: "bosque", slug: "open-bosque" };
    const produto2 = { id: "arvoredo", slug: "open-arvoredo" };
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const tabela = new URL(String(url)).pathname.split('/').at(-1);
      return new Response(JSON.stringify(tabela === 'campanhas' ? [campanha] : [{ produto: produto1 }, { produto: produto2 }]));
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useCampanha("natal-chave-de-ouro"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const urls = fetchMock.mock.calls.map(([url]) => new URL(String(url)));
    expect(urls.map(url => url.pathname.split('/').at(-1))).toEqual(['campanhas', 'campanha_produtos']);
    expect(urls[1].searchParams.get('select')).toContain('produto:produtos_foco!inner(');
    expect(urls[1].searchParams.get('produto.ativo')).toBe('eq.true');
    expect(urls[1].searchParams.get('order')).toBe('ordem.asc');
    expect(result.current.data?.produtos).toEqual([produto1, produto2]);
  });
});