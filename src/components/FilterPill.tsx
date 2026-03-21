import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target) && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  // Reposition dropdown if it goes off-screen on desktop
  const adjustPosition = useCallback(() => {
    if (!dropdownRef.current || !ref.current || isMobile) return;
    const dropdown = dropdownRef.current;
    const pill = ref.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Position below the pill
    dropdown.style.position = "absolute";
    dropdown.style.top = `${pill.bottom + 8}px`;
    dropdown.style.left = `${pill.left}px`;

    // Check if overflowing right edge
    const rect = dropdown.getBoundingClientRect();
    if (rect.right > viewportWidth - 8) {
      dropdown.style.left = `${pill.left - (rect.right - viewportWidth + 8)}px`;
    }
    // Check if overflowing left edge
    const newRect = dropdown.getBoundingClientRect();
    if (newRect.left < 8) {
      dropdown.style.left = "8px";
    }
  }, [isMobile]);

  useEffect(() => {
    if (open && !isMobile) {
      requestAnimationFrame(adjustPosition);
    }
  }, [open, adjustPosition, isMobile]);

  const dropdownContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: isMobile ? 20 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isMobile ? 20 : -4 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-card p-3 pb-8 shadow-xl sm:absolute sm:bottom-auto sm:left-0 sm:right-auto sm:top-full sm:mt-2 sm:min-w-[200px] sm:rounded-xl sm:border sm:p-2 sm:pb-2"
            style={!isMobile ? { position: "fixed" } : undefined}
          >
            {/* Mobile drag handle */}
            <div className="mb-3 flex justify-center sm:hidden">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>
            <p className="mb-2 px-1 font-body text-sm font-semibold text-foreground sm:hidden">
              {label}
            </p>
            {children}
            {/* Mobile apply button */}
            <div className="mt-3 sm:hidden">
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-primary py-3 font-body text-sm font-semibold text-primary-foreground transition-all active:scale-[0.97]"
              >
                Aplicar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
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

      {/* Render dropdown via portal to escape overflow clipping */}
      {createPortal(dropdownContent, document.body)}
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
      className={`block w-full rounded-lg px-3 py-2.5 text-left font-body text-sm transition-colors sm:py-2 sm:text-[13px] ${
        selected
          ? "bg-primary/10 font-medium text-primary"
          : "text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
