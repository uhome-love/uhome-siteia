import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Users, MousePointerClick, CalendarCheck, MessageCircle, Eye,
  TrendingUp, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { useEffect as useEffectReact, useState as useStateReact, useRef } from "react";

const useRechartsLazy = () => {
  const [mod, setMod] = useStateReact<typeof import("recharts") | null>(null);
  const loaded = useRef(false);
  useEffectReact(() => {
    if (!loaded.current) {
      loaded.current = true;
      import("recharts").then(setMod);
    }
  }, []);
  return mod;
};

import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

/* ── Types ───────────────────────────────────────────────────── */
interface CorretorRow {
  id: string;
  nome: string | null;
  slug_ref: string | null;
}

interface CorretorMetrics {
  id: string;
  nome: string;
  slug: string;
  visitas: number;
  leads: number;
  agendamentos: number;
  whatsapp: number;
  total: number;
}

interface DailyPoint {
  date: string;
  label: string;
  visitas: number;
  leads: number;
  agendamentos: number;
  whatsapp: number;
}

/* ── Palette ─────────────────────────────────────────────────── */
const COLORS = [
  "hsl(var(--primary))",
  "hsl(142 71% 45%)",
  "hsl(38 92% 50%)",
  "hsl(280 67% 55%)",
  "hsl(199 89% 48%)",
  "hsl(350 80% 55%)",
];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(142 71% 45%)",
  "hsl(38 92% 50%)",
  "hsl(199 89% 48%)",
];

/* ── Component ───────────────────────────────────────────────── */
export default function AdminCorretores() {
  const [loading, setLoading] = useState(true);
  const [corretores, setCorretores] = useState<CorretorRow[]>([]);
  const [metrics, setMetrics] = useState<CorretorMetrics[]>([]);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [period, setPeriod] = useState<7 | 30>(30);

  useEffect(() => {
    loadAll();
  }, [period]);

  async function loadAll() {
    setLoading(true);
    const since = startOfDay(subDays(new Date(), period)).toISOString();

    // Load corretores
    const { data: corretoresData } = await supabase
      .from("profiles")
      .select("id, nome, slug_ref")
      .eq("role", "corretor")
      .eq("ativo", true);

    const corrs = (corretoresData as CorretorRow[]) || [];
    setCorretores(corrs);

    if (corrs.length === 0) {
      setMetrics([]);
      setDaily([]);
      setLoading(false);
      return;
    }

    const ids = corrs.map((c) => c.id);

    // Parallel queries
    const [visitasRes, leadsRes, agendRes, whatsRes] = await Promise.all([
      supabase
        .from("corretor_visitas")
        .select("corretor_id, created_at")
        .in("corretor_id", ids)
        .gte("created_at", since),
      supabase
        .from("public_leads")
        .select("corretor_ref_id, created_at")
        .in("corretor_ref_id", ids)
        .gte("created_at", since),
      supabase
        .from("agendamentos")
        .select("corretor_ref_id, created_at")
        .in("corretor_ref_id", ids)
        .gte("created_at", since),
      supabase
        .from("whatsapp_clicks")
        .select("corretor_ref_id, created_at")
        .in("corretor_ref_id", ids)
        .gte("created_at", since),
    ]);

    const visitas = (visitasRes.data || []) as { corretor_id: string; created_at: string }[];
    const leads = (leadsRes.data || []) as { corretor_ref_id: string; created_at: string }[];
    const agend = (agendRes.data || []) as { corretor_ref_id: string; created_at: string }[];
    const whats = (whatsRes.data || []) as { corretor_ref_id: string; created_at: string }[];

    // Build per-corretor metrics
    const metricsMap = new Map<string, CorretorMetrics>();
    for (const c of corrs) {
      metricsMap.set(c.id, {
        id: c.id,
        nome: c.nome || "Sem nome",
        slug: c.slug_ref || "",
        visitas: 0,
        leads: 0,
        agendamentos: 0,
        whatsapp: 0,
        total: 0,
      });
    }

    for (const v of visitas) {
      const m = metricsMap.get(v.corretor_id);
      if (m) m.visitas++;
    }
    for (const l of leads) {
      const m = metricsMap.get(l.corretor_ref_id);
      if (m) m.leads++;
    }
    for (const a of agend) {
      const m = metricsMap.get(a.corretor_ref_id!);
      if (m) m.agendamentos++;
    }
    for (const w of whats) {
      const m = metricsMap.get(w.corretor_ref_id!);
      if (m) m.whatsapp++;
    }

    for (const m of metricsMap.values()) {
      m.total = m.visitas + m.leads + m.agendamentos + m.whatsapp;
    }

    const sorted = Array.from(metricsMap.values()).sort((a, b) => b.total - a.total);
    setMetrics(sorted);

    // Build daily timeline
    const dailyMap = new Map<string, DailyPoint>();
    for (let i = period - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      dailyMap.set(key, {
        date: key,
        label: format(d, "dd/MM", { locale: ptBR }),
        visitas: 0,
        leads: 0,
        agendamentos: 0,
        whatsapp: 0,
      });
    }

    const addToDay = (dateStr: string, field: keyof Omit<DailyPoint, "date" | "label">) => {
      const key = dateStr.slice(0, 10);
      const d = dailyMap.get(key);
      if (d) d[field]++;
    };

    for (const v of visitas) addToDay(v.created_at, "visitas");
    for (const l of leads) addToDay(l.created_at, "leads");
    for (const a of agend) addToDay(a.created_at!, "agendamentos");
    for (const w of whats) addToDay(w.created_at!, "whatsapp");

    setDaily(Array.from(dailyMap.values()));
    setLoading(false);
  }

  /* ── Derived ──────────────────────────────────────────────── */
  const totals = useMemo(() => {
    const t = { visitas: 0, leads: 0, agendamentos: 0, whatsapp: 0 };
    for (const m of metrics) {
      t.visitas += m.visitas;
      t.leads += m.leads;
      t.agendamentos += m.agendamentos;
      t.whatsapp += m.whatsapp;
    }
    return t;
  }, [metrics]);

  const conversionRate = useMemo(() => {
    if (totals.visitas === 0) return 0;
    return ((totals.leads + totals.agendamentos) / totals.visitas * 100);
  }, [totals]);

  const pieData = useMemo(() => [
    { name: "Visitas", value: totals.visitas },
    { name: "Leads", value: totals.leads },
    { name: "Agendamentos", value: totals.agendamentos },
    { name: "WhatsApp", value: totals.whatsapp },
  ].filter(d => d.value > 0), [totals]);

  /* ── Render ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (corretores.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Conversão por Corretor</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Users className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum corretor ativo encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpis = [
    { label: "Visitas via link", value: totals.visitas, icon: Eye, accent: "text-sky-500" },
    { label: "Leads gerados", value: totals.leads, icon: Users, accent: "text-primary" },
    { label: "Agendamentos", value: totals.agendamentos, icon: CalendarCheck, accent: "text-emerald-500" },
    { label: "Cliques WhatsApp", value: totals.whatsapp, icon: MessageCircle, accent: "text-green-500" },
    { label: "Taxa conversão", value: `${conversionRate.toFixed(1)}%`, icon: TrendingUp, accent: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Conversão por Corretor</h1>
        <div className="flex gap-1.5 rounded-lg bg-muted p-1">
          {([7, 30] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-xl bg-muted p-2.5 ${kpi.accent}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold tabular-nums">
                  {typeof kpi.value === "number" ? kpi.value.toLocaleString("pt-BR") : kpi.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      {recharts ? (() => {
        const { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } = recharts;
        return (
          <>
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Atividade diária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={daily} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10 }}
                        interval={period === 30 ? 4 : 0}
                        className="fill-muted-foreground"
                      />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Area type="monotone" dataKey="visitas" name="Visitas" stackId="1" stroke="hsl(199 89% 48%)" fill="hsl(199 89% 48% / 0.15)" />
                      <Area type="monotone" dataKey="leads" name="Leads" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" />
                      <Area type="monotone" dataKey="agendamentos" name="Agendamentos" stackId="1" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45% / 0.15)" />
                      <Area type="monotone" dataKey="whatsapp" name="WhatsApp" stackId="1" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45% / 0.08)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Distribuição de ações</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                    Sem dados no período
                  </div>
                ) : (
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1">
                      {pieData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          {d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bar chart — per corretor */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Desempenho por corretor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.filter((m) => m.total > 0).slice(0, 10)}
                    margin={{ top: 8, right: 4, left: -10, bottom: 0 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="nome"
                      tick={{ fontSize: 11 }}
                      width={120}
                      className="fill-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="visitas" name="Visitas" stackId="a" fill="hsl(199 89% 48%)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="leads" name="Leads" stackId="a" fill="hsl(var(--primary))" />
                    <Bar dataKey="agendamentos" name="Agendamentos" stackId="a" fill="hsl(142 71% 45%)" />
                    <Bar dataKey="whatsapp" name="WhatsApp" stackId="a" fill="hsl(38 92% 50%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          </>
        );
      })() : (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando gráficos…
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Ranking de corretores</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">Corretor</th>
                <th className="pb-2 pr-4 font-medium text-right">Visitas</th>
                <th className="pb-2 pr-4 font-medium text-right">Leads</th>
                <th className="pb-2 pr-4 font-medium text-right">Agend.</th>
                <th className="pb-2 pr-4 font-medium text-right">WhatsApp</th>
                <th className="pb-2 pr-4 font-medium text-right">Conv.</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => {
                const conv = m.visitas > 0
                  ? ((m.leads + m.agendamentos) / m.visitas * 100).toFixed(1)
                  : "—";
                return (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-3 text-muted-foreground">{i + 1}</td>
                    <td className="py-2.5 pr-4">
                      <div>
                        <p className="font-medium">{m.nome}</p>
                        {m.slug && (
                          <p className="text-[11px] text-muted-foreground">/c/{m.slug}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{m.visitas}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums font-medium">{m.leads}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{m.agendamentos}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{m.whatsapp}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {conv !== "—" ? (
                        <Badge variant={Number(conv) >= 10 ? "default" : "secondary"} className="text-xs">
                          {conv}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right tabular-nums font-bold">{m.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
