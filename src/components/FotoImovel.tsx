import { useState, useEffect, forwardRef, useCallback } from "react";
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

  // Timeout: if image takes > 10s, show fallback
  useEffect(() => {
    if (loaded || erro) return;
    const t = setTimeout(() => {
      if (!loaded) handleErr();
    }, 10000);
    return () => clearTimeout(t);
  }, [loaded, erro, src, handleErr]);

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
    <div className="relative h-full w-full overflow-hidden" style={style}>
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
        fetchPriority={fetchPriority}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ ...style, willChange: loaded ? undefined : "opacity" }}
        width={width || 400}
        height={height || 300}
        sizes={sizes}
        onLoad={handleLoad}
        onError={() => setErro(true)}
        {...(!loaded && { "data-loading": "true" })}
      />
    </div>
  );
});
