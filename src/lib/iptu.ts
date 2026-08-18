/**
 * IPTU pode vir do Jetimob com periodicidade mensal ou anual.
 * Sempre normalizamos para valor mensal equivalente nos cálculos de custo.
 */

export interface IptuInput {
  preco_iptu?: number | null;
  iptu_periodicidade?: string | null;
}

export function isIptuAnual(imovel: IptuInput): boolean {
  return (imovel.iptu_periodicidade ?? "").toLowerCase().startsWith("anual");
}

/** Valor mensal equivalente do IPTU (anual ÷ 12). */
export function iptuMensal(imovel: IptuInput): number {
  const valor = imovel.preco_iptu ?? 0;
  if (valor <= 0) return 0;
  return isIptuAnual(imovel) ? Math.round(valor / 12) : Math.round(valor);
}

const brl = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

/** Ex.: "IPTU: R$ 729/ano (R$ 61/mês)" ou "IPTU: R$ 120/mês". Vazio quando não há valor. */
export function formatIptu(imovel: IptuInput): string {
  const valor = imovel.preco_iptu ?? 0;
  if (valor <= 0) return "";
  if (isIptuAnual(imovel)) {
    return `IPTU: R$ ${brl(valor)}/ano (R$ ${brl(iptuMensal(imovel))}/mês)`;
  }
  return `IPTU: R$ ${brl(valor)}/mês`;
}

/** Versão curta para cards: "IPTU R$ 61/mês". */
export function formatIptuCurto(imovel: IptuInput): string {
  const mensal = iptuMensal(imovel);
  if (mensal <= 0) return "";
  return `IPTU R$ ${brl(mensal)}/mês`;
}
