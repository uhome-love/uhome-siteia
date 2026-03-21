import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  imovel_titulo: string | null;
  imovel_bairro: string | null;
  imovel_preco: number | null;
  origem_componente: string | null;
  origem_pagina: string | null;
  utm_source: string | null;
  created_at: string;
  status: string | null;
}

const STATUS_OPTIONS = ["novo", "em_atendimento", "convertido", "descartado"];

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const loadLeads = useCallback(async () => {
    let query = supabase
      .from("public_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (statusFilter !== "todos") {
      query = query.eq("status", statusFilter);
    }
    if (search) {
      query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%`);
    }

    const { data } = await query;
    setLeads((data as Lead[]) || []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("public_leads")
      .update({ status } as any)
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar status");
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    toast.success("Status atualizado");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leads</h1>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
            ))}
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
                  <th className="p-3 font-medium">Nome</th>
                  <th className="p-3 font-medium">WhatsApp</th>
                  <th className="p-3 font-medium">Imóvel</th>
                  <th className="p-3 font-medium">Origem</th>
                  <th className="p-3 font-medium">UTM</th>
                  <th className="p-3 font-medium">Quando</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{lead.nome}</td>
                    <td className="p-3">
                      <a
                        href={`https://wa.me/${lead.telefone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-600 hover:underline"
                      >
                        {lead.telefone}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="max-w-[180px] truncate p-3 text-muted-foreground">
                      {lead.imovel_titulo ?? "—"}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">{lead.origem_componente ?? "—"}</Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{lead.utm_source ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">
                      {formatDistanceToNow(new Date(lead.created_at!), { addSuffix: true, locale: ptBR })}
                    </td>
                    <td className="p-3">
                      <Select value={lead.status ?? "novo"} onValueChange={(v) => updateStatus(lead.id, v)}>
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhum lead encontrado</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
