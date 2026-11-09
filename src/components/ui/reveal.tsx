import { useEffect, useRef, useState, type ReactNode } from "react";

/** Faz o bloco surgir suavemente quando entra na tela (uma vez só). */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setShow(true);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShow(true); io.disconnect(); }
    }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`${show ? "uh-rise" : "opacity-0 motion-reduce:opacity-100"} ${className}`}>{children}</div>;
}
