import { useState } from "react";
import { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import { submitLead } from "@/services/leads";
import { formatPhone } from "@/lib/phoneMask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProdutoFoco } from "@/lib/produtosFoco";

export const contatoSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100, "Nome muito longo"),
  telefone: z.string().refine((t) => { const n = t.replace(/\D/g, "").length; return n === 10 || n === 11; }, "Informe o telefone com DDD"),
});

type Modo = "info" | "visita";

/** Formulário básico (nome + telefone obrigatórios). Com `p` fica preso ao produto; com `produtos` mostra a escolha do empreendimento. */
export function InfoLeadFoco({ p, produtos, modo = "info", campanha }: { p?: ProdutoFoco; produtos?: ProdutoFoco[]; modo?: Modo; campanha?: string }) {
  const [v, setV] = useState({ nome: "", telefone: "", produto: "" });
  const [tipo, setTipo] = useState<Modo>(modo);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [falha, setFalha] = useState("");
  const escolhido = p ?? produtos?.find((x) => x.slug === v.produto);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = contatoSchema.safeParse(v);
    if (!r.success) { const m: Record<string, string> = {}; r.error.issues.forEach((i) => { m[String(i.path[0])] ??= i.message; }); setErros(m); return; }
    setErros({}); setFalha(""); setLoading(true);
    const alvo = escolhido?.nome ?? campanha ?? "campanha de Natal";
    try {
      await submitLead({
        nome: r.data.nome, telefone: v.telefone.trim(),
        mensagem: tipo === "visita" ? `Quero agendar uma visita: ${alvo}` : `Quero receber informações: ${alvo}`,
        imovel_slug: escolhido ? `em-foco/${escolhido.slug}` : undefined, imovel_titulo: escolhido?.nome ?? campanha, imovel_bairro: escolhido?.bairro ?? undefined, imovel_preco: escolhido?.preco_a_partir ?? undefined,
        origem_componente: p ? "foco_mais_informacoes" : tipo === "visita" ? "campanha_agendar_visita" : "campanha_receber_informacoes",
      } as any);
      setOk(true);
    } catch { setFalha("Não foi possível enviar agora. Tente de novo ou chame no WhatsApp."); }
    finally { setLoading(false); }
  };

  if (ok) return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <Check className="mx-auto h-8 w-8 text-primary" />
      <p className="mt-3 font-body text-base text-foreground">
        {tipo === "visita"
          ? `Em poucos minutos um consultor da Uhome chama você no WhatsApp para combinar a visita${escolhido ? ` ao ${escolhido.nome}` : ""}.`
          : `Em poucos minutos um consultor da Uhome chama você no WhatsApp com valores, plantas e unidades disponíveis${escolhido ? ` do ${escolhido.nome}` : ""}.`}
      </p>
    </div>
  );

  const campo = (k: "nome" | "telefone") => ({ value: v[k], "aria-invalid": !!erros[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: k === "telefone" ? formatPhone(e.target.value) : e.target.value }) });
  const Erro = ({ k }: { k: string }) => erros[k] ? <p className="mt-1 font-body text-sm text-destructive">{erros[k]}</p> : null;

  return (
    <form data-contato onSubmit={enviar} noValidate className="grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-5 text-foreground sm:p-6 [&>*]:min-w-0">
      {!p && (
        <div role="radiogroup" aria-label="O que você quer" className="grid grid-cols-2 gap-2">
          {([["info", "Receber informações"], ["visita", "Agendar visita"]] as const).map(([k, l]) => (
            <button key={k} type="button" role="radio" aria-checked={tipo === k} onClick={() => setTipo(k)} className={`min-w-0 rounded-xl border px-2 py-2.5 font-body text-sm font-semibold ${tipo === k ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground"}`}>{l}</button>
          ))}
        </div>
      )}
      <div><Input aria-label="Seu nome" placeholder="Seu nome *" autoComplete="name" required className="h-12 text-base" {...campo("nome")} /><Erro k="nome" /></div>
      <div><Input aria-label="Seu telefone" placeholder="Telefone / WhatsApp com DDD *" inputMode="tel" autoComplete="tel" required className="h-12 text-base" {...campo("telefone")} /><Erro k="telefone" /></div>
      {produtos && produtos.length > 0 && (
        <select aria-label="Empreendimento de interesse" value={v.produto} onChange={(e) => setV({ ...v, produto: e.target.value })} className="h-12 rounded-md border border-input bg-background px-3 font-body text-base text-foreground">
          <option value="">Empreendimento (opcional)</option>
          {produtos.map((x) => <option key={x.slug} value={x.slug}>{x.nome}{x.bairro ? ` · ${x.bairro}` : ""}</option>)}
        </select>
      )}
      {falha && <p className="font-body text-sm text-destructive">{falha}</p>}
      <Button type="submit" size="lg" disabled={loading} className="w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : tipo === "visita" ? "Quero agendar visita" : "Quero receber informações"}</Button>
      <p className="text-center font-body text-xs text-muted-foreground">Sem compromisso. Respondemos pelo WhatsApp.</p>
    </form>
  );
}
