import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

const MAPBOX_TOKEN = "pk.eyJ1IjoibHVjYXN1aG9tZSIsImEiOiJjbW16c2l2dmUwYmxsMnJwdDI2bGxrazBkIn0.B4dp727gJlQQIWTci7GpFQ";

interface PropertyMapProps {
  neighborhood: string;
  city: string;
  lat?: number;
  lng?: number;
}

export function PropertyMap({ neighborhood, city, lat = -30.0277, lng = -51.2287 }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) {
      setMapError(true);
      return;
    }

    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !mapContainer.current) return;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css";
      document.head.appendChild(link);

      mapboxgl.default.accessToken = MAPBOX_TOKEN!;

      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [lng, lat],
        zoom: 15,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      new mapboxgl.default.Marker({ color: "hsl(39, 70%, 66%)" })
        .setLngLat([lng, lat])
        .addTo(map);

      mapRef.current = map;
    }).catch(() => {
      setMapError(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove?.();
      mapRef.current = null;
    };
  }, [lat, lng]);

  const fallbackMap = mapError || !MAPBOX_TOKEN;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.005}%2C${lng + 0.008}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 p-5 pb-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Localização</h3>
          <p className="font-body text-xs text-muted-foreground">{neighborhood}, {city}</p>
        </div>
      </div>

      <div className="mt-4 aspect-[16/9] w-full">
        {fallbackMap ? (
          <iframe title="Mapa do imóvel" src={mapUrl} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <div ref={mapContainer} className="h-full w-full" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 p-5">
        {["Supermercado", "Escola", "Parque", "Farmácia", "Restaurantes"].map((poi) => (
          <span key={poi} className="rounded-full border border-border px-3 py-1 font-body text-xs text-muted-foreground">
            📍 {poi} próximo
          </span>
        ))}
      </div>
    </div>
  );
}
