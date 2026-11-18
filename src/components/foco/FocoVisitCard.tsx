import { Button } from "@/components/ui/button";
import { CalendarDays, MessageCircle } from "lucide-react";
import { formatPreco, type ProdutoFoco } from "@/lib/produtosFoco";
import { proximosDiasFoco, dataLocalFoco } from "@/lib/focoVisit";
import { trackEvent } from "@/lib/trackEvent";
import { trackProdutoWhatsApp } from "./FocoShared";

export function FocoVisitCard({ p, condicao, dia, periodo, setDia, setPeriodo, onVisita, onInfo, waUrl }: { p: ProdutoFoco; condicao?: string; dia: Date; periodo: string; setDia: (d: Date) => void; setPeriodo: (p: string) => void; onVisita: () => void; onInfo: () => void; waUrl: string }) {
  const dias = proximosDiasFoco();
  return <aside aria-label="Pedir visita" className="sticky top-6 rounded-lg border border-border bg-card p-6 shadow-sm">
    <p className="text-sm text-muted-foreground">A partir de</p><p className="mt-1 text-3xl font-bold">{formatPreco(p.preco_a_partir) ?? "Consulte valores"}</p>
    {condicao && <p className="mt-3 text-sm font-semibold text-primary">{condicao}</p>}<p className="mt-2 text-xs text-muted-foreground">Valores sujeitos a alteração</p>
    <p className="mt-6 text-sm font-semibold">Escolha o dia da visita</p>
    <div className="mt-3 grid grid-cols-5 gap-1">{dias.map(d => <Button key={dataLocalFoco(d)} variant={dataLocalFoco(dia) === dataLocalFoco(d) ? "secondary" : "outline"} className="h-16 flex-col gap-0 px-1" aria-pressed={dataLocalFoco(dia) === dataLocalFoco(d)} onClick={() => { setDia(d); void trackEvent({ tipo: "dia_escolhido", imovel_slug: `em-foco/${p.slug}`, dados: { dia: dataLocalFoco(d) } }); }}><span className="text-xs capitalize">{d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span><span className="text-lg">{d.getDate()}</span></Button>)}</div>
    <div className="mt-3 grid grid-cols-2 gap-2">{["Manhã", "Tarde"].map(t => <Button key={t} variant={periodo === t ? "secondary" : "outline"} aria-pressed={periodo === t} onClick={() => setPeriodo(t)}>{t}</Button>)}</div>
    <Button onClick={onVisita} className="mt-4 w-full"><CalendarDays />Agendar visita</Button><p className="mt-3 text-center text-xs text-muted-foreground">Sem compromisso. Um especialista confirma pelo WhatsApp.</p>
    <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" /></div>
    <Button variant="outline" onClick={onInfo} className="w-full">Receber informações</Button>
    <div className="mt-3 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent("uhome:abrir-lia"))}><MessageCircle />Lia</Button><Button variant="outline" asChild><a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackProdutoWhatsApp(p)}><MessageCircle className="text-whatsapp" />WhatsApp</a></Button></div>
  </aside>;
}