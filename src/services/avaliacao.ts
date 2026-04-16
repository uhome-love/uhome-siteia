import { supabase } from "@/integrations/supabase/client";
import type { Imovel } from "@/services/imoveis";
import { formatPreco } from "@/services/imoveis";

export { formatPreco };

export interface DadosImovel {
  tipo: string;
  bairro: string;
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  estado: "novo" | "bom" | "medio" | "reforma";
  diferenciais: string[];
}

export interface ResultadoAvaliacao {
  valorMin: number;
  valorMax: number;
  valorMedio: number;
  precoM2Bairro: number;
  totalSimilares: number;
  tempoMedioVenda: number;
  imoveisSimilares: Imovel[];
  confianca: "alta" | "media" | "baixa";
}

function normalizarTipo(tipo: string): string {
  const map: Record<string, string> = {
    Apartamento: "apartamento",
    "Apartamento Garden": "garden",
    Casa: "casa",
    Cobertura: "cobertura",
    "Studio / Kitnet": "studio",
  };
  return map[tipo] ?? tipo.toLowerCase();
}

export const precoM2Fallback: Record<string, number> = {
  "Três Figueiras": 14200,
  "Moinhos de Vento": 12500,
  "Petrópolis": 9800,
  Ipanema: 9200,
  Tristeza: 8900,
  Auxiliadora: 8600,
  "Bela Vista": 8200,
  "Menino Deus": 7800,
  "Cidade Baixa": 6800,
  "Bom Fim": 6200,
  "Centro Histórico": 5600,
  Cristal: 5400,
  Partenon: 4800,
  "Boa Vista": 5800,
  Sarandi: 4200,
};

export async function avaliarImovel(dados: DadosImovel): Promise<ResultadoAvaliacao> {
  const tipoNorm = normalizarTipo(dados.tipo);

  // 1. Buscar imóveis similares
  const { data: similares, count } = await supabase
    .from("imoveis")
    .select("*", { count: "exact" })
    .eq("status", "disponivel")
    .ilike("bairro", `%${dados.bairro}%`)
    .ilike("tipo", `%${tipoNorm}%`)
    .gte("quartos", Math.max(0, dados.quartos - 1))
    .lte("quartos", dados.quartos + 1)
    .gte("area_total", dados.area * 0.7)
    .lte("area_total", dados.area * 1.3)
    .order("created_at", { ascending: false })
    .limit(20);

  // 2. Preço médio m² no bairro
  const { data: todosBairro } = await supabase
    .from("imoveis")
    .select("preco, area_total")
    .eq("status", "disponivel")
    .ilike("bairro", `%${dados.bairro}%`)
    .gt("area_total", 0)
    .limit(100);

  const precoM2Bairro =
    todosBairro && todosBairro.length > 0
      ? Math.round(
          todosBairro.reduce((acc, i) => acc + i.preco / (i.area_total ?? 1), 0) /
            todosBairro.length
        )
      : precoM2Fallback[dados.bairro] ?? 7000;

  // 3. Valor base
  const valorBase = precoM2Bairro * dados.area;

  // 4. Multiplicadores
  const multEstado: Record<string, number> = { novo: 1.15, bom: 1.0, medio: 0.9, reforma: 0.78 };
  const multTipo: Record<string, number> = { cobertura: 1.25, apartamento: 1.0, casa: 0.95, studio: 0.85 };

  const multVagas = 1 + dados.vagas * 0.03;
  const multDif = Math.min(1 + dados.diferenciais.length * 0.02, 1.12);

  const valorMedio = Math.round(
    valorBase *
      (multEstado[dados.estado] ?? 1) *
      (multTipo[tipoNorm] ?? 1) *
      multVagas *
      multDif
  );

  const valorMin = Math.round(valorMedio * 0.88);
  const valorMax = Math.round(valorMedio * 1.12);

  const confianca: ResultadoAvaliacao["confianca"] =
    (count ?? 0) >= 10 ? "alta" : (count ?? 0) >= 5 ? "media" : "baixa";

  return {
    valorMin,
    valorMax,
    valorMedio,
    precoM2Bairro,
    totalSimilares: count ?? 0,
    tempoMedioVenda: 45,
    imoveisSimilares: (similares ?? []).slice(0, 3) as unknown as Imovel[],
    confianca,
  };
}
