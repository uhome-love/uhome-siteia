import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buildWhatsAppUrl, buildCorretorWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/services/whatsappTracker";
import { trackClickWhatsapp } from "@/lib/gtag";
import { useCorretor } from "@/contexts/CorretorContext";

export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(true);
  const { corretor } = useCorretor();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!tooltip) return;
    const t = setTimeout(() => setTooltip(false), 8000);
    return () => clearTimeout(t);
  }, [tooltip]);

  const handleClick = () => {
    const url = corretor
      ? buildCorretorWhatsAppUrl(corretor.nome, corretor.telefone)
      : buildWhatsAppUrl("Olá! Vim pelo site da Uhome e gostaria de falar com um corretor.");

    trackWhatsAppClick({ origem_pagina: window.location.pathname });
    trackClickWhatsapp({
      origem_componente: "floating_whatsapp",
      origem_pagina: window.location.pathname,
    });

    window.open(url, "_blank", "noopener");
  };

  // Hide on admin pages
  if (window.location.pathname.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-[4.5rem] right-3 z-[60] sm:bottom-6 sm:right-6 flex flex-col items-end gap-2"
        >
          {/* Tooltip bubble */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="relative mr-1 max-w-[200px] rounded-xl bg-card px-4 py-2.5 shadow-lg border border-border"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setTooltip(false); }}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="font-body text-xs font-medium text-foreground">
                  Precisa de ajuda? Fale com um corretor!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <button
            onClick={handleClick}
            aria-label="Falar no WhatsApp"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
          >
            <MessageCircle className="h-7 w-7" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
