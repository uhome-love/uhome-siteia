import { useState } from "react";
import { MessageCircle, Send, Check, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/services/whatsappTracker";
import { submitLead } from "@/services/leads";
import { formatPhone } from "@/lib/phoneMask";
import { toast } from "sonner";

export function SearchCTACard() {
  const [formOpen, setFormOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleWhatsApp = () => {
    const url = buildWhatsAppUrl(
      "Olá! Estou buscando imóveis no site da Uhome e gostaria de receber uma lista personalizada."
    );
    trackWhatsAppClick({ origem_pagina: "/busca" });
    window.open(url, "_blank", "noopener");
  };

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
        origem_componente: "busca_cta",
        origem_pagina: "/busca",
      });
      setSuccess(true);
      toast.success("Recebemos seu contato! Um corretor falará com você em breve.");
      setTimeout(() => {
        setSuccess(false);
        setFormOpen(false);
        setNome("");
        setTelefone("");
        setEmail("");
      }, 2500);
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-full rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.03] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div>
          <p className="font-body text-base font-bold text-foreground">
            Gostou de algum imóvel?
          </p>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Fale com um corretor agora e receba uma lista personalizada.
          </p>
        </div>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
        >
          <MessageCircle className="h-4 w-4" />
          Falar com corretor
        </button>
      </div>

      {/* Expandable form + WhatsApp */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-primary/10 px-6 py-5">
              {success ? (
                <div className="flex items-center justify-center gap-2 py-4 font-body text-sm font-medium text-green-600">
                  <Check className="h-5 w-5" /> Enviado com sucesso! Entraremos em contato.
                </div>
              ) : (
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  {/* Form */}
                  <form onSubmit={handleSubmit} className="flex-1 space-y-3">
                    <p className="font-body text-sm font-semibold text-foreground">Deixe seu contato</p>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      maxLength={100}
                    />
                    <input
                      type="tel"
                      placeholder="(51) 99999-9999"
                      value={telefone}
                      onChange={(e) => setTelefone(formatPhone(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      maxLength={16}
                    />
                    <input
                      type="email"
                      placeholder="E-mail (opcional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      maxLength={255}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 font-body text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Quero ser contactado
                    </button>
                  </form>

                  {/* Divider + WhatsApp */}
                  <div className="flex items-center gap-3 sm:flex-col sm:self-stretch">
                    <div className="h-px flex-1 bg-border sm:h-auto sm:w-px sm:flex-1" />
                    <span className="font-body text-xs text-muted-foreground">ou</span>
                    <div className="h-px flex-1 bg-border sm:h-auto sm:w-px sm:flex-1" />
                  </div>

                  {/* WhatsApp option */}
                  <div className="flex flex-col items-center justify-center gap-3 sm:w-48">
                    <p className="text-center font-body text-sm text-muted-foreground">
                      Prefere falar agora?
                    </p>
                    <button
                      onClick={handleWhatsApp}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-body text-sm font-bold text-white transition-all hover:bg-[#20bd5a] active:scale-[0.97]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
