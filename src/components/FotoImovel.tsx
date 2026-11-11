import { useState, useEffect, forwardRef, useCallback, useRef } from "react";
import { Home } from "lucide-react";

interface FotoImovelProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: "eager" | "lazy";
  decoding?: "async" | "auto" | "sync";
  fetchPriority?: "high" | "low" | "auto";
  width?: number;
  height?: number;
  sizes?: string;
  onError?: () => void;
}

export const FotoImovel = forwardRef<HTMLImageElement, FotoImovelProps>(function FotoImovel(
  { src, alt, className = "", style, loading = "lazy", decoding = "async", fetchPriority, width, height, sizes, onError },
  ref
) {
  const [erro, setErro] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleErr = useCallback(() => {
    setErro(true);
    onError?.();
  }, [onError]);

  // O prazo de 10s só começa quando a foto chega perto da tela. Antes, fotos
  // "lazy" fora da tela estouravam o prazo sem nem começar a baixar, e os cards sumiam.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [naTela, setNaTela] = useState(loading === "eager");
  useEffect(() => {
    if (naTela || !wrapRef.current || typeof IntersectionObserver === "undefined") { if (!naTela) setNaTela(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setNaTela(true); io.disconnect(); } }, { rootMargin: "200px" });
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [naTela]);

  // Timeout: if image takes > 10s after entering view, show fallback
  useEffect(() => {
    if (loaded || erro || !naTela) return;
    const t = setTimeout(() => {
      if (!loaded) handleErr();
    }, 10000);
    return () => clearTimeout(t);
  }, [loaded, erro, src, handleErr, naTela]);

  if (erro) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${className}`}
        style={style}
      >
        <Home className="h-8 w-8 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden" style={style}>
      {/* Skeleton placeholder — visible until image loads */}
      {!loaded && (
        <div
          className={`absolute inset-0 animate-pulse bg-muted ${className}`}
          style={{ aspectRatio: style?.aspectRatio }}
        />
      )}
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        {...(fetchPriority ? { fetchpriority: fetchPriority } : {})}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ ...style, willChange: loaded ? undefined : "opacity" }}
        width={width || 400}
        height={height || 300}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleErr}
        {...(!loaded && { "data-loading": "true" })}
      />
    </div>
  );
});
