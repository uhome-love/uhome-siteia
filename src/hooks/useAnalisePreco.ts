import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Imovel } from "@/services/imoveis";
import {
  computeAdvancedScore,
  filterOutliersIQR,
  weightedMedian,
  extractCondition,
  type ScoredComparable,
  type ReferenceProperty,
  type ComparableInput,
  type PropertyCondition,
  type MatchReason,
} from "@/lib/similarityEngine";

export type { ScoredComparable, PropertyCondition, MatchReason };

export interface AnalisePreco {
  status: "abaixo" | "justo" | "acima";
  percentual: number;
  precoM2Imovel: number;
  precoM2Bairro: number;
  mediaPreco: number;
  minEstimado: number;
  maxEstimado: number;
  totalSimilares: number;
  confianca: "alta" | "media" | "baixa";
  custoTotalMensal: number | null;
  comparaveis: ScoredComparable[];
  estadoImovel: PropertyCondition;
}

const COMPARABLE_COLUMNS = "id, preco, area_total, area_util, quartos, banheiros, vagas, andar, diferenciais, preco_condominio, condominio_nome, condominio_id, latitude, longitude, titulo, descricao, publicado_em";

export function useAnalisePreco(imovel: Imovel | null): AnalisePreco | null {
  const [analise, setAnalise] = useState<AnalisePreco | null>(null);

  useEffect(() => {
    if (!imovel?.preco || !imovel.area_total || !imovel.bairro) return;

    let cancelled = false;

    async function calcular() {
      const area = imovel!.area_total!;
      const areaMin = Math.round(area * 0.5);
      const areaMax = Math.round(area * 2.0);

      // Build reference property
      const ref: ReferenceProperty = {
        id: imovel!.id,
        preco: imovel!.preco,
        area_total: imovel!.area_total,
        area_util: imovel!.area_util ?? null,
        quartos: imovel!.quartos,
        banheiros: imovel!.banheiros ?? null,
        vagas: imovel!.vagas,
        andar: imovel!.andar,
        diferenciais: imovel!.diferenciais,
        preco_condominio: imovel!.preco_condominio ?? null,
        condominio_nome: imovel!.condominio_nome ?? null,
        condominio_id: null, // not in Imovel type
        latitude: imovel!.latitude ?? null,
        longitude: imovel!.longitude ?? null,
        titulo: imovel!.titulo ?? null,
        descricao: imovel!.descricao ?? null,
        bairro: imovel!.bairro,
        tipo: imovel!.tipo,
        preco_iptu: imovel!.preco_iptu ?? null,
      };

      const { data: similares } = await supabase
        .from("imoveis")
        .select(COMPARABLE_COLUMNS)
        .eq("status", "disponivel")
        .ilike("bairro", `%${imovel!.bairro}%`)
        .ilike("tipo", `%${imovel!.tipo}%`)
        .gte("area_total", areaMin)
        .lte("area_total", areaMax)
        .neq("id", imovel!.id)
        .limit(200);

      if (cancelled || !similares || similares.length < 3) return;

      // Score each comparable with advanced engine
      let scored = similares
        .filter((s) => (s.area_total ?? 0) > 0)
        .map((s) => {
          const comp: ComparableInput = {
            id: s.id,
            preco: s.preco,
            area_total: s.area_total,
            area_util: s.area_util,
            quartos: s.quartos,
            banheiros: s.banheiros,
            vagas: s.vagas,
            andar: s.andar,
            diferenciais: s.diferenciais,
            preco_condominio: s.preco_condominio,
            condominio_nome: s.condominio_nome,
            condominio_id: s.condominio_id,
            latitude: s.latitude,
            longitude: s.longitude,
            titulo: s.titulo,
            descricao: s.descricao,
            publicado_em: s.publicado_em,
          };

          const result = computeAdvancedScore(ref, comp);

          return {
            id: s.id,
            preco: s.preco,
            area_total: s.area_total!,
            precoM2: s.preco / s.area_total!,
            score: result.totalScore,
            quartos: s.quartos ?? 0,
            banheiros: s.banheiros ?? 0,
            vagas: s.vagas ?? 0,
            andar: s.andar,
            distanciaMetros: result.distanciaMetros,
            condominio_nome: s.condominio_nome,
            estado: result.estado,
            matchReasons: result.matchReasons,
            recencyWeight: result.recencyWeight,
          } satisfies ScoredComparable;
        })
        .filter((s) => s.score > 0.40) // calibrated threshold for tighter similarity
        .sort((a, b) => b.score - a.score);

      if (scored.length < 3) return;

      // IQR outlier filtering on price/m²
      scored = filterOutliersIQR(scored) as typeof scored;
      if (scored.length < 3) return;

      // Use top 30 most similar
      const top = scored.slice(0, 30);

      const precoM2Bairro = Math.round(
        weightedMedian(top.map((s) => ({ value: s.precoM2, weight: s.score })))
      );

      const precoM2Imovel = Math.round(imovel!.preco / area);

      const percentual = Math.round(
        ((precoM2Imovel - precoM2Bairro) / precoM2Bairro) * 100
      );

      const status: AnalisePreco["status"] =
        percentual < -8 ? "abaixo" : percentual > 8 ? "acima" : "justo";

      const mediaPreco = Math.round(precoM2Bairro * area);

      // Confidence based on high-similarity matches
      const highSimilarity = top.filter((s) => s.score > 0.65).length;
      const confianca: AnalisePreco["confianca"] =
        highSimilarity >= 8 ? "alta" : highSimilarity >= 3 ? "media" : "baixa";

      const margin = confianca === "alta" ? 0.07 : confianca === "media" ? 0.11 : 0.16;

      const cond = imovel!.preco_condominio ?? 0;
      const iptu = imovel!.preco_iptu ?? 0;
      const custoTotalMensal = cond + iptu > 0 ? cond + iptu : null;

      if (cancelled) return;

      setAnalise({
        status,
        percentual,
        precoM2Imovel,
        precoM2Bairro,
        mediaPreco,
        minEstimado: Math.round(mediaPreco * (1 - margin)),
        maxEstimado: Math.round(mediaPreco * (1 + margin)),
        totalSimilares: top.length,
        confianca,
        custoTotalMensal,
        comparaveis: top.slice(0, 5),
        estadoImovel: extractCondition(imovel!.titulo, imovel!.descricao),
      });
    }

    calcular();
    return () => { cancelled = true; };
  }, [imovel?.id]);

  return analise;
}
