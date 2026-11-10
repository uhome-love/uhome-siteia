import type { ProdutoFoco } from "@/lib/produtosFoco";

export const FAIXAS_CAMPANHA = [
  { id: "todos", label: "Todos os valores", min: 0, max: Infinity },
  { id: "ate400", label: "Até R$ 400 mil", min: 0, max: 400_000 },
  { id: "400a1m", label: "R$ 400 mil a 1 mi", min: 400_000, max: 1_000_000 },
  { id: "1m", label: "Acima de R$ 1 mi", min: 1_000_000, max: Infinity },
];

export function filtrarProdutosCampanha(produtos: ProdutoFoco[], cidade: string, faixaId: string) {
  const faixa = FAIXAS_CAMPANHA.find((f) => f.id === faixaId) ?? FAIXAS_CAMPANHA[0];
  return produtos.filter((p) => {
    if (cidade !== "todas" && p.cidade !== cidade) return false;
    if (faixa.id === "todos") return true;
    const preco = p.preco_a_partir;
    if (preco === null) return false;
    if (faixa.id === "ate400") return preco <= faixa.max;
    return preco > faixa.min && preco <= faixa.max;
  });
}