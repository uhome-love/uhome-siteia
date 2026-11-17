import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

/** Load below-the-fold tools shortly before they enter view, not before the hero. */
export function DeferredFoco({ children, minHeight }: { children: ReactNode; minHeight: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setReady(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setReady(true); observer.disconnect(); }
    }, { rootMargin: "400px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const placeholder = <div aria-busy="true" className="bg-muted/30" style={{ minHeight }} />;
  return <div ref={ref}>{ready ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}</div>;
}