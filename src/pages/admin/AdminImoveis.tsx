import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Star, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { formatPreco } from "@/services/imoveis";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ImovelRow {
  id: string;
  slug: string;
  titulo: string;
  bairro: string;
  cidade: string | null;
  preco: number;
  tipo: string;
  status: string | null;
  destaque: boolean | null;
  fotos: any;
  quartos: number | null;
}

function fotoUrl(fotos: any): string {
  if (!fotos) return "";
  const arr = typeof fotos === "string" ? JSON.parse(fotos) : fotos;
  if (Array.isArray(arr) && arr.length > 0) return arr[0]?.url || "";
  return "";
}

export default function AdminImoveis() {
  const [imoveis, setImoveis] = useState<ImovelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    let query = supabase
      .from("imoveis")
      .select("id,slug,titulo,bairro,cidade,preco,tipo,status,destaque,fotos,quartos")
      .order("publicado_em", { ascending: false })
      .limit(100);

    if (statusFilter !== "todos") query = query.eq("status", statusFilter);
    if (search) query = query.or(`titulo.ilike.%${search}%,bairro.ilike.%${search}%`);

    const { data } = await query;
    setImoveis((data as ImovelRow[]) || []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function toggleDestaque(id: string, current: boolean) {
    const { error } = await supabase.from("imoveis").update({ destaque: !current }).eq("id", id);
    if (error) { toast.error("Erro"); return; }
    setImoveis((prev) => prev.map((i) => (i.id === id ? { ...i, destaque: !current } : i)));
    toast.success(!current ? "Marcado como destaque" : "Destaque removido");
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("imoveis").update({ status }).eq("id", id);
    if (error) { toast.error("Erro"); return; }
    setImoveis((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    toast.success("Status atualizado");
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-jetimob", {
        body: { start_page: 1, max_pages: 5 },
      });
      if (error) throw error;
      toast.success(`Sync concluída: ${data.inseridos} inseridos, ${data.erros} erros`);
      load();
    } catch (err: any) {
      toast.error("Erro na sincronização: " + (err.message || ""));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Imóveis</h1>
        <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando..." : "Sync Jetimob"}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar imóvel..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="disponivel">Disponível</SelectItem>
            <SelectItem value="reservado">Reservado</SelectItem>
            <SelectItem value="vendido">Vendido</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-3 font-medium">Foto</th>
                  <th className="p-3 font-medium">Título</th>
                  <th className="p-3 font-medium">Bairro</th>
                  <th className="p-3 font-medium">Preço</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-center">Destaque</th>
                  <th className="p-3 font-medium">Ver</th>
                </tr>
              </thead>
              <tbody>
                {imoveis.map((im) => (
                  <tr key={im.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      {fotoUrl(im.fotos) ? (
                        <img src={fotoUrl(im.fotos)} alt="" className="h-10 w-14 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-14 rounded bg-muted" />
                      )}
                    </td>
                    <td className="max-w-[220px] truncate p-3 font-medium">{im.titulo}</td>
                    <td className="p-3 text-muted-foreground">{im.bairro}</td>
                    <td className="p-3 font-medium tabular-nums">{formatPreco(im.preco)}</td>
                    <td className="p-3">
                      <Select value={im.status ?? "disponivel"} onValueChange={(v) => updateStatus(im.id, v)}>
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponivel">Disponível</SelectItem>
                          <SelectItem value="reservado">Reservado</SelectItem>
                          <SelectItem value="vendido">Vendido</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleDestaque(im.id, !!im.destaque)}
                        className="text-lg transition-transform hover:scale-110 active:scale-95"
                      >
                        {im.destaque ? <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> : <Star className="h-5 w-5 text-muted-foreground" />}
                      </button>
                    </td>
                    <td className="p-3">
                      <Link to={`/imovel/${im.slug}`} target="_blank" className="text-primary hover:underline">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {imoveis.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhum imóvel encontrado</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
