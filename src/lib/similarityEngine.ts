/**
 * UhomePreço Super-Intelligence Similarity Engine
 * 
 * 10+ dimensional scoring with geographic proximity,
 * same-building detection, property condition extraction,
 * recency decay, and IQR outlier filtering.
 */

// ─── Types ──────────────────────────────────────────────────
export interface ComparableInput {
  id: string;
  preco: number;
  area_total: number | null;
  area_util: number | null;
  quartos: number | null;
  banheiros: number | null;
  vagas: number | null;
  andar: number | null;
  diferenciais: string[] | null;
  preco_condominio: number | null;
  condominio_nome: string | null;
  condominio_id: string | null;
  latitude: number | null;
  longitude: number | null;
  titulo: string | null;
  descricao: string | null;
  publicado_em: string | null;
}

export interface ReferenceProperty {
  id: string;
  preco: number;
  area_total: number | null;
  area_util: number | null;
  quartos: number | null;
  banheiros: number | null;
  vagas: number | null;
  andar: number | null;
  diferenciais: string[] | null;
  preco_condominio: number | null;
  condominio_nome: string | null;
  condominio_id: string | null;
  latitude: number | null;
  longitude: number | null;
  titulo: string | null;
  descricao: string | null;
  bairro: string;
  tipo: string;
  preco_iptu?: number | null;
}

export type MatchReason = 
  | "mesmo_edificio"
  | "mesma_rua"
  | "muito_proximo"
  | "mesmo_padrao"
  | "mesmo_tipo_estado";

export interface ScoredComparable {
  id: string;
  preco: number;
  area_total: number;
  precoM2: number;
  score: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  andar: number | null;
  distanciaMetros: number | null;
  condominio_nome: string | null;
  estado: PropertyCondition;
  matchReasons: MatchReason[];
  recencyWeight: number;
  slug?: string;
  foto_principal?: string | null;
  bairro?: string;
}

export type PropertyCondition = "novo" | "usado" | "planta" | "reformado" | "desconhecido";

// ─── Helpers ────────────────────────────────────────────────

/** Gaussian-like proximity score: 1.0 when equal, decays with distance */
function gaussianScore(a: number, b: number, sigma: number): number {
  const diff = (a - b) / sigma;
  return Math.exp(-0.5 * diff * diff);
}

/** Haversine distance in meters between two lat/lng points */
function haversineMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Extract property condition from titulo + descricao */
export function extractCondition(titulo?: string | null, descricao?: string | null): PropertyCondition {
  const text = `${titulo ?? ""} ${descricao ?? ""}`.toLowerCase();
  
  // Order matters: "na planta" before "novo"
  if (/\bna planta\b|em construção|lançamento|pré-lançamento|entrega\s*\d{4}/.test(text)) return "planta";
  if (/\b(novo|zero|nunca morado|nunca habitado|1[ªº]\s*locação|primeira locação|recém entregue)\b/.test(text)) return "novo";
  if (/\b(reformad[oa]|remodel|totalmente renovad|revitalizad)\b/.test(text)) return "reformado";
  if (/\b(usado|semi[- ]?novo|conservad|bom estado)\b/.test(text)) return "usado";
  
  return "desconhecido";
}

/** Recency decay: listings published recently are more relevant */
function recencyDecay(publicadoEm: string | null): number {
  if (!publicadoEm) return 0.5; // neutral if unknown
  const daysAgo = (Date.now() - new Date(publicadoEm).getTime()) / (1000 * 60 * 60 * 24);
  if (daysAgo <= 90) return 1.0;
  if (daysAgo <= 180) return 0.8;
  if (daysAgo <= 365) return 0.5;
  return 0.3;
}

/** Check if two properties are in the same building */
function isSameBuilding(ref: ReferenceProperty, comp: ComparableInput): boolean {
  // By condominio_id
  if (ref.condominio_id && comp.condominio_id && ref.condominio_id === comp.condominio_id) return true;
  // By condominio_nome (fuzzy)
  if (ref.condominio_nome && comp.condominio_nome) {
    const a = ref.condominio_nome.toLowerCase().trim();
    const b = comp.condominio_nome.toLowerCase().trim();
    if (a.length > 3 && b.length > 3 && (a === b || a.includes(b) || b.includes(a))) return true;
  }
  return false;
}

/** Area efficiency ratio similarity */
function areaEfficiencyScore(ref: ReferenceProperty, comp: ComparableInput): number {
  const refRatio = (ref.area_util && ref.area_total && ref.area_total > 0) 
    ? ref.area_util / ref.area_total : null;
  const compRatio = (comp.area_util && comp.area_total && comp.area_total > 0) 
    ? comp.area_util / comp.area_total : null;
  
  if (refRatio == null || compRatio == null) return 0.5; // neutral
  return gaussianScore(refRatio, compRatio, 0.15);
}

// ─── Main Scoring ───────────────────────────────────────────

interface DimensionScore {
  name: string;
  weight: number;
  score: number;
}

export function computeAdvancedScore(
  ref: ReferenceProperty,
  comp: ComparableInput
): { totalScore: number; dimensions: DimensionScore[]; matchReasons: MatchReason[]; distanciaMetros: number | null; estado: PropertyCondition; recencyWeight: number } {
  const dimensions: DimensionScore[] = [];
  const matchReasons: MatchReason[] = [];
  let bonusMultiplier = 1.0;
  
  // ── 1. Same building detection (bonus, not a dimension) ──
  const sameBuilding = isSameBuilding(ref, comp);
  if (sameBuilding) {
    bonusMultiplier = 1.5; // 50% boost
    matchReasons.push("mesmo_edificio");
  }
  
  // ── 2. Geographic proximity (22%) — strongest signal with high data coverage ──
  let distanciaMetros: number | null = null;
  if (ref.latitude && ref.longitude && comp.latitude && comp.longitude) {
    distanciaMetros = haversineMeters(ref.latitude, ref.longitude, comp.latitude, comp.longitude);
    // sigma = 400m → tighter radius, within ~150m scores very high
    const geoScore = gaussianScore(0, distanciaMetros, 400);
    dimensions.push({ name: "geo", weight: 0.22, score: geoScore });
    
    if (distanciaMetros < 100 && !sameBuilding) matchReasons.push("mesma_rua");
    else if (distanciaMetros < 300 && !sameBuilding) matchReasons.push("muito_proximo");
  }
  
  // ── 3. Area (22%) — core signal, always available ──
  const iArea = ref.area_total ?? 0;
  const cArea = comp.area_total ?? 0;
  if (iArea > 0 && cArea > 0) {
    dimensions.push({ name: "area", weight: 0.22, score: gaussianScore(iArea, cArea, iArea * 0.20) });
  }
  
  // ── 4. Quartos (12%) ──
  const iQ = ref.quartos ?? 0;
  const cQ = comp.quartos ?? 0;
  if (iQ > 0) {
    dimensions.push({ name: "quartos", weight: 0.12, score: gaussianScore(iQ, cQ, 0.8) });
  }
  
  // ── 5. Banheiros (8%) ──
  const iB = ref.banheiros ?? 0;
  const cB = comp.banheiros ?? 0;
  if (iB > 0) {
    dimensions.push({ name: "banheiros", weight: 0.08, score: gaussianScore(iB, cB, 1) });
  }
  
  // ── 6. Vagas (8%) ──
  const iV = ref.vagas ?? 0;
  const cV = comp.vagas ?? 0;
  dimensions.push({ name: "vagas", weight: 0.08, score: gaussianScore(iV, cV, 1) });
  
  // ── 7. Padrão construtivo via condomínio (12%) — good coverage ~60% ──
  const iCond = ref.preco_condominio ?? 0;
  const cCond = comp.preco_condominio ?? 0;
  if (iCond > 0 && cCond > 0) {
    const condScore = gaussianScore(iCond, cCond, iCond * 0.35);
    dimensions.push({ name: "padrao", weight: 0.12, score: condScore });
    if (condScore > 0.8) matchReasons.push("mesmo_padrao");
  }
  
  // ── 8. Andar (6%) ──
  const iA = ref.andar;
  const cA = comp.andar;
  if (iA != null && cA != null) {
    dimensions.push({ name: "andar", weight: 0.06, score: gaussianScore(iA, cA, 3) });
  }
  
  // ── 9. Diferenciais overlap (2%) — almost no data in production, minimal weight ──
  const iDif = ref.diferenciais ?? [];
  const cDif = comp.diferenciais ?? [];
  if (iDif.length > 0 && cDif.length > 0) {
    const iSet = new Set(iDif.map(d => d.toLowerCase()));
    const cSet = new Set(cDif.map(d => d.toLowerCase()));
    const intersection = [...iSet].filter(d => cSet.has(d)).length;
    const union = new Set([...iSet, ...cSet]).size;
    dimensions.push({ name: "diferenciais", weight: 0.02, score: intersection / union });
  }
  
  // ── 10. Property condition: novo/usado/planta (12%) — strong differentiator ──
  const refCondition = extractCondition(ref.titulo, ref.descricao);
  const compCondition = extractCondition(comp.titulo, comp.descricao);
  const estado = compCondition;
  
  let conditionScore = 0.5; // neutral if unknown
  if (refCondition !== "desconhecido" && compCondition !== "desconhecido") {
    conditionScore = refCondition === compCondition ? 1.0 : 0.15;
    if (refCondition === compCondition) matchReasons.push("mesmo_tipo_estado");
  }
  dimensions.push({ name: "estado", weight: 0.12, score: conditionScore });
  
  // ── 11. Area efficiency (implicit bonus, not weighted separately) ──
  const effScore = areaEfficiencyScore(ref, comp);
  // Small boost/penalty
  bonusMultiplier *= (0.9 + 0.2 * effScore); // range 0.9–1.1
  
  // ── Aggregate ──
  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0);
  const rawScore = totalWeight > 0
    ? dimensions.reduce((s, d) => s + d.weight * d.score, 0) / totalWeight
    : 0;
  
  // Apply bonus and recency
  const recencyWeight = recencyDecay(comp.publicado_em);
  const totalScore = Math.min(1, rawScore * bonusMultiplier * (0.7 + 0.3 * recencyWeight));
  
  return { totalScore, dimensions, matchReasons: [...new Set(matchReasons)], distanciaMetros, estado, recencyWeight };
}

// ─── IQR Outlier Filtering ──────────────────────────────────

/** Remove price/m² outliers using IQR method */
export function filterOutliersIQR(items: { precoM2: number }[]): typeof items {
  if (items.length < 5) return items;
  
  const sorted = [...items].sort((a, b) => a.precoM2 - b.precoM2);
  const q1Idx = Math.floor(sorted.length * 0.25);
  const q3Idx = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Idx].precoM2;
  const q3 = sorted[q3Idx].precoM2;
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  
  return items.filter(i => i.precoM2 >= lower && i.precoM2 <= upper);
}

/** Weighted median calculation */
export function weightedMedian(items: { value: number; weight: number }[]): number {
  const sorted = [...items].sort((a, b) => a.value - b.value);
  const totalWeight = sorted.reduce((s, i) => s + i.weight, 0);
  let cumWeight = 0;
  for (const item of sorted) {
    cumWeight += item.weight;
    if (cumWeight >= totalWeight / 2) return item.value;
  }
  return sorted[sorted.length - 1].value;
}

/** Format match reason to human-readable Portuguese */
export function formatMatchReason(reason: MatchReason): string {
  const map: Record<MatchReason, string> = {
    mesmo_edificio: "Mesmo edifício",
    mesma_rua: "Mesma rua",
    muito_proximo: "Muito próximo",
    mesmo_padrao: "Mesmo padrão",
    mesmo_tipo_estado: "Mesmo estado",
  };
  return map[reason] ?? reason;
}

/** Condition label in Portuguese */
export function conditionLabel(c: PropertyCondition): string {
  const map: Record<PropertyCondition, string> = {
    novo: "Novo",
    usado: "Usado",
    planta: "Na planta",
    reformado: "Reformado",
    desconhecido: "",
  };
  return map[c] ?? "";
}
