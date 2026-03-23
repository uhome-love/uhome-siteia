import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Menu, X, Sparkles, BarChart3, Building2, MapPin, HelpCircle, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UhomeLogo } from "@/components/UhomeLogo";
import { UserMenu } from "@/components/UserMenu";
import { useCorretor } from "@/contexts/CorretorContext";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchBusca } from "@/lib/prefetch";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { prefixLink } = useCorretor();
  const [bannerVisible, setBannerVisible] = useState(false);
  const queryClient = useQueryClient();

  const handlePrefetchBusca = useCallback(() => {
    prefetchBusca(queryClient);
  }, [queryClient]);

  useEffect(() => {
    const check = () => setBannerVisible(!!document.getElementById('banner-corretor-spacer'));
    check();
    window.addEventListener('corretor-ref-ready', check);
    const t = setTimeout(check, 2000);
    return () => { window.removeEventListener('corretor-ref-ready', check); clearTimeout(t); };
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isSearchPage = location.pathname === "/busca" || location.pathname.endsWith("/busca");
  const modoIA = searchParams.get("modo") === "ia";

  return (
    <nav className={`fixed left-0 right-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md ${bannerVisible ? 'top-10' : 'top-0'}`}>
      <div className="relative mx-auto flex h-16 w-full max-w-[1440px] items-center px-5 sm:px-8">
        {/* LEFT — Logo */}
        <Link to={prefixLink("/")} className="flex flex-shrink-0 items-center">
          <UhomeLogo variant="full" height={28} />
        </Link>

        {/* CENTER — Navigation */}
        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {/* Mode pills */}
          <div className="flex items-center gap-0.5 rounded-full bg-secondary/80 p-[3px]">
            <Link
              to={prefixLink("/busca?finalidade=venda")}
              onMouseEnter={handlePrefetchBusca}
              className={`rounded-full px-4 py-[6px] font-body text-[13px] font-semibold transition-all ${
                isSearchPage && !modoIA
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Comprar
            </Link>
            <Link
              to={prefixLink("/busca?modo=ia")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-[6px] font-body text-[13px] font-semibold transition-all ${
                isSearchPage && modoIA
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Busca IA
            </Link>
          </div>

          {/* Divider */}
          <div className="mx-3 h-5 w-px bg-border" />

          {/* Value links */}
          <Link
            to={prefixLink("/avaliar-imovel")}
            className="rounded-full px-3.5 py-[6px] font-body text-[13px] font-medium text-primary transition-colors hover:bg-primary/5 active:scale-[0.97]"
          >
            Quanto vale meu imóvel?
          </Link>
          <Link
            to={prefixLink("/faq")}
            className="rounded-full px-3.5 py-[6px] font-body text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Ajuda
          </Link>
        </div>

        {/* RIGHT — CTAs + Auth */}
        <div className="hidden items-center gap-2 lg:flex flex-shrink-0">
          <Link
            to={prefixLink("/anunciar")}
            className="rounded-full border border-primary/30 bg-primary/5 px-4 py-[7px] font-body text-[13px] font-semibold text-primary transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.97]"
          >
            Anuncie seu imóvel
          </Link>
          <UserMenu />
        </div>

        {/* MOBILE — hamburger + user */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <UserMenu />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary active:scale-95"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-5">
              {/* Mode pills */}
              <div className="mb-3 flex items-center gap-1 self-start rounded-full bg-secondary/80 p-[3px]">
                <Link
                  to={prefixLink("/busca?finalidade=venda")}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-full px-4 py-2 font-body text-sm font-semibold transition-all ${
                    isSearchPage && !modoIA
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Comprar
                </Link>
                <Link
                  to={prefixLink("/busca?modo=ia")}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-body text-sm font-semibold transition-all ${
                    isSearchPage && modoIA
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Busca IA
                </Link>
              </div>

              <div className="my-1 h-px bg-border/60" />

              {/* Links */}
              <MobileNavLink
                to={prefixLink("/avaliar-imovel")}
                icon={<BarChart3 className="h-4 w-4" />}
                label="Quanto vale meu imóvel?"
                accent
                onClick={() => setMobileOpen(false)}
              />
              <MobileNavLink
                to={prefixLink("/bairros")}
                icon={<MapPin className="h-4 w-4" />}
                label="Bairros"
                onClick={() => setMobileOpen(false)}
              />
              <MobileNavLink
                to={prefixLink("/condominios")}
                icon={<Building2 className="h-4 w-4" />}
                label="Condomínios"
                onClick={() => setMobileOpen(false)}
              />
              <MobileNavLink
                to="/faq"
                icon={<HelpCircle className="h-4 w-4" />}
                label="Ajuda"
                onClick={() => setMobileOpen(false)}
              />

              <div className="my-1 h-px bg-border/60" />

              <Link
                to={prefixLink("/anunciar")}
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-5 py-3 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-[0.97]"
              >
                <Megaphone className="h-4 w-4" />
                Anuncie seu imóvel
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileNavLink({
  to,
  icon,
  label,
  accent,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 font-body text-sm font-medium transition-colors hover:bg-secondary active:scale-[0.98] ${
        accent ? "text-primary" : "text-foreground"
      }`}
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Link>
  );
}
