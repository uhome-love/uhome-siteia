// Visitante de anúncio do Google: URL atual com clique/UTM do Google, ou primeira/última origem com gclid/gbraid.
import { origins } from "@/lib/journeyIdentity";

type Origem = Record<string, unknown>;
const CLIQUE_URL = ["gclid", "gbraid", "wbraid"];

export function veioDeAnuncio(search: string, o: { primeira_origem: Origem; ultima_origem: Origem }): boolean {
  const q = new URLSearchParams(search);
  if (CLIQUE_URL.some(k => q.get(k))) return true;
  if ((q.get("utm_source") || "").toLowerCase() === "google") return true;
  return [o.primeira_origem, o.ultima_origem].some(x => !!(x?.gclid || x?.gbraid));
}

export function visitanteDeAnuncio(): boolean {
  try { return veioDeAnuncio(window.location.search, origins()); } catch { return false; }
}

export interface FiltrosResumo { cidade?: string; bairro?: string; tipo?: string; quartos?: number; precoMin?: number; precoMax?: number }
const reais = (v: number) => v >= 1_000_000 ? `R$ ${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi` : `R$ ${Math.round(v / 1000).toLocaleString("pt-BR")} mil`;

/** Texto dos filtros ativos, anexado ao lead para o corretor saber o que a pessoa procura. */
export function resumoBusca(f: FiltrosResumo): string {
  const partes = [
    `Cidade: ${f.cidade || "Porto Alegre"}`,
    f.bairro ? `Bairro: ${f.bairro}` : "",
    f.tipo ? `Tipo: ${f.tipo}` : "",
    f.quartos ? `Quartos: ${f.quartos}+` : "",
    f.precoMin || f.precoMax ? `Preço: ${f.precoMin ? `de ${reais(f.precoMin)}` : ""}${f.precoMin && f.precoMax ? " " : ""}${f.precoMax ? `até ${reais(f.precoMax)}` : ""}` : "",
  ];
  return partes.filter(Boolean).join(" · ");
}
