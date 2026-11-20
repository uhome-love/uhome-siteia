/** Public catalog reads use the same anonymous permissions without loading the SDK. */
export async function catalogoPublico<T>(tabela: 'produtos_foco' | 'campanhas' | 'campanha_produtos', filtros: Record<string, string>, signal?: AbortSignal): Promise<T[]> {
  const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${tabela}?${new URLSearchParams(filtros)}`, {
    headers: { apikey: chave, Authorization: `Bearer ${chave}`, 'Accept-Profile': 'public', Range: '0-1999' },
    credentials: 'omit', signal,
  });
  if (!response.ok) throw new Error(`Catálogo indisponível (${response.status})`);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Resposta inválida do catálogo');
  return data as T[];
}

export async function itemPublico<T>(tabela: 'produtos_foco' | 'campanhas', filtros: Record<string, string>, signal?: AbortSignal): Promise<T | null> {
  const rows = await catalogoPublico<T>(tabela, filtros, signal);
  if (rows.length > 1) throw new Error('Mais de um item para o mesmo endereço');
  return rows[0] ?? null;
}