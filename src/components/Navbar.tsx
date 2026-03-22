import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UhomeLogo } from "@/components/UhomeLogo";
import { UserMenu } from "@/components/UserMenu";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isSearchPage = location.pathname === "/busca";
  const modoIA = searchParams.get("modo") === "ia";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50">
      <div className="relative flex h-16 w-full items-center justify-between px-5 sm:px-10">
        <Link to="/" className="flex items-center flex-shrink-0">
          <UhomeLogo variant="full" height={32} />
        </Link>

        {/* Desktop — centered pill toggle */}
        <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 rounded-full bg-secondary p-1 gap-0.5">
          <Link
            to="/busca?finalidade=venda"
            className={`rounded-full px-[18px] py-[7px] text-[14px] font-semibold transition-all whitespace-nowrap ${
              isSearchPage && !modoIA
                ? "bg-background text-foreground shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Comprar
          </Link>
          <Link
            to="/busca?modo=ia"
            className={`rounded-full px-[18px] py-[7px] text-[14px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              isSearchPage && modoIA
                ? "bg-background text-primary shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Busca IA
          </Link>
          <Link
            to="/onboarding"
            className="rounded-full px-[18px] py-[7px] text-[14px] font-semibold transition-all whitespace-nowrap text-muted-foreground hover:text-foreground"
          >
            Busca guiada
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex flex-shrink-0">
          <Link
            to="/avaliar-imovel"
            className="rounded-full px-4 py-2 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-[0.97]"
          >
            Quanto vale meu imóvel?
          </Link>
          <Link
            to="/anunciar"
            className="rounded-full border-[1.5px] border-primary px-[18px] py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-[0.97]"
          >
            Anuncie seu imóvel
          </Link>
          <Link
            to="/faq"
            className="rounded-full px-4 py-2 font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Ajuda
          </Link>
          <UserMenu />
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <UserMenu />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full p-2 text-foreground"
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
            className="border-t border-border bg-background md:hidden"
          >
            <div className="flex flex-col gap-4 px-8 py-6">
              {/* Mobile pill toggle */}
              <div className="flex items-center rounded-full bg-secondary p-1 gap-0.5 self-start">
                <Link
                  to="/busca?finalidade=venda"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    isSearchPage && !modoIA
                      ? "bg-background text-foreground shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
                      : "text-muted-foreground"
                  }`}
                >
                  Comprar
                </Link>
                <Link
                  to="/busca?modo=ia"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isSearchPage && modoIA
                      ? "bg-background text-primary shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
                      : "text-muted-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Busca IA
                </Link>
              </div>

              <Link
                to="/condominios"
                onClick={() => setMobileOpen(false)}
                className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Condomínios
              </Link>
              <Link
                to="/bairros"
                onClick={() => setMobileOpen(false)}
                className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Bairros
              </Link>
              <Link
                to="/anunciar"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-block rounded-full border-[1.5px] border-primary px-5 py-2.5 text-center font-body text-base font-semibold text-primary"
              >
                Anuncie seu imóvel
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
