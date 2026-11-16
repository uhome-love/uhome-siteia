import { useState } from "react";
import { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import { submitLead } from "@/services/leads";
import { formatPhone } from "@/lib/phoneMask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProdutoFoco } from "@/lib/produtosFoco";

export const contatoSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100, "Nome muito longo"),
  telefone: z.string().refine((t) => { const n = t.replace(/\D/g, "").length; return n === 10 || n === 11; }, "Informe o telefone com DDD"),
});
const extraSchema = z.object({
  email: z.string().trim().max(255).email("E-mail inválido").or(z.literal("")),
  mensagem: z.string().trim().max(1000, "Mensagem muito longa"),
});

export function InfoLeadFoco({ p }: { p: ProdutoFoco }) {
  const [v, setV] = useState({ nome: "", telefone: "", email: "", mensagem: "" });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [falha, setFalha] = useState("");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = contatoSchema.merge(extraSchema).safeParse(v);
    if (!r.success) { const m: Record<string, string> = {}; r.error.issues.forEach((i) => { m[String(i.path[0])] ??= i.message; }); setErros(m); return; }
    setErros({}); setFalha(""); setLoading(true);
    try {
      await submitLead({
        nome: r.data.nome, telefone: v.telefone.trim(), email: r.data.email || undefined, mensagem: r.data.mensagem || undefined,
        imovel_slug: `em-foco/${p.slug}`, imovel_titulo: p.nome, imovel_bairro: p.bairro ?? undefined, imovel_preco: p.preco_a_partir ?? undefined,
        origem_componente: "foco_mais_informacoes",
      } as any);
      setOk(true);
    } catch { setFalha("Não foi possível enviar agora. Tente de novo ou chame no WhatsApp."); }
    finally { setLoading(false); }
  };

  if (ok) return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <Check className="mx-auto h-8 w-8 text-primary" />
      <p className="mt-3 font-body text-base text-foreground">Em poucos minutos um consultor da Uhome chama você no WhatsApp com valores, plantas e unidades disponíveis do {p.nome}.</p>
    </div>
  );

  const campo = (k: keyof typeof v) => ({ value: v[k], "aria-invalid": !!erros[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: k === "telefone" ? formatPhone(e.target.value) : e.target.value }) });
  const Erro = ({ k }: { k: string }) => erros[k] ? <p className="mt-1 font-body text-sm text-destructive">{erros[k]}</p> : null;

  return (
    <form data-contato onSubmit={enviar} noValidate className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div><Input aria-label="Seu nome" placeholder="Seu nome *" required className="h-12 text-base" {...campo("nome")} /><Erro k="nome" /></div>
      <div><Input aria-label="Seu telefone" placeholder="Telefone / WhatsApp com DDD *" inputMode="tel" required className="h-12 text-base" {...campo("telefone")} /><Erro k="telefone" /></div>
      <div><Input aria-label="Seu e-mail" type="email" placeholder="E-mail (opcional)" className="h-12 text-base" {...campo("email")} /><Erro k="email" /></div>
      <div><Textarea aria-label="Mensagem" placeholder="Mensagem (opcional)" rows={3} className="text-base" {...campo("mensagem")} /><Erro k="mensagem" /></div>
      {falha && <p className="font-body text-sm text-destructive">{falha}</p>}
      <Button type="submit" size="lg" disabled={loading} className="w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Quero mais informações"}</Button>
      <p className="text-center font-body text-xs text-muted-foreground">* obrigatório. Sem compromisso.</p>
    </form>
  );
}
