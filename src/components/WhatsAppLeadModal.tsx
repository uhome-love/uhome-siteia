import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useWhatsAppLeadStore } from "@/stores/whatsappLeadStore";
import { submitLead } from "@/services/leads";
import { trackWhatsAppClick } from "@/services/whatsappTracker";
import { trackClickWhatsapp, trackGenerateLead } from "@/lib/gtag";
import { formatPhone } from "@/lib/phoneMask";
import { toast } from "sonner";

const LEAD_NAME_KEY = "uhome_lead_nome";
const LEAD_PHONE_KEY = "uhome_lead_telefone_form";

export function WhatsAppLeadModal() {
  const { isOpen, data, closeModal } = useWhatsAppLeadStore();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill from localStorage
  useEffect(() => {
    if (isOpen) {
      setNome(localStorage.getItem(LEAD_NAME_KEY) || "");
      setTelefone(localStorage.getItem(LEAD_PHONE_KEY) || "");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }
    if (!data) return;

    setLoading(true);
    try {
      // Persist for next time
      localStorage.setItem(LEAD_NAME_KEY, nome.trim());
      localStorage.setItem(LEAD_PHONE_KEY, telefone.trim());

      // Submit lead
      await submitLead({
        nome: nome.trim(),
        telefone: telefone.trim(),
        imovel_id: data.imovel_id,
        imovel_slug: data.imovel_slug,
        imovel_titulo: data.imovel_titulo,
        imovel_bairro: data.imovel_bairro,
        imovel_preco: data.imovel_preco,
        origem_componente: data.origem_componente,
      });

      // Track events
      trackWhatsAppClick({
        imovel_id: data.imovel_id,
        imovel_titulo: data.imovel_titulo,
        imovel_slug: data.imovel_slug,
        origem_pagina: window.location.pathname,
      });
      trackClickWhatsapp({
        origem_componente: data.origem_componente,
        imovel_titulo: data.imovel_titulo,
        imovel_slug: data.imovel_slug,
      });
      trackGenerateLead({
        origem_componente: data.origem_componente,
        imovel_titulo: data.imovel_titulo,
        imovel_slug: data.imovel_slug,
      });

      // Open WhatsApp
      window.open(data.whatsappUrl, "_blank", "noopener");
      closeModal();
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-xl"
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10">
                <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
              </div>
              <div>
                <h3 className="font-body text-base font-bold text-foreground">Falar no WhatsApp</h3>
                <p className="font-body text-xs text-muted-foreground">Preencha para iniciar a conversa</p>
              </div>
            </div>

            {data?.imovel_titulo && (
              <div className="mb-4 rounded-lg bg-muted/50 px-3 py-2">
                <p className="font-body text-xs text-muted-foreground">Imóvel:</p>
                <p className="font-body text-sm font-medium text-foreground truncate">{data.imovel_titulo}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                  maxLength={100}
                  autoFocus
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
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 font-body text-sm font-bold text-white transition-all hover:bg-[#20bd5a] active:scale-[0.97] disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Abrir WhatsApp
              </button>
            </form>

            <p className="mt-3 text-center font-body text-[10px] text-muted-foreground">
              Seus dados são usados apenas para contato sobre imóveis.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
