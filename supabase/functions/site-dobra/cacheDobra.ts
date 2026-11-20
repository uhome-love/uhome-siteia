/** Deduplica consultas simultâneas e mantém corpos válidos, nunca falhas vazias. */
export function criarCacheDobra<T extends { head: string; pre: string; script: string }>(ttl = 60_000) {
  const prontos = new Map<string, { em: number; corpo: T }>();
  const pendentes = new Map<string, Promise<T>>();
  return async (chave: string, carregar: () => Promise<T>): Promise<T> => {
    const pronto = prontos.get(chave);
    if (pronto && Date.now() - pronto.em < ttl) return pronto.corpo;
    const pendente = pendentes.get(chave);
    if (pendente) return pendente;
    const pedido = carregar().then(corpo => {
      if (corpo.pre || corpo.head || corpo.script) prontos.set(chave, { em: Date.now(), corpo });
      if (prontos.size > 100) { const primeira = prontos.keys().next().value; if (primeira) prontos.delete(primeira); }
      return corpo;
    }).finally(() => pendentes.delete(chave));
    pendentes.set(chave, pedido);
    return pedido;
  };
}

export function pathDobra(bruto: string) {
  const path = new URL(bruto || '/', 'https://uhome.com.br').pathname;
  return path.replace(/\/$/, '') || '/';
}