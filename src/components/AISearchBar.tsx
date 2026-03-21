import { useState } from "react";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const suggestions = [
  "2 quartos Moinhos",
  "Studio até R$2.500",
  "Casa com piscina Ipanema",
  "Cobertura Bela Vista",
  "Apartamento pet friendly Petrópolis",
  "3 dormitórios Boa Vista até 800k",
];

interface AISearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function AISearchBar({ onSearch, loading = false }: AISearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed);
  };

  return (
    <div className="w-full">
      {/* Input */}
      <div className="relative flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors focus-within:border-accent/50">
        <Sparkles className="h-5 w-5 shrink-0 text-accent" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ex: apartamento 2 quartos no Moinhos até R$ 3.000/mês..."
          className="flex-1 bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 font-body text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4 animate-pulse text-accent" />
            <span className="font-body text-sm text-accent animate-pulse">
              Interpretando sua busca...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestion chips */}
      {!loading && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                onSearch(s);
              }}
              className="rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground active:scale-[0.97]"
            >
              "{s}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
