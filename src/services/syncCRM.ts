import { supabase } from "@/integrations/supabase/client";

/**
 * Fire-and-forget sync to UhomeSales CRM.
 * Never throws — errors are logged silently so user flow is never blocked.
 */
export async function syncToCRM(tipo: "lead" | "agendamento" | "busca_salva" | "favorito", record: Record<string, unknown>) {
  try {
    await supabase.functions.invoke("sync-to-crm", {
      body: { tipo, record },
    });
  } catch (err) {
    console.error("[syncToCRM] Erro (não-bloqueante):", err);
  }
}
