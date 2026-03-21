import { useState } from "react";
import { Send, Loader2, Check, MessageCircle } from "lucide-react";
import { submitLead } from "@/services/leads";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "5551999999999";

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

  return (
    <div className="sticky top-24 glass rounded-2xl p-6">
      <h3 className="font-display text-xl font-bold text-foreground">Fale com um corretor</h3>

      {success ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
            <Check className="h-7 w-7 text-green-400" />
          </div>
          <p className="font-body text-sm text-foreground">Recebemos seu interesse!</p>
          <p className="font-body text-xs text-muted-foreground">Um corretor entrará em contato em breve.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-xl bg-secondary/50 px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            maxLength={100}
          />
          <input
            type="tel"
            placeholder="WhatsApp (51) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full rounded-xl bg-secondary/50 px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            maxLength={20}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Quero visitar este imóvel
          </button>
        </form>
      )}

      {/* Separator */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-body text-xs text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* WhatsApp direct */}
      <button
        onClick={handleWhatsApp}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-body text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.97]"
        style={{ backgroundColor: "#25D366", color: "#fff" }}
      >
        <MessageCircle className="h-4 w-4" />
        Falar via WhatsApp
      </button>

      {/* Social proof */}
      <div className="mt-5 space-y-2">
        <p className="flex items-center gap-2 font-body text-xs text-muted-foreground">
          <span>⚡</span>
          <span>{viewCount > 0 ? viewCount : Math.floor(Math.random() * 12) + 3} pessoas viram hoje</span>
        </p>
        <p className="flex items-center gap-2 font-body text-xs text-muted-foreground">
          <span>✅</span>
          <span>Corretor disponível</span>
        </p>
      </div>
    </div>
  );
}
