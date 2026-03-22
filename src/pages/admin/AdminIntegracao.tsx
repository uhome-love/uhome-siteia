import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, ArrowRightLeft, CheckCircle2, XCircle, Users, Send, AlertTriangle, Clock, Stethoscope } from "lucide-react";

interface SyncLog {
  id: string;
  created_at: string;
  direcao: string;
  tipo: string;
  sucesso: boolean | null;
  erro: string | null;
  payload: Record<string, unknown> | null;
}

interface Stats {
  corretores: number;
  leads_enviados: number;
  leads_pendentes: number;
  ultima_sync: string;
}

export default function AdminIntegracao() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    corretores: 0,
    leads_enviados: 0,
    leads_pendentes: 0,
    ultima_sync: "",
  });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .not("uhomesales_id", "is", null),
      supabase
        .from("public_leads")
        .select("*", { count: "exact", head: true })
        .not("uhomesales_lead_id", "is", null),
      supabase
        .from("public_leads")
        .select("*", { count: "exact", head: true })
        .is("uhomesales_lead_id", null)
        .not("created_at", "is", null),
      supabase
        .from("sync_log")
        .select("created_at")
        .eq("tipo", "corretor")
        .order("created_at", { ascending: false })
        .limit(1),
    ]).then(([c, ls, le, ul]) => {
      setStats({
        corretores: c.count ?? 0,
        leads_enviados: ls.count ?? 0,
        leads_pendentes: le.count ?? 0,
        ultima_sync: ul.data?.[0]?.created_at ?? "",
      });
    });

    supabase
      .from("sync_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setLogs((data as SyncLog[]) ?? []));
  }, []);

  async function sincronizarAgora() {
    setSyncing(true);
    try {
      await supabase.functions.invoke("sync-corretores", {
        body: {},
      });
      toast.success("Sincronização de corretores iniciada!");
    } catch {
      toast.error("Erro ao iniciar sincronização");
    } finally {
      setSyncing(false);
    }
  }

  const kpis = [
    {
      label: "Corretores sincronizados",
      value: stats.corretores,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Leads enviados ao CRM",
      value: stats.leads_enviados,
      icon: Send,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Leads pendentes",
      value: stats.leads_pendentes,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Última sync corretores",
      value: stats.ultima_sync
        ? new Date(stats.ultima_sync).toLocaleString("pt-BR")
        : "—",
      icon: Clock,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-body text-2xl font-extrabold tracking-tight text-foreground">
          Integração UhomeSales CRM
        </h1>
        <button
          onClick={sincronizarAgora}
          disabled={syncing}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97] disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando..." : "Sincronizar agora"}
        </button>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${k.bg}`}>
                <k.icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <span className="font-body text-[13px] text-muted-foreground">
                {k.label}
              </span>
            </div>
            <div className={`font-body text-xl font-extrabold ${k.color}`}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Logs */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-body text-[15px] font-bold text-foreground">
            Log de sincronizações recentes
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                {["Horário", "Direção", "Tipo", "Status", "Detalhe"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center font-body text-sm text-muted-foreground"
                  >
                    Nenhum log de sincronização encontrado
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-border transition-colors hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-body text-[13px] text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                        log.direcao === "site->crm"
                          ? "bg-primary/10 text-primary"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      <ArrowRightLeft className="h-3 w-3" />
                      {log.direcao}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-[13px] capitalize text-foreground">
                    {log.tipo}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                        log.sucesso
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {log.sucesso ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {log.sucesso ? "OK" : "Erro"}
                    </span>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-body text-xs text-muted-foreground">
                    {log.erro ?? JSON.stringify(log.payload)?.slice(0, 60)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
