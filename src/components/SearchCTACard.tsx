import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/services/whatsappTracker";

export function SearchCTACard() {
  const handleClick = () => {
    const url = buildWhatsAppUrl(
      "Olá! Estou buscando imóveis no site da Uhome e gostaria de receber uma lista personalizada."
    );
    trackWhatsAppClick({ origem_pagina: "/busca" });
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="col-span-full flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.03] px-6 py-5">
      <div>
        <p className="font-body text-base font-bold text-foreground">
          Gostou de algum imóvel?
        </p>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Fale com um corretor agora e receba uma lista personalizada.
        </p>
      </div>
      <button
        onClick={handleClick}
        className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
      >
        <MessageCircle className="h-4 w-4" />
        Falar com corretor
      </button>
    </div>
  );
}
