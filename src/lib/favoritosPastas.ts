export type Pasta = { id: string; nome: string; ordem: number; itens: string[] };
export type EstadoPastas = { pastas: Pasta[]; notas: Record<string, string> };
export const PASTAS_KEY = 'uh-favoritos-pastas';
const vazio = (): EstadoPastas => ({ pastas: [], notas: {} });

export function lerPastas(): EstadoPastas {
  try { const e = JSON.parse(localStorage.getItem(PASTAS_KEY) ?? 'null'); return e && Array.isArray(e.pastas) ? { pastas: e.pastas, notas: e.notas ?? {} } : vazio(); } catch { return vazio(); }
}
export function salvarPastas(e: EstadoPastas) { localStorage.setItem(PASTAS_KEY, JSON.stringify(e)); window.dispatchEvent(new Event('uhome:pastas')); }

export function criarPasta(e: EstadoPastas, nome: string, id: string = crypto.randomUUID()): EstadoPastas {
  const n = nome.trim().slice(0, 40); if (!n) return e;
  return { ...e, pastas: [...e.pastas, { id, nome: n, ordem: e.pastas.length, itens: [] }] };
}
export function renomearPasta(e: EstadoPastas, id: string, nome: string): EstadoPastas {
  const n = nome.trim().slice(0, 40); if (!n) return e;
  return { ...e, pastas: e.pastas.map(p => p.id === id ? { ...p, nome: n } : p) };
}
/** Apagar a pasta não remove o imóvel dos favoritos. */
export function apagarPasta(e: EstadoPastas, id: string): EstadoPastas { return { ...e, pastas: e.pastas.filter(p => p.id !== id) }; }
export function alternarNaPasta(e: EstadoPastas, pastaId: string, imovelId: string): EstadoPastas {
  return { ...e, pastas: e.pastas.map(p => p.id !== pastaId ? p : { ...p, itens: p.itens.includes(imovelId) ? p.itens.filter(x => x !== imovelId) : [...p.itens, imovelId] }) };
}
export function definirNota(e: EstadoPastas, imovelId: string, nota: string): EstadoPastas {
  const notas = { ...e.notas }; const t = nota.slice(0, 140);
  if (t.trim()) notas[imovelId] = t; else delete notas[imovelId];
  return { ...e, notas };
}
/** Ao desfavoritar, o imóvel sai de todas as pastas. */
export function removerImovel(e: EstadoPastas, imovelId: string): EstadoPastas {
  const notas = { ...e.notas }; delete notas[imovelId];
  return { notas, pastas: e.pastas.map(p => ({ ...p, itens: p.itens.filter(x => x !== imovelId) })) };
}
/** Junta pastas do aparelho com as da conta, sem perder itens nem notas. */
export function juntarPastas(local: EstadoPastas, conta: EstadoPastas): EstadoPastas {
  const porId = new Map(conta.pastas.map(p => [p.id, { ...p }]));
  for (const p of local.pastas) { const c = porId.get(p.id); porId.set(p.id, c ? { ...c, itens: [...new Set([...c.itens, ...p.itens])] } : p); }
  return { pastas: [...porId.values()].sort((a, b) => a.ordem - b.ordem), notas: { ...conta.notas, ...local.notas } };
}
export function linkPasta(origin: string, token: string) { return `${origin}/favoritos/p/${token}`; }
