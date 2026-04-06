import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCorretor } from "@/contexts/CorretorContext";

const examples = [
  "Apartamento 2 quartos perto do Parcão até R$3.000",
  "Cobertura com terraço no Moinhos",
  "Studio moderno até R$2.500/mês",
  "Casa com jardim e piscina em Três Figueiras",
];

export function AISearchSection() {
  const navigate = useNavigate();
  const { prefixLink } = useCorretor();

  return (
    <section className="py-24">
      <div className="container-uhome">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <h2 className="text-h2 text-foreground text-balance">
            Busque com inteligência artificial
          </h2>
          <p className="mt-4 font-body text-muted-foreground">
            Descreva o imóvel dos seus sonhos em linguagem natural. Nossa IA encontra as melhores opções para você.
          </p>

          {/* Search area */}
          <div className="mt-10 glass rounded-2xl p-6">
            <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-4">
              <Sparkles className="h-5 w-5 shrink-0 text-accent" />
              <input
                type="text"
                placeholder="Ex: Apartamento 3 quartos com varanda no Moinhos até R$ 1 milhão..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(prefixLink(`/busca?modo=ia&q=${encodeURIComponent((e.target as HTMLInputElement).value)}`));
                  }
                }}
              />
              <button
                onClick={() => navigate(prefixLink("/busca?modo=ia"))}
                aria-label="Buscar com IA"
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 active:scale-[0.97]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => navigate(prefixLink(`/busca?modo=ia&q=${encodeURIComponent(ex)}`))}
                  className="rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
