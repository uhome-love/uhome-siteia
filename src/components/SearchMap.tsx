import { useEffect, useRef, useState } from "react";
import type { MockProperty } from "@/data/properties";

const MAPBOX_TOKEN = "pk.eyJ1IjoibHVjYXN1aG9tZSIsImEiOiJjbW16c2l2dmUwYmxsMnJwdDI2bGxrazBkIn0.B4dp727gJlQQIWTci7GpFQ";

interface SearchMapProps {
  properties: MockProperty[];
  onMarkerClick?: (id: string) => void;
}

export function SearchMap({ properties, onMarkerClick }: SearchMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Dynamically import mapbox-gl to avoid crash if not available
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) {
      setMapError(true);
      return;
    }

    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !mapContainer.current) return;

      // Load CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css";
      document.head.appendChild(link);

      mapboxgl.default.accessToken = MAPBOX_TOKEN!;

      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-51.18, -30.04],
        zoom: 12,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (!cancelled) setMapLoaded(true);
      });

      mapRef.current = { map, mapboxgl: mapboxgl.default };
    }).catch(() => {
      setMapError(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const { map, mapboxgl } = mapRef.current;

    markersRef.current.forEach((m: any) => m.remove());
    markersRef.current = [];

    if (properties.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    properties.forEach((p) => {
      const priceLabel =
        p.finalidade === "locacao"
          ? `R$${(p.price / 1000).toFixed(1)}k`
          : p.price >= 1000000
            ? `R$${(p.price / 1000000).toFixed(1)}M`
            : `R$${(p.price / 1000).toFixed(0)}k`;

      const el = document.createElement("button");
      el.className = "mapbox-price-pin";
      el.innerHTML = `<div class="pin-body"><span>${priceLabel}</span></div><div class="pin-arrow"></div>`;
      el.addEventListener("click", () => onMarkerClick?.(p.id));

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([p.lng, p.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 12, closeButton: false, maxWidth: "240px" }).setHTML(`
            <div style="font-family:'DM Sans',sans-serif;">
              <img src="${p.image}" alt="" style="width:100%;height:100px;object-fit:cover;border-radius:8px 8px 0 0;" />
              <div style="padding:8px 10px;">
                <p style="font-size:11px;font-weight:700;color:#fff;margin:0;">${p.title}</p>
                <p style="font-size:10px;color:#999;margin:4px 0 0;">${p.neighborhood}</p>
                <p style="font-size:13px;font-weight:700;color:hsl(39,70%,66%);margin:6px 0 0;">${p.priceFormatted}</p>
              </div>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([p.lng, p.lat]);
    });

    if (properties.length > 1) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 600 });
    } else {
      map.flyTo({ center: [properties[0].lng, properties[0].lat], zoom: 14, duration: 600 });
    }
  }, [properties, onMarkerClick, mapLoaded]);

  // Fallback if no token
  if (mapError) {
    return (
      <div className="relative flex h-full w-full items-center justify-center rounded-xl bg-secondary/30">
        <div className="glass rounded-2xl px-6 py-4 text-center">
          <p className="font-body text-sm font-semibold text-foreground">Mapa Interativo</p>
          <p className="mt-1 font-body text-xs text-muted-foreground">Configure VITE_MAPBOX_TOKEN para ativar</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .mapbox-price-pin { cursor:pointer;background:none;border:none;padding:0;transition:transform .15s ease-out; }
        .mapbox-price-pin:hover { transform:scale(1.12);z-index:10!important; }
        .mapbox-price-pin:active { transform:scale(0.96); }
        .pin-body { background:hsl(39 70% 66%);color:hsl(230 40% 8%);font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;padding:4px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 4px 12px hsl(0 0% 0%/.4); }
        .pin-arrow { width:0;height:0;margin:0 auto;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid hsl(39 70% 66%); }
        .mapboxgl-popup-content { background:hsl(230 30% 12%)!important;border:1px solid hsl(230 20% 18%)!important;border-radius:12px!important;padding:0!important;overflow:hidden;box-shadow:0 8px 32px hsl(0 0% 0%/.5)!important; }
        .mapboxgl-popup-tip { border-top-color:hsl(230 30% 12%)!important; }
      `}</style>
      <div ref={mapContainer} className="h-full w-full rounded-xl" />
    </>
  );
}
