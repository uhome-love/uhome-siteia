import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const propertyTypes = ["Apartamento", "Casa", "Cobertura", "Studio", "Comercial"];

export function HeroSection() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    navigate(`/busca?finalidade=venda&q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-16">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-accent/8 blur-[100px]" />
      </div>

      <div className="container-uhome relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 font-body text-sm font-medium uppercase tracking-[0.2em] text-primary"
        >
          Porto Alegre & Região
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-3xl font-display text-4xl font-bold leading-[1.1] text-foreground sm:text-5xl lg:text-6xl text-balance"
        >
          Encontre o imóvel{" "}
          <span className="text-gradient-gold">perfeito</span> para você
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mx-auto mt-5 max-w-xl font-body text-base text-muted-foreground sm:text-lg"
        >
          Apartamentos, casas e coberturas com a curadoria Uhome. Busca inteligente por IA.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mt-10 max-w-2xl"
        >
          {/* Tabs */}
          <div className="mb-4 flex items-center justify-center gap-2">
            {quickFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-full px-5 py-2 font-body text-sm font-medium transition-all duration-200 ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="glass flex items-center gap-3 rounded-2xl p-2 shadow-2xl shadow-black/20">
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Bairro, cidade ou tipo de imóvel..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            >
              Buscar
            </button>
          </div>

          {/* Quick type tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => navigate(`/busca?tipo=${type.toLowerCase()}`)}
                className="rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {type}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
