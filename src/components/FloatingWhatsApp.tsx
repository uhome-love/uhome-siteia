import { useState, useEffect } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buildWhatsAppUrl, buildCorretorWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/services/whatsappTracker";
import { trackClickWhatsapp } from "@/lib/gtag";
import { useCorretor } from "@/contexts/CorretorContext";

export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(() => {
    return sessionStorage.getItem("uhome_tooltip_dismissed") !== "1";
  });
  const [retargetingPopup, setRetargetingPopup] = useState(false);
  const { corretor } = useCorretor();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Hide initial tooltip after 8s and persist
  useEffect(() => {
    if (!tooltip) return;
    const t = setTimeout(() => {
      setTooltip(false);
      sessionStorage.setItem("uhome_tooltip_dismissed", "1");
    }, 8000);
    return () => clearTimeout(t);
  }, [tooltip]);

  // Retargeting popup: show after user viewed 3+ properties
  useEffect(() => {
    if (sessionStorage.getItem("uhome_retargeting_dismissed") === "1") return;

    const check = () => {
      const viewedRaw = localStorage.getItem("imoveis_vistos");
      if (!viewedRaw) return;
      try {
        const viewed = JSON.parse(viewedRaw);
        if (Array.isArray(viewed) && viewed.length >= 3) {
          setTooltip(false); // hide default tooltip
          setRetargetingPopup(true);
        }
      } catch { /* ignore */ }
    };

    // Check after delay and periodically
    const t = setTimeout(check, 5000);
    const interval = setInterval(check, 8000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

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

  const handleRetargetingClick = () => {
    const url = corretor
      ? buildCorretorWhatsAppUrl(corretor.nome, corretor.telefone)
      : buildWhatsAppUrl("Olá! Estou vendo vários imóveis no site e gostaria de receber uma seleção personalizada.");

    trackWhatsAppClick({ origem_pagina: window.location.pathname });
    trackClickWhatsapp({ origem_componente: "retargeting_popup" });
    window.open(url, "_blank", "noopener");
    dismissRetargeting();
  };

  const dismissRetargeting = () => {
    setRetargetingPopup(false);
    sessionStorage.setItem("uhome_retargeting_dismissed", "1");
  };

  if (window.location.pathname.startsWith("/admin")) return null;

  const showBubble = retargetingPopup || tooltip;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-[4.5rem] right-3 z-[60] sm:bottom-6 sm:right-6 flex flex-col items-end gap-2"
        >
          {/* Retargeting popup (priority over tooltip) */}
          <AnimatePresence>
            {retargetingPopup && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative mr-1 w-[240px] rounded-2xl bg-card p-4 shadow-xl border border-border"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); dismissRetargeting(); }}
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                >
                  <X className="h-3 w-3" />
                </button>

                <div className="flex items-start gap-2 mb-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-body text-sm font-bold text-foreground leading-tight">
                      Gostou dos imóveis?
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      Receba uma lista personalizada no WhatsApp — grátis!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRetargetingClick}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition-transform hover:bg-[#20bd5a] active:scale-95"
                >
                  <MessageCircle className="h-4 w-4" />
                  Receber lista
                </button>

                {/* Speech bubble tail */}
                <div className="absolute -bottom-2 right-6 h-0 w-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-card drop-shadow-sm" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Default tooltip (only if no retargeting) */}
          <AnimatePresence>
            {tooltip && !retargetingPopup && (
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

          {/* WhatsApp Button */}
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
