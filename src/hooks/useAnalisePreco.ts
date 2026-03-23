import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Imovel } from "@/services/imoveis";

export interface SimilarComparable {
  preco: number;
  area_total: number;
  precoM2: number;
  score: number; // 0-1 similarity score
  quartos: number;
  vagas: number;
  andar: number | null;
}

export interface AnalisePreco {
  status: "abaixo" | "justo" | "acima";
  percentual: number;
  precoM2Imovel: number;
  precoM2Bairro: number; // weighted median of comparables
  mediaPreco: number;
  minEstimado: number;
  maxEstimado: number;
  totalSimilares: number;
  confianca: "alta" | "media" | "baixa";
  custoTotalMensal: number | null; // condominio + iptu
  comparaveis: SimilarComparable[];
}

// Gaussian-like proximity score: 1.0 when equal, decays as distance grows
function proximityScore(a: number, b: number, sigma: number): number {
  const diff = (a - b) / sigma;
  return Math.exp(-0.5 * diff * diff);
}

function computeSimilarityScore(
  imovel: Imovel,
  comp: {
    area_total: number | null;
    quartos: number | null;
    vagas: number | null;
    andar: number | null;
    diferenciais: string[] | null;
    preco_condominio: number | null;
  }
): number {
  let score = 0;
  let totalWeight = 0;

  // Area similarity (weight 35%) — sigma = 30% of imovel area
  const iArea = imovel.area_total ?? 0;
  const cArea = comp.area_total ?? 0;
  if (iArea > 0 && cArea > 0) {
    score += 0.35 * proximityScore(iArea, cArea, iArea * 0.3);
    totalWeight += 0.35;
  }

  // Quartos similarity (weight 25%) — sigma = 1
  const iQ = imovel.quartos ?? 0;
  const cQ = comp.quartos ?? 0;
  if (iQ > 0) {
    score += 0.25 * proximityScore(iQ, cQ, 1);
    totalWeight += 0.25;
  }

  // Vagas similarity (weight 15%) — sigma = 1
  const iV = imovel.vagas ?? 0;
  const cV = comp.vagas ?? 0;
  score += 0.15 * proximityScore(iV, cV, 1);
  totalWeight += 0.15;

  // Andar similarity (weight 10%) — sigma = 3
  const iA = imovel.andar;
  const cA = comp.andar;
  if (iA != null && cA != null) {
    score += 0.10 * proximityScore(iA, cA, 3);
    totalWeight += 0.10;
  }

  // Diferenciais overlap (weight 15%)
  const iDif = imovel.diferenciais ?? [];
  const cDif = comp.diferenciais ?? [];
  if (iDif.length > 0 && cDif.length > 0) {
    const iSet = new Set(iDif.map(d => d.toLowerCase()));
    const cSet = new Set(cDif.map(d => d.toLowerCase()));
    const intersection = [...iSet].filter(d => cSet.has(d)).length;
    const union = new Set([...iSet, ...cSet]).size;
    score += 0.15 * (intersection / union); // Jaccard
    totalWeight += 0.15;
  }

  return totalWeight > 0 ? score / totalWeight : 0;
}

function weightedMedian(items: { value: number; weight: number }[]): number {
  const sorted = [...items].sort((a, b) => a.value - b.value);
  const totalWeight = sorted.reduce((s, i) => s + i.weight, 0);
  let cumWeight = 0;
  for (const item of sorted) {
    cumWeight += item.weight;
    if (cumWeight >= totalWeight / 2) return item.value;
  }
  return sorted[sorted.length - 1].value;
}

export function useAnalisePreco(imovel: Imovel | null): AnalisePreco | null {
  const [analise, setAnalise] = useState<AnalisePreco | null>(null);

  useEffect(() => {
    if (!imovel?.preco || !imovel.area_total || !imovel.bairro) return;

    async function calcular() {
      const area = imovel!.area_total!;
      // Cast a wider net — we'll rank by similarity instead of filtering tightly
      const areaMin = Math.round(area * 0.5);
      const areaMax = Math.round(area * 2.0);

      const { data: similares } = await supabase
        .from("imoveis")
        .select("preco, area_total, quartos, vagas, andar, diferenciais, preco_condominio")
        .eq("status", "disponivel")
        .ilike("bairro", `%${imovel!.bairro}%`)
        .ilike("tipo", `%${imovel!.tipo}%`)
        .gte("area_total", areaMin)
        .lte("area_total", areaMax)
        .neq("id", imovel!.id)
        .limit(100);

      if (!similares || similares.length < 3) return;

      // Score each comparable
      const scored = similares
        .filter((s) => (s.area_total ?? 0) > 0)
        .map((s) => ({
          ...s,
          area_total: s.area_total!,
          quartos: s.quartos ?? 0,
          vagas: s.vagas ?? 0,
          andar: s.andar,
          precoM2: s.preco / s.area_total!,
          score: computeSimilarityScore(imovel!, s),
        }))
        .filter((s) => s.score > 0.3) // discard poor matches
        .sort((a, b) => b.score - a.score);

      if (scored.length < 3) return;

      // Use top 30 most similar for analysis
      const top = scored.slice(0, 30);

      // Weighted median of price/m² (weight = similarity score)
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

      // Confidence: based on count of high-similarity matches
      const highSimilarity = top.filter((s) => s.score > 0.6).length;
      const confianca: AnalisePreco["confianca"] =
        highSimilarity >= 10 ? "alta" : highSimilarity >= 4 ? "media" : "baixa";

      // Narrower estimate range for higher confidence
      const margin = confianca === "alta" ? 0.08 : confianca === "media" ? 0.12 : 0.18;

      // Monthly costs
      const cond = imovel!.preco_condominio ?? 0;
      const iptu = imovel!.preco_iptu ?? 0;
      const custoTotalMensal = cond + iptu > 0 ? cond + iptu : null;

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
        comparaveis: top.slice(0, 5).map((s) => ({
          preco: s.preco,
          area_total: s.area_total,
          precoM2: Math.round(s.precoM2),
          score: Math.round(s.score * 100) / 100,
          quartos: s.quartos,
          vagas: s.vagas,
          andar: s.andar,
        })),
      });
    }

    calcular();
  }, [imovel?.id]);

  return analise;
}
