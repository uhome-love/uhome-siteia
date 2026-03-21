import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { type MapPin as MapPinData } from "@/services/imoveis";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoibHVjYXN1aG9tZSIsImEiOiJjbW16c2l2dmUwYmxsMnJwdDI2bGxrazBkIn0.B4dp727gJlQQIWTci7GpFQ";

mapboxgl.accessToken = MAPBOX_TOKEN;

function formatPreco(preco: number): string {
  if (!preco) return "";
  if (preco >= 1_000_000) return `R$${(preco / 1_000_000).toFixed(1)}M`;
  if (preco >= 1_000) return `R$${Math.round(preco / 1_000)}k`;
  return `R$${preco}`;
}

function toGeoJSON(pins: MapPinData[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: pins
      .filter((i) => {
        const lat = Number(i.latitude);
        const lng = Number(i.longitude);
        return lat && lng && lat < -28 && lat > -32 && lng < -49 && lng > -54;
      })
      .map((i) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [Number(i.longitude), Number(i.latitude)],
        },
        properties: {
          id: i.id,
          slug: i.slug,
          preco: Number(i.preco),
          preco_label: formatPreco(Number(i.preco)),
          titulo: i.titulo ?? "",
          bairro: i.bairro ?? "",
        },
      })),
  };
}

function createPillImage(fillColor: string, strokeColor: string): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = 80;
  canvas.height = 28;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  const r = 14;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(80 - r, 0);
  ctx.quadraticCurveTo(80, 0, 80, r);
  ctx.lineTo(80, 28 - r);
  ctx.quadraticCurveTo(80, 28, 80 - r, 28);
  ctx.lineTo(r, 28);
  ctx.quadraticCurveTo(0, 28, 0, 28 - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  return ctx.getImageData(0, 0, 80, 28);
}

// Check if a point is inside a polygon using ray casting
function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

interface SearchMapProps {
  pins?: MapPinData[];
  hoveredId?: string | null;
  onPinHover?: (id: string | null) => void;
  onBoundsSearch?: (bounds: { lat_min: number; lat_max: number; lng_min: number; lng_max: number }) => void;
  onDrawFilter?: (filteredPins: MapPinData[]) => void;
}

export function SearchMap({ pins = [], hoveredId, onPinHover, onBoundsSearch, onDrawFilter }: SearchMapProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const initRef = useRef(false);
  const mapReadyRef = useRef(false);
  const boundsRef = useRef<mapboxgl.LngLatBounds | null>(null);
  const pinsRef = useRef(pins);
  const [mapMoved, setMapMoved] = useState(false);

  // Draw mode state
  const [drawMode, setDrawMode] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const drawPointsRef = useRef<[number, number][]>([]);

  // Keep ref in sync
  useEffect(() => { pinsRef.current = pins; }, [pins]);
  useEffect(() => { drawPointsRef.current = drawPoints; }, [drawPoints]);

  // Listen for draw-area event from SearchFiltersBar
  useEffect(() => {
    const handler = () => {
      setDrawMode(true);
      setDrawPoints([]);
      setHasDrawn(false);
      import("sonner").then(({ toast }) => toast.info("Clique no mapa para desenhar a área de busca. Clique duplo para finalizar."));
    };
    window.addEventListener("uhome:draw-area", handler);
    return () => window.removeEventListener("uhome:draw-area", handler);
  }, []);

  // Init map once
  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-51.2177, -30.0346],
      zoom: 11,
      dragRotate: false,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      // Source with clustering
      map.addSource("imoveis", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 15,
        clusterRadius: 60,
      });

      // Draw polygon source
      map.addSource("draw-polygon", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addSource("draw-points", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Layer 1: cluster circles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "imoveis",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#5B6CF9",
          "circle-radius": ["step", ["get", "point_count"], 20, 10, 26, 50, 32, 200, 38],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#FFFFFF",
          "circle-opacity": 0.92,
        },
      });

      // Layer 2: cluster count label
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "imoveis",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 13,
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#FFFFFF",
        },
      });

      // Pill images
      map.addImage("pin-bg", createPillImage("#FFFFFF", "rgba(0,0,0,0.2)"));
      map.addImage("pin-bg-dark", createPillImage("#222222", "#222222"));

      // Layer 3: individual pins with price
      map.addLayer({
        id: "imoveis-pins",
        type: "symbol",
        source: "imoveis",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "pin-bg",
          "icon-text-fit": "both",
          "icon-text-fit-padding": [5, 10, 5, 10],
          "icon-allow-overlap": true,
          "text-field": ["get", "preco_label"],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-allow-overlap": true,
          "text-anchor": "center",
        },
        paint: {
          "text-color": "#222222",
          "icon-opacity": 1,
        },
      });

      // Layer 4: hovered pin (dark)
      map.addLayer({
        id: "imoveis-pins-hover",
        type: "symbol",
        source: "imoveis",
        filter: ["==", ["get", "id"], ""],
        layout: {
          "icon-image": "pin-bg-dark",
          "icon-text-fit": "both",
          "icon-text-fit-padding": [5, 10, 5, 10],
          "icon-allow-overlap": true,
          "text-field": ["get", "preco_label"],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-allow-overlap": true,
          "text-anchor": "center",
        },
        paint: {
          "text-color": "#FFFFFF",
        },
      });

      // Draw polygon fill layer
      map.addLayer({
        id: "draw-polygon-fill",
        type: "fill",
        source: "draw-polygon",
        paint: {
          "fill-color": "#5B6CF9",
          "fill-opacity": 0.12,
        },
      });

      // Draw polygon outline
      map.addLayer({
        id: "draw-polygon-line",
        type: "line",
        source: "draw-polygon",
        paint: {
          "line-color": "#5B6CF9",
          "line-width": 2.5,
          "line-dasharray": [2, 2],
        },
      });

      // Draw vertices
      map.addLayer({
        id: "draw-points-layer",
        type: "circle",
        source: "draw-points",
        paint: {
          "circle-color": "#FFFFFF",
          "circle-radius": 5,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#5B6CF9",
        },
      });

      // Events
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0].properties!.cluster_id;
        (map.getSource("imoveis") as mapboxgl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom!,
          });
        });
      });

      map.on("click", "imoveis-pins", (e) => {
        const slug = e.features?.[0]?.properties?.slug;
        if (slug) navigate(`/imovel/${slug}`);
      });

      map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "imoveis-pins", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const id = e.features?.[0]?.properties?.id;
        if (id) onPinHover?.(id);
      });
      map.on("mouseleave", "imoveis-pins", () => {
        map.getCanvas().style.cursor = "";
        onPinHover?.(null);
      });

      mapReadyRef.current = true;

      // Set initial data
      const source = map.getSource("imoveis") as mapboxgl.GeoJSONSource | undefined;
      if (source && pinsRef.current.length > 0) {
        const geo = toGeoJSON(pinsRef.current);
        source.setData(geo);
        const validos = pinsRef.current.filter((i) => {
          const lat = Number(i.latitude);
          const lng = Number(i.longitude);
          return lat && lng && lat < -28 && lat > -32 && lng < -49 && lng > -54;
        });
        if (validos.length > 0 && validos.length < 2000) {
          const b = new mapboxgl.LngLatBounds();
          validos.forEach((i) => b.extend([Number(i.longitude), Number(i.latitude)]));
          map.fitBounds(b, { padding: 60, maxZoom: 14, duration: 500 });
        }
      }
    });

    map.on("moveend", () => {
      if (!mapReadyRef.current) return;
      boundsRef.current = map.getBounds();
      setMapMoved(true);
    });

    mapRef.current = map;

    return () => {
      mapReadyRef.current = false;
      map.remove();
      mapRef.current = null;
      initRef.current = false;
    };
  }, [navigate, onPinHover]);

  // Handle draw mode clicks
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (drawMode) {
      map.getCanvas().style.cursor = "crosshair";

      const onClick = (e: mapboxgl.MapMouseEvent) => {
        const point: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        setDrawPoints(prev => {
          const next = [...prev, point];
          updateDrawSources(map, next, false);
          return next;
        });
      };

      const onDblClick = (e: mapboxgl.MapMouseEvent) => {
        e.preventDefault();
        const finalPoints = drawPointsRef.current;
        if (finalPoints.length >= 3) {
          const closed = [...finalPoints, finalPoints[0]];
          updateDrawSources(map, closed, true);
          setDrawMode(false);
          setHasDrawn(true);
          map.getCanvas().style.cursor = "";

          // Filter pins inside polygon
          if (onDrawFilter) {
            const inside = pinsRef.current.filter(pin => {
              const lat = Number(pin.latitude);
              const lng = Number(pin.longitude);
              if (!lat || !lng) return false;
              return pointInPolygon([lng, lat], finalPoints);
            });
            onDrawFilter(inside);
          }

          // Also set bounds to the polygon bbox
          if (onBoundsSearch && finalPoints.length >= 3) {
            const lngs = finalPoints.map(p => p[0]);
            const lats = finalPoints.map(p => p[1]);
            onBoundsSearch({
              lng_min: Math.min(...lngs),
              lng_max: Math.max(...lngs),
              lat_min: Math.min(...lats),
              lat_max: Math.max(...lats),
            });
          }
        }
      };

      map.on("click", onClick);
      map.on("dblclick", onDblClick);
      // Disable double-click zoom during draw
      map.doubleClickZoom.disable();

      return () => {
        map.off("click", onClick);
        map.off("dblclick", onDblClick);
        map.doubleClickZoom.enable();
        if (!drawMode) map.getCanvas().style.cursor = "";
      };
    } else {
      map.getCanvas().style.cursor = "";
    }
  }, [drawMode, onDrawFilter, onBoundsSearch]);

  function updateDrawSources(map: mapboxgl.Map, pts: [number, number][], closed: boolean) {
    const pointsSource = map.getSource("draw-points") as mapboxgl.GeoJSONSource | undefined;
    const polySource = map.getSource("draw-polygon") as mapboxgl.GeoJSONSource | undefined;

    if (pointsSource) {
      pointsSource.setData({
        type: "FeatureCollection",
        features: pts.map(p => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: p },
          properties: {},
        })),
      });
    }

    if (polySource && pts.length >= 3) {
      const ring = closed ? pts : [...pts, pts[0]];
      polySource.setData({
        type: "FeatureCollection",
        features: [{
          type: "Feature" as const,
          geometry: { type: "Polygon" as const, coordinates: [ring] },
          properties: {},
        }],
      });
    } else if (polySource && pts.length >= 2) {
      // Show a line while drawing
      polySource.setData({
        type: "FeatureCollection",
        features: [{
          type: "Feature" as const,
          geometry: { type: "LineString" as const, coordinates: pts },
          properties: {},
        }],
      });
    }
  }

  const clearDraw = useCallback(() => {
    setDrawPoints([]);
    setHasDrawn(false);
    setDrawMode(false);
    const map = mapRef.current;
    if (map && mapReadyRef.current) {
      const pointsSource = map.getSource("draw-points") as mapboxgl.GeoJSONSource | undefined;
      const polySource = map.getSource("draw-polygon") as mapboxgl.GeoJSONSource | undefined;
      if (pointsSource) pointsSource.setData({ type: "FeatureCollection", features: [] });
      if (polySource) polySource.setData({ type: "FeatureCollection", features: [] });
    }
    // Clear the bounds filter
    if (onBoundsSearch) {
      // Reset by triggering a normal search
      setMapMoved(false);
    }
  }, [onBoundsSearch]);

  // Update data via source.setData
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    const source = map.getSource("imoveis") as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData(toGeoJSON(pins));

    const validos = pins.filter((i) => {
      const lat = Number(i.latitude);
      const lng = Number(i.longitude);
      return lat && lng && lat < -28 && lat > -32 && lng < -49 && lng > -54;
    });

    if (validos.length > 0 && validos.length < 2000 && !hasDrawn) {
      const bounds = new mapboxgl.LngLatBounds();
      validos.forEach((i) => bounds.extend([Number(i.longitude), Number(i.latitude)]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 500 });
    } else if (validos.length >= 2000 && !hasDrawn) {
      map.easeTo({ center: [-51.2177, -30.0346], zoom: 12, duration: 500 });
    }
  }, [pins, hasDrawn]);

  // Hover from card → highlight pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    if (!map.getLayer("imoveis-pins-hover")) return;

    map.setFilter(
      "imoveis-pins-hover",
      hoveredId ? ["==", ["get", "id"], hoveredId] : ["==", ["get", "id"], ""],
    );
  }, [hoveredId]);

  const handleBoundsSearch = useCallback(() => {
    if (!boundsRef.current || !onBoundsSearch) return;
    const sw = boundsRef.current.getSouthWest();
    const ne = boundsRef.current.getNorthEast();
    onBoundsSearch({ lat_min: sw.lat, lat_max: ne.lat, lng_min: sw.lng, lng_max: ne.lng });
    setMapMoved(false);
  }, [onBoundsSearch]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: "12px" }} />

      {/* Draw mode indicator */}
      <AnimatePresence>
        {drawMode && (
          <div className="absolute left-4 top-4 z-20">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-body text-[13px] font-semibold text-primary-foreground shadow-lg"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              Desenhando área ({drawPoints.length} pontos)
              <button
                onClick={() => { setDrawMode(false); clearDraw(); }}
                className="ml-1 rounded-full p-0.5 hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear draw button */}
      <AnimatePresence>
        {hasDrawn && !drawMode && (
          <div className="absolute bottom-4 left-4 z-20">
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={clearDraw}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-body text-[13px] font-semibold text-foreground shadow-lg transition-transform hover:shadow-xl active:scale-[0.97]"
            >
              <X className="h-3.5 w-3.5" />
              Apagar desenho
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Buscar nessa região */}
      <AnimatePresence>
        {mapMoved && onBoundsSearch && !drawMode && !hasDrawn && (
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
