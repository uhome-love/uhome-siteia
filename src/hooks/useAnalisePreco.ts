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

export function useAnalisePreco(imovel: Imovel | null): AnalisePreco | null {
  const [analise, setAnalise] = useState<AnalisePreco | null>(null);

  useEffect(() => {
    if (!imovel?.preco || !imovel.area_total || !imovel.bairro) return;

    async function calcular() {
      const { data: similares } = await supabase
        .from("imoveis")
        .select("preco, area_total")
        .eq("status", "disponivel")
        .ilike("bairro", `%${imovel!.bairro}%`)
        .ilike("tipo", `%${imovel!.tipo}%`)
        .gte("quartos", Math.max(1, (imovel!.quartos ?? 1) - 1))
        .lte("quartos", (imovel!.quartos ?? 3) + 1)
        .gt("area_total", 0)
        .neq("id", imovel!.id)
        .limit(30);

      if (!similares || similares.length < 3) return;

      const precoM2Lista = similares
        .filter((s) => (s.area_total ?? 0) > 0)
        .map((s) => s.preco / (s.area_total ?? 1));

      if (precoM2Lista.length === 0) return;

      const precoM2Bairro = Math.round(
        precoM2Lista.reduce((a, b) => a + b, 0) / precoM2Lista.length
      );
      const precoM2Imovel = Math.round(imovel!.preco / imovel!.area_total!);

      const percentual = Math.round(
        ((precoM2Imovel - precoM2Bairro) / precoM2Bairro) * 100
      );

      const status: AnalisePreco["status"] =
        percentual < -8 ? "abaixo" : percentual > 8 ? "acima" : "justo";

      const mediaPreco = Math.round(precoM2Bairro * imovel!.area_total!);

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
