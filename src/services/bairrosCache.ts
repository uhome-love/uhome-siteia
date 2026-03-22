import { supabase } from "@/integrations/supabase/client";

interface BairroCount {
  bairro: string;
  count: number;
}

let cache: { data: BairroCount[]; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getBairrosDisponiveis(): Promise<BairroCount[]> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  const { data } = await supabase.rpc("get_bairros_disponiveis");
  const result = (data ?? []) as BairroCount[];

  cache = { data: result, ts: Date.now() };
  return result;
}
