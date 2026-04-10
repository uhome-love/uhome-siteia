import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Home, Eye, TrendingUp, Loader2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  imovel_titulo: string | null;
  imovel_slug: string | null;
  origem_componente: string | null;
  created_at: string;
  status: string | null;
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState({ leadsHoje: 0, leadsSemana: 0, imoveis: 0, viewsHoje: 0 });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();

    const [leadsHoje, leadsSemana, imoveis, viewsHoje, recentLeads] = await Promise.all([
      supabase.from("public_leads").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("public_leads").select("*", { count: "exact", head: true }).gte("created_at", weekStart),
      supabase.from("imoveis").select("*", { count: "exact", head: true }).eq("status", "disponivel"),
      supabase.from("imovel_views").select("*", { count: "exact", head: true }).gte("viewed_at", todayStart),
      supabase.from("public_leads").select("id,nome,telefone,imovel_titulo,imovel_slug,origem_componente,created_at,status").order("created_at", { ascending: false }).limit(15),
    ]);

    setKpis({
      leadsHoje: leadsHoje.count ?? 0,
      leadsSemana: leadsSemana.count ?? 0,
      imoveis: imoveis.count ?? 0,
      viewsHoje: viewsHoje.count ?? 0,
    });
    setLeads((recentLeads.data as Lead[]) || []);
    setLoading(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const kpiCards = [
    { label: "Leads hoje", valor: kpis.leadsHoje, icon: Users, color: "text-primary" },
    { label: "Leads semana", valor: kpis.leadsSemana, icon: TrendingUp, color: "text-emerald-600" },
    { label: "Imóveis ativos", valor: kpis.imoveis, icon: Home, color: "text-amber-500" },
    { label: "Views hoje", valor: kpis.viewsHoje, icon: Eye, color: "text-pink-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-xl bg-muted p-3 ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold tabular-nums">{kpi.valor.toLocaleString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos leads</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Nome</th>
                <th className="pb-2 pr-4 font-medium">WhatsApp</th>
                <th className="pb-2 pr-4 font-medium">Imóvel</th>
                <th className="pb-2 pr-4 font-medium">Origem</th>
                <th className="pb-2 pr-4 font-medium">Quando</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0">
                  <td className="py-2.5 pr-4 font-medium">{lead.nome}</td>
                  <td className="py-2.5 pr-4">
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
                  <td className="max-w-[200px] truncate py-2.5 pr-4 text-muted-foreground">
                    {lead.imovel_titulo ?? "—"}
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge variant="outline" className="text-xs">{lead.origem_componente ?? "—"}</Badge>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">
                    {formatDistanceToNow(new Date(lead.created_at!), { addSuffix: true, locale: ptBR })}
                  </td>
                  <td className="py-2.5">
                    <Badge
                      variant={lead.status === "convertido" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {lead.status ?? "novo"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
