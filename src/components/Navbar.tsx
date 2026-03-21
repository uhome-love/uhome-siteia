import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UhomeLogo } from "@/components/UhomeLogo";

const navLinks = [
  { label: "Comprar", href: "/busca?finalidade=venda", match: "/busca" },
  { label: "Busca IA", href: "/ia-search", match: "/ia-search" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50">
      <div className="relative flex h-16 w-full items-center justify-between px-10">
        <Link to="/" className="flex items-center flex-shrink-0">
          <UhomeLogo variant="full" height={32} />
        </Link>

        {/* Desktop — centered nav */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.match);
            return (
              <Link
                key={link.label}
                to={link.href}
                className={`rounded-full px-[18px] py-2 text-[15px] transition-colors active:scale-[0.97] ${
                  isActive
                    ? "font-bold text-primary bg-primary/5"
                    : "font-medium text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex flex-shrink-0">
          <Link
            to="/anunciar"
            className="rounded-full border-[1.5px] border-primary px-[18px] py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-[0.97]"
          >
            Anuncie seu imóvel
          </Link>
          <button className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary">
            <Heart className="h-5 w-5" />
          </button>
          <button className="rounded-full border-[1.5px] border-border px-3 py-1.5 flex items-center gap-1.5 text-foreground transition-colors hover:border-foreground/40">
            <Menu className="h-4 w-4" />
            <User className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-full p-2 text-foreground md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-body text-lg text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
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
