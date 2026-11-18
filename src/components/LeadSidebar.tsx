import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Check, CalendarDays } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { formatPhone } from "@/lib/phoneMask";
import { submitLead } from "@/services/leads";
import { toast } from "sonner";
import { formatPreco } from "@/services/imoveis";
import { buildWhatsAppUrl, buildCorretorWhatsAppUrl } from "@/lib/whatsapp";
import { useCorretor } from "@/contexts/CorretorContext";
import { useWhatsAppLeadStore } from "@/stores/whatsappLeadStore";

interface LeadSidebarProps {
  imovelId?: string;
  imovelSlug?: string;
  imovelTitulo?: string;
  imovelBairro?: string;
  imovelPreco?: number;
  viewCount: number;
  onAgendar?: () => void;
}

export function LeadSidebar({ imovelId, imovelSlug, imovelTitulo, imovelBairro, imovelPreco, viewCount, onAgendar }: LeadSidebarProps) {
  const [informacoesOpen, setInformacoesOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { corretor } = useCorretor();
  const openModal = useWhatsAppLeadStore((s) => s.openModal);

  const imovelData = { titulo: imovelTitulo, bairro: imovelBairro, slug: imovelSlug };

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
        imovel_id: imovelId,
        imovel_slug: imovelSlug,
        imovel_titulo: imovelTitulo,
        imovel_bairro: imovelBairro,
        imovel_preco: imovelPreco,
        origem_componente: "detalhe_sidebar",
        origem_pagina: window.location.href,
      });
      setSuccess(true);
      toast.success("Interesse registrado! Falaremos com você em breve.");
    } catch {
      toast.error("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const url = corretor
      ? buildCorretorWhatsAppUrl(corretor.nome, corretor.telefone, imovelData)
      : buildWhatsAppUrl(undefined, imovelData);

    openModal({
      whatsappUrl: url,
      origem_componente: "detalhe_sidebar",
      imovel_id: imovelId,
      imovel_slug: imovelSlug,
      imovel_titulo: imovelTitulo,
      imovel_bairro: imovelBairro,
      imovel_preco: imovelPreco,
    });
  };

  const priceLabel = imovelPreco ? formatPreco(imovelPreco) : null;
  const viewsText = viewCount === 1 ? "1 pessoa viu hoje" : viewCount > 1 ? `${viewCount} pessoas viram hoje` : null;

  if (corretor) {
    const primeiroNome = corretor.nome.split(" ")[0];
    return (
      <div data-lead-sidebar className="space-y-4 border-y border-border py-6">
        {priceLabel && (
          <p className="font-body text-2xl font-extrabold text-foreground">{priceLabel}</p>
        )}
        {imovelBairro && (
          <p className="mt-1 font-body text-xs text-muted-foreground">{imovelBairro}</p>
        )}

        <div className="my-5 h-px bg-border" />

        <div className="flex items-center gap-3">
          {corretor.foto_url ? (
            <img src={corretor.foto_url} alt={corretor.nome} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-body text-lg font-bold text-primary">
              {corretor.nome.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-body text-sm font-bold text-foreground">{corretor.nome}</p>
            {corretor.creci && (
              <p className="font-body text-xs text-muted-foreground">CRECI {corretor.creci}</p>
            )}
            <p className="font-body text-xs text-muted-foreground">Corretor Uhome</p>
          </div>
        </div>

        {onAgendar && <Button className="w-full" onClick={onAgendar}><CalendarDays />Agendar visita</Button>}
        <Button variant="outline" className="w-full" onClick={handleWhatsApp}><WhatsAppIcon />Receber informações</Button>
      </div>
    );
  }

  return (
    <div data-lead-sidebar className="space-y-4 border-y border-border py-6">
      {priceLabel && (
        <p className="font-body text-2xl font-extrabold text-foreground">{priceLabel}</p>
      )}
      {imovelBairro && (
        <p className="mt-1 font-body text-xs text-muted-foreground">{imovelBairro}</p>
      )}

      <div className="my-5 h-px bg-border" />

      {onAgendar && <Button className="w-full" onClick={onAgendar}><CalendarDays />Agendar visita</Button>}
      <Button variant="outline" className="w-full" aria-expanded={informacoesOpen} onClick={() => setInformacoesOpen(x => !x)}>Receber informações</Button>

      {informacoesOpen && (success ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
            <Check className="h-7 w-7 text-green-500" />
          </div>
          <p className="font-body text-sm font-semibold text-foreground">Recebemos seu interesse!</p>
          <p className="font-body text-xs text-muted-foreground">Um corretor entrará em contato em breve.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nome</label>
            <input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
              maxLength={100}
            />
          </div>
          <div>
            <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp</label>
            <input
              type="tel"
              placeholder="(51) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
              maxLength={16}
            />
          </div>
          <div>
            <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">E-mail <span className="normal-case font-normal tracking-normal">(opcional)</span></label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
              maxLength={255}
            />
          </div>
          <Button type="submit" variant="outline" disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar pedido
          </Button>
        </form>
      ))}

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-body text-xs text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="w-full" onClick={handleWhatsApp}><WhatsAppIcon />WhatsApp</Button>
    </div>
  );
}
