import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Bed, Maximize, ToggleLeft, ToggleRight, PenTool, Navigation, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { type MapPin as MapPinData } from "@/services/imoveis";


const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoibHVjYXN1aG9tZSIsImEiOiJjbW16c2l2dmUwYmxsMnJwdDI2bGxrazBkIn0.B4dp727gJlQQIWTci7GpFQ";

mapboxgl.accessToken = MAPBOX_TOKEN;

function formatPreco(preco: number): string {
  if (!preco) return "";
  if (preco >= 1_000_000) return `R$${(preco / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (preco >= 1_000) return `R$${Math.round(preco / 1_000)}k`;
  return `R$${preco}`;
}

function formatPrecoFull(preco: number): string {
  if (!preco) return "Consulte";
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

// FIX 10 — Expanded bbox to include RS + SC
function toGeoJSON(pins: MapPinData[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: pins
      .filter((i) => {
        const lat = Number(i.latitude);
        const lng = Number(i.longitude);
        return (
          lat !== 0 && lng !== 0 &&
          !isNaN(lat) && !isNaN(lng) &&
          lat > -34 && lat < -27 &&
          lng > -55 && lng < -48
        );
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
          tipo: i.tipo ?? "",
          quartos: i.quartos ?? 0,
          area: i.area_total ?? 0,
          foto: i.foto ?? "",
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
  onBoundsChange?: (bounds: { lat_min: number; lat_max: number; lng_min: number; lng_max: number }) => void;
  onDrawFilter?: (filteredPins: MapPinData[]) => void;
  onPertoDeVoce?: () => void;
}

export function SearchMap({ pins = [], hoveredId, onPinHover, onBoundsSearch, onBoundsChange, onDrawFilter, onPertoDeVoce }: SearchMapProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const initRef = useRef(false);
  const mapReadyRef = useRef(false);
  const boundsRef = useRef<mapboxgl.LngLatBounds | null>(null);
  const pinsRef = useRef(pins);
  const [mapMoved, setMapMoved] = useState(false);
  const [autoSearch, setAutoSearch] = useState(false);
  const autoSearchRef = useRef(false);
  const autoSearchTimerRef = useRef<number | null>(null);

  // FIX 3 — Flag to prevent double initial load
  const initialBoundsReportedRef = useRef(false);

  // FIX 9 — Track last center to avoid closing popup on micro-movements
  const lastCenterRef = useRef<{ lat: number; lng: number }>({ lat: -30.0346, lng: -51.2177 });

  // Stable callback refs — prevent map re-initialization when parent re-renders
  const onPinHoverRef = useRef(onPinHover);
  const onBoundsSearchRef = useRef(onBoundsSearch);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onDrawFilterRef = useRef(onDrawFilter);
  useEffect(() => { onPinHoverRef.current = onPinHover; }, [onPinHover]);
  useEffect(() => { onBoundsSearchRef.current = onBoundsSearch; }, [onBoundsSearch]);
  useEffect(() => { onBoundsChangeRef.current = onBoundsChange; }, [onBoundsChange]);
  useEffect(() => { onDrawFilterRef.current = onDrawFilter; }, [onDrawFilter]);

  // Preview popup state
  const [previewPin, setPreviewPin] = useState<MapPinData | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);

  // Draw mode state
  const [drawMode, setDrawMode] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const drawPointsRef = useRef<[number, number][]>([]);

  // Keep ref in sync
  useEffect(() => { pinsRef.current = pins; }, [pins]);
  useEffect(() => { drawPointsRef.current = drawPoints; }, [drawPoints]);
  useEffect(() => { autoSearchRef.current = autoSearch; }, [autoSearch]);

  // Listen for draw-area event
  useEffect(() => {
    const handler = () => {
      setDrawMode(true);
      setDrawPoints([]);
      setHasDrawn(false);
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
      // FIX 8 — clusterMaxZoom reduced to 13 (neighborhood level)
      map.addSource("imoveis", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 52,
        buffer: 64,
        tolerance: 0.4,
      });

      map.addSource("draw-polygon", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addSource("draw-points", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Cluster circles
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
        paint: { "text-color": "#FFFFFF" },
      });

      // Pill images
      map.addImage("pin-bg", createPillImage("#FFFFFF", "rgba(0,0,0,0.2)"));
      map.addImage("pin-bg-dark", createPillImage("#222222", "#222222"));

      // FIX 7 — Individual pins with collision management
      map.addLayer({
        id: "imoveis-pins",
        type: "symbol",
        source: "imoveis",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "pin-bg",
          "icon-text-fit": "both",
          "icon-text-fit-padding": [5, 10, 5, 10],
          "icon-allow-overlap": false,
          "icon-ignore-placement": false,
          "icon-padding": 4,
          "text-field": ["get", "preco_label"],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-allow-overlap": false,
          "text-optional": true,
          "text-anchor": "center",
          "symbol-sort-key": ["get", "preco"],
        },
        paint: { "text-color": "#222222", "icon-opacity": 1 },
      });

      // Hovered pin — always on top
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
        paint: { "text-color": "#FFFFFF" },
      });

      // Draw layers
      map.addLayer({
        id: "draw-polygon-fill",
        type: "fill",
        source: "draw-polygon",
        paint: { "fill-color": "#5B6CF9", "fill-opacity": 0.12 },
      });
      map.addLayer({
        id: "draw-polygon-line",
        type: "line",
        source: "draw-polygon",
        paint: { "line-color": "#5B6CF9", "line-width": 2.5, "line-dasharray": [2, 2] },
      });
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

      // Pin click → show preview popup
      map.on("click", "imoveis-pins", (e) => {
        const props = e.features?.[0]?.properties;
        if (!props) return;
        const pinData = pinsRef.current.find(p => p.id === props.id);
        if (pinData) {
          const point = map.project((e.features![0].geometry as GeoJSON.Point).coordinates as [number, number]);
          setPreviewPin(pinData);
          setPreviewPos({ x: point.x, y: point.y });
        }
      });

      // Click on map (not pin) → close preview
      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["imoveis-pins", "clusters"] });
        if (features.length === 0) {
          setPreviewPin(null);
          setPreviewPos(null);
        }
      });

      map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "imoveis-pins", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const id = e.features?.[0]?.properties?.id;
        if (id) onPinHoverRef.current?.(id);
      });
      map.on("mouseleave", "imoveis-pins", () => {
        map.getCanvas().style.cursor = "";
        onPinHoverRef.current?.(null);
      });

      mapReadyRef.current = true;

      // FIX 3 — Report initial bounds once, flag it
      const initialBounds = map.getBounds();
      boundsRef.current = initialBounds;
      lastCenterRef.current = { lat: map.getCenter().lat, lng: map.getCenter().lng };

      if (onBoundsChangeRef.current && !initialBoundsReportedRef.current) {
        initialBoundsReportedRef.current = true;
        const sw = initialBounds.getSouthWest();
        const ne = initialBounds.getNorthEast();
        onBoundsChangeRef.current({ lat_min: sw.lat, lat_max: ne.lat, lng_min: sw.lng, lng_max: ne.lng });
      }

      // Set initial data if pins already available
      const source = map.getSource("imoveis") as mapboxgl.GeoJSONSource | undefined;
      if (source && pinsRef.current.length > 0) {
        source.setData(toGeoJSON(pinsRef.current));
      }
    });

    // FIX 5 & 9 — Debounce 800ms, smart popup close
    map.on("moveend", () => {
      if (!mapReadyRef.current) return;
      boundsRef.current = map.getBounds();

      // FIX 9 — Only close popup on significant movement
      const newCenter = map.getCenter();
      const distanceMoved = Math.sqrt(
        Math.pow(newCenter.lat - lastCenterRef.current.lat, 2) +
        Math.pow(newCenter.lng - lastCenterRef.current.lng, 2)
      );
      if (distanceMoved > 0.003) {
        setPreviewPin(null);
        setPreviewPos(null);
      }
      lastCenterRef.current = { lat: newCenter.lat, lng: newCenter.lng };

      const sw = boundsRef.current!.getSouthWest();
      const ne = boundsRef.current!.getNorthEast();
      const currentBounds = { lat_min: sw.lat, lat_max: ne.lat, lng_min: sw.lng, lng_max: ne.lng };

      // Always report bounds change for lazy pin loading
      onBoundsChangeRef.current?.(currentBounds);

      // FIX 5 — Auto-search with 800ms debounce
      if (autoSearchRef.current && onBoundsSearchRef.current) {
        if (autoSearchTimerRef.current) clearTimeout(autoSearchTimerRef.current);
        autoSearchTimerRef.current = window.setTimeout(() => {
          onBoundsSearchRef.current?.(currentBounds);
        }, 800);
      } else {
        setMapMoved(true);
      }
    });

    mapRef.current = map;

    return () => {
      mapReadyRef.current = false;
      if (autoSearchTimerRef.current) clearTimeout(autoSearchTimerRef.current);
      map.remove();
      mapRef.current = null;
      initRef.current = false;
      initialBoundsReportedRef.current = false;
    };
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (onBoundsSearchRef.current) {
      setMapMoved(false);
    }
  }, []);

  const finalizarDesenho = useCallback(() => {
    const map = mapRef.current;
    const finalPoints = drawPointsRef.current;
    if (!map || finalPoints.length < 3) return;

    const closed = [...finalPoints, finalPoints[0]];
    updateDrawSources(map, closed, true);
    setDrawMode(false);
    setHasDrawn(true);
    map.getCanvas().style.cursor = "";

    if (onDrawFilterRef.current) {
      const inside = pinsRef.current.filter(pin => {
        const lat = Number(pin.latitude);
        const lng = Number(pin.longitude);
        if (!lat || !lng) return false;
        return pointInPolygon([lng, lat], finalPoints);
      });
      onDrawFilterRef.current(inside);
    }

    if (finalPoints.length >= 3 && onBoundsSearchRef.current) {
      const lngs = finalPoints.map(p => p[0]);
      const lats = finalPoints.map(p => p[1]);
      onBoundsSearchRef.current({
        lng_min: Math.min(...lngs),
        lng_max: Math.max(...lngs),
        lat_min: Math.min(...lats),
        lat_max: Math.max(...lats),
      });
    }
  }, []);

  // ESC to cancel draw mode
  useEffect(() => {
    if (!drawMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearDraw();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [drawMode, clearDraw]);

  // Draw mode — click to add points, dblclick or button to finalize
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
        finalizarDesenho();
      };

      map.on("click", onClick);
      map.on("dblclick", onDblClick);
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
  }, [drawMode, finalizarDesenho]);




  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    const source = map.getSource("imoveis") as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    const geojson = toGeoJSON(pins);

    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => {
        source.setData(geojson);
      }, { timeout: 500 });
      return () => cancelIdleCallback(id);
    } else {
      requestAnimationFrame(() => {
        source.setData(geojson);
      });
    }
  }, [pins]);

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

      {/* Property preview popup — Airbnb style */}
      <AnimatePresence>
        {previewPin && previewPos && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-30 w-[260px] cursor-pointer"
            style={{
              left: Math.min(Math.max(previewPos.x - 130, 8), (containerRef.current?.offsetWidth ?? 400) - 268),
              top: previewPos.y - 10,
              transform: "translateY(-100%)",
            }}
            onClick={() => navigate(`/imovel/${previewPin.slug}`)}
          >
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              <div className="px-3 py-2.5">
                <p className="font-body text-sm font-bold text-foreground">{formatPrecoFull(previewPin.preco)}</p>
                <div className="mt-0.5 flex items-center gap-2 font-body text-xs text-muted-foreground">
                  {previewPin.quartos && (
                    <span className="flex items-center gap-0.5">
                      <Bed className="h-3 w-3" />
                      {previewPin.quartos}
                    </span>
                  )}
                  {previewPin.area_total && (
                    <span className="flex items-center gap-0.5">
                      <Maximize className="h-3 w-3" />
                      {previewPin.area_total}m²
                    </span>
                  )}
                  <span>· {previewPin.bairro}</span>
                </div>
                <p className="mt-1 font-body text-[11px] text-primary font-medium">Ver detalhes →</p>
              </div>
            </div>
            {/* Triangle pointer */}
            <div className="flex justify-center">
              <div className="h-2.5 w-2.5 rotate-45 border-b border-r border-border bg-card -mt-[6px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map toolbar — draw, nearby, auto-search */}
      {onBoundsSearch && !drawMode && !hasDrawn && (
        <div className="absolute bottom-12 left-3 right-3 z-20 flex flex-wrap items-center justify-center gap-2 sm:bottom-4 sm:left-4 sm:right-14 sm:justify-end">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("uhome:draw-area"))}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 font-body text-[12px] font-semibold text-muted-foreground shadow-lg transition-all hover:border-foreground/30 active:scale-[0.97]"
          >
            <PenTool className="h-3.5 w-3.5" />
            Desenhar área
          </button>
          {onPertoDeVoce && (
            <button
              onClick={onPertoDeVoce}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 font-body text-[12px] font-semibold text-muted-foreground shadow-lg transition-all hover:border-foreground/30 active:scale-[0.97]"
            >
              <Navigation className="h-3.5 w-3.5" />
              Perto de você
            </button>
          )}
          <button
            onClick={() => setAutoSearch(prev => !prev)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 font-body text-[12px] font-semibold shadow-lg transition-all active:scale-[0.97] ${
              autoSearch
                ? "border border-primary bg-primary/10 text-primary"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {autoSearch ? (
              <ToggleRight className="h-4 w-4 text-primary" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            Buscar ao mover
          </button>
        </div>
      )}

      {/* Draw mode indicator + confirm button */}
      <AnimatePresence>
        {drawMode && (
          <div className="absolute left-3 right-3 top-4 z-20 flex flex-wrap items-center gap-2 sm:left-4 sm:right-auto">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-body text-[13px] font-semibold text-primary-foreground shadow-lg"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              {drawPoints.length < 3
                ? `Clique no mapa para marcar pontos (${drawPoints.length}/3)`
                : `Área com ${drawPoints.length} pontos`
              }
              <button
                onClick={clearDraw}
                className="ml-1 rounded-full p-0.5 hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>

            {drawPoints.length >= 3 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={finalizarDesenho}
                className="flex items-center gap-1.5 rounded-full bg-card border-2 border-primary px-4 py-2 font-body text-[13px] font-bold text-primary shadow-lg transition-all hover:bg-primary hover:text-primary-foreground active:scale-[0.96]"
              >
                <Check className="h-4 w-4" />
                Buscar nessa área
              </motion.button>
            )}
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

      {/* Buscar nessa região — only show when NOT auto-searching */}
      <AnimatePresence>
        {mapMoved && onBoundsSearch && !drawMode && !hasDrawn && !autoSearch && (
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
