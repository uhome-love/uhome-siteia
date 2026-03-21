import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const DISMISSED_KEY = "uhome_float_dismissed";
const WHATSAPP_NUMBER = "5551999999999";

export function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      if (elapsed < 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }

    const timer = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  const handleClick = () => {
    const msg = encodeURIComponent("Olá! Vim pelo site da Uhome e gostaria de saber mais sobre os imóveis disponíveis.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 bg-primary"
        >
          <p className="flex-1 font-body text-sm font-semibold text-white">
            Corretor disponível agora
          </p>
          <button
            onClick={handleClick}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 font-body text-sm font-bold text-primary transition-all hover:brightness-95 active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4" style={{ color: "#25D366" }} />
            Falar no WhatsApp
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-white/70 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
