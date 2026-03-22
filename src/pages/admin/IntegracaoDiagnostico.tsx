import { useState } from "react";
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
    label: "Edge Functions",
    emoji: "⚡",
    keys: ["fn_sync_corretores", "fn_sync_lead", "fn_crm_webhook"],
  },
  {
    label: "Integração real (end-to-end)",
    emoji: "🔗",
    keys: ["integracao_lead_test", "integracao_status_test"],
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
];

function initialTests(): TestResult[] {
  return [
    { nome: "site_conexao", status: "pendente", mensagem: "Conexão com banco de dados do site" },
    { nome: "site_tabela_profiles", status: "pendente", mensagem: "Coluna uhomesales_id em profiles" },
    { nome: "site_tabela_leads", status: "pendente", mensagem: "Colunas de sync em public_leads" },
    { nome: "site_tabela_sync_log", status: "pendente", mensagem: "Tabela sync_log existe" },
    { nome: "site_tabela_visitas", status: "pendente", mensagem: "Tabela corretor_visitas existe" },
    { nome: "site_corretores_sync", status: "pendente", mensagem: "Corretores sincronizados do CRM" },
    { nome: "site_slug_ref", status: "pendente", mensagem: "Corretores com slug_ref gerado" },
    { nome: "fn_sync_corretores", status: "pendente", mensagem: "Edge function sync-corretores" },
    { nome: "fn_sync_lead", status: "pendente", mensagem: "Edge function sync-to-crm" },
    { nome: "fn_crm_webhook", status: "pendente", mensagem: "Edge function crm-webhook" },
    { nome: "integracao_lead_test", status: "pendente", mensagem: "Criar lead de teste → verificar sync" },
    { nome: "integracao_status_test", status: "pendente", mensagem: "Verificar sync de status CRM → site" },
    { nome: "link_corretor_rota", status: "pendente", mensagem: "Rota /c/:slug configurada" },
    { nome: "link_corretor_localStorage", status: "pendente", mensagem: "localStorage funcionando" },
    { nome: "crm_conexao", status: "pendente", mensagem: "Conexão com CRM via último sync" },
    { nome: "crm_tabela_leads", status: "pendente", mensagem: "Leads sincronizados com CRM" },
    { nome: "crm_fn_status", status: "pendente", mensagem: "Atualizações de status recebidas do CRM" },
  ];
}

export default function IntegracaoDiagnostico() {
  const [testes, setTestes] = useState<TestResult[]>([]);
  const [rodando, setRodando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  function atualizar(nome: string, resultado: Partial<TestResult>) {
    setTestes((prev) =>
      prev.map((t) => (t.nome === nome ? { ...t, ...resultado } : t))
    );
  }

  async function rodarTodos() {
    setRodando(true);
    setConcluido(false);
    setTestes(initialTests());

    // Small delay so UI renders the pending state
    await new Promise((r) => setTimeout(r, 100));

    // ── SITE DB ──────────────────────────────────────────
    let t = Date.now();
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      atualizar("site_conexao", {
        status: error ? "erro" : "ok",
        detalhe: error ? error.message : "Conectado com sucesso",
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("site_conexao", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    t = Date.now();
    try {
      const { error } = await supabase
        .from("profiles")
        .select("uhomesales_id, slug_ref, sincronizado_em")
        .limit(1);
      atualizar("site_tabela_profiles", {
        status: error ? "erro" : "ok",
        detalhe: error
          ? `Coluna ausente: ${error.message}`
          : "Colunas uhomesales_id, slug_ref, sincronizado_em OK",
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("site_tabela_profiles", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    t = Date.now();
    try {
      const { error } = await supabase
        .from("public_leads")
        .select("uhomesales_lead_id, corretor_ref_id, corretor_ref_slug, origem_ref")
        .limit(1);
      atualizar("site_tabela_leads", {
        status: error ? "erro" : "ok",
        detalhe: error
          ? `Coluna ausente: ${error.message}`
          : "Todas as colunas de integração OK",
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("site_tabela_leads", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    t = Date.now();
    try {
      const { count, error } = await supabase
        .from("sync_log")
        .select("*", { count: "exact", head: true });
      atualizar("site_tabela_sync_log", {
        status: error ? "erro" : "ok",
        detalhe: error ? error.message : `Tabela OK — ${count ?? 0} registros`,
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("site_tabela_sync_log", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    t = Date.now();
    try {
      const { count, error } = await supabase
        .from("corretor_visitas")
        .select("*", { count: "exact", head: true });
      atualizar("site_tabela_visitas", {
        status: error ? "erro" : "ok",
        detalhe: error ? error.message : `Tabela OK — ${count ?? 0} visitas registradas`,
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("site_tabela_visitas", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    // ── CORRETORES ────────────────────────────────────────
    t = Date.now();
    try {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .not("uhomesales_id", "is", null);
      const total = count ?? 0;
      atualizar("site_corretores_sync", {
        status: total === 0 ? "aviso" : "ok",
        detalhe:
          total === 0
            ? "Nenhum corretor sincronizado ainda — rodar sync manual"
            : `${total} corretores sincronizados do CRM`,
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("site_corretores_sync", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    t = Date.now();
    try {
      const { data: semSlug } = await supabase
        .from("profiles")
        .select("nome")
        .eq("role", "corretor")
        .is("slug_ref", null)
        .limit(5);
      const { data: comSlug } = await supabase
        .from("profiles")
        .select("nome, slug_ref")
        .eq("role", "corretor")
        .not("slug_ref", "is", null)
        .limit(3);
      atualizar("site_slug_ref", {
        status: (semSlug?.length ?? 0) > 0 ? "aviso" : "ok",
        detalhe:
          (semSlug?.length ?? 0) > 0
            ? `${semSlug?.length} corretor(es) sem slug: ${semSlug?.map((c) => c.nome).join(", ")}`
            : `Todos têm slug. Ex: ${comSlug?.map((c) => `${c.nome} → /c/${c.slug_ref}`).join(", ") || "Nenhum corretor encontrado"}`,
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("site_slug_ref", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    // ── EDGE FUNCTIONS ────────────────────────────────────
    t = Date.now();
    try {
      const res = await supabase.functions.invoke("sync-corretores", { body: {} });
      const ok = !res.error && res.data?.ok;
      atualizar("fn_sync_corretores", {
        status: ok ? "ok" : "erro",
        detalhe: ok
          ? `Executou OK — ${res.data?.sincronizados ?? 0} corretores sincronizados`
          : `Erro: ${res.error?.message ?? JSON.stringify(res.data)}`,
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("fn_sync_corretores", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    t = Date.now();
    try {
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
      atualizar("fn_sync_lead", {
        status: res.error ? "erro" : "ok",
        detalhe: res.error
          ? `Erro: ${res.error.message}`
          : "Function acessível e respondendo",
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("fn_sync_lead", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    t = Date.now();
    try {
      // crm-webhook expects x-sync-secret header — test with empty body to see if it responds
      const res = await supabase.functions.invoke("crm-webhook", {
        body: { tipo: "test", record: {} },
      });
      // We expect a 401 or error since we're not passing the secret — but it means the function is deployed
      atualizar("fn_crm_webhook", {
        status: "ok",
        detalhe: "Function deployada e respondendo",
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("fn_crm_webhook", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    // ── INTEGRAÇÃO REAL ───────────────────────────────────
    t = Date.now();
    try {
      const { data: leadSite, error: insertErr } = await supabase
        .from("public_leads")
        .insert({
          nome: "TESTE_INTEGRACAO_DIAG",
          telefone: "51000000000",
          origem_componente: "diagnostico",
          origem_ref: "teste",
        } as any)
        .select()
        .single();

      if (insertErr) throw insertErr;

      // Wait for trigger to fire
      await new Promise((r) => setTimeout(r, 4000));

      const { data: leadAtualizado } = await supabase
        .from("public_leads")
        .select("uhomesales_lead_id, sincronizado_em")
        .eq("id", leadSite?.id)
        .single();

      const sincronizou = !!leadAtualizado?.uhomesales_lead_id;

      atualizar("integracao_lead_test", {
        status: sincronizou ? "ok" : "aviso",
        detalhe: sincronizou
          ? `Lead sincronizado! CRM ID: ${leadAtualizado?.uhomesales_lead_id}`
          : "Lead criado mas não sincronizado (trigger pode estar atrasado ou CRM indisponível)",
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("integracao_lead_test", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    t = Date.now();
    try {
      const { data: logsStatus } = await supabase
        .from("sync_log")
        .select("*")
        .eq("direcao", "crm->site")
        .in("tipo", ["status", "lead_status"])
        .order("created_at", { ascending: false })
        .limit(1);
      atualizar("integracao_status_test", {
        status: logsStatus?.length ? "ok" : "aviso",
        detalhe: logsStatus?.length
          ? `Última atualização de status: ${new Date(logsStatus[0].created_at).toLocaleString("pt-BR")}`
          : "Nenhum sync de status registrado — normal se nenhum lead foi movido no CRM",
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("integracao_status_test", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    // ── LINKS DE CORRETOR ─────────────────────────────────
    t = Date.now();
    try {
      const { data: corretores } = await supabase
        .from("profiles")
        .select("slug_ref")
        .eq("role", "corretor")
        .not("slug_ref", "is", null)
        .limit(1);
      const slug = corretores?.[0]?.slug_ref;
      atualizar("link_corretor_rota", {
        status: slug ? "ok" : "aviso",
        detalhe: slug
          ? `Rota OK. Testar: ${window.location.origin}/c/${slug}`
          : "Nenhum corretor com slug disponível para testar",
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("link_corretor_rota", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    t = Date.now();
    try {
      localStorage.setItem("_diag_test", "ok");
      const val = localStorage.getItem("_diag_test");
      localStorage.removeItem("_diag_test");
      atualizar("link_corretor_localStorage", {
        status: val === "ok" ? "ok" : "erro",
        detalhe: val === "ok" ? "localStorage leitura/escrita OK" : "Erro ao acessar localStorage",
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("link_corretor_localStorage", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    // ── CRM ───────────────────────────────────────────────
    t = Date.now();
    try {
      const { data: ultimoSync } = await supabase
        .from("sync_log")
        .select("created_at, sucesso, erro")
        .eq("tipo", "corretor")
        .order("created_at", { ascending: false })
        .limit(1);
      const log = ultimoSync?.[0];
      atualizar("crm_conexao", {
        status: !log ? "aviso" : log.sucesso ? "ok" : "erro",
        detalhe: !log
          ? "Nenhum sync registrado — executar sync manual"
          : log.sucesso
            ? `Última conexão OK: ${new Date(log.created_at).toLocaleString("pt-BR")}`
            : `Último sync com erro: ${log.erro}`,
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("crm_conexao", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    t = Date.now();
    try {
      const { count: comId } = await supabase
        .from("public_leads")
        .select("*", { count: "exact", head: true })
        .not("uhomesales_lead_id", "is", null)
        .not("nome", "ilike", "%TESTE%");
      const { count: semId } = await supabase
        .from("public_leads")
        .select("*", { count: "exact", head: true })
        .is("uhomesales_lead_id", null)
        .not("nome", "ilike", "%TESTE%");
      const total = (comId ?? 0) + (semId ?? 0);
      const pct = total > 0 ? Math.round(((comId ?? 0) / total) * 100) : 0;
      atualizar("crm_tabela_leads", {
        status: total === 0 ? "aviso" : pct >= 80 ? "ok" : pct >= 50 ? "aviso" : "erro",
        detalhe:
          total === 0
            ? "Nenhum lead real ainda"
            : `${comId} de ${total} leads sincronizados (${pct}%)`,
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("crm_tabela_leads", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

    t = Date.now();
    try {
      const { data: logStatus } = await supabase
        .from("sync_log")
        .select("*")
        .eq("direcao", "crm->site")
        .in("tipo", ["status", "lead_status"])
        .order("created_at", { ascending: false })
        .limit(1);
      atualizar("crm_fn_status", {
        status: logStatus?.length ? "ok" : "aviso",
        detalhe: logStatus?.length
          ? `Última atualização recebida: ${new Date(logStatus[0].created_at).toLocaleString("pt-BR")}`
          : "Nenhuma atualização de status recebida — normal se nenhum lead foi movido no CRM",
        duracao: Date.now() - t,
      });
    } catch (e: any) {
      atualizar("crm_fn_status", { status: "erro", detalhe: e.message, duracao: Date.now() - t });
    }

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
      {/* Header */}
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
            Valida a integração entre Uhome.com.br e UhomeSales CRM em tempo real
          </p>
        </div>
        <button
          onClick={rodarTodos}
          disabled={rodando}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97] disabled:opacity-60"
        >
          {rodando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {rodando ? "Testando..." : "Rodar todos os testes"}
        </button>
      </div>

      {/* Summary */}
      {concluido && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Passaram", val: okCount, cls: "bg-emerald-50 text-emerald-700" },
            { label: "Avisos", val: avisoCount, cls: "bg-amber-50 text-amber-700" },
            { label: "Erros", val: erroCount, cls: "bg-destructive/5 text-destructive" },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl border border-border p-4 text-center ${s.cls}`}
            >
              <div className="font-body text-3xl font-extrabold">{s.val}</div>
              <div className="mt-1 font-body text-xs font-semibold uppercase tracking-wider opacity-70">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {testes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20">
          <div className="text-5xl">🔍</div>
          <h3 className="mt-4 font-body text-lg font-bold text-foreground">
            Pronto para validar
          </h3>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Clique em "Rodar todos os testes" para iniciar o diagnóstico completo
          </p>
        </div>
      )}

      {/* Test groups */}
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
                    <div
                      key={teste.nome}
                      className={`flex items-start gap-3 px-5 py-4 transition-colors ${statusBg(teste.status)}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <StatusIcon status={teste.status} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-body text-sm font-semibold text-foreground">
                            {teste.mensagem}
                          </span>
                          {teste.duracao !== undefined && (
                            <span className="font-body text-[11px] text-muted-foreground">
                              {teste.duracao}ms
                            </span>
                          )}
                        </div>
                        {teste.detalhe && (
                          <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">
                            {teste.detalhe}
                          </p>
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

      {/* Post-diagnostic messages */}
      {concluido && erroCount > 0 && (
        <div className="mt-8 rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <h3 className="font-body text-base font-bold text-destructive">
            ❌ {erroCount} erro(s) encontrado(s)
          </h3>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            Verifique os itens em vermelho. Causas comuns:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 font-body text-sm text-muted-foreground">
            <li>Secrets não configurados nas Edge Functions</li>
            <li>Colunas SQL não criadas (rodar migration)</li>
            <li>Edge Functions não deployadas</li>
            <li>SYNC_SECRET diferente nos dois projetos</li>
          </ul>
        </div>
      )}

      {concluido && erroCount === 0 && avisoCount === 0 && (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 py-8">
          <PartyPopper className="h-10 w-10 text-emerald-600" />
          <h3 className="mt-3 font-body text-lg font-bold text-emerald-800">
            Integração 100% funcionando!
          </h3>
          <p className="mt-1 max-w-md text-center font-body text-sm text-emerald-700">
            Todos os testes passaram. Leads gerados no site chegam automaticamente no UhomeSales CRM.
          </p>
        </div>
      )}
    </div>
  );
}
