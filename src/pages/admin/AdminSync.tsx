import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Clock, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface SyncState {
  id: string;
  iniciado_em: string;
  finalizado_em: string | null;
  pagina_atual: number;
  paginas_totais: number | null;
  total_processado: number;
  total_esperado: number | null;
  desativados: number | null;
  status: string;
  erro: string | null;
  updated_at: string;
}

function formatData(v?: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminSync() {
  const [syncing, setSyncing] = useState(false);
  const [totalImoveis, setTotalImoveis] = useState(0);
  const [disponiveis, setDisponiveis] = useState(0);
  const [runs, setRuns] = useState<SyncState[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ count: total }, { count: disp }, { data: states }] = await Promise.all([
      supabase.from("imoveis").select("*", { count: "exact", head: true }),
      supabase.from("imoveis").select("*", { count: "exact", head: true }).eq("status", "disponivel"),
      supabase.from("sync_state").select("*").order("iniciado_em", { ascending: false }).limit(5),
    ]);
    setTotalImoveis(total ?? 0);
    setDisponiveis(disp ?? 0);
    setRuns((states as SyncState[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Atualiza automaticamente enquanto houver execução em andamento
  const atual = runs[0];
  const rodando = atual?.status === "rodando";
  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [rodando, load]);

  const ultimaConcluida = runs.find((r) => r.status.startsWith("concluida"));
  const horasDesdeConclusao = ultimaConcluida?.finalizado_em
    ? (Date.now() - new Date(ultimaConcluida.finalizado_em).getTime()) / 3600000
    : null;
  const desatualizado = horasDesdeConclusao === null || horasDesdeConclusao > 24;

  const progresso =
    atual && atual.paginas_totais
      ? Math.min(100, Math.round((atual.pagina_atual / atual.paginas_totais) * 100))
      : 0;

  async function handleSync() {
    setSyncing(true);
    try {
      const { error } = await supabase.functions.invoke("sync-jetimob", {
        body: { mode: "start", max_pages: 10 },
      });
      if (error) throw error;
      toast.success("Sincronização iniciada — o progresso aparece abaixo.");
    } catch (err: unknown) {
      // A função continua rodando em segundo plano mesmo se a resposta demorar
      toast.message("Sincronização disparada", { description: "Acompanhe o progresso abaixo." });
      console.warn("[sync-jetimob]", err);
    } finally {
      setTimeout(load, 3000);
      setSyncing(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sincronização Jetimob</h1>

      {desatualizado && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Sincronização completa desatualizada</p>
            <p>
              A última execução concluída foi {formatData(ultimaConcluida?.finalizado_em)}. Rode uma
              sincronização completa para atualizar imóveis novos e desativar os que saíram do Jetimob.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-muted p-3 text-primary"><Database className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Imóveis no banco</p>
              <p className="text-2xl font-bold tabular-nums">{totalImoveis.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-muted p-3 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Disponíveis (no ar)</p>
              <p className="text-2xl font-bold tabular-nums">{disponiveis.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-muted p-3 text-amber-500"><Clock className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Última sync concluída</p>
              <p className="text-sm font-medium">{formatData(ultimaConcluida?.finalizado_em)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <Button onClick={handleSync} disabled={syncing || rodando} className="w-full" size="lg">
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing || rodando ? "animate-spin" : ""}`} />
            {rodando ? "Sincronizando..." : syncing ? "Iniciando..." : "Iniciar sync completa agora"}
          </Button>

          {atual && (
            <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {rodando ? "Execução em andamento" : `Última execução (${atual.status})`}
                </span>
                <span className="text-muted-foreground">{formatData(atual.iniciado_em)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progresso}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                <span>Página {atual.pagina_atual}/{atual.paginas_totais ?? "?"}</span>
                <span>
                  Processados {atual.total_processado.toLocaleString("pt-BR")}
                  {atual.total_esperado ? ` / ${atual.total_esperado.toLocaleString("pt-BR")}` : ""}
                </span>
                <span>Desativados: {atual.desativados ?? "—"}</span>
                <span>Atualizado {formatData(atual.updated_at)}</span>
              </div>
              {atual.erro && <p className="text-xs text-destructive">Erro: {atual.erro}</p>}
            </div>
          )}

          {runs.length > 1 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2 font-medium">Início</th>
                    <th className="p-2 font-medium">Fim</th>
                    <th className="p-2 font-medium">Status</th>
                    <th className="p-2 font-medium">Processados</th>
                    <th className="p-2 font-medium">Desativados</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.slice(1).map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="p-2">{formatData(r.iniciado_em)}</td>
                      <td className="p-2">{formatData(r.finalizado_em)}</td>
                      <td className="p-2">{r.status}</td>
                      <td className="p-2 tabular-nums">{r.total_processado.toLocaleString("pt-BR")}</td>
                      <td className="p-2 tabular-nums">{r.desativados ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            A sincronização roda em blocos e é retomada automaticamente a cada 3 minutos caso um bloco falhe.
            A limpeza de imóveis que saíram do Jetimob só é aplicada quando a execução termina completa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
