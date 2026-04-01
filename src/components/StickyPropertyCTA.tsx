import { useState, useEffect } from "react";
import { Send, Loader2, Check, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { motion, AnimatePresence } from "framer-motion";
import { buildWhatsAppUrl, buildCorretorWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/services/whatsappTracker";
import { trackClickWhatsapp, trackGenerateLead } from "@/lib/gtag";
import { useCorretor } from "@/contexts/CorretorContext";
import { submitLead } from "@/services/leads";
import { formatPhone } from "@/lib/phoneMask";
import { toast } from "sonner";

interface Props {
  imovelId?: string;
  imovelSlug?: string;
  imovelTitulo?: string;
  imovelBairro?: string;
  imovelPreco?: number;
}

export function StickyPropertyCTA({ imovelId, imovelSlug, imovelTitulo, imovelBairro, imovelPreco }: Props) {
  const [show, setShow] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { corretor } = useCorretor();

  useEffect(() => {
    const onScroll = () => {
      const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setShow(scrollPct > 0.35);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleWhatsApp = () => {
    const imovelData = imovelTitulo ? { titulo: imovelTitulo, bairro: imovelBairro, slug: imovelSlug } : undefined;
    const url = corretor
      ? buildCorretorWhatsAppUrl(corretor.nome, corretor.telefone, imovelData)
      : buildWhatsAppUrl(undefined, imovelData);

    trackWhatsAppClick({ imovel_id: imovelId, imovel_titulo: imovelTitulo, imovel_slug: imovelSlug });
    trackClickWhatsapp({ origem_componente: "sticky_cta", imovel_titulo: imovelTitulo, imovel_slug: imovelSlug });
    window.open(url, "_blank", "noopener");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) { toast.error("Preencha nome e WhatsApp"); return; }
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
        origem_componente: "sticky_cta",
        origem_pagina: window.location.pathname,
      });
      trackGenerateLead({ origem_componente: "sticky_cta", imovel_titulo: imovelTitulo, imovel_slug: imovelSlug });
      setSuccess(true);
      toast.success("Recebemos seu contato!");
      setTimeout(() => { setSuccess(false); setFormOpen(false); setNome(""); setTelefone(""); }, 2500);
    } catch { toast.error("Erro ao enviar."); }
    finally { setLoading(false); }
  };

  // Only show on desktop (mobile has its own bottom bar)
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[55] hidden border-t border-border bg-card/95 backdrop-blur-md sm:block"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm font-bold text-foreground">{imovelTitulo}</p>
              <p className="font-body text-xs text-muted-foreground">{imovelBairro}</p>
            </div>

            <AnimatePresence mode="wait">
              {formOpen ? (
                <motion.form
                  key="form"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  {success ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <Check className="h-4 w-4" /> Enviado!
                    </span>
                  ) : (
                    <>
                      <input
                        placeholder="Nome"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        className="w-32 rounded-lg border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <input
                        placeholder="WhatsApp"
                        value={telefone}
                        onChange={e => setTelefone(formatPhone(e.target.value))}
                        className="w-36 rounded-lg border border-border bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button type="submit" disabled={loading} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Enviar
                      </button>
                      <button type="button" onClick={() => setFormOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </motion.form>
              ) : (
                <motion.div key="buttons" className="flex items-center gap-2">
                  <button
                    onClick={() => setFormOpen(true)}
                    className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                    Tenho interesse
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#20bd5a]"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
