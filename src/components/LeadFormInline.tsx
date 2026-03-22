import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, Loader2 } from "lucide-react";
import { submitLead } from "@/services/leads";
import { toast } from "sonner";
import { formatPhone } from "@/lib/phoneMask";

interface LeadFormInlineProps {
  isOpen: boolean;
  imovelId?: string;
  imovelTitulo?: string;
  imovelBairro?: string;
  imovelPreco?: number;
  onClose: () => void;
}

export function LeadFormInline({ isOpen, imovelId, imovelTitulo, imovelBairro, imovelPreco, onClose }: LeadFormInlineProps) {
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
        imovel_id: imovelId,
        imovel_titulo: imovelTitulo,
        imovel_bairro: imovelBairro,
        imovel_preco: imovelPreco,
        origem_componente: "card_cta",
      });
      setSuccess(true);
      toast.success("Recebemos seu contato! Um corretor falará com você em breve.");
      setTimeout(() => {
        setSuccess(false);
        setNome("");
        setTelefone("");
        setEmail("");
        onClose();
      }, 2500);
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
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="border-t border-border bg-secondary/30 p-4">
            {success ? (
              <div className="flex items-center justify-center gap-2 py-3 font-body text-sm text-green-400">
                <Check className="h-4 w-4" /> Enviado com sucesso!
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-lg bg-input px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  maxLength={100}
                />
                <input
                  type="tel"
                  placeholder="WhatsApp (51) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  className="w-full rounded-lg bg-input px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  maxLength={16}
                />
                <input
                  type="email"
                  placeholder="E-mail (opcional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-input px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  maxLength={255}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-body text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Quero ser contactado
                </button>
              </div>
            )}
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
