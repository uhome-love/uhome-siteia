import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/lib/phoneMask";
import { erroTelefoneFoco, dataLocalFoco, proximosDiasFoco } from "@/lib/focoVisit";
import { submitLead } from "@/services/leads";
import { supabase } from "@/lib/supabaseLazy";
import { getLeadTracking } from "@/lib/leadTracking";
import { getCorretorRef, getCorretorRefId } from "@/lib/session";

export const ORIGEM_SELECAO = "busca_selecao_anuncio";
export const FORMULARIO_SELECAO = "Busca - seleção (anúncio)";
export const ORIGEM_VISITA_BUSCA = "agendamento_visita_busca";

/** Cartão de captura para quem chegou à busca por anúncio do Google. */
export function BuscaSelecaoCard({ resumo, id }: { resumo: string; id?: string }) {
  const [nome, setNome] = useState(""); const [telefone, setTelefone] = useState("");
  const [etapa, setEtapa] = useState<"form" | "ok" | "visita" | "visita_ok">("form");
  const [loading, setLoading] = useState(false); const [erro, setErro] = useState("");
  const dias = proximosDiasFoco();
  const [dia, setDia] = useState(dias[0]); const [periodo, setPeriodo] = useState("Tarde");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2) { setErro("Informe seu nome."); return; }
    const t = erroTelefoneFoco(telefone); if (t) { setErro(t); return; }
    setErro(""); setLoading(true);
    try {
      await submitLead({ nome: nome.trim(), telefone, origem_componente: ORIGEM_SELECAO, formulario: FORMULARIO_SELECAO, tipo_interesse: "selecao_busca", imovel_titulo: `Busca: ${resumo}`, contexto: { resumo_busca: resumo, pedido: { id: crypto.randomUUID(), tipo: "informacoes_pedidas", origem: "busca_selecao", resumo_busca: resumo, pagina: window.location.href, horario: new Date().toISOString() } } });
      setEtapa("ok");
    } catch { setErro("Não foi possível salvar seu pedido. Tente novamente."); }
    finally { setLoading(false); }
  }

  async function agendar() {
    setErro(""); setLoading(true);
    try {
      const pedido = { id: crypto.randomUUID(), tipo: "visita_pedida", origem: "busca_selecao", dia: dataLocalFoco(dia), periodo: periodo.toLowerCase(), resumo_busca: resumo, pagina: window.location.href, horario: new Date().toISOString() };
      const tracking = getLeadTracking(ORIGEM_VISITA_BUSCA);
      const { error } = await supabase.from("agendamentos").insert({ nome: nome.trim(), telefone, imovel_slug: "busca", imovel_titulo: `Busca: ${resumo}`, data_visita: pedido.dia, turno: pedido.periodo, horario: periodo, status: "confirmado", corretor_ref_id: getCorretorRefId() || null, corretor_ref_slug: getCorretorRef() || null, origem_componente: ORIGEM_VISITA_BUSCA, contexto: { ...pedido, ...tracking.contexto }, ...tracking.colunas });
      if (error) throw error;
      await submitLead({ nome: nome.trim(), telefone, origem_componente: ORIGEM_VISITA_BUSCA, tipo_interesse: "visita", imovel_titulo: `Busca: ${resumo}`, contexto: { resumo_busca: resumo, pedido } });
      setEtapa("visita_ok");
    } catch { setErro("Não foi possível agendar. Tente novamente."); }
    finally { setLoading(false); }
  }

  const primeiro = nome.trim().split(" ")[0];
  return <section id={id} data-busca-selecao className="col-span-full scroll-mt-32 rounded-xl border border-border bg-card p-5 sm:p-6">
    {etapa === "form" && <form noValidate data-formulario={ORIGEM_SELECAO} data-contato onSubmit={enviar} className="space-y-3">
      <h2 className="text-lg font-bold leading-snug">Receba a seleção de imóveis que combinam com a sua busca</h2>
      <p className="text-sm text-muted-foreground">Um corretor da Uhome envia pelo WhatsApp as opções com valores, condições e plantas.</p>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block text-sm font-semibold">Seu nome<Input aria-label="Seu nome" autoComplete="name" maxLength={100} value={nome} onChange={e => setNome(e.target.value)} className="mt-1 text-base" /></label>
        <label className="block text-sm font-semibold">WhatsApp<Input aria-label="Seu WhatsApp" autoComplete="tel" inputMode="tel" value={telefone} onChange={e => setTelefone(formatPhone(e.target.value))} placeholder="(51) 99999-9999" className="mt-1 text-base" /></label>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? <Loader2 className="animate-spin" /> : "Quero receber"}</Button>
      </div>
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    </form>}
    {etapa === "ok" && <div role="status" className="space-y-3 text-center"><Check className="mx-auto h-7 w-7 text-primary" /><h2 className="text-lg font-bold">Pedido recebido, {primeiro}!</h2><p className="text-sm text-muted-foreground">Um corretor da Uhome envia a seleção pelo WhatsApp.</p><Button onClick={() => setEtapa("visita")}>Agendar visita</Button></div>}
    {etapa === "visita" && <div className="space-y-3"><h2 className="text-lg font-bold">Agendar visita</h2>
      <div className="grid grid-cols-5 gap-1">{dias.map(d => <Button type="button" key={dataLocalFoco(d)} variant={dataLocalFoco(dia) === dataLocalFoco(d) ? "secondary" : "outline"} aria-pressed={dataLocalFoco(dia) === dataLocalFoco(d)} className="h-14 flex-col gap-0 px-1" onClick={() => setDia(d)}><span className="text-xs">{d.toLocaleDateString("pt-BR", { weekday: "short" })}</span>{d.getDate()}</Button>)}</div>
      <div className="grid grid-cols-2 gap-2">{["Manhã", "Tarde"].map(t => <Button type="button" key={t} variant={periodo === t ? "secondary" : "outline"} aria-pressed={periodo === t} onClick={() => setPeriodo(t)}>{t}</Button>)}</div>
      <Button className="w-full" disabled={loading} onClick={agendar}>{loading ? <Loader2 className="animate-spin" /> : "Agendar visita"}</Button>
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    </div>}
    {etapa === "visita_ok" && <div role="status" className="space-y-2 text-center"><Check className="mx-auto h-7 w-7 text-primary" /><h2 className="text-lg font-bold">Visita pedida, {primeiro}!</h2><p className="text-sm text-muted-foreground">Um corretor da Uhome confirma pelo WhatsApp.</p></div>}
  </section>;
}

/** Mostra o cartão só para quem veio de anúncio; para os demais a busca fica como está. */
export function SelecaoAnuncio({ anuncio, resumo, id }: { anuncio: boolean; resumo: string; id?: string }) {
  return anuncio ? <BuscaSelecaoCard id={id} resumo={resumo} /> : null;
}
