import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MockProperty } from "@/data/properties";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface SearchMapProps {
  properties: MockProperty[];
  onMarkerClick?: (id: string) => void;
}

export function SearchMap({ properties, onMarkerClick }: SearchMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Init map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-51.18, -30.04],
      zoom: 12,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
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

      // Custom marker element
      const el = document.createElement("button");
      el.className = "mapbox-price-pin";
      el.innerHTML = `
        <div class="pin-body">
          <span>${priceLabel}</span>
        </div>
        <div class="pin-arrow"></div>
      `;
      el.addEventListener("click", () => onMarkerClick?.(p.id));
      el.addEventListener("mouseenter", () => setHoveredId(p.id));
      el.addEventListener("mouseleave", () => setHoveredId(null));

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([p.lng, p.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 12, closeButton: false, maxWidth: "240px" }).setHTML(`
            <div style="font-family: 'DM Sans', sans-serif;">
              <img src="${p.image}" alt="" style="width:100%;height:100px;object-fit:cover;border-radius:8px 8px 0 0;" />
              <div style="padding:8px 10px;">
                <p style="font-size:11px;font-weight:700;color:#fff;margin:0;">${p.title}</p>
                <p style="font-size:10px;color:#999;margin:4px 0 0;">${p.neighborhood}</p>
                <p style="font-size:13px;font-weight:700;color:hsl(39,70%,66%);margin:6px 0 0;">${p.priceFormatted}</p>
              </div>
            </div>
          `)
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
      bounds.extend([p.lng, p.lat]);
    });

    if (properties.length > 1) {
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 600 });
    } else {
      map.current.flyTo({ center: [properties[0].lng, properties[0].lat], zoom: 14, duration: 600 });
    }
  }, [properties, onMarkerClick]);

  return (
    <>
      <style>{`
        .mapbox-price-pin {
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          transition: transform 0.15s ease-out;
        }
        .mapbox-price-pin:hover { transform: scale(1.12); z-index: 10 !important; }
        .mapbox-price-pin:active { transform: scale(0.96); }
        .pin-body {
          background: hsl(39 70% 66%);
          color: hsl(230 40% 8%);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 999px;
          white-space: nowrap;
          box-shadow: 0 4px 12px hsl(0 0% 0% / 0.4);
        }
        .pin-arrow {
          width: 0; height: 0;
          margin: 0 auto;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid hsl(39 70% 66%);
        }
        .mapboxgl-popup-content {
          background: hsl(230 30% 12%) !important;
          border: 1px solid hsl(230 20% 18%) !important;
          border-radius: 12px !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 8px 32px hsl(0 0% 0% / 0.5) !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: hsl(230 30% 12%) !important;
        }
      `}</style>
      <div ref={mapContainer} className="h-full w-full rounded-xl" />
    </>
  );
}
