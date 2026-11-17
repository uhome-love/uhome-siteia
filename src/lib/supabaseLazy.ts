import type { supabase as ClienteReal } from "@/integrations/supabase/client";

/**
 * Conexão com o servidor carregada sob demanda: o pacote do cliente (≈250 KB) sai do arquivo principal
 * e só baixa na primeira consulta. Mesma interface do cliente: `supabase.from(...).select(...)` etc.
 * Cada `await` reexecuta a cadeia gravada no cliente real (igual ao comportamento original).
 * Não use para chamadas que precisam de retorno síncrono (ex.: onAuthStateChange, getPublicUrl):
 * nesses casos use `carregarSupabase()`.
 */
type Cliente = typeof ClienteReal;
let carregando: Promise<Cliente> | null = null;
export const carregarSupabase = (): Promise<Cliente> =>
  (carregando ??= import("@/integrations/supabase/client").then((m) => m.supabase));

type Passo = { k: PropertyKey } | { args: unknown[] };

async function executar(passos: Passo[]): Promise<unknown> {
  let alvo: any = await carregarSupabase();
  let dono: any = null;
  for (const p of passos) {
    if ("k" in p) { dono = alvo; alvo = alvo[p.k]; }
    else { alvo = alvo.apply(dono, p.args); dono = null; }
  }
  return alvo;
}

function gravar(passos: Passo[]): any {
  return new Proxy(function () {}, {
    get(_t, k) {
      if (k === "then") return (ok?: (v: unknown) => unknown, erro?: (e: unknown) => unknown) => executar(passos).then(ok, erro);
      if (k === "catch") return (erro?: (e: unknown) => unknown) => executar(passos).catch(erro);
      if (k === "finally") return (f?: () => void) => executar(passos).finally(f);
      return gravar([...passos, { k }]);
    },
    apply(_t, _this, args) {
      return gravar([...passos, { args }]);
    },
  });
}

export const supabase = gravar([]) as Cliente;
