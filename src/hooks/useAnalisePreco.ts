import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Imovel } from "@/services/imoveis";

export interface AnalisePreco {
  status: "abaixo" | "justo" | "acima";
  percentual: number;
  precoM2Imovel: number;
  precoM2Bairro: number;
  mediaPreco: number;
  minEstimado: number;
  maxEstimado: number;
  totalSimilares: number;
}

function mediana(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function removeOutliers(values: number[]): number[] {
  if (values.length < 5) return values;
  const sorted = [...values].sort((a, b) => a - b);
  const p10 = Math.floor(sorted.length * 0.1);
  const p90 = Math.ceil(sorted.length * 0.9);
  return sorted.slice(p10, p90);
}

export function useAnalisePreco(imovel: Imovel | null): AnalisePreco | null {
  const [analise, setAnalise] = useState<AnalisePreco | null>(null);

  useEffect(() => {
    if (!imovel?.preco || !imovel.area_total || !imovel.bairro) return;

    async function calcular() {
      const area = imovel!.area_total!;
      const areaMin = Math.round(area * 0.7);
      const areaMax = Math.round(area * 1.3);
      const vagasMin = Math.max(0, (imovel!.vagas ?? 0) - 1);

      let query = supabase
        .from("imoveis")
        .select("preco, area_total")
        .eq("status", "disponivel")
        .ilike("bairro", `%${imovel!.bairro}%`)
        .ilike("tipo", `%${imovel!.tipo}%`)
        .gte("quartos", Math.max(1, (imovel!.quartos ?? 1) - 1))
        .lte("quartos", (imovel!.quartos ?? 3) + 1)
        .gte("area_total", areaMin)
        .lte("area_total", areaMax)
        .gte("vagas", vagasMin)
        .neq("id", imovel!.id)
        .limit(50);

      const { data: similares } = await query;

      if (!similares || similares.length < 3) return;

      const precoM2Lista = similares
        .filter((s) => (s.area_total ?? 0) > 0)
        .map((s) => s.preco / (s.area_total ?? 1));

      if (precoM2Lista.length === 0) return;

      // Remove outliers (P10-P90) and use median
      const cleaned = removeOutliers(precoM2Lista);
      const precoM2Bairro = Math.round(mediana(cleaned));
      const precoM2Imovel = Math.round(imovel!.preco / area);

      const percentual = Math.round(
        ((precoM2Imovel - precoM2Bairro) / precoM2Bairro) * 100
      );

      const status: AnalisePreco["status"] =
        percentual < -8 ? "abaixo" : percentual > 8 ? "acima" : "justo";

      const mediaPreco = Math.round(precoM2Bairro * area);

      setAnalise({
        status,
        percentual,
        precoM2Imovel,
        precoM2Bairro,
        mediaPreco,
        minEstimado: Math.round(mediaPreco * 0.88),
        maxEstimado: Math.round(mediaPreco * 1.12),
        totalSimilares: similares.length,
      });
    }

    calcular();
  }, [imovel?.id]);

  return analise;
}
