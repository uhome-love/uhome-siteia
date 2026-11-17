/**
 * Primeira dobra pronta vinda da borda (Worker + site-dobra).
 * - `#uh-pre`: HTML da primeira tela, trocado pelo app quando o conteúdo real monta (ver index.html).
 * - `window.__UH_DOBRA__`: os mesmos dados usados no "pre", para o app montar igual na primeira vez.
 */
type Dobra = { campanhas?: unknown[]; total?: number | null };

export function dadosDobra<K extends keyof Dobra>(k: K): Dobra[K] | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { __UH_DOBRA__?: Dobra }).__UH_DOBRA__?.[k];
}

/** A primeira tela ainda é a da borda: o conteúdo real deve aparecer sem animação de entrada. */
export function preAtivo() {
  return typeof document !== "undefined" && !!document.getElementById("uh-pre");
}
