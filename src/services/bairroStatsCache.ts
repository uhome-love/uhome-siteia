import { supabase } from "@/integrations/supabase/client";

interface BairroStats {
  precoM2Medio: number;
  precoMedio: number;
  count: number;
}

let cache: { data: Map<string, BairroStats>; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 min

export async function getBairroStats(): Promise<Map<string, BairroStats>> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.data;

  const { data } = await supabase
    .from("imoveis")
    .select("bairro, preco, area_total")
    .eq("status", "disponivel")
    .eq("finalidade", "venda")
    .gt("preco", 0)
    .gt("area_total", 0);

  const map = new Map<string, { soma: number; somaM2: number; count: number }>();
  for (const row of data ?? []) {
    const area = Number(row.area_total);
    const preco = Number(row.preco);
    if (!area || !preco) continue;
    const entry = map.get(row.bairro) || { soma: 0, somaM2: 0, count: 0 };
    entry.soma += preco;
    entry.somaM2 += preco / area;
    entry.count += 1;
    map.set(row.bairro, entry);
  }

  const result = new Map<string, BairroStats>();
  for (const [bairro, { soma, somaM2, count }] of map.entries()) {
    result.set(bairro, {
      precoM2Medio: somaM2 / count,
      precoMedio: soma / count,
      count,
    });
  }

  cache = { data: result, ts: Date.now() };
  return result;
}
