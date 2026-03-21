import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";

const MAPBOX_TOKEN = "pk.eyJ1IjoibHVjYXN1aG9tZSIsImEiOiJjbW16c2l2dmUwYmxsMnJwdDI2bGxrazBkIn0.B4dp727gJlQQIWTci7GpFQ";

function formatPinPreco(preco: number): string {
  if (!preco || preco === 0) return "";
  if (preco >= 1_000_000) return `R$${(preco / 1_000_000).toFixed(1)}M`;
  if (preco >= 1_000) return `R$${Math.round(preco / 1_000)}k`;
  return `R$${preco}`;
}

function isValidPOACoord(lat: number, lng: number): boolean {
  return lat > -32 && lat < -28 && lng > -54 && lng < -49;
}

interface SearchMapProps {
  imoveis: Imovel[];
  hoveredId?: string | null;
  onPinHover?: (id: string | null) => void;
  onBoundsSearch?: (bounds: { lat_min: number; lat_max: number; lng_min: number; lng_max: number }) => void;
}

export function SearchMap({ imoveis, hoveredId, onPinHover, onBoundsSearch }: SearchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const mapboxRef = useRef<any>(null);
  const marcadoresRef = useRef<Map<string, { el: HTMLElement; marker: any }>>(new Map());
  const popupRef = useRef<any>(null);
  const mountedRef = useRef(false);
  const mapReadyRef = useRef(false);
  const boundsRef = useRef<any>(null);
  const navigate = useNavigate();

  const [mapMoved, setMapMoved] = __import_useState(false);
  const [mapError, setMapError] = __import_useState(false);

  // Init map once
  useEffect(() => {
    if (mountedRef.current || !containerRef.current) return;
    if (!MAPBOX_TOKEN) { setMapError(true); return; }
    mountedRef.current = true;

    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css";
      document.head.appendChild(link);

      mapboxgl.default.accessToken = MAPBOX_TOKEN;
      mapboxRef.current = mapboxgl.default;

      const map = new mapboxgl.default.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-51.2177, -30.0346],
        zoom: 11,
        attributionControl: false,
        dragRotate: false,
      });

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("moveend", () => {
        if (!mapReadyRef.current) return;
        boundsRef.current = map.getBounds();
        setMapMoved(true);
      });

      mapRef.current = map;
    }).catch(() => { setMapError(true); });

    return () => {
      cancelled = true;
      marcadoresRef.current.forEach(({ marker }) => marker.remove());
      marcadoresRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      mapboxRef.current = null;
      mountedRef.current = false;
    };
  }, []);

  // Navigate helper for popups
  useEffect(() => {
    (window as any).__navigateImovel = (slug: string) => navigate(`/imovel/${slug}`);
    return () => { delete (window as any).__navigateImovel; };
  }, [navigate]);

  // Render pins when imoveis change
  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl) return;

    function renderPins() {
      const idsNovos = new Set(imoveis.map(i => i.id));

      // Remove pins that left
      marcadoresRef.current.forEach(({ marker }, id) => {
        if (!idsNovos.has(id)) {
          marker.remove();
          marcadoresRef.current.delete(id);
        }
      });

      // Add new pins
      const withCoords: Imovel[] = [];

      imoveis.forEach((imovel) => {
        if (marcadoresRef.current.has(imovel.id)) return;

        const lat = Number(imovel.latitude);
        const lng = Number(imovel.longitude);
        if (!lat || !lng || !isValidPOACoord(lat, lng)) return;

        const label = formatPinPreco(imovel.preco);
        if (!label) return;

        withCoords.push(imovel);

        const el = document.createElement("div");
        el.textContent = label;
        el.dataset.imovelId = imovel.id;
        el.style.cssText = `
          background: white;
          color: #222;
          border: 1.5px solid rgba(0,0,0,0.2);
          border-radius: 20px;
          padding: 5px 10px;
          font-size: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          white-space: nowrap;
          user-select: none;
          will-change: transform;
          pointer-events: auto;
          transition: background 0.15s, color 0.15s, transform 0.1s, border-color 0.15s;
        `;

        el.addEventListener("mouseenter", () => {
          onPinHover?.(imovel.id);
          el.style.background = "#222";
          el.style.color = "white";
          el.style.borderColor = "#222";
          el.style.transform = "scale(1.08)";
          el.style.zIndex = "10";

          // Show popup
          if (popupRef.current) popupRef.current.remove();
          const image = fotoPrincipal(imovel);
          const formatted = formatPreco(imovel.preco);
          const area = imovel.area_total ?? imovel.area_util ?? 0;
          const statsLine = [
            area > 0 ? `${area}m²` : null,
            (imovel.quartos ?? 0) > 0 ? `${imovel.quartos} quartos` : null,
          ].filter(Boolean).join(" · ");

          try {
            popupRef.current = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 16,
              className: "uhome-popup",
            })
              .setLngLat([lng, lat])
              .setHTML(`
                <div style="width:220px;cursor:pointer;font-family:'Plus Jakarta Sans',system-ui,sans-serif;" onclick="window.__navigateImovel('${imovel.slug}')">
                  <img src="${image}" alt="" style="width:100%;height:110px;object-fit:cover;" />
                  <div style="padding:10px 12px;">
                    <p style="font-size:11px;color:#717171;margin:0 0 2px;">${imovel.bairro}</p>
                    <p style="font-size:13px;font-weight:600;margin:0 0 4px;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${imovel.titulo}</p>
                    <p style="font-size:15px;font-weight:700;color:#222;margin:0;">${formatted}</p>
                    ${statsLine ? `<p style="font-size:11px;color:#717171;margin:4px 0 0;">${statsLine}</p>` : ""}
                  </div>
                </div>
              `)
              .addTo(map);
          } catch (err) {
            console.warn("Popup error:", err);
          }
        });

        el.addEventListener("mouseleave", () => {
          onPinHover?.(null);
          el.style.background = "white";
          el.style.color = "#222";
          el.style.borderColor = "rgba(0,0,0,0.2)";
          el.style.transform = "scale(1)";
          el.style.zIndex = "1";
          if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
        });

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          navigate(`/imovel/${imovel.slug}`);
        });

        try {
          const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat([lng, lat])
            .addTo(map);
          marcadoresRef.current.set(imovel.id, { el, marker });
        } catch (err) {
          console.warn("Marker error:", err);
        }
      });

      // Fit bounds
      const allWithCoords = imoveis.filter(i => {
        const lat = Number(i.latitude);
        const lng = Number(i.longitude);
        return lat && lng && isValidPOACoord(lat, lng);
      });

      if (allWithCoords.length > 0 && withCoords.length > 0) {
        mapReadyRef.current = false;
        const bounds = new mapboxgl.LngLatBounds();
        allWithCoords.forEach(i => bounds.extend([Number(i.longitude), Number(i.latitude)]));

        if (allWithCoords.length > 1) {
          map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 500 });
        } else {
          map.flyTo({ center: [Number(allWithCoords[0].longitude), Number(allWithCoords[0].latitude)], zoom: 14, duration: 500 });
        }
        setTimeout(() => { mapReadyRef.current = true; }, 800);
      }
    }

    // CRITICAL: wait for map to be fully loaded
    if (map.loaded()) {
      renderPins();
    } else {
      map.once("load", renderPins);
    }
  }, [imoveis, navigate, onPinHover]);

  // Sync hover from card → pin
  useEffect(() => {
    marcadoresRef.current.forEach(({ el }, id) => {
      if (id === hoveredId) {
        el.style.background = "#222";
        el.style.color = "white";
        el.style.borderColor = "#222";
        el.style.transform = "scale(1.1)";
        el.style.zIndex = "10";
      } else {
        el.style.background = "white";
        el.style.color = "#222";
        el.style.borderColor = "rgba(0,0,0,0.2)";
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
        .uhome-popup .mapboxgl-popup-tip { display: none; }
        .mapboxgl-ctrl-group {
          border-radius: 10px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
          border: none !important;
        }
        .mapboxgl-ctrl-group button { width: 36px !important; height: 36px !important; }
      `}</style>
      <div className="relative h-full w-full">
        <div ref={containerRef} className="h-full w-full" />

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
