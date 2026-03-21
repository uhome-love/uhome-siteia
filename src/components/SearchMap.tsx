import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";

const MAPBOX_TOKEN = "pk.eyJ1IjoibHVjYXN1aG9tZSIsImEiOiJjbW16c2l2dmUwYmxsMnJwdDI2bGxrazBkIn0.B4dp727gJlQQIWTci7GpFQ";

function formatPinPreco(preco: number): string {
  if (preco >= 1_000_000) return `R$${(preco / 1_000_000).toFixed(1)}M`;
  if (preco >= 1_000) return `R$${Math.round(preco / 1_000)}k`;
  return `R$${preco}`;
}

interface SearchMapProps {
  imoveis: Imovel[];
  hoveredId?: string | null;
  onPinHover?: (id: string | null) => void;
  onBoundsSearch?: (bounds: { lat_min: number; lat_max: number; lng_min: number; lng_max: number }) => void;
}

export function SearchMap({ imoveis, hoveredId, onPinHover, onBoundsSearch }: SearchMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, { el: HTMLElement; marker: any }>>(new Map());
  const popupRef = useRef<any>(null);
  const mapReadyRef = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mapMoved, setMapMoved] = useState(false);
  const boundsRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (window as any).__navigateImovel = (slug: string) => navigate(`/imovel/${slug}`);
    return () => { delete (window as any).__navigateImovel; };
  }, [navigate]);

  // Init map once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) { setMapError(true); return; }

    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !mapContainer.current) return;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css";
      document.head.appendChild(link);

      mapboxgl.default.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-51.18, -30.04],
        zoom: 12,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (!cancelled) {
          setMapLoaded(true);
          setTimeout(() => { mapReadyRef.current = true; }, 800);
        }
      });

      map.on("moveend", () => {
        if (!mapReadyRef.current) return;
        boundsRef.current = map.getBounds();
        setMapMoved(true);
      });

      mapRef.current = { map, mapboxgl: mapboxgl.default };
    }).catch(() => { setMapError(true); });

    return () => {
      cancelled = true;
      mapRef.current?.map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Create/update markers — only when imoveis change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const { map, mapboxgl } = mapRef.current;

    const currentIds = new Set(imoveis.filter(p => p.latitude && p.longitude).map(p => p.id));

    // Remove markers no longer in results
    markersRef.current.forEach(({ marker }, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    const withCoords = imoveis.filter((p) => p.latitude && p.longitude);
    if (withCoords.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    let hasNewMarkers = false;

    withCoords.forEach((p) => {
      bounds.extend([p.longitude!, p.latitude!]);

      if (markersRef.current.has(p.id)) return;
      hasNewMarkers = true;

      const el = document.createElement("div");
      el.textContent = formatPinPreco(p.preco);
      el.dataset.imovelId = p.id;

      // Airbnb-style pill
      Object.assign(el.style, {
        background: "white",
        color: "#222",
        border: "1.5px solid rgba(0,0,0,0.18)",
        borderRadius: "20px",
        padding: "5px 10px",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.14)",
        whiteSpace: "nowrap",
        userSelect: "none",
        transition: "background 0.15s, color 0.15s, transform 0.1s, border-color 0.15s",
        willChange: "transform",
      });

      el.addEventListener("mouseenter", () => {
        onPinHover?.(p.id);
        el.style.background = "#222";
        el.style.color = "white";
        el.style.borderColor = "#222";
        el.style.transform = "scale(1.08)";
        el.style.zIndex = "10";

        // Show popup
        if (popupRef.current) popupRef.current.remove();
        const image = fotoPrincipal(p);
        const formatted = formatPreco(p.preco);
        const area = p.area_total ?? p.area_util ?? 0;
        const statsLine = [
          area > 0 ? `${area}m²` : null,
          (p.quartos ?? 0) > 0 ? `${p.quartos} quartos` : null,
        ].filter(Boolean).join(" · ");

        popupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 16,
          className: "uhome-popup",
        })
          .setLngLat([p.longitude!, p.latitude!])
          .setHTML(`
            <div style="width:220px;cursor:pointer;font-family:'Plus Jakarta Sans',system-ui,sans-serif;" onclick="window.__navigateImovel('${p.slug}')">
              <img src="${image}" alt="" style="width:100%;height:110px;object-fit:cover;" />
              <div style="padding:10px 12px;">
                <p style="font-size:11px;color:#888;margin:0 0 2px;">${p.bairro}</p>
                <p style="font-size:13px;font-weight:600;margin:0 0 4px;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.titulo}</p>
                <p style="font-size:15px;font-weight:700;color:#222;margin:0;">${formatted}</p>
                ${statsLine ? `<p style="font-size:11px;color:#717171;margin:4px 0 0;">${statsLine}</p>` : ""}
              </div>
            </div>
          `)
          .addTo(map);
      });

      el.addEventListener("mouseleave", () => {
        onPinHover?.(null);
        el.style.background = "white";
        el.style.color = "#222";
        el.style.borderColor = "rgba(0,0,0,0.18)";
        el.style.transform = "scale(1)";
        el.style.zIndex = "1";
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      });

      el.addEventListener("click", () => {
        navigate(`/imovel/${p.slug}`);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([p.longitude!, p.latitude!])
        .addTo(map);

      markersRef.current.set(p.id, { el, marker });
    });

    if (hasNewMarkers) {
      mapReadyRef.current = false;
      if (withCoords.length > 1) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 800 });
      } else if (markersRef.current.size <= 1) {
        map.flyTo({ center: [withCoords[0].longitude!, withCoords[0].latitude!], zoom: 14, duration: 800 });
      }
      setTimeout(() => { mapReadyRef.current = true; }, 1200);
    }
  }, [imoveis, mapLoaded, navigate, onPinHover]);

  // Sync hover from card → pin
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
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

  if (mapError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-secondary/30">
        <p className="font-body text-sm text-muted-foreground">Mapa indisponível</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .uhome-popup .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.15) !important;
          border: none !important;
          overflow: hidden;
        }
        .uhome-popup .mapboxgl-popup-tip {
          display: none;
        }
        .mapboxgl-ctrl-group {
          border-radius: 10px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
          border: none !important;
        }
        .mapboxgl-ctrl-group button {
          width: 36px !important;
          height: 36px !important;
        }
      `}</style>
      <div className="relative h-full w-full">
        <div ref={mapContainer} className="h-full w-full" />

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
    </>
  );
}
