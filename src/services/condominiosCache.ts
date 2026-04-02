import { supabase } from "@/integrations/supabase/client";

let cache: string[] | null = null;
let cacheTime = 0;
const TTL = 5 * 60 * 1000; // 5 min

export async function getCondominiosDisponiveis(): Promise<string[]> {
  if (cache && Date.now() - cacheTime < TTL) return cache;

  const { data } = await supabase
    .from("imoveis")
    .select("condominio_nome")
    .eq("status", "disponivel")
    .not("condominio_nome", "is", null)
    .not("condominio_nome", "eq", "")
    .limit(1000);

  // Deduplicate and sort
  const names = [...new Set((data ?? []).map((r: any) => r.condominio_nome as string))].sort();
  cache = names;
  cacheTime = Date.now();
  return names;
}
