import { useState } from "react";
import { Send, Check, Loader2 } from "lucide-react";
import { submitLead } from "@/services/leads";
import { toast } from "sonner";
import { formatPhone } from "@/lib/phoneMask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmpreendimentoLeadFormProps {
  empreendimentoNome: string;
  empreendimentoSlug: string;
  bairro?: string;
}

export function EmpreendimentoLeadForm({ empreendimentoNome, empreendimentoSlug, bairro }: EmpreendimentoLeadFormProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }
    setLoading(true);
    try {
      await submitLead({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim() || undefined,
        imovel_titulo: empreendimentoNome,
        imovel_slug: empreendimentoSlug,
        imovel_bairro: bairro,
        origem_componente: "empreendimento_landing",
        origem_pagina: window.location.pathname,
        tipo_interesse: "empreendimento",
      });
      setSuccess(true);
      toast.success("Recebemos seu interesse!");
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-semibold">Obrigado pelo interesse!</p>
        <p className="text-xs text-muted-foreground">Um especialista entrará em contato em breve.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <Input
        placeholder="WhatsApp"
        value={telefone}
        onChange={(e) => setTelefone(formatPhone(e.target.value))}
        required
      />
      <Input
        placeholder="E-mail (opcional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Quero saber mais
      </Button>
    </form>
  );
}
