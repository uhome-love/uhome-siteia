import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/services/whatsappTracker";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * Persistent WhatsApp floating button — always visible, not dismissable.
 * Hidden on mobile in property detail pages (which have their own fixed CTA bar).
 */
export function FloatingWhatsApp() {
  const location = useLocation();
  const isPropertyDetail = location.pathname.startsWith("/imovel/");

  const handleClick = () => {
    trackWhatsAppClick({ origem_pagina: location.pathname });
    window.open(buildWhatsAppUrl(), "_blank");
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleClick}
      aria-label="Falar no WhatsApp"
      className={`fixed right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition-all hover:scale-105 hover:shadow-[0_6px_20px_rgba(37,211,102,0.5)] active:scale-95 ${
        isPropertyDetail ? "bottom-20 sm:bottom-5" : "bottom-5"
      }`}
      style={{ background: "#25D366" }}
    >
      <MessageCircle className="h-6 w-6 text-white" fill="white" />
    </motion.button>
  );
}
