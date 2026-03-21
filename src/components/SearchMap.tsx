import { useRef, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { type Imovel } from "@/services/imoveis";

const MAPBOX_TOKEN = "pk.eyJ1IjoibHVjYXN1aG9tZSIsImEiOiJjbW16c2l2dmUwYmxsMnJwdDI2bGxrazBkIn0.B4dp727gJlQQIWTci7GpFQ";

mapboxgl.accessToken = MAPBOX_TOKEN;

function formatPin(preco: number): string {
  if (!preco || preco === 0) return "";
  if (preco >= 1_000_000) return `R$${(preco / 1_000_000).toFixed(1)}M`;
  if (preco >= 1_000) return `R$${Math.round(preco / 1_000)}k`;
  return `R$${preco}`;
}

function coordsValidas(lat: number, lng: number): boolean {
  return lat < -28 && lat > -32 && lng < -49 && lng > -54;
}

interface SearchMapProps {
  imoveis?: Imovel[];
  hoveredId?: string | null;
  onPinHover?: (id: string | null) => void;
  onBoundsSearch?: (bounds: { lat_min: number; lat_max: number; lng_min: number; lng_max: number }) => void;
}

export function SearchMap({ imoveis = [], hoveredId, onPinHover, onBoundsSearch }: SearchMapProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const markerElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const mapaReadyRef = useRef(false);
  const pendingImoveisRef = useRef<Imovel[]>(imoveis);
  const boundsRef = useRef<mapboxgl.LngLatBounds | null>(null);
  const [mapMoved, setMapMoved] = useState(false);

  const renderPins = useCallback((map: mapboxgl.Map, lista: Imovel[]) => {
    const idsNovos = new Set(lista.map((i) => i.id));

    markersRef.current.forEach((marker, id) => {
      if (!idsNovos.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
        markerElementsRef.current.delete(id);
      }
    });

    lista.forEach((imovel) => {
      if (markersRef.current.has(imovel.id)) return;

      const lat = Number(imovel.latitude);
      const lng = Number(imovel.longitude);
      if (!coordsValidas(lat, lng)) return;

      const label = formatPin(Number(imovel.preco));
      if (!label) return;

      const el = document.createElement("div");
      el.textContent = label;
      el.style.cssText = `
        background: white;
        color: #222;
        border: 1.5px solid rgba(0,0,0,0.18);
        border-radius: 20px;
        padding: 5px 10px;
        font-size: 12px;
        font-weight: 700;
        font-family: 'Plus Jakarta Sans', sans-serif;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        white-space: nowrap;
        user-select: none;
        will-change: transform;
        pointer-events: auto;
        transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
      `;

      el.onmouseenter = () => {
        onPinHover?.(imovel.id);
        el.style.background = "#222";
        el.style.color = "white";
        el.style.borderColor = "#222";
      };

      el.onmouseleave = () => {
        onPinHover?.(null);
        if (hoveredId === imovel.id) return;
        el.style.background = "white";
        el.style.color = "#222";
        el.style.borderColor = "rgba(0,0,0,0.18)";
        el.style.transform = "scale(1)";
        el.style.zIndex = "1";
      };

      el.onclick = (e) => {
        e.stopPropagation();
        navigate(`/imovel/${imovel.slug}`);
      };

      try {
        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat])
          .addTo(map);
        markersRef.current.set(imovel.id, marker);
        markerElementsRef.current.set(imovel.id, el);
      } catch (e) {
        console.warn("marker error", e);
      }
    });
  }, [hoveredId, navigate, onPinHover]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-51.2177, -30.0346],
      zoom: 11,
      dragRotate: false,
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    map.once("idle", () => {
      mapaReadyRef.current = true;
      renderPins(map, pendingImoveisRef.current);
    });

    map.on("moveend", () => {
      boundsRef.current = map.getBounds();
      if (mapaReadyRef.current) setMapMoved(true);
    });

    mapRef.current = map;

    return () => {
      mapaReadyRef.current = false;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      markerElementsRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [renderPins]);

  useEffect(() => {
    pendingImoveisRef.current = imoveis;
    if (!mapRef.current || !mapaReadyRef.current) return;

    renderPins(mapRef.current, imoveis);

    const validos = imoveis.filter((i) =>
      coordsValidas(Number(i.latitude), Number(i.longitude)),
    );

    if (validos.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      validos.forEach((i) => {
        bounds.extend([Number(i.longitude), Number(i.latitude)]);
      });

      mapRef.current.fitBounds(bounds, {
        padding: 60,
        maxZoom: 14,
        duration: 500,
      });
    }
  }, [imoveis, renderPins]);

  useEffect(() => {
    markerElementsRef.current.forEach((el, id) => {
      if (id === hoveredId) {
        el.style.background = "#222";
        el.style.color = "white";
        el.style.borderColor = "#222";
        el.style.transform = "scale(1.1)";
        el.style.zIndex = "10";
      } else {
        el.style.background = "white";
        el.style.color = "#222";
        el.style.borderColor = "rgba(0,0,0,0.18)";
        el.style.transform = "scale(1)";
        el.style.zIndex = "1";
      }
    });
  }, [hoveredId]);

  const handleBoundsSearch = useCallback(() => {
    if (!boundsRef.current || !onBoundsSearch) return;
    const sw = boundsRef.current.getSouthWest();
    const ne = boundsRef.current.getNorthEast();

    onBoundsSearch({
      lat_min: sw.lat,
      lat_max: ne.lat,
      lng_min: sw.lng,
      lng_max: ne.lng,
    });

    setMapMoved(false);
  }, [onBoundsSearch]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: "12px" }} />

      <AnimatePresence>
        {mapMoved && onBoundsSearch && (
          <div className="pointer-events-none absolute left-0 right-0 top-4 z-20 flex justify-center">
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onClick={handleBoundsSearch}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 font-body text-[13px] font-semibold text-foreground shadow-lg transition-transform hover:shadow-xl active:scale-[0.97]"
            >
              <Search className="h-3.5 w-3.5" />
              Buscar nessa região
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
