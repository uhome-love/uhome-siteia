import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check } from "lucide-react";
import { submitLead } from "@/services/leads";
import { toast } from "sonner";

export function ExitIntentModal() {
  const [show, setShow] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("uhome_exit_shown");
    if (shown) return;

    // Desktop: mouse leaves top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        sessionStorage.setItem("uhome_exit_shown", "1");
        setShow(true);
      }
    };

    // Mobile: 60s timeout
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem("uhome_exit_shown")) {
        sessionStorage.setItem("uhome_exit_shown", "1");
        setShow(true);
      }
    }, 60000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefone.trim()) return;
    setLoading(true);
    try {
      await submitLead({
        nome: "Via Exit Intent",
        telefone: telefone.trim(),
        origem_componente: "exit_intent",
      });
      setSuccess(true);
      toast.success("Pronto! Um corretor entrará em contato.");
      setTimeout(() => setShow(false), 2000);
    } catch {
      toast.error("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
          >
            <button
              onClick={() => setShow(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {success ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <p className="font-body text-sm text-foreground">Entraremos em contato em breve!</p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl font-bold" style={{ color: "var(--gray-900)" }}>
                  Ainda procurando?
                </h3>
                <p className="mt-2 font-body text-sm" style={{ color: "var(--gray-500)" }}>
                  Deixe seu WhatsApp — um corretor responde em até 1h, sem compromisso.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                  <input
                    type="tel"
                    placeholder="Seu WhatsApp"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full rounded-xl border-[1.5px] bg-white px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    style={{ borderColor: "var(--gray-300)", color: "var(--gray-900)" }}
                    maxLength={20}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex w-full items-center justify-center gap-2 py-3 font-body text-sm font-semibold disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Quero ser contactado
                  </button>
                </form>

                <button
                  onClick={() => setShow(false)}
                  className="mt-3 w-full text-center font-body text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Não, obrigado
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
