/**
 * Motor de cálculo do studio para renda (mesmas fórmulas do estudo de cenários da Uhome).
 * Todas as premissas entram por parâmetro; aqui ficam só as fórmulas.
 */

export function taxaMensal(aa: number) {
  return Math.pow(1 + aa, 1 / 12) - 1;
}

export function price(pv: number, aa: number, n: number) {
  const i = taxaMensal(aa);
  return (pv * i) / (1 - Math.pow(1 + i, -n));
}

/** Sazonalidade mensal de Porto Alegre (AirROI, receita média por mês out/25–set/26), índice médio = 1. */
export const SAZ: Record<string, number> = {
  jan: 0.886, fev: 0.762, mar: 1.042, abr: 0.889, mai: 0.96, jun: 1.089,
  jul: 1.093, ago: 1.092, set: 1.126, out: 0.967, nov: 1.026, dez: 1.068,
};
export const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export interface SimParams {
  preco: number;
  entradaPct: number;
  taxaAA: number;
  prazo: number;
  seguro: number;
  faturamentoMes: number;
  custoPct: number;
  fixoMes: number;
  fixoMesSemCondo: number;
  condoGratisMeses: number;
  mobiliaTotal: number;
  mobiliaEntrada: number;
  mobiliaParcelas: number;
  mesesImplantacao: number;
  crescRenda: number;
  valorizacao: number;
  cdi: number[];
  irBanco: number;
  irAluguel?: number;
  irDedutivelPct?: number | null;
  contador?: number;
  sazonal: boolean;
  mesInicio: number;
  horizonteAnos?: number;
}

export interface SimMes {
  mes: number;
  fat: number;
  custos: number;
  fixo: number;
  mob: number;
  caixa: number;
  saldo: number;
  valorImovel: number;
  rendaLivre: number;
}

export interface SimResultado {
  parcela: number;
  parcelaComSeguro: number;
  capitalInicial: number;
  quitadoEm: number | null;
  serie: SimMes[];
}

export function simular(p: SimParams): SimResultado {
  const pv = p.preco * (1 - p.entradaPct);
  const i = taxaMensal(p.taxaAA);
  const parcela = price(pv, p.taxaAA, p.prazo);
  const mobParc = p.mobiliaParcelas > 0 ? (p.mobiliaTotal - p.mobiliaEntrada) / p.mobiliaParcelas : 0;
  const capitalInicial = p.preco * p.entradaPct + p.mobiliaEntrada;
  const H = (p.horizonteAnos || 15) * 12;
  const serie: SimMes[] = [];
  let saldo = pv;
  let quitadoEm: number | null = null;

  for (let mes = 1; mes <= H; mes++) {
    const ano = Math.floor((mes - 1) / 12);
    const operando = mes > p.mesesImplantacao;
    const mOp = mes - p.mesesImplantacao;
    const cresc = Math.pow(1 + p.crescRenda, Math.max(0, Math.floor((mOp - 1) / 12)));
    const saz = p.sazonal ? SAZ[MESES[(p.mesInicio + mes - 1) % 12]] : 1;
    const fat = operando ? p.faturamentoMes * cresc * saz : 0;
    const custos = fat * p.custoPct;
    const fixo = (mes <= p.condoGratisMeses ? p.fixoMesSemCondo : p.fixoMes) * Math.pow(1.045, ano) + (p.contador || 0);
    const ded = p.irDedutivelPct != null ? p.irDedutivelPct : p.custoPct;
    const lucroIR = Math.max(0, fat - fat * ded - fixo);
    const ir = lucroIR * (p.irAluguel || 0);
    const mob = mes <= p.mobiliaParcelas ? mobParc : 0;
    const caixa = fat - custos - fixo - ir - mob;
    const juros = saldo > 0 ? saldo * i : 0;
    const devido = saldo > 0 ? Math.min(parcela + p.seguro, saldo + juros + p.seguro) : 0;
    if (saldo > 0) {
      const pago = caixa >= devido ? Math.min(caixa, saldo + juros + p.seguro) : devido;
      saldo = Math.max(0, saldo - (pago - p.seguro - juros));
      if (saldo <= 0.5 && quitadoEm === null) quitadoEm = mes;
    }
    const valorImovel = p.preco * Math.pow(1 + p.valorizacao, mes / 12);
    const rendaLivre = saldo <= 0 ? Math.max(0, caixa) : 0;
    serie.push({ mes, fat, custos, fixo, mob, caixa, saldo, valorImovel, rendaLivre });
  }

  return { parcela, parcelaComSeguro: parcela + p.seguro, capitalInicial, quitadoEm, serie };
}
