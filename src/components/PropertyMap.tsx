import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface PropertyMapProps {
  neighborhood: string;
  city: string;
  lat?: number;
  lng?: number;
}

export function PropertyMap({ neighborhood, city, lat = -30.0277, lng = -51.2287 }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [lng, lat],
      zoom: 15,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    new mapboxgl.Marker({ color: "hsl(39, 70%, 66%)" })
      .setLngLat([lng, lat])
      .addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [lat, lng]);

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
        <div ref={mapContainer} className="h-full w-full" />
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
