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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex h-16 w-full items-center justify-between px-8">
        <Link to="/" className="flex items-center">
          <UhomeLogo variant="full" height={28} />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.match);
            return (
              <Link
                key={link.label}
                to={link.href}
                className={`rounded-full px-4 py-2 font-body text-sm transition-colors active:scale-[0.97] ${
                  isActive
                    ? "font-bold text-primary bg-primary/5"
                    : "font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/anunciar"
            className="rounded-full border-[1.5px] border-primary px-4 py-1.5 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-[0.97]"
          >
            Anuncie seu imóvel
          </Link>
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Heart className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <User className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-muted-foreground md:hidden"
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
