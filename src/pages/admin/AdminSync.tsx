import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSync() {
  const [syncing, setSyncing] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [totalImoveis, setTotalImoveis] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("imoveis")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => {
        setTotalImoveis(count ?? 0);
        setLoading(false);
      });
  }, []);

  async function handleSync() {
    setSyncing(true);
    setLog(["🔄 Iniciando sincronização..."]);

    let totalInseridos = 0;
    let totalErros = 0;
    let startPage = 1;
    const PAGES_PER_CHUNK = 15;

    try {
      for (let chunk = 0; chunk < 10; chunk++) {
        setLog((prev) => [...prev, `📄 Processando páginas ${startPage}-${startPage + PAGES_PER_CHUNK - 1}...`]);

        const { data, error } = await supabase.functions.invoke("sync-jetimob", {
          body: { start_page: startPage, max_pages: PAGES_PER_CHUNK },
        });

        if (error) throw error;

        totalInseridos += data.inseridos ?? 0;
        totalErros += data.erros ?? 0;

        setLog((prev) => [
          ...prev,
          `  ✅ ${data.inseridos ?? 0} inseridos, ${data.erros ?? 0} erros (${data.total ?? 0} processados)`,
        ]);

        if (!data.next_start_page || (data.total ?? 0) === 0) {
          break;
        }
        startPage = data.next_start_page;
      }

      setLog((prev) => [...prev, `\n🏁 Sync finalizada: ${totalInseridos} inseridos, ${totalErros} erros`]);
      toast.success(`Sync concluída: ${totalInseridos} inseridos`);

      // Refresh count
      const { count } = await supabase.from("imoveis").select("*", { count: "exact", head: true });
      setTotalImoveis(count ?? 0);
    } catch (err: any) {
      setLog((prev) => [...prev, `❌ Erro: ${err.message}`]);
      toast.error("Erro na sincronização");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sincronização Jetimob</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-muted p-3 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Imóveis no banco</p>
              <p className="text-2xl font-bold tabular-nums">{totalImoveis.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-muted p-3 text-amber-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sync automática</p>
              <p className="text-sm font-medium">Diário às 03:00 (BRT)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <Button onClick={handleSync} disabled={syncing} className="w-full" size="lg">
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Iniciar sync agora"}
          </Button>

          {log.length > 0 && (
            <div className="max-h-80 overflow-y-auto rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed">
              {log.map((line, i) => (
                <p key={i} className="whitespace-pre-wrap">{line}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
