import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Captacao {
  id: string;
  nome: string;
  telefone: string;
  tipo_imovel: string | null;
  bairro: string | null;
  valor_pretendido: string | null;
  mensagem: string | null;
  status: string | null;
  utm_source: string | null;
  created_at: string;
}

const STATUS_OPTIONS = ["novo", "em_contato", "avaliacao", "captado", "descartado"];

export default function AdminCaptacoes() {
  const [items, setItems] = useState<Captacao[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("captacao_imoveis")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setItems((data as Captacao[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("captacao_imoveis")
      .update({ status } as any)
      .eq("id", id);
    if (error) { toast.error("Erro ao atualizar"); return; }
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    toast.success("Status atualizado");
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Captações de Imóveis</h1>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="p-3 font-medium">Nome</th>
                <th className="p-3 font-medium">Telefone</th>
                <th className="p-3 font-medium">Tipo</th>
                <th className="p-3 font-medium">Bairro</th>
                <th className="p-3 font-medium">Valor</th>
                <th className="p-3 font-medium">Quando</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium">{c.nome}</td>
                  <td className="p-3">
                    <a href={`https://wa.me/${c.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-600 hover:underline">
                      {c.telefone}<ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="p-3">{c.tipo_imovel ?? "—"}</td>
                  <td className="p-3">{c.bairro ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{c.valor_pretendido ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at!), { addSuffix: true, locale: ptBR })}
                  </td>
                  <td className="p-3">
                    <Select value={c.status ?? "novo"} onValueChange={(v) => updateStatus(c.id, v)}>
                      <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhuma captação encontrada</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
