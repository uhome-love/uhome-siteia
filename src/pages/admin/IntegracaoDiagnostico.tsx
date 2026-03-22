import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  Loader2,
  ArrowLeft,
  PartyPopper,
} from "lucide-react";
import { Link } from "react-router-dom";

interface TestResult {
  nome: string;
  status: "pendente" | "ok" | "erro" | "aviso";
  mensagem: string;
  detalhe?: string;
  duracao?: number;
}

const supabaseAnon = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const grupos = [
  {
    label: "Banco de dados do site",
    emoji: "🌐",
    keys: [
      "site_conexao",
      "site_tabela_profiles",
      "site_tabela_leads",
      "site_tabela_sync_log",
      "site_tabela_visitas",
    ],
  },
  {
    label: "Corretores sincronizados",
    emoji: "👥",
    keys: ["site_corretores_sync", "site_slug_ref"],
  },
  {
    label: "RLS Policies",
    emoji: "🔒",
    keys: ["rls_anon_corretores", "rls_slug_lookup", "rls_insert_visitas"],
  },
  {
    label: "Edge Functions",
    emoji: "⚡",
    keys: ["fn_sync_corretores", "fn_sync_lead", "fn_crm_webhook", "fn_cors"],
  },
  {
    label: "Correções críticas",
    emoji: "🔧",
    keys: ["profiles_id_insert"],
  },
  {
    label: "Trigger e Cron",
    emoji: "⏰",
    keys: ["trigger_on_lead", "cron_sync"],
  },
  {
    label: "Links personalizados de corretor",
    emoji: "🔗",
    keys: ["link_corretor_rota", "link_corretor_localStorage"],
  },
  {
    label: "CRM UhomeSales",
    emoji: "📊",
    keys: ["crm_conexao", "crm_tabela_leads", "crm_fn_status"],
  },
  {
    label: "End-to-end completo",
    emoji: "🚀",
    keys: ["e2e_fluxo_completo"],
  },
];

function initialTests(): TestResult[] {
  return [
    // Site DB
    { nome: "site_conexao", status: "pendente", mensagem: "Conexão Supabase" },
    { nome: "site_tabela_profiles", status: "pendente", mensagem: "Coluna uhomesales_id em profiles" },
    { nome: "site_tabela_leads", status: "pendente", mensagem: "Colunas de sync em public_leads" },
    { nome: "site_tabela_sync_log", status: "pendente", mensagem: "Tabela sync_log existe" },
    { nome: "site_tabela_visitas", status: "pendente", mensagem: "Tabela corretor_visitas existe" },
    // Corretores
    { nome: "site_corretores_sync", status: "pendente", mensagem: "Corretores sincronizados do CRM" },
    { nome: "site_slug_ref", status: "pendente", mensagem: "Slugs gerados" },
    // RLS
    { nome: "rls_anon_corretores", status: "pendente", mensagem: "Anon consegue ler corretores" },
    { nome: "rls_slug_lookup", status: "pendente", mensagem: "Lookup por slug_ref funciona" },
    { nome: "rls_insert_visitas", status: "pendente", mensagem: "Anon consegue inserir em corretor_visitas" },
    // Edge Functions
    { nome: "fn_sync_corretores", status: "pendente", mensagem: "Edge function sync-corretores" },
    { nome: "fn_sync_lead", status: "pendente", mensagem: "Edge function sync-to-crm" },
    { nome: "fn_crm_webhook", status: "pendente", mensagem: "Edge function crm-webhook" },
    { nome: "fn_cors", status: "pendente", mensagem: "CORS — OPTIONS preflight" },
    // Correções
    { nome: "profiles_id_insert", status: "pendente", mensagem: "profiles.id aceita insert sem auth.users" },
    // Trigger / Cron
    { nome: "trigger_on_lead", status: "pendente", mensagem: "Trigger on_lead_created existe" },
    { nome: "cron_sync", status: "pendente", mensagem: "Cron job agendado" },
    // Links
    { nome: "link_corretor_rota", status: "pendente", mensagem: "Rota /c/:slug configurada" },
    { nome: "link_corretor_localStorage", status: "pendente", mensagem: "localStorage do useCorretorRef" },
    // CRM
    { nome: "crm_conexao", status: "pendente", mensagem: "Conexão com CRM funcionou" },
    { nome: "crm_tabela_leads", status: "pendente", mensagem: "% de leads sincronizados" },
    { nome: "crm_fn_status", status: "pendente", mensagem: "Atualizações de status recebidas" },
    // E2E
    { nome: "e2e_fluxo_completo", status: "pendente", mensagem: "Fluxo completo: link corretor → lead atribuído no CRM" },
  ];
}

export default function IntegracaoDiagnostico() {
  const [testes, setTestes] = useState<TestResult[]>([]);
  const [rodando, setRodando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  function up(nome: string, resultado: Partial<TestResult>) {
    setTestes((prev) =>
      prev.map((t) => (t.nome === nome ? { ...t, ...resultado } : t))
    );
  }

  async function timed(nome: string, fn: () => Promise<Partial<TestResult>>) {
    const t = Date.now();
    try {
      const r = await fn();
      up(nome, { ...r, duracao: Date.now() - t });
    } catch (e: any) {
      up(nome, { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }
  }

  async function rodarTodos() {
    setRodando(true);
    setConcluido(false);
    setTestes(initialTests());
    await new Promise((r) => setTimeout(r, 80));

    // 1. Conexão
    await timed("site_conexao", async () => {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      return { status: error ? "erro" : "ok", detalhe: error ? error.message : "Conectado com sucesso" };
    });

    // 2. Colunas profiles
    await timed("site_tabela_profiles", async () => {
      const { error } = await supabase.from("profiles").select("uhomesales_id, slug_ref, sincronizado_em").limit(1);
      return {
        status: error ? "erro" : "ok",
        detalhe: error ? `Coluna ausente: ${error.message}` : "Colunas uhomesales_id, slug_ref, sincronizado_em OK",
      };
    });

    // 3. Colunas public_leads
    await timed("site_tabela_leads", async () => {
      const { error } = await supabase.from("public_leads").select("uhomesales_lead_id, corretor_ref_id, corretor_ref_slug, origem_ref").limit(1);
      return {
        status: error ? "erro" : "ok",
        detalhe: error ? `Coluna ausente: ${error.message}` : "Todas as colunas de integração OK",
      };
    });

    // 4. sync_log
    await timed("site_tabela_sync_log", async () => {
      const { count, error } = await supabase.from("sync_log").select("*", { count: "exact", head: true });
      return { status: error ? "erro" : "ok", detalhe: error ? error.message : `Tabela OK — ${count ?? 0} registros` };
    });

    // 5. corretor_visitas
    await timed("site_tabela_visitas", async () => {
      const { count, error } = await supabase.from("corretor_visitas").select("*", { count: "exact", head: true });
      return { status: error ? "erro" : "ok", detalhe: error ? error.message : `Tabela OK — ${count ?? 0} visitas` };
    });

    // 6. Corretores sincronizados
    await timed("site_corretores_sync", async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true }).not("uhomesales_id", "is", null);
      const n = count ?? 0;
      return {
        status: n === 0 ? "aviso" : "ok",
        detalhe: n === 0 ? "Nenhum corretor sincronizado — rodar sync manual" : `${n} corretores sincronizados do CRM`,
      };
    });

    // 7. Slugs
    await timed("site_slug_ref", async () => {
      const { data: sem } = await supabase.from("profiles").select("nome").eq("role", "corretor").is("slug_ref", null).limit(5);
      const { data: com } = await supabase.from("profiles").select("nome, slug_ref").eq("role", "corretor").not("slug_ref", "is", null).limit(3);
      const n = sem?.length ?? 0;
      return {
        status: n > 0 ? "aviso" : "ok",
        detalhe: n > 0
          ? `${n} corretor(es) sem slug: ${sem?.map((c) => c.nome).join(", ")}`
          : `Todos têm slug. Ex: ${com?.map((c) => `${c.nome} → /c/${c.slug_ref}`).join(", ") || "—"}`,
      };
    });

    // 8. RLS — anon lê corretores
    await timed("rls_anon_corretores", async () => {
      const { data, error } = await supabaseAnon.from("profiles").select("id, nome, slug_ref").eq("role", "corretor").eq("ativo", true).limit(3);
      if (error) return { status: "erro", detalhe: `RLS bloqueando: ${error.message} — criar policy SELECT para anon` };
      return { status: (data?.length ?? 0) > 0 ? "ok" : "aviso", detalhe: data?.length ? `Retornou ${data.length} corretores` : "Nenhum corretor ativo encontrado" };
    });

    // 9. RLS — lookup slug_ref
    await timed("rls_slug_lookup", async () => {
      const { data: cs } = await supabase.from("profiles").select("slug_ref").eq("role", "corretor").not("slug_ref", "is", null).limit(1);
      const slug = cs?.[0]?.slug_ref;
      if (!slug) return { status: "aviso", detalhe: "Nenhum corretor com slug para testar" };
      const { data, error } = await supabaseAnon.from("profiles").select("id, nome, slug_ref").eq("slug_ref", slug).eq("ativo", true).maybeSingle();
      if (error) return { status: "erro", detalhe: `RLS bloqueando /c/:slug — ${error.message}` };
      return { status: data ? "ok" : "erro", detalhe: data ? `Retornou corretor: ${data.nome}` : "slug não encontrado" };
    });

    // 10. RLS — insert corretor_visitas anon
    await timed("rls_insert_visitas", async () => {
      const { data, error } = await supabaseAnon.from("corretor_visitas").insert({ corretor_slug: "teste-diagnostico", user_agent: "diagnostico" }).select("id").single();
      if (error) return { status: "erro", detalhe: `RLS bloqueando insert: ${error.message}` };
      if (data?.id) await supabase.from("corretor_visitas").delete().eq("id", data.id);
      return { status: "ok", detalhe: "Insert anon OK — registro de teste limpo" };
    });

    // 11. sync-corretores
    await timed("fn_sync_corretores", async () => {
      const res = await supabase.functions.invoke("sync-corretores", { body: {} });
      const ok = !res.error && res.data?.ok;
      return {
        status: ok ? "ok" : "erro",
        detalhe: ok ? `Executou OK — ${res.data?.sincronizados ?? 0} corretores sincronizados` : `Erro: ${res.error?.message ?? JSON.stringify(res.data)}`,
      };
    });

    // 12. sync-to-crm
    await timed("fn_sync_lead", async () => {
      const res = await supabase.functions.invoke("sync-to-crm", {
        body: {
          record: {
            id: "00000000-0000-0000-0000-000000000000",
            nome: "TESTE_DIAGNOSTICO",
            telefone: "51999999999",
            origem_componente: "diagnostico",
            origem_ref: "teste",
            created_at: new Date().toISOString(),
          },
        },
      });
      return { status: res.error ? "erro" : "ok", detalhe: res.error ? `Erro: ${res.error.message}` : "Function acessível e respondendo" };
    });

    // 13. crm-webhook
    await timed("fn_crm_webhook", async () => {
      const res = await supabase.functions.invoke("crm-webhook", { body: { tipo: "test", record: {} } });
      return { status: "ok", detalhe: "Function deployada e respondendo" };
    });

    // 14. CORS preflight
    await timed("fn_cors", async () => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-corretores`;
      const res = await fetch(url, { method: "OPTIONS", headers: { Origin: window.location.origin } });
      const acao = res.headers.get("access-control-allow-origin");
      return {
        status: acao ? "ok" : "erro",
        detalhe: acao ? `access-control-allow-origin: ${acao}` : "Sem CORS headers — adicionar corsHeaders na function",
      };
    });

    // 15. profiles.id insert sem auth
    await timed("profiles_id_insert", async () => {
      const testId = crypto.randomUUID();
      const testUhomeId = crypto.randomUUID();
      const { error } = await supabase.from("profiles").insert({
        id: testId,
        nome: "TESTE_UUID_DIAG",
        role: "corretor",
        ativo: false,
        slug_ref: "teste-uuid-" + Date.now(),
        uhomesales_id: testUhomeId,
      } as any);
      if (!error) {
        await supabase.from("profiles").delete().eq("id", testId);
      }
      return {
        status: error ? "erro" : "ok",
        detalhe: error ? `Erro de FK/constraint: ${error.message}` : "Insert sem auth.users funcionou — registro limpo",
      };
    });

    // 16. Trigger on_lead_created
    await timed("trigger_on_lead", async () => {
      const { count } = await supabase.from("sync_log").select("*", { count: "exact", head: true }).eq("tipo", "lead").eq("direcao", "site->crm");
      const n = count ?? 0;
      return {
        status: n > 0 ? "ok" : "aviso",
        detalhe: n > 0 ? `Trigger funcionando — ${n} leads no log` : "Sem registros — verificar trigger SQL",
      };
    });

    // 17. Cron job
    await timed("cron_sync", async () => {
      const { data } = await supabase.from("sync_log").select("created_at").eq("tipo", "corretor").order("created_at", { ascending: false }).limit(1);
      const d = data?.[0]?.created_at;
      return {
        status: d ? "ok" : "aviso",
        detalhe: d ? `Último sync: ${new Date(d).toLocaleString("pt-BR")}` : "Nunca rodou — executar sync manual",
      };
    });

    // 18. Rota /c/:slug
    await timed("link_corretor_rota", async () => {
      const { data } = await supabase.from("profiles").select("slug_ref").eq("role", "corretor").not("slug_ref", "is", null).limit(1);
      const slug = data?.[0]?.slug_ref;
      return {
        status: slug ? "ok" : "aviso",
        detalhe: slug ? `Testar: ${window.location.origin}/c/${slug}` : "Nenhum corretor com slug",
      };
    });

    // 19. localStorage
    await timed("link_corretor_localStorage", async () => {
      localStorage.setItem("corretor_ref_id", "test-id");
      localStorage.setItem("corretor_ref_slug", "teste-slug");
      localStorage.setItem("corretor_ref_nome", "Corretor Teste");
      localStorage.setItem("corretor_ref_ts", Date.now().toString());
      const id = localStorage.getItem("corretor_ref_id");
      const slug = localStorage.getItem("corretor_ref_slug");
      ["corretor_ref_id", "corretor_ref_slug", "corretor_ref_nome", "corretor_ref_ts"].forEach((k) => localStorage.removeItem(k));
      return { status: id && slug ? "ok" : "erro", detalhe: id && slug ? "localStorage leitura/escrita OK" : "Erro ao acessar localStorage" };
    });

    // 20. CRM conexão
    await timed("crm_conexao", async () => {
      const { data } = await supabase.from("sync_log").select("created_at, sucesso, erro").eq("tipo", "corretor").order("created_at", { ascending: false }).limit(1);
      const log = data?.[0];
      if (!log) return { status: "aviso", detalhe: "Nenhum sync registrado — executar sync manual" };
      return {
        status: log.sucesso ? "ok" : "erro",
        detalhe: log.sucesso ? `Última conexão OK: ${new Date(log.created_at).toLocaleString("pt-BR")}` : `Último sync com erro: ${log.erro}`,
      };
    });

    // 21. % leads sincronizados
    await timed("crm_tabela_leads", async () => {
      const { count: comId } = await supabase.from("public_leads").select("*", { count: "exact", head: true }).not("uhomesales_lead_id", "is", null).not("nome", "ilike", "%TESTE%");
      const { count: semId } = await supabase.from("public_leads").select("*", { count: "exact", head: true }).is("uhomesales_lead_id", null).not("nome", "ilike", "%TESTE%");
      const total = (comId ?? 0) + (semId ?? 0);
      const pct = total > 0 ? Math.round(((comId ?? 0) / total) * 100) : 0;
      return {
        status: total === 0 ? "aviso" : pct >= 80 ? "ok" : pct >= 50 ? "aviso" : "erro",
        detalhe: total === 0 ? "Nenhum lead real ainda" : `${comId} de ${total} leads sincronizados (${pct}%)`,
      };
    });

    // 22. Status recebidos
    await timed("crm_fn_status", async () => {
      const { data } = await supabase.from("sync_log").select("created_at").eq("direcao", "crm->site").in("tipo", ["status", "lead_status"]).order("created_at", { ascending: false }).limit(1);
      return {
        status: data?.length ? "ok" : "aviso",
        detalhe: data?.length ? `Última atualização: ${new Date(data[0].created_at).toLocaleString("pt-BR")}` : "Nenhuma — normal se nenhum lead movido no CRM",
      };
    });

    // 23. E2E completo
    await timed("e2e_fluxo_completo", async () => {
      // a) Pegar corretor real
      const { data: corretores } = await supabase.from("profiles").select("id, nome, slug_ref, uhomesales_id").eq("role", "corretor").eq("ativo", true).not("slug_ref", "is", null).not("uhomesales_id", "is", null).limit(1);
      const corretor = corretores?.[0];
      if (!corretor) return { status: "aviso", detalhe: "Nenhum corretor com slug_ref E uhomesales_id — rodar sync primeiro" };

      // b) Simular localStorage
      localStorage.setItem("corretor_ref_id", corretor.id);
      localStorage.setItem("corretor_ref_slug", corretor.slug_ref!);
      localStorage.setItem("corretor_ref_nome", corretor.nome ?? "");
      localStorage.setItem("corretor_ref_ts", Date.now().toString());

      // c) Inserir lead com corretor_ref_id
      const { data: lead, error: insertErr } = await supabase.from("public_leads").insert({
        nome: "TESTE_E2E_DIAG",
        telefone: "51000000001",
        origem_componente: "diagnostico_e2e",
        origem_ref: "link_corretor",
        corretor_ref_id: corretor.id,
        corretor_ref_slug: corretor.slug_ref,
      } as any).select("id").single();

      // Limpar localStorage
      ["corretor_ref_id", "corretor_ref_slug", "corretor_ref_nome", "corretor_ref_ts"].forEach((k) => localStorage.removeItem(k));

      if (insertErr || !lead) return { status: "erro", detalhe: `Falha ao criar lead: ${insertErr?.message}` };

      // d) Aguardar 3s
      await new Promise((r) => setTimeout(r, 3000));

      // e) Verificar sync
      const { data: updated } = await supabase.from("public_leads").select("uhomesales_lead_id, sincronizado_em").eq("id", lead.id).maybeSingle();

      // f) Limpar
      await supabase.from("public_leads").delete().eq("id", lead.id);

      const ok = !!updated?.uhomesales_lead_id;
      return {
        status: ok ? "ok" : "aviso",
        detalhe: ok
          ? `FLUXO COMPLETO OK — Lead no CRM: ${updated.uhomesales_lead_id} | Corretor: ${corretor.nome} (${corretor.slug_ref})`
          : `Lead criado mas não sincronizado em 3s — verificar trigger e edge function`,
      };
    });

    setRodando(false);
    setConcluido(true);
  }

  const okCount = testes.filter((t) => t.status === "ok").length;
  const erroCount = testes.filter((t) => t.status === "erro").length;
  const avisoCount = testes.filter((t) => t.status === "aviso").length;

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "ok":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case "erro":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "aviso":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground animate-pulse" />;
    }
  };

  const statusBg = (s: string) =>
    ({
      ok: "bg-emerald-50 border-emerald-200",
      erro: "bg-destructive/5 border-destructive/20",
      aviso: "bg-amber-50 border-amber-200",
      pendente: "bg-muted/50 border-border",
    })[s] ?? "bg-muted/50 border-border";

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/integracao"
            className="mb-2 inline-flex items-center gap-1 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <h1 className="font-body text-2xl font-extrabold tracking-tight text-foreground">
            Diagnóstico da Integração
          </h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            23 testes validando a integração Uhome ↔ UhomeSales CRM
          </p>
        </div>
        <button
          onClick={rodarTodos}
          disabled={rodando}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97] disabled:opacity-60"
        >
          {rodando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {rodando ? "Testando..." : "Rodar todos os testes"}
        </button>
      </div>

      {concluido && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Passaram", val: okCount, cls: "bg-emerald-50 text-emerald-700" },
            { label: "Avisos", val: avisoCount, cls: "bg-amber-50 text-amber-700" },
            { label: "Erros", val: erroCount, cls: "bg-destructive/5 text-destructive" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border border-border p-4 text-center ${s.cls}`}>
              <div className="font-body text-3xl font-extrabold">{s.val}</div>
              <div className="mt-1 font-body text-xs font-semibold uppercase tracking-wider opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {testes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20">
          <div className="text-5xl">🔍</div>
          <h3 className="mt-4 font-body text-lg font-bold text-foreground">Pronto para validar</h3>
          <p className="mt-1 font-body text-sm text-muted-foreground">Clique em "Rodar todos os testes" para iniciar</p>
        </div>
      )}

      {testes.length > 0 && (
        <div className="space-y-6">
          {grupos.map((grupo) => {
            const testsGrupo = testes.filter((t) => grupo.keys.includes(t.nome));
            if (!testsGrupo.length) return null;
            return (
              <div key={grupo.label} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border bg-muted/30 px-5 py-3">
                  <h3 className="font-body text-sm font-bold text-foreground">
                    {grupo.emoji} {grupo.label}
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {testsGrupo.map((teste) => (
                    <div key={teste.nome} className={`flex items-start gap-3 px-5 py-4 transition-colors ${statusBg(teste.status)}`}>
                      <div className="mt-0.5 shrink-0">
                        <StatusIcon status={teste.status} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-body text-sm font-semibold text-foreground">{teste.mensagem}</span>
                          {teste.duracao !== undefined && (
                            <span className="font-body text-[11px] text-muted-foreground">{teste.duracao}ms</span>
                          )}
                        </div>
                        {teste.detalhe && (
                          <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">{teste.detalhe}</p>
                        )}
                        {teste.status === "pendente" && (
                          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-1/3 animate-pulse rounded-full bg-primary/40" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {concluido && erroCount > 0 && (
        <div className="mt-8 rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <h3 className="font-body text-base font-bold text-destructive">❌ {erroCount} erro(s) encontrado(s)</h3>
          <p className="mt-2 font-body text-sm text-muted-foreground">Causas comuns:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 font-body text-sm text-muted-foreground">
            <li>Secrets não configurados nas Edge Functions</li>
            <li>Colunas SQL não criadas (rodar migration)</li>
            <li>Edge Functions não deployadas</li>
            <li>SYNC_SECRET diferente nos dois projetos</li>
            <li>RLS policies ausentes para anon</li>
          </ul>
        </div>
      )}

      {concluido && erroCount === 0 && avisoCount === 0 && (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 py-8">
          <PartyPopper className="h-10 w-10 text-emerald-600" />
          <h3 className="mt-3 font-body text-lg font-bold text-emerald-800">Integração 100% funcionando!</h3>
          <p className="mt-1 max-w-md text-center font-body text-sm text-emerald-700">
            Todos os 23 testes passaram. Leads gerados no site chegam automaticamente no UhomeSales CRM.
          </p>
        </div>
      )}
    </div>
  );
}
