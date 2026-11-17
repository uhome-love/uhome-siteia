import { useEffect, useRef, useState } from "react";
import miniaturas from "@/data/miniaturas.json";

const MINI = miniaturas as Record<string, string>;

/** Versão leve (WebP no tamanho do card) quando existe; senão a original. */
export function miniatura(url?: string | null) {
  return url ? MINI[url] ?? url : "";
}

/** Foto abaixo da dobra: só pede o arquivo quando chega perto da tela e usa a versão leve do card. */
export function FotoPerto({ src, alt, className, margem = "300px" }: { src: string; alt: string; className?: string; margem?: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [perto, setPerto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || perto) return;
    if (typeof IntersectionObserver === "undefined") { setPerto(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setPerto(true); io.disconnect(); } }, { rootMargin: margem });
    io.observe(el);
    return () => io.disconnect();
  }, [perto, margem]);
  return <img ref={ref} src={perto ? miniatura(src) : undefined} alt={alt} decoding="async" className={className} />;
}
