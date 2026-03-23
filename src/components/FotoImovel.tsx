import { useState } from "react";
import { Home } from "lucide-react";

interface FotoImovelProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: "eager" | "lazy";
  decoding?: "async" | "auto" | "sync";
  width?: number;
  height?: number;
  sizes?: string;
}

export function FotoImovel({ src, alt, className = "", style, loading, decoding, width, height, sizes }: FotoImovelProps) {
  const [erro, setErro] = useState(false);

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
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={className}
      style={style}
      width={width}
      height={height}
      sizes={sizes}
      onError={() => setErro(true)}
    />
  );
}
