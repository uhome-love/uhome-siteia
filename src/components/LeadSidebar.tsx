import { useState } from "react";
import { Send, Loader2, Check, MessageCircle } from "lucide-react";
import { submitLead } from "@/services/leads";
import { toast } from "sonner";
import { formatPreco } from "@/services/imoveis";
import { whatsappLink } from "@/lib/whatsapp";

interface LeadSidebarProps {
  imovelId?: string;
  imovelSlug?: string;
  imovelTitulo?: string;
  imovelBairro?: string;
  imovelPreco?: number;
  viewCount: number;
}

export function LeadSidebar({ imovelId, imovelSlug, imovelTitulo, imovelBairro, imovelPreco, viewCount }: LeadSidebarProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
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
        imovel_id: imovelId,
        imovel_slug: imovelSlug,
        imovel_titulo: imovelTitulo,
        imovel_bairro: imovelBairro,
        imovel_preco: imovelPreco,
        origem_componente: "detalhe_sidebar",
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
    const msg = encodeURIComponent(`Olá! Tenho interesse no imóvel: ${imovelTitulo || ""}. Vi no site da Uhome.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const priceLabel = imovelPreco ? formatPreco(imovelPreco) : null;
  const viewsText = viewCount === 1 ? "1 pessoa viu hoje" : `${viewCount > 0 ? viewCount : 5} pessoas viram hoje`;

  return (
    <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Price at top */}
      {priceLabel && (
        <p className="font-body text-2xl font-extrabold text-foreground">{priceLabel}</p>
      )}
      {imovelBairro && (
        <p className="mt-1 font-body text-xs text-muted-foreground">{imovelBairro}</p>
      )}

      <div className="my-5 h-px bg-border" />

      <h3 className="font-body text-base font-bold text-foreground">Fale com um corretor</h3>

      {success ? (
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
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
              maxLength={20}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Quero visitar este imóvel
          </button>
        </form>
      )}

      {/* Separator */}
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-body text-xs text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* WhatsApp */}
      <button
        onClick={handleWhatsApp}
        className="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-body text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
        style={{ backgroundColor: "#25D366" }}
      >
        <MessageCircle className="h-4 w-4" />
        Falar via WhatsApp
      </button>

      {/* Social proof */}
      <div className="mt-5 space-y-2">
        <p className="flex items-center gap-2 font-body text-xs text-muted-foreground">
          <span>⚡</span>
          <span>{viewsText}</span>
        </p>
        <p className="flex items-center gap-2 font-body text-xs text-muted-foreground">
          <span>✅</span>
          <span>Corretor disponível agora</span>
        </p>
      </div>
    </div>
  );
}
