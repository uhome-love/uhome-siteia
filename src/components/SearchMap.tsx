import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";

const MAPBOX_TOKEN = "pk.eyJ1IjoibHVjYXN1aG9tZSIsImEiOiJjbW16c2l2dmUwYmxsMnJwdDI2bGxrazBkIn0.B4dp727gJlQQIWTci7GpFQ";
const SOURCE_ID = "imoveis-source";
const LAYER_BG = "imoveis-bg";
const LAYER_TEXT = "imoveis-text";

function formatPinPreco(preco: number): string {
  if (preco >= 1_000_000) return `R$${(preco / 1_000_000).toFixed(1)}M`;
  if (preco >= 1_000) return `R$${Math.round(preco / 1_000)}k`;
  return `R$${preco}`;
}

function toGeoJSON(imoveis: Imovel[]) {
  return {
    type: "FeatureCollection" as const,
    features: imoveis
      .filter((i) => i.latitude && i.longitude)
      .map((i) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [i.longitude!, i.latitude!],
        },
        properties: {
          id: i.id,
          slug: i.slug,
          preco_label: formatPinPreco(i.preco),
          titulo: i.titulo,
          bairro: i.bairro,
          preco: i.preco,
          area: i.area_total ?? i.area_util ?? 0,
          quartos: i.quartos ?? 0,
          foto: fotoPrincipal(i),
        },
      })),
  };
}

/** Create a rounded-pill SDF-like image for the pin background */
function createPinImage(color: string, w = 80, h = 28): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const dpr = 2;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.arc(w - r, r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(r, h);
  ctx.arc(r, r, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();
  // small shadow
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fill();
  return canvas;
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
  const popupRef = useRef<any>(null);
  const mapReadyRef = useRef(false);
  const layersAddedRef = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mapMoved, setMapMoved] = useState(false);
  const boundsRef = useRef<any>(null);
  const navigate = useNavigate();

  // Navigate helper for popup clicks
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
        pitchWithRotate: false,
        dragRotate: false,
      });

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (cancelled) return;

        // Add pin background images
        map.addImage("pin-default", createPinImage("#FFFFFF"), { pixelRatio: 2 });
        map.addImage("pin-active", createPinImage("#222222"), { pixelRatio: 2 });

        // GeoJSON source
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        // Background pill layer
        map.addLayer({
          id: LAYER_BG,
          type: "symbol",
          source: SOURCE_ID,
          layout: {
            "icon-image": [
              "case",
              ["==", ["get", "id"], ""],
              "pin-active",
              "pin-default",
            ],
            "icon-allow-overlap": true,
            "icon-ignore-placement": false,
            "icon-text-fit": "both",
            "icon-text-fit-padding": [4, 10, 4, 10],
            "text-field": ["get", "preco_label"],
            "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
            "text-size": 12,
            "text-allow-overlap": true,
            "symbol-sort-key": ["to-number", ["get", "preco"]],
          },
          paint: {
            "text-color": [
              "case",
              ["==", ["get", "id"], ""],
              "#FFFFFF",
              "#222222",
            ],
          },
        });

        layersAddedRef.current = true;

        // Click → navigate
        map.on("click", LAYER_BG, (e: any) => {
          const slug = e.features?.[0]?.properties?.slug;
          if (slug) navigate(`/imovel/${slug}`);
        });

        // Hover → highlight + popup
        map.on("mouseenter", LAYER_BG, (e: any) => {
          map.getCanvas().style.cursor = "pointer";
          const feat = e.features?.[0];
          if (!feat) return;
          const id = feat.properties.id;
          onPinHover?.(id);

          // Show popup
          if (popupRef.current) popupRef.current.remove();
          const coords = feat.geometry.coordinates.slice();
          const p = feat.properties;
          const formatted = formatPreco(p.preco);
          const statsLine = [
            p.area > 0 ? `${p.area}m²` : null,
            p.quartos > 0 ? `${p.quartos} quartos` : null,
          ].filter(Boolean).join(" · ");

          popupRef.current = new mapboxgl.default.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 16,
            className: "uhome-popup",
          })
            .setLngLat(coords)
            .setHTML(`
              <div style="width:220px;cursor:pointer;font-family:'Plus Jakarta Sans',system-ui,sans-serif;" onclick="window.__navigateImovel('${p.slug}')">
                <img src="${p.foto}" alt="" style="width:100%;height:110px;object-fit:cover;" />
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

        map.on("mouseleave", LAYER_BG, () => {
          map.getCanvas().style.cursor = "";
          onPinHover?.(null);
          if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
        });

        // Bounds
        map.on("moveend", () => {
          if (!mapReadyRef.current) return;
          boundsRef.current = map.getBounds();
          setMapMoved(true);
        });

        setMapLoaded(true);
        setTimeout(() => { mapReadyRef.current = true; }, 800);
      });

      mapRef.current = { map, mapboxgl: mapboxgl.default };
    }).catch(() => { setMapError(true); });

    return () => {
      cancelled = true;
      mapRef.current?.map?.remove();
      mapRef.current = null;
      layersAddedRef.current = false;
    };
  }, []);

  // Update data when imoveis change — NO DOM recreation
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !layersAddedRef.current) return;
    const { map, mapboxgl } = mapRef.current;

    const source = map.getSource(SOURCE_ID);
    if (!source) return;

    source.setData(toGeoJSON(imoveis));

    // Fit bounds
    const withCoords = imoveis.filter((i) => i.latitude && i.longitude);
    if (withCoords.length > 0) {
      mapReadyRef.current = false;
      const bounds = new mapboxgl.LngLatBounds();
      withCoords.forEach((i) => bounds.extend([i.longitude!, i.latitude!]));
      if (withCoords.length > 1) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 800 });
      } else {
        map.flyTo({ center: [withCoords[0].longitude!, withCoords[0].latitude!], zoom: 14, duration: 800 });
      }
      setTimeout(() => { mapReadyRef.current = true; }, 1200);
    }
  }, [imoveis, mapLoaded]);

  // Update hover highlight — just repaint, no DOM
  useEffect(() => {
    if (!mapRef.current || !layersAddedRef.current) return;
    const map = mapRef.current.map;
    if (!map.getLayer(LAYER_BG)) return;

    const hId = hoveredId ?? "____none____";

    map.setLayoutProperty(LAYER_BG, "icon-image", [
      "case",
      ["==", ["get", "id"], hId],
      "pin-active",
      "pin-default",
    ]);

    map.setPaintProperty(LAYER_BG, "text-color", [
      "case",
      ["==", ["get", "id"], hId],
      "#FFFFFF",
      "#222222",
    ]);
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
