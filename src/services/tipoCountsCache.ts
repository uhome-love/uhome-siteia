import { supabase } from "@/integrations/supabase/client";

export type TipoCounts = Record<string, number>;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
let cache: { data: TipoCounts; ts: number } | null = null;
let inflight: Promise<TipoCounts> | null = null;

async function fetchTipoCountsFresh(): Promise<TipoCounts> {
  // Lista de tipos válidos no banco (ver propertyTypes em src/data/properties.ts)
  const tipos = [
    "apartamento",
    "garden",
    "cobertura",
    "casa",
    "casa_condominio",
    "sobrado",
    "studio",
    "loft",
    "terreno",
    "comercial",
  ];

  const results = await Promise.all(
    tipos.map(async (tipo) => {
      const { count } = await supabase
        .from("imoveis")
        .select("id", { count: "exact", head: true })
        .eq("tipo", tipo)
        .eq("status", "disponivel")
        .eq("finalidade", "venda")
        .not("fotos", "is", null)
        .neq("fotos", "[]");
      return [tipo, count ?? 0] as const;
    })
  );

  const map: TipoCounts = {};
  for (const [tipo, count] of results) map[tipo] = count;
  return map;
}

export async function getTipoCounts(): Promise<TipoCounts> {
  const now = Date.now();
  if (cache && now - cache.ts < CACHE_TTL_MS) return cache.data;
  if (inflight) return inflight;

  inflight = fetchTipoCountsFresh()
    .then((data) => {
      cache = { data, ts: Date.now() };
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
