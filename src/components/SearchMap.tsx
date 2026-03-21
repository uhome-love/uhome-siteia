import type { MockProperty } from "@/data/properties";
import { MapPin } from "lucide-react";

interface SearchMapProps {
  properties: MockProperty[];
  onMarkerClick?: (id: string) => void;
}

export function SearchMap({ properties, onMarkerClick }: SearchMapProps) {
  // Placeholder map — will be replaced with Google Maps/Mapbox
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-secondary/30">
      {/* Map background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop')] bg-cover bg-center opacity-20" />

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="glass rounded-2xl px-6 py-4 text-center">
          <MapPin className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2 font-body text-sm font-semibold text-foreground">
            Mapa Interativo
          </p>
          <p className="mt-1 font-body text-xs text-muted-foreground">
            Google Maps / Mapbox será integrado aqui
          </p>
        </div>
      </div>

      {/* Mock pins */}
      {properties.slice(0, 8).map((p, i) => {
        const left = 15 + ((i * 37 + 13) % 70);
        const top = 15 + ((i * 29 + 7) % 65);
        return (
          <button
            key={p.id}
            onClick={() => onMarkerClick?.(p.id)}
            className="absolute z-10 transition-transform hover:scale-110 active:scale-95"
            style={{ left: `${left}%`, top: `${top}%` }}
            title={p.title}
          >
            <div className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 shadow-lg shadow-primary/20">
              <span className="font-body text-[10px] font-bold text-primary-foreground whitespace-nowrap">
                {p.finalidade === "locacao"
                  ? `R$${(p.price / 1000).toFixed(1)}k`
                  : p.price >= 1000000
                    ? `R$${(p.price / 1000000).toFixed(1)}M`
                    : `R$${(p.price / 1000).toFixed(0)}k`}
              </span>
            </div>
            <div className="mx-auto h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary" />
          </button>
        );
      })}
    </div>
  );
}
