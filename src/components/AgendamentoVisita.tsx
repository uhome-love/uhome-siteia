import { useState } from "react";
import { CalendarDays, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { submitLead } from "@/services/leads";
import { syncToCRM } from "@/services/syncCRM";
import { toast } from "sonner";

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
  const [etapa, setEtapa] = useState<"form" | "horario" | "confirmado">("form");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataEscolhida, setDataEscolhida] = useState<Date | null>(null);
  const [horario, setHorario] = useState("");
  const [loading, setLoading] = useState(false);

  const proximosDias = getProximosDias();

  const confirmar = async () => {
    if (!dataEscolhida || !horario) return;
    setLoading(true);
    try {
      const agendamentoPayload = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        imovel_id: imovelId,
        imovel_slug: imovelSlug,
        imovel_titulo: imovelTitulo,
        data_visita: dataEscolhida.toISOString().split("T")[0],
        horario,
        status: "confirmado",
      };
      await supabase.from("agendamentos" as any).insert(agendamentoPayload);

      // Fire-and-forget sync to CRM
      syncToCRM("agendamento", agendamentoPayload);
      await submitLead({
        nome: nome.trim(),
        telefone: telefone.trim(),
        imovel_id: imovelId,
        imovel_slug: imovelSlug,
        imovel_titulo: imovelTitulo,
        imovel_bairro: imovelBairro,
        imovel_preco: imovelPreco,
        origem_componente: "agendamento_visita",
      });
      setEtapa("confirmado");
      toast.success("Visita agendada com sucesso!");
    } catch {
      toast.error("Erro ao agendar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (etapa === "confirmado") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
          <Check className="h-7 w-7 text-green-500" />
        </div>
        <p className="font-body text-base font-bold text-foreground">Visita agendada!</p>
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
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="font-body text-base font-bold text-foreground">Agendar visita</h3>
      </div>

      {etapa === "form" && (
        <div className="mt-4 space-y-3">
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
          <button
            onClick={() => nome.trim() && telefone.trim() && setEtapa("horario")}
            disabled={!nome.trim() || !telefone.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50"
          >
            Ver horários disponíveis →
          </button>
        </div>
      )}

      {etapa === "horario" && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Escolha o dia
            </p>
            <div className="flex flex-wrap gap-2">
              {proximosDias.map((dia) => {
                const selected = dataEscolhida?.toDateString() === dia.toDateString();
                return (
                  <button
                    key={dia.toISOString()}
                    onClick={() => setDataEscolhida(dia)}
                    className={`rounded-lg border-[1.5px] px-3 py-2 font-body text-xs font-medium transition-colors active:scale-[0.97] ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:border-primary/30"
                    }`}
                  >
                    {dia.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                  </button>
                );
              })}
            </div>
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
                    <button
                      key={h}
                      onClick={() => setHorario(h)}
                      className={`rounded-lg border-[1.5px] px-3.5 py-2 font-body text-xs font-medium transition-colors active:scale-[0.97] ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:border-primary/30"
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {dataEscolhida && horario && (
            <button
              onClick={confirmar}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Confirmar visita
            </button>
          )}
        </div>
      )}
    </div>
  );
}
