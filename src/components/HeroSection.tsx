import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
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
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="container-uhome relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 font-body text-sm font-semibold uppercase tracking-[0.2em] text-primary"
        >
          Porto Alegre & Região
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-3xl text-hero text-foreground sm:text-[56px] text-[36px] text-balance"
          style={{ lineHeight: 1.1 }}
        >
          Encontre o imóvel{" "}
          <span className="text-primary">perfeito</span> para você
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mx-auto mt-5 max-w-xl font-body text-base text-muted-foreground sm:text-lg"
        >
          Apartamentos, casas e coberturas com a curadoria UHome. Busca inteligente por IA.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mt-10 max-w-2xl"
        >
          {/* Input */}
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2 shadow-xl shadow-primary/5">
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
                className="rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
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
