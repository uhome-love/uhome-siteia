import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X, Sparkles } from "lucide-react";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
import { buildWhatsAppUrl, buildCorretorWhatsAppUrl } from "@/lib/whatsapp";
import { useCorretor } from "@/contexts/CorretorContext";
import { useWhatsAppLeadStore } from "@/stores/whatsappLeadStore";

export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(() => {
    return sessionStorage.getItem("uhome_tooltip_dismissed") !== "1";
  });
  const [retargetingPopup, setRetargetingPopup] = useState(false);
  const { corretor } = useCorretor();
  const openModal = useWhatsAppLeadStore((s) => s.openModal);
  const location = useLocation();

  // Hide on property detail pages in mobile — the sticky bottom CTA handles it
  const isPropertyPage = location.pathname.startsWith("/imovel/");
  // Pages with sticky bottom bars need extra offset
  const hasBottomBar = location.pathname === "/busca" || isPropertyPage;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!tooltip) return;
    const t = setTimeout(() => {
      setTooltip(false);
      sessionStorage.setItem("uhome_tooltip_dismissed", "1");
    }, 8000);
    return () => clearTimeout(t);
  }, [tooltip]);

  useEffect(() => {
    if (sessionStorage.getItem("uhome_retargeting_dismissed") === "1") return;

    const check = () => {
      if (sessionStorage.getItem("uhome_retargeting_dismissed") === "1") {
        clearInterval(interval);
        return;
      }
      const viewedRaw = localStorage.getItem("imoveis_vistos");
      if (!viewedRaw) return;
      try {
        const viewed = JSON.parse(viewedRaw);
        if (Array.isArray(viewed) && viewed.length >= 3) {
          setTooltip(false);
          setRetargetingPopup(true);
          clearInterval(interval);
        }
      } catch { /* ignore */ }
    };

    const t = setTimeout(check, 5000);
    const interval = setInterval(check, 8000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  // Extract imovel data from URL when on a property page
  const imovelMatch = location.pathname.match(/^\/imovel\/([^/]+)/);
  const currentImovelSlug = imovelMatch ? imovelMatch[1] : undefined;

  const handleClick = () => {
    const imovelData = currentImovelSlug ? { slug: currentImovelSlug } : undefined;
    const url = corretor
      ? buildCorretorWhatsAppUrl(corretor.nome, corretor.telefone, imovelData)
      : currentImovelSlug
        ? buildWhatsAppUrl(undefined, imovelData)
        : buildWhatsAppUrl("Olá! Vim pelo site da Uhome e gostaria de falar com um corretor.");

    openModal({
      whatsappUrl: url,
      origem_componente: "floating_whatsapp",
      imovel_slug: currentImovelSlug,
    });
  };

  const handleRetargetingClick = () => {
    const imovelData = currentImovelSlug ? { slug: currentImovelSlug } : undefined;
    const url = corretor
      ? buildCorretorWhatsAppUrl(corretor.nome, corretor.telefone, imovelData)
      : currentImovelSlug
        ? buildWhatsAppUrl(undefined, imovelData)
        : buildWhatsAppUrl("Olá! Estou vendo vários imóveis no site e gostaria de receber uma seleção personalizada.");

    openModal({
      whatsappUrl: url,
      origem_componente: "retargeting_popup",
      imovel_slug: currentImovelSlug,
    });
    dismissRetargeting();
  };

  const dismissRetargeting = () => {
    setRetargetingPopup(false);
    sessionStorage.setItem("uhome_retargeting_dismissed", "1");
  };

  if (window.location.pathname.startsWith("/admin")) return null;

  return visible ? (
    <div className={`fixed right-3 z-[60] flex flex-col items-end gap-2 transition-[bottom] duration-300 sm:bottom-6 sm:right-6 ${hasBottomBar ? "bottom-[7.5rem]" : "bottom-[4.5rem]"}`}>
      {retargetingPopup && (
        <div
          className="relative mr-1 w-[240px] rounded-2xl bg-card p-4 shadow-xl border border-border animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <button
            onClick={(e) => { e.stopPropagation(); dismissRetargeting(); }}
            aria-label="Fechar popup"
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
            <WhatsAppIcon className="h-4 w-4" />
            Receber lista
          </button>

          <div className="absolute -bottom-2 right-6 h-0 w-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-card drop-shadow-sm" />
        </div>
      )}

      {tooltip && !retargetingPopup && (
        <div
          className="relative mr-1 max-w-[200px] rounded-xl bg-card px-4 py-2.5 shadow-lg border border-border animate-in fade-in slide-in-from-right-2 duration-300"
        >
          <button
            onClick={(e) => { e.stopPropagation(); setTooltip(false); sessionStorage.setItem("uhome_tooltip_dismissed", "1"); }}
            aria-label="Fechar dica"
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
          >
            <X className="h-3 w-3" />
          </button>
          <p className="font-body text-xs font-medium text-foreground">
            Precisa de ajuda? Fale com um corretor!
          </p>
        </div>
      )}

      <button
        onClick={handleClick}
        aria-label="Falar no WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </button>
    </div>
  ) : null;
}

export default FloatingWhatsApp;
