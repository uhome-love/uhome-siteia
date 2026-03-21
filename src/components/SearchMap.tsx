import { useEffect, useRef, useState } from "react";
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
      map.addControl(
        new mapboxgl.default.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
          showUserHeading: false,
        }),
        "top-right"
      );

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

  // Create / update markers — only when imoveis change, not on map move
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

      // Skip if marker already exists
      if (markersRef.current.has(p.id)) return;

      hasNewMarkers = true;
      const priceLabel = formatPinPreco(p.preco);

      const el = document.createElement("div");
      el.className = "uhome-pin";
      el.textContent = priceLabel;
      el.dataset.imovelId = p.id;

      el.addEventListener("mouseenter", () => {
        onPinHover?.(p.id);
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

    // Fit bounds only when markers actually changed
    if (hasNewMarkers) {
      mapReadyRef.current = false;
      if (withCoords.length > 1) {
        map.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 60, right: 60 }, maxZoom: 14, duration: 800 });
      } else if (markersRef.current.size <= 1) {
        map.flyTo({ center: [withCoords[0].longitude!, withCoords[0].latitude!], zoom: 14, duration: 800 });
      }
      setTimeout(() => { mapReadyRef.current = true; }, 1200);
    }
  }, [imoveis, mapLoaded, navigate, onPinHover]);

  // Sync hover highlight from card → pin
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      const selected = id === hoveredId;
      el.classList.toggle("uhome-pin--active", selected);
    });
  }, [hoveredId]);

  const handleBoundsSearch = () => {
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
  };

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
        .uhome-pin {
          background: white;
          color: #222;
          border: 1.5px solid rgba(0,0,0,0.12);
          border-radius: 20px;
          padding: 5px 10px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          transition: all 0.15s ease-out;
          white-space: nowrap;
          user-select: none;
        }
        .uhome-pin:hover,
        .uhome-pin--active {
          background: #222;
          color: white;
          border-color: #222;
          transform: scale(1.08);
          z-index: 10 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
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

        {/* "Search this area" button — centered via flex */}
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
