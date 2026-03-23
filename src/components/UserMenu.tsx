import { useState, useRef, useEffect } from "react";
import { User, Heart, Search, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          aria-label="Entrar na conta"
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-2 font-body text-sm font-medium text-foreground transition-colors hover:bg-secondary active:scale-[0.97]"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Entrar</span>
        </button>
        <AuthModal open={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  const displayName =
    user.user_metadata?.nome ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Usuário";
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 rounded-full border border-border px-2 py-1.5 transition-colors hover:bg-secondary active:scale-[0.97]"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {initials}
          </div>
        )}
        <span className="hidden max-w-[100px] truncate font-body text-sm font-medium text-foreground sm:block">
          {displayName.split(" ")[0]}
        </span>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-border bg-card p-1.5 shadow-xl"
          >
            <div className="px-3 py-2">
              <p className="truncate font-body text-sm font-semibold text-foreground">{displayName}</p>
              <p className="truncate font-body text-[11px] text-muted-foreground">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <Link
              to="/favoritos"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-body text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Heart className="h-4 w-4" />
              Meus favoritos
            </Link>
            <Link
              to="/busca"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-body text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Search className="h-4 w-4" />
              Minhas buscas
            </Link>
            <div className="my-1 h-px bg-border" />
            <button
              onClick={() => { signOut(); setMenuOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 font-body text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/5"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
