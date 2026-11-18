type F = Record<string, any>;
const lista = (s?: string) => (s ? String(s).split(',').filter(Boolean) : []);
const comodidade = (id: string, nome: string) => ({
  id, nome,
  ativo: (f: F) => lista(f.comodidades).includes(id),
  alternar: (f: F) => { const l = lista(f.comodidades); return { ...f, comodidades: (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]).join(',') }; },
});
const numero = (id: string, k: string, v: number, nome: string) => ({ id, nome, ativo: (f: F) => Number(f[k]) === v, alternar: (f: F) => ({ ...f, [k]: Number(f[k]) === v ? 0 : v }) });
/** Chips rápidos da busca (padrão Airbnb): um toque liga ou desliga o filtro. */
export type Rapido = { id: string; nome: string; ativo: (f: F) => boolean; alternar: (f: F) => F };
export const RAPIDOS: Rapido[] = [
  comodidade('Pet friendly', 'Aceita pet'),
  comodidade('Piscina', 'Piscina'),
  comodidade('Pátio', 'Com pátio'),
  comodidade('Vista panorâmica', 'Vista panorâmica'),
  comodidade('Churrasqueira', 'Churrasqueira'),
  comodidade('Sacada', 'Sacada'),
  numero('vagas2', 'vagas', 2, '2+ vagas'),
  numero('quartos3', 'quartos', 3, '3+ quartos'),
  { id: 'pronto', nome: 'Pronto pra morar', ativo: (f: F) => f.fase === 'novo,usado', alternar: (f: F) => ({ ...f, fase: f.fase === 'novo,usado' ? '' : 'novo,usado' }) },
  comodidade('Elevador', 'Elevador'),
];
