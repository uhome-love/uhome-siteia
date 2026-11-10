import { iptuMensal, type IptuInput } from "./iptu";

/** Primeira parcela SAC — mesmos padrões do simulador (20% entrada, 30 anos, 10,5% a.a.). */
export function primeiraParcelaSAC(preco: number, entradaPct = 20, anos = 30, taxaAnual = 10.5): number {
  if (!preco || preco <= 0) return 0;
  const financiado = preco * (1 - entradaPct / 100);
  const meses = anos * 12;
  return financiado / meses + financiado * (taxaAnual / 100 / 12);
}

/** Custo fixo mensal: condomínio + IPTU convertido para mês. */
export function custoMensalFixo(imovel: IptuInput & { preco_condominio?: number | null }): number {
  const cond = imovel.preco_condominio && imovel.preco_condominio > 0 ? imovel.preco_condominio : 0;
  return Math.round(cond + iptuMensal(imovel));
}
