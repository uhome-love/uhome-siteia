import { MapPin } from "lucide-react";

interface PropertyMapProps {
  neighborhood: string;
  city: string;
  lat?: number;
  lng?: number;
}

export function PropertyMap({ neighborhood, city, lat = -30.0277, lng = -51.2287 }: PropertyMapProps) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.005}%2C${lng + 0.008}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 p-5 pb-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Localização</h3>
          <p className="font-body text-xs text-muted-foreground">
            {neighborhood}, {city}
          </p>
        </div>
      </div>

      <div className="mt-4 aspect-[16/9] w-full">
        <iframe
          title="Mapa do imóvel"
          src={mapUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="flex flex-wrap gap-2 p-5">
        {["Supermercado", "Escola", "Parque", "Farmácia", "Restaurantes"].map((poi) => (
          <span
            key={poi}
            className="rounded-full border border-border px-3 py-1 font-body text-xs text-muted-foreground"
          >
            📍 {poi} próximo
          </span>
        ))}
      </div>
    </div>
  );
}
