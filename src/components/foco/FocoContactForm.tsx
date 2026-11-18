import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/lib/phoneMask";
import { erroTelefoneFoco, dataLocalFoco, proximosDiasFoco } from "@/lib/focoVisit";
import { trackEvent } from "@/lib/trackEvent";
import { submitLead } from "@/services/leads";
import { supabase } from "@/lib/supabaseLazy";
import { getLeadTracking } from "@/lib/leadTracking";
import { getCorretorRef, getCorretorRefId } from "@/lib/session";
import type { ProdutoFoco } from "@/lib/produtosFoco";

const ASSUNTOS = ["Valores e condições", "Plantas e unidades", "Financiamento", "Localização e obra"];
export type PedidoFoco = "visita" | "informacoes";
export function FocoContactForm({ p, modo, dia, periodo, planta, onVisita, setDia, setPeriodo }: { p: ProdutoFoco; modo: PedidoFoco; dia: Date; periodo: string; planta?: string | null; onVisita: () => void; setDia: (d: Date) => void; setPeriodo: (s: string) => void }) {
  const [nome, setNome] = useState(""); const [telefone, setTelefone] = useState("");
  const [financiamento, setFinanciamento] = useState("Ainda não sei"); const [assunto, setAssunto] = useState(ASSUNTOS[0]);
  const [loading, setLoading] = useState(false); const [ok, setOk] = useState(false); const [erro, setErro] = useState("");
  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const telErro = erroTelefoneFoco(telefone);
    if (telErro) { setErro(telErro); return; }
    if (nome.trim().length < 2) { setErro("Informe seu nome."); return; }
    setErro(""); setLoading(true);
    try {
      const pedido = { tipo: modo === "visita" ? "visita_pedida" : "informacoes_pedidas", origem: modo, dia: dataLocalFoco(dia), periodo: periodo.toLowerCase(), planta: planta ?? null, financiamento: modo === "visita" ? financiamento : null, assunto: modo === "informacoes" ? assunto : null };
      if (modo === "visita") {
        const ref = getCorretorRef(); const tracking = getLeadTracking("agendamento_visita_foco");
        const { error } = await supabase.from("agendamentos").insert({ nome: nome.trim(), telefone, imovel_slug: `em-foco/${p.slug}`, imovel_titulo: p.nome, data_visita: pedido.dia, turno: pedido.periodo, horario: periodo, status: "confirmado", corretor_ref_id: getCorretorRefId() || null, corretor_ref_slug: ref || null, origem_ref: ref ? "link_corretor" : "organico", origem_componente: "agendamento_visita_foco", contexto: pedido, ...tracking.colunas });
        if (error) throw error;
      }
      await submitLead({ nome: nome.trim(), telefone, imovel_slug: `em-foco/${p.slug}`, imovel_titulo: p.nome, imovel_bairro: p.bairro ?? undefined, imovel_preco: p.preco_a_partir ?? undefined, tipo_interesse: modo, origem_componente: modo === "visita" ? "agendamento_visita_foco" : "foco_mais_informacoes", contexto: { origem: modo, pedido } });
      setOk(true);
    } catch { setErro("Não foi possível salvar seu pedido. Tente novamente ou chame no WhatsApp."); }
    finally { setLoading(false); }
  }
  if (ok) return <div role="status" className="space-y-4 py-6 text-center"><Check className="mx-auto h-8 w-8 text-primary" /><h3 className="text-xl font-bold">{modo === "visita" ? `Visita pedida, ${nome.trim().split(" ")[0]}… Um passo mais perto do seu novo lar.` : `Pedido recebido, ${nome.trim().split(" ")[0]}…`}</h3><p className="text-muted-foreground">Um especialista da Uhome confirma pelo WhatsApp.</p>{modo === "informacoes" && <Button className="w-full" onClick={onVisita}>Agendar visita também</Button>}</div>;
  return <form noValidate data-formulario={modo === "visita" ? "agendamento_visita_foco" : "foco_mais_informacoes"} data-contato onSubmit={enviar} className="space-y-4">
    <div className="rounded-lg bg-secondary p-3 text-sm">{modo === "visita" ? <><strong>{p.nome}</strong><p>{dia.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} · {periodo}</p></> : <><strong>{p.nome}</strong><p>Planta: {planta ?? "A escolher com o especialista"}</p></>}</div>
    {modo === "visita" && <><div className="grid grid-cols-5 gap-1">{proximosDiasFoco().map(d => <Button type="button" key={dataLocalFoco(d)} variant={dataLocalFoco(dia) === dataLocalFoco(d) ? "secondary" : "outline"} aria-pressed={dataLocalFoco(dia) === dataLocalFoco(d)} className="h-14 flex-col gap-0 px-1" onClick={() => { setDia(d); void trackEvent({ tipo: "dia_escolhido", imovel_slug: `em-foco/${p.slug}`, dados: { dia: dataLocalFoco(d) } }); }}><span className="text-xs">{d.toLocaleDateString("pt-BR", { weekday: "short" })}</span>{d.getDate()}</Button>)}</div><div className="grid grid-cols-2 gap-2">{["Manhã", "Tarde"].map(t => <Button type="button" key={t} variant={periodo === t ? "secondary" : "outline"} aria-pressed={periodo === t} onClick={() => setPeriodo(t)}>{t}</Button>)}</div></>}
    <label className="block text-sm font-semibold">Seu nome<Input aria-label="Seu nome" autoComplete="name" maxLength={100} value={nome} onChange={e => setNome(e.target.value)} className="mt-1 text-base" /></label>
    <label className="block text-sm font-semibold">WhatsApp<Input aria-label="Seu WhatsApp" autoComplete="tel" inputMode="tel" value={telefone} onChange={e => setTelefone(formatPhone(e.target.value))} className="mt-1 text-base" /></label>
    {modo === "visita" ? <fieldset><legend className="text-sm font-semibold">Vai usar financiamento?</legend><div className="mt-2 flex flex-wrap gap-2">{["Sim", "Não", "Ainda não sei"].map(x => <Button key={x} variant={financiamento === x ? "secondary" : "outline"} aria-pressed={financiamento === x} type="button" onClick={() => setFinanciamento(x)}>{x}</Button>)}</div></fieldset> : <label className="block text-sm font-semibold">O que você quer saber?<select aria-label="O que você quer saber?" value={assunto} onChange={e => setAssunto(e.target.value)} className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-base">{ASSUNTOS.map(x => <option key={x}>{x}</option>)}</select></label>}
    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    <Button type="submit" disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin" /> : modo === "visita" ? "Agendar visita" : "Receber informações"}</Button>
    <p className="text-xs text-muted-foreground">Ao enviar, você aceita receber contato da Uhome pelo WhatsApp sobre {p.nome}.</p>
  </form>;
}