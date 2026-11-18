import { trackEvent } from "@/lib/trackEvent";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { submitLead } from "@/services/leads";
import { toast } from "sonner";
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
            <div className="flex flex-wrap gap-2">
              {proximosDias.map((dia) => {
                const selected = dataEscolhida?.toDateString() === dia.toDateString();
                return (
                  <Button
                    key={dia.toISOString()}
                    onClick={() => { setDataEscolhida(dia); void trackEvent({ tipo: "dia_escolhido", imovel_slug: imovelSlug, dados: { dia: dia.toISOString().split("T")[0] } }); }}
                    variant="outline" aria-pressed={selected} className={`rounded-lg border-[1.5px] px-3 py-2 font-body text-xs font-medium transition-colors active:scale-[0.97] ${
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:border-primary/30"
                    }`}
                  >
                    {dia.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                  </Button>
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
                    <Button
                      key={h}
                      onClick={() => setHorario(h)}
                      variant="outline" aria-pressed={selected} className={`rounded-lg border-[1.5px] px-3.5 py-2 font-body text-xs font-medium transition-colors active:scale-[0.97] ${
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground hover:border-primary/30"
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
