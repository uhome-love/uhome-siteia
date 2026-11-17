import { trackEvent } from "@/lib/trackEvent";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { submitLead } from "@/services/leads";
import { getCorretorRef, getCorretorRefId } from "@/lib/session";
import { formatPhone } from "@/lib/phoneMask";
import { getLeadTracking } from "@/lib/leadTracking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contatoSchema } from "@/components/foco/InfoLeadFoco";
import type { ProdutoFoco } from "@/lib/produtosFoco";

const TURNOS = ["Manhã", "Tarde", "Noite"] as const;

function proximosDias(): Date[] {
  const dias: Date[] = [];
  for (let i = 1; dias.length < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (d.getDay() !== 0) dias.push(d);
  }
  return dias;
}

export function AgendaVisitaFoco({ p, planta }: { p: ProdutoFoco; planta?: string | null }) {
  const dias = proximosDias();
  const [dia, setDia] = useState<Date | null>(dias[0]);
  const [turno, setTurno] = useState<string>("Tarde");
  const [nome, setNome] = useState("");
  const [tel, setTel] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState("");
  const telOk = tel.replace(/\D/g, "").length >= 10;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dia || !turno) { setErro("Escolha o dia e o período."); return; }
    const v = contatoSchema.safeParse({ nome, telefone: tel });
    if (!v.success) { setErro(v.error.issues[0].message); return; }
    setErro(""); setLoading(true);
    try {
      const ref = getCorretorRef();
      const tr = getLeadTracking("agendamento_visita_foco");
      const { error: agendamentoError } = await supabase.from("agendamentos" as any).insert({
        nome: nome.trim(), telefone: tel.trim(), imovel_slug: `em-foco/${p.slug}`, imovel_titulo: p.nome,
        data_visita: dia.toISOString().split("T")[0], turno: turno.toLowerCase(), horario: turno,
        status: "confirmado", corretor_ref_id: getCorretorRefId() || null, corretor_ref_slug: ref || null,
        origem_ref: ref ? "link_corretor" : "organico", origem_componente: "agendamento_visita_foco",
        contexto: planta ? { planta } : null, ...tr.colunas,
      });
      if (agendamentoError) throw agendamentoError;
      await submitLead({
        nome: nome.trim(), telefone: tel.trim(), imovel_slug: `em-foco/${p.slug}`, imovel_titulo: p.nome,
        imovel_bairro: p.bairro ?? undefined, imovel_preco: p.preco_a_partir ?? undefined,
        origem_componente: "agendamento_visita_foco",
        contexto: { pedido: { tipo: "visita_pedida", dia: dia.toISOString().split("T")[0], periodo: turno.toLowerCase(), planta: planta || null } },
      } as any);
      setOk(true);
    } catch {
      setErro("Não foi possível agendar agora. Tente de novo ou chame no WhatsApp.");
    } finally { setLoading(false); }
  };

  if (ok) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <Check className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-3 font-heading text-lg font-bold text-foreground">Pedido de visita recebido</p>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {dia?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}, {turno.toLowerCase()}. Um especialista da Uhome confirma pelo WhatsApp em poucos minutos.
        </p>
      </div>
    );
  }

  return (
    <form noValidate data-contato onSubmit={enviar} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      {planta && <p className="mb-3 rounded-lg bg-secondary px-3 py-2 font-body text-sm text-foreground">Planta escolhida: <strong>{planta}</strong></p>}
      <p className="font-body text-sm font-semibold text-foreground">Dia</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {dias.map((d) => {
          const sel = dia?.toDateString() === d.toDateString();
          return (
            <button type="button" key={d.toISOString()} onClick={() => { setDia(d); void trackEvent({ tipo: "dia_escolhido", imovel_slug: `em-foco/${p.slug}`, dados: { dia: d.toISOString().split("T")[0] } }); }} aria-pressed={sel}
              className={`flex min-w-[64px] shrink-0 flex-col items-center rounded-xl border px-3 py-2 font-body transition-colors ${sel ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-secondary"}`}>
              <span className="text-xs capitalize">{d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span>
              <span className="text-lg font-bold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 font-body text-sm font-semibold text-foreground">Período</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {TURNOS.map((t) => (
          <button type="button" key={t} onClick={() => setTurno(t)} aria-pressed={turno === t}
            className={`rounded-xl border py-2.5 font-body text-sm font-semibold transition-colors ${turno === t ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-secondary"}`}>{t}</button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input aria-label="Seu nome" placeholder="Seu nome *" required value={nome} onChange={(e) => setNome(e.target.value)} className="h-12 text-base" />
        <Input aria-label="Seu WhatsApp" placeholder="WhatsApp com DDD *" required inputMode="tel" value={tel} onChange={(e) => setTel(formatPhone(e.target.value))} className="h-12 text-base" />
      </div>
      {erro && <p className="mt-3 font-body text-sm text-destructive">{erro}</p>}
      <Button type="submit" size="lg" disabled={loading} className="mt-4 w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Agendar visita"}
      </Button>
      <p className="mt-2 text-center font-body text-xs text-muted-foreground">Sem compromisso. Um especialista confirma pelo WhatsApp.</p>
    </form>
  );
}
