import { useState, useEffect } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buildWhatsAppUrl, buildCorretorWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/services/whatsappTracker";
import { trackClickWhatsapp } from "@/lib/gtag";
import { useCorretor } from "@/contexts/CorretorContext";

export function RetargetingBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { corretor } = useCorretor();

  useEffect(() => {
    if (dismissed) return;
    const viewedRaw = localStorage.getItem("imoveis_vistos");
    if (!viewedRaw) return;
    try {
      const viewed = JSON.parse(viewedRaw);
      if (Array.isArray(viewed) && viewed.length >= 3) {
        // Show after a small delay
        const t = setTimeout(() => setShow(true), 2000);
        return () => clearTimeout(t);
      }
    } catch { /* ignore */ }
  }, [dismissed]);

  // Also check on route changes
  useEffect(() => {
    if (dismissed || show) return;
    const check = () => {
      const viewedRaw = localStorage.getItem("imoveis_vistos");
      if (!viewedRaw) return;
      try {
        const viewed = JSON.parse(viewedRaw);
        if (Array.isArray(viewed) && viewed.length >= 3) setShow(true);
      } catch { /* ignore */ }
    };
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [dismissed, show]);

  const handleClick = () => {
    const url = corretor
      ? buildCorretorWhatsAppUrl(corretor.nome, corretor.telefone)
      : buildWhatsAppUrl("Olá! Estou vendo vários imóveis no site e gostaria de receber uma seleção personalizada.");

    trackWhatsAppClick({ origem_pagina: window.location.pathname });
    trackClickWhatsapp({ origem_componente: "retargeting_banner" });
    window.open(url, "_blank", "noopener");
    setDismissed(true);
    setShow(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem("uhome_retargeting_dismissed", "1");
  };

  // Don't show if already dismissed this session or on admin
  if (sessionStorage.getItem("uhome_retargeting_dismissed") === "1") return null;
  if (window.location.pathname.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-0 right-0 top-0 z-[70] border-b border-primary/20 bg-primary/5 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-body text-sm font-bold text-foreground">
                  Gostou dos imóveis que viu?
                </p>
                <p className="font-body text-xs text-muted-foreground hidden sm:block">
                  Receba uma lista personalizada no seu WhatsApp — é grátis!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClick}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition-transform hover:bg-[#20bd5a] active:scale-95"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Receber lista</span>
                <span className="sm:hidden">WhatsApp</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
