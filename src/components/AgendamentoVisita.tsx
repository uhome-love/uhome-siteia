import { trackEvent } from "@/lib/trackEvent";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { submitLead } from "@/services/leads";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { getCorretorRef, getCorretorRefId } from "@/lib/session";
import { formatPhone } from "@/lib/phoneMask";
import { getLeadTracking } from "@/lib/leadTracking";

interface Props {
  imovelId: string;
  imovelSlug: string;
  imovelTitulo: string;
  imovelBairro: string;
  imovelPreco: number;
}

const horariosDisponiveis = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

function getProximosDias(): Date[] {
  const dias: Date[] = [];
  for (let i = 1; dias.length < 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (d.getDay() !== 0) dias.push(d); // skip Sunday
  }
  return dias;
}

export function AgendamentoVisita({ imovelId, imovelSlug, imovelTitulo, imovelBairro, imovelPreco }: Props) {
  const [etapa, setEtapa] = useState<"form" | "horario" | "confirmado">("horario");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataEscolhida, setDataEscolhida] = useState<Date | null>(null);
  const [horario, setHorario] = useState("");
  const [loading, setLoading] = useState(false);

  const proximosDias = getProximosDias();

  const confirmar = async () => {
    if (!dataEscolhida || !horario || !nome.trim() || !telefone.trim() || loading) return;
    setLoading(true);
    try {
      const refSlug = getCorretorRef();
      const refId = getCorretorRefId();
      const agendamentoPayload = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        imovel_id: imovelId,
        imovel_slug: imovelSlug,
        imovel_titulo: imovelTitulo,
        data_visita: dataEscolhida.toISOString().split("T")[0],
        horario,
        status: "confirmado",
        corretor_ref_id: refId || null,
        corretor_ref_slug: refSlug || null,
        origem_ref: refSlug ? 'link_corretor' : 'organico',
        ...getLeadTracking("agendamento_visita").colunas,
      };
      const { error } = await supabase.from("agendamentos" as any).insert(agendamentoPayload);
      if (error) throw error;
      await submitLead({
        nome: nome.trim(),
        telefone: telefone.trim(),
        imovel_id: imovelId,
        imovel_slug: imovelSlug,
        imovel_titulo: imovelTitulo,
        imovel_bairro: imovelBairro,
        imovel_preco: imovelPreco,
        origem_componente: "agendamento_visita",
        contexto: { pedido: { tipo: "visita_pedida", dia: dataEscolhida.toISOString().split("T")[0], horario, periodo: Number(horario.slice(0, 2)) < 12 ? "manhã" : "tarde" } },
      });
      setEtapa("confirmado");
      toast.success("Visita pedida! Aguarde a confirmação do corretor.");
    } catch {
      toast.error("Erro ao agendar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (etapa === "confirmado") {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
          <Check className="h-7 w-7 text-primary" />
        </div>
        <p className="font-body text-base font-bold text-foreground">Visita pedida!</p>
        <p className="font-body text-sm text-muted-foreground">
          {dataEscolhida?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} às {horario}
        </p>
        <p className="font-body text-xs text-muted-foreground">
          Você receberá a confirmação via WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="font-body text-base font-bold text-foreground">Agendar visita</h3>
      </div>

      {etapa === "form" && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">{dataEscolhida?.toLocaleDateString("pt-BR")} às {horario}</p>
          <Button variant="ghost" onClick={() => setEtapa("horario")}>Alterar dia e horário</Button>
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
            maxLength={100}
          />
          <input
            type="tel"
            placeholder="(51) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(formatPhone(e.target.value))}
            className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
            maxLength={16}
          />
          <Button
            onClick={confirmar}
            disabled={loading || !nome.trim() || !telefone.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50"
          >
            Pedir visita
          </Button>
        </div>
      )}

      {etapa === "horario" && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Escolha o dia
            </p>
            <Calendar
              mode="single"
              locale={ptBR}
              selected={dataEscolhida ?? undefined}
              defaultMonth={proximosDias[0]}
              fromDate={proximosDias[0]}
              toDate={new Date(Date.now() + 60 * 864e5)}
              disabled={[{ before: proximosDias[0] }, { dayOfWeek: [0] }]}
              showOutsideDays={false}
              onSelect={(dia) => { if (!dia) return; setDataEscolhida(dia); setHorario(""); void trackEvent({ tipo: "dia_escolhido", imovel_slug: imovelSlug, dados: { dia: dia.toISOString().split("T")[0] } }); }}
              className="visita-calendario pointer-events-auto rounded-xl border border-border p-3"
              classNames={{
                caption_label: "font-body text-[15px] font-bold capitalize",
                nav_button: "grid h-8 w-8 place-items-center rounded-full border border-border bg-background transition hover:bg-secondary disabled:opacity-30",
                head_cell: "w-full font-body text-[11px] font-semibold uppercase text-muted-foreground",
                row: "mt-1 flex w-full",
                cell: "relative flex-1 p-0.5 text-center",
                day: "mx-auto grid h-10 w-10 place-items-center rounded-full font-body text-sm font-semibold transition-all duration-200 hover:border hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                day_selected: "!bg-primary !text-primary-foreground scale-105 shadow-md",
                day_today: "underline underline-offset-4",
                day_disabled: "!cursor-not-allowed text-muted-foreground/50 line-through hover:border-0",
              }}
            />
            {dataEscolhida && <p className="mt-2 font-body text-sm text-foreground animate-in fade-in">{dataEscolhida.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>}
          </div>

          {dataEscolhida && (
            <div>
              <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Escolha o horário
              </p>
              <div className="flex flex-wrap gap-2">
                {horariosDisponiveis.map((h) => {
                  const selected = horario === h;
                  return (
                    <Button
                      key={h}
                      onClick={() => setHorario(h)}
                      variant="outline" aria-pressed={selected} className={`min-h-11 rounded-full border-[1.5px] px-4 py-2 animate-in fade-in font-body text-xs font-medium transition-colors active:scale-[0.97] ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:border-foreground"
                      }`}
                    >
                      {h}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {dataEscolhida && horario && (
            <Button
              onClick={() => setEtapa("form")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Continuar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
