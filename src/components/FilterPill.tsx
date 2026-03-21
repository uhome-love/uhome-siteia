import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterPillProps {
  label: string;
  value?: string;
  active?: boolean;
  children: React.ReactNode;
  onClear?: () => void;
}

export function FilterPill({ label, value, active, children, onClear }: FilterPillProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-body text-[13px] font-medium transition-all active:scale-[0.97] ${
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:border-primary"
        }`}
      >
        <span className="whitespace-nowrap">{value || label}</span>
        {active && onClear ? (
          <X
            className="h-3.5 w-3.5 opacity-70 hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onClear(); setOpen(false); }}
          />
        ) : (
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border border-border bg-card p-2 shadow-xl"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Reusable option button for inside pills */
export function PillOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full rounded-lg px-3 py-2 text-left font-body text-[13px] transition-colors ${
        selected
          ? "bg-primary/10 font-medium text-primary"
          : "text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
