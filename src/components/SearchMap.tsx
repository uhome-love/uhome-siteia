import { selosDoCard } from "@/lib/novidade";
import { FotosCard } from "@/components/search/FotosCard";
import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Bed, Maximize, ToggleLeft, ToggleRight, PenTool, Navigation, Check, Eye, Maximize2, Minimize2, Heart } from "lucide-react";
import { useFavoritos } from "@/hooks/useFavoritos";
import { motion, AnimatePresence } from "framer-motion";
import type mapboxgl from "mapbox-gl";

// Lazy-loaded mapbox reference — filled on first mount, NOT at module parse time
let mapboxModule: typeof import("mapbox-gl") | null = null;
let mapboxReadyPromise: Promise<typeof import("mapbox-gl")> | null = null;

function getMapboxReady(): Promise<typeof import("mapbox-gl")> {
  if (!mapboxReadyPromise) {
    mapboxReadyPromise = import("mapbox-gl").then((m) => {
      mapboxModule = m;
      // Load CSS dynamically to avoid blocking render
      if (typeof document !== "undefined" && !document.getElementById("mapbox-css")) {
        const link = document.createElement("link");
        link.id = "mapbox-css";
        link.rel = "stylesheet";
        link.href = "https://api.mapbox.com/mapbox-gl-js/v3.20.0/mapbox-gl.css";
        document.head.appendChild(link);
      }
      return m;
    });
  }
  return mapboxReadyPromise;
}

import { type MapPin as MapPinData } from "@/services/imoveis";
import { useCorretor } from "@/contexts/CorretorContext";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoibHVjYXN1aG9tZSIsImEiOiJjbW16c2l2dmUwYmxsMnJwdDI2bGxrazBkIn0.B4dp727gJlQQIWTci7GpFQ";

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
      .map((i, ordem) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [Number(i.longitude), Number(i.latitude)],
        },
        properties: {
          ordem,
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
          visto: vistosSet().has(String(i.id)),
        },
      })),
  };
}

// High-DPI pill sprite (Airbnb-style): crisp edges + soft drop shadow.
// Rendered at PILL_SCALE and registered with pixelRatio so text-fit stays sharp.
const PILL_SCALE = 3;

function createPillImage(fillColor: string, strokeColor: string, shadow = true): ImageData {
  const w = 72, h = 30, r = 15, pad = 6; // pad reserves room for the shadow
  const canvas = document.createElement("canvas");
  canvas.width = (w + pad * 2) * PILL_SCALE;
  canvas.height = (h + pad * 2) * PILL_SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(PILL_SCALE, PILL_SCALE);
  ctx.translate(pad, pad);

  if (shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.22)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 1.5;
  }
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
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
  fitToPins?: boolean;
  autoSearchPadrao?: boolean;
  carregando?: boolean;
}

const ALTURA_MINI_CARD = 270;
/** Decide se o mini card abre para cima ou para baixo do preço e quanto mover o mapa quando não cabe em nenhum lado
 *  (no celular a gaveta da lista cobre a parte de baixo e o botão "Voltar à lista" ocupa o topo). */
export function planoMiniCard(y: number, container: HTMLElement | null): { abreBaixo: boolean; moverY: number } {
  const caixa = container?.getBoundingClientRect();
  if (!caixa) return { abreBaixo: y < ALTURA_MINI_CARD, moverY: 0 };
  const gaveta = typeof document !== "undefined" ? document.querySelector(".gaveta-mapa") : null;
  const topo = gaveta ? 72 : 8;
  const limiteBaixo = gaveta ? Math.min(caixa.height, gaveta.getBoundingClientRect().top - caixa.top) - 8 : caixa.height - 8;
  const espacoBaixo = limiteBaixo - (y + 22);
  const espacoCima = y - 10 - topo;
  if (espacoBaixo >= ALTURA_MINI_CARD) return { abreBaixo: true, moverY: 0 };
  if (espacoCima >= ALTURA_MINI_CARD) return { abreBaixo: false, moverY: 0 };
  // Não cabe: leva o preço para baixo o suficiente para o card abrir para cima inteiro
  const alvo = topo + 10 + ALTURA_MINI_CARD;
  if (alvo + 20 <= limiteBaixo) return { abreBaixo: false, moverY: alvo - y };
  return { abreBaixo: espacoBaixo > espacoCima, moverY: 0 };
}

function vistosSet(): Set<string> {
  try { return new Set((JSON.parse(localStorage.getItem("imoveis_vistos") || "[]") as unknown[]).filter((v): v is string => typeof v === "string")); } catch { return new Set(); }
}

export function SearchMap({ pins = [], hoveredId, onPinHover, onBoundsSearch, onBoundsChange, onDrawFilter, onPertoDeVoce, fitToPins = false, autoSearchPadrao = false, carregando = false }: SearchMapProps) {
  const navigate = useNavigate();
  const { prefixLink } = useCorretor();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const initRef = useRef(false);
  const mapReadyRef = useRef(false);
  const boundsRef = useRef<mapboxgl.LngLatBounds | null>(null);
  const pinsRef = useRef(pins);
  const [mapMoved, setMapMoved] = useState(false);
  const [mapaPronto, setMapaPronto] = useState(false);
  const [autoSearch, setAutoSearch] = useState(true);
  const autoSearchRef = useRef(true);
  const [cheio, setCheio] = useState(false);
  const autoSearchTimerRef = useRef<number | null>(null);
  const boundsChangeTimerRef = useRef<number | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // FIX 3 — Flag to prevent double initial load
  const initialBoundsReportedRef = useRef(false);

  // Flag to suppress onBoundsChange during programmatic fitBounds (avoids zoom-in/zoom-out loop)
  const programmaticMoveRef = useRef(false);

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
  const { isFavorito, toggleFavorito } = useFavoritos();
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);
  // Recalcula os preços cinza (já vistos) quando a pessoa volta para esta aba/página
  const [vistosVersao, setVistosVersao] = useState(0);
  useEffect(() => {
    const atualizar = () => { if (document.visibilityState !== "hidden") setVistosVersao((v) => v + 1); };
    window.addEventListener("focus", atualizar);
    window.addEventListener("pageshow", atualizar);
    document.addEventListener("visibilitychange", atualizar);
    return () => { window.removeEventListener("focus", atualizar); window.removeEventListener("pageshow", atualizar); document.removeEventListener("visibilitychange", atualizar); };
  }, []);

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

  // Cleanup user marker on unmount
  useEffect(() => {
    return () => { userMarkerRef.current?.remove(); document.body.classList.remove("mapa-cheio"); };
  }, []);

  // Handle "Perto de você" — center map + add marker
  const handlePertoDeVoceInternal = useCallback(() => {
    if (!("geolocation" in navigator)) {
      import("sonner").then(({ toast }) => toast.error("Geolocalização não disponível"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const map = mapRef.current;

        // Also call parent handler for filter update
        onPertoDeVoce?.();

        if (map) {
          map.flyTo({ center: [longitude, latitude], zoom: 14, duration: 1200, essential: true });

          // Remove previous marker
          userMarkerRef.current?.remove();

          // Add user location marker
          const el = document.createElement("div");
          el.style.cssText = "width:18px;height:18px;background:hsl(var(--primary));border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);";
          userMarkerRef.current = new mapboxModule!.default.Marker(el).setLngLat([longitude, latitude]).addTo(map);

          import("sonner").then(({ toast }) => toast.success("Mapa centralizado na sua localização"));
        }
      },
      (err) => {
        const msg = err.code === err.PERMISSION_DENIED
          ? "Permissão de localização negada. Habilite nas configurações."
          : "Não foi possível obter sua localização";
        import("sonner").then(({ toast }) => toast.error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [onPertoDeVoce]);

  // Init map once — wait for mapbox module
  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    getMapboxReady().then((mb) => {
      if (!containerRef.current) return;
      mb.default.accessToken = MAPBOX_TOKEN;

      const map = new mb.default.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-51.2177, -30.0346],
        zoom: 11,
        minZoom: 7,
        maxZoom: 18,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: false,
        renderWorldCopies: false,
        fadeDuration: 120,
        antialias: false,
        refreshExpiredTiles: false,
      });

      map.addControl(new mb.default.NavigationControl({ showCompass: false }), "top-right");
      map.on("style.load", () => { for (const l of map.getStyle().layers ?? []) { if (/poi|transit/.test(l.id) && l.type === "symbol") map.setLayoutProperty(l.id, "visibility", "none"); if (l.type === "fill" && /^water/.test(l.id)) map.setPaintProperty(l.id, "fill-color", "#CDE6F2"); if (l.type === "fill" && /landuse|park|national-park/.test(l.id)) map.setPaintProperty(l.id, "fill-color", "#E3EFD9"); if (l.type === "background") map.setPaintProperty(l.id, "background-color", "#F5F3EF"); } });

    map.on("load", () => {
      // Cluster settings — lower maxZoom/radius to show price pins earlier
      map.addSource("imoveis", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: false,
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

      // Pontinhos (padrão Airbnb): todo imóvel tem um ponto; o preço aparece por cima quando cabe
      const dot = (fill: string) => { const c = document.createElement("canvas"); c.width = 44; c.height = 28; const g = c.getContext("2d")!; g.shadowColor = "rgba(0,0,0,0.22)"; g.shadowBlur = 4; g.shadowOffsetY = 1; g.fillStyle = fill; g.beginPath(); g.roundRect(6, 5, 32, 17, 8.5); g.fill(); g.shadowColor = "transparent"; g.strokeStyle = "rgba(0,0,0,0.12)"; g.lineWidth = 1; g.stroke(); return g.getImageData(0, 0, 44, 28); };
      map.addImage("pin-dot", dot("#FFFFFF"), { pixelRatio: 2 });
      map.addImage("pin-dot-visto", dot("#EBEBEB"), { pixelRatio: 2 });
      map.addLayer({
        id: "clusters",
        type: "symbol",
        source: "imoveis",
        layout: {
          "icon-image": ["case", ["boolean", ["get", "visto"], false], "pin-dot-visto", "pin-dot"],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      // Pill images — high-DPI with 9-slice stretch so corners never distort
      const pillOptions = {
        pixelRatio: PILL_SCALE,
        stretchX: [[63, 171]] as [number, number][],
        stretchY: [[60, 66]] as [number, number][],
        content: [18, 18, 234, 108] as [number, number, number, number],
      };
      map.addImage("pin-bg", createPillImage("#FFFFFF", "rgba(0,0,0,0.10)"), pillOptions);
      map.addImage("pin-bg-visto", createPillImage("#EBEBEB", "rgba(0,0,0,0.10)"), pillOptions);
      map.addImage("pin-bg-dark", createPillImage("#1A1A1A", "rgba(0,0,0,0.25)"), pillOptions);

      // Individual pins with collision management
      map.addLayer({
        id: "imoveis-pins",
        type: "symbol",
        source: "imoveis",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": ["case", ["boolean", ["get", "visto"], false], "pin-bg-visto", "pin-bg"],
          "icon-text-fit": "both",
          "icon-text-fit-padding": [7, 13, 7, 13],
          "icon-allow-overlap": false,
          "icon-ignore-placement": false,
          "icon-padding": 8,
          "text-field": ["get", "preco_label"],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 14,
          "text-allow-overlap": false,
          "text-optional": false,
          "text-anchor": "center",
          "symbol-sort-key": ["get", "ordem"],
        },
        paint: {
          "text-color": ["case", ["boolean", ["get", "visto"], false], "#6A6A6A", "#222222"],
          "icon-opacity": 1,
          "icon-opacity-transition": { duration: 180, delay: 0 },
        },
      });

      // Hovered / selected pin — always on top
      map.addLayer({
        id: "imoveis-pins-hover",
        type: "symbol",
        source: "imoveis",
        filter: ["==", ["get", "id"], ""],
        layout: {
          "icon-image": "pin-bg-dark",
          "icon-text-fit": "both",
          "icon-text-fit-padding": [7, 12, 7, 12],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "text-field": ["get", "preco_label"],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 14.5,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
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
      // Toque no pontinho aproxima o mapa até o preço aparecer
      map.on("click", "clusters", (e) => {
        if (map.queryRenderedFeatures(e.point, { layers: ["imoveis-pins"] }).length) return;
        const f = e.features?.[0]; if (!f) return;
        map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: Math.min(map.getZoom() + 2, 17) });
      });

      // Pin click → show preview popup
      map.on("click", "imoveis-pins", (e) => {
        const props = e.features?.[0]?.properties;
        if (!props) return;
        const pinData = pinsRef.current.find(p => p.id === props.id);
        if (pinData) {
          const coords = (e.features![0].geometry as GeoJSON.Point).coordinates as [number, number];
          const point = map.project(coords);
          setPreviewPin(pinData);
          const { moverY } = planoMiniCard(point.y, map.getContainer());
          if (moverY) {
            // Move o mapa para o mini card caber inteiro (sem disparar a busca ao mover)
            setPreviewPos(null);
            programmaticMoveRef.current = true;
            map.once("moveend", () => { const p = map.project(coords); setPreviewPin(pinData); setPreviewPos({ x: p.x, y: p.y }); });
            map.panBy([0, -moverY], { duration: 300 });
          } else {
            setPreviewPos({ x: point.x, y: point.y });
          }
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
      setMapaPronto(true);

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
    map.on("moveend", (ev: any) => {
      if (!mapReadyRef.current) return;
      const peloUsuario = !!ev?.originalEvent;
      boundsRef.current = map.getBounds();

      // Skip side-effects when fitBounds was triggered programmatically by us (prevents zoom loop)
      if (programmaticMoveRef.current) {
        programmaticMoveRef.current = false;
        lastCenterRef.current = { lat: map.getCenter().lat, lng: map.getCenter().lng };
        return;
      }

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

      // Report bounds change (debounced 350ms) for lazy pin loading
      if (boundsChangeTimerRef.current) clearTimeout(boundsChangeTimerRef.current);
      boundsChangeTimerRef.current = window.setTimeout(() => {
        onBoundsChangeRef.current?.(currentBounds);
      }, 350);

      // FIX 5 — Auto-search with 800ms debounce
      if (!peloUsuario) return;
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
    if (import.meta.env.DEV) (window as any).__uhMapa = map;
    }); // end getMapboxReady().then

    return () => {
      mapReadyRef.current = false;
      if (autoSearchTimerRef.current) clearTimeout(autoSearchTimerRef.current);
      mapRef.current?.remove();
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




  const lastFitIdsRef = useRef<string>("");
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    const source = map.getSource("imoveis") as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    const geojson = toGeoJSON(pins);

    const doFit = () => {
      if (fitToPins && pins.length > 0) {
        const idsKey = pins.map(p => p.id).sort().join(",");
        const caixa = map.getContainer().getBoundingClientRect();
        if (idsKey !== lastFitIdsRef.current && caixa.height > 200 && caixa.width > 200) {
          lastFitIdsRef.current = idsKey;
          map.resize();
          // Ignora coordenadas isoladas (geocodificação errada) para enquadrar a região real
          // Faixa central (10%–90%) ampliada em 40%: endereços mal geocodificados não afastam o mapa da cidade
          const corte = (v: number[]) => { const o = [...v].sort((x, y) => x - y); const n = o.length; if (n < 8) return [o[0], o[n - 1]]; const a = o[Math.floor(n * 0.1)], b = o[Math.ceil(n * 0.9) - 1], m = Math.max((b - a) * 0.4, 0.01); return [Math.max(o[0], a - m), Math.min(o[n - 1], b + m)]; };
          const [lngMin, lngMax] = corte(pins.map(p => Number(p.longitude)));
          const [latMin, latMax] = corte(pins.map(p => Number(p.latitude)));
          const sw: [number, number] = [lngMin, latMin];
          const ne: [number, number] = [lngMax, latMax];
          programmaticMoveRef.current = true;
          const gaveta = typeof document !== 'undefined' ? document.querySelector('.gaveta-mapa') : null;
          const cobre = gaveta ? Math.max(0, map.getContainer().getBoundingClientRect().bottom - gaveta.getBoundingClientRect().top) : 0;
          map.fitBounds([sw, ne], { padding: { top: 80, left: 40, right: 40, bottom: Math.min(cobre + 40, caixa.height - 160) }, maxZoom: 15, duration: 800 });
        }
      } else if (!fitToPins) {
        lastFitIdsRef.current = "";
      }
    };

    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => {
        source.setData(geojson);
        doFit();
      }, { timeout: 500 });
      return () => cancelIdleCallback(id);
    } else {
      requestAnimationFrame(() => {
        source.setData(geojson);
        doFit();
      });
    }
  }, [pins, fitToPins, mapaPronto, visivel, vistosVersao]);

  // Mapa aberto depois (celular): reenquadra quando o contêiner ganha tamanho
  useEffect(() => {
    const el = mapRef.current?.getContainer();
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setVisivel(e.contentRect.height > 200 && e.contentRect.width > 200));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mapaPronto]);

  // Hover from card OR selected pin (popup aberto) → destaque escuro no topo
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    if (!map.getLayer("imoveis-pins-hover")) return;

    const activeIds = [hoveredId, previewPin?.id].filter(Boolean) as string[];
    map.setFilter(
      "imoveis-pins-hover",
      activeIds.length
        ? (["in", ["get", "id"], ["literal", activeIds]] as unknown as mapboxgl.FilterSpecification)
        : (["==", ["get", "id"], ""] as unknown as mapboxgl.FilterSpecification),
    );
  }, [hoveredId, previewPin]);

  const handleBoundsSearch = useCallback(() => {
    if (!boundsRef.current || !onBoundsSearch) return;
    const sw = boundsRef.current.getSouthWest();
    const ne = boundsRef.current.getNorthEast();
    onBoundsSearch({ lat_min: sw.lat, lat_max: ne.lat, lng_min: sw.lng, lng_max: ne.lng });
    setMapMoved(false);
  }, [onBoundsSearch]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} data-testid="search-map" style={{ width: "100%", height: "100%", borderRadius: "12px" }} />

      {/* Property preview popup — with photo */}
      <AnimatePresence>
        {previewPin && previewPos && (() => {
          const { abreBaixo } = planoMiniCard(previewPos.y, containerRef.current);
          const larg = containerRef.current?.offsetWidth ?? 400;
          const esq = Math.min(Math.max(previewPos.x - 130, 8), larg - 268);
          const setaX = Math.min(Math.max(previewPos.x - esq, 16), 244);
          const jaVisto = vistosSet().has(String(previewPin.id));
          return (
          <motion.div
            data-testid="mini-card-mapa"
            data-abre={abreBaixo ? "baixo" : "cima"}
            initial={{ opacity: 0, y: abreBaixo ? 8 : "calc(-100% + 8px)", scale: 0.95 }}
            animate={{ opacity: 1, y: abreBaixo ? 0 : "-100%", scale: 1 }}
            exit={{ opacity: 0, y: abreBaixo ? 4 : "calc(-100% + 4px)", scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-30 w-[260px] cursor-pointer"
            style={{
              left: esq,
              top: abreBaixo ? previewPos.y + 22 : previewPos.y - 10,
            }}
            onClick={() => navigate(prefixLink(`/imovel/${previewPin.slug}`))}
          >
            {/* Pontinha apontando para o preço quando o card abre para baixo */}
            {abreBaixo && (
              <div className="relative z-10 h-[6px]">
                <div data-testid="seta-mini-card" data-direcao="cima" className="absolute top-[1px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t border-border bg-card" style={{ left: setaX }} />
              </div>
            )}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <div className="absolute right-2 top-2 z-20 flex gap-1.5">
                <button type="button" aria-label={isFavorito(String(previewPin.id)) ? "Remover dos favoritos" : "Salvar imóvel"} aria-pressed={isFavorito(String(previewPin.id))} className="grid h-8 w-8 place-items-center rounded-full bg-background/95 text-foreground shadow" onClick={(e) => { e.stopPropagation(); void toggleFavorito(String(previewPin.id)); }}><Heart className={`h-4 w-4 ${isFavorito(String(previewPin.id)) ? "fill-primary text-primary" : ""}`} /></button>
                <button type="button" aria-label="Fechar" className="grid h-8 w-8 place-items-center rounded-full bg-background/95 text-foreground shadow" onClick={(e) => { e.stopPropagation(); setPreviewPin(null); }}><X className="h-4 w-4" /></button>
              </div>
              {previewPin.foto ? (
                <div className="relative h-[130px] w-full overflow-hidden"><FotosCard id={String(previewPin.id)} produto={false} titulo={previewPin.titulo ?? ""}><img
                  src={previewPin.foto}
                  alt={previewPin.titulo}
                  className="h-[130px] w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                /></FotosCard></div>
              ) : null}
              {(() => { const c = pins.find((x) => String(x.id) === String(previewPin.id)) as any; const sl = selosDoCard(c?.publicado_em, c?.fase).foto; return sl ? <span className="absolute left-2 top-2 z-10 rounded-full bg-background px-2.5 py-1 font-body text-xs font-bold text-foreground shadow">{sl}</span> : null; })()}
              {previewPin.foto ? null : (
                <div className="flex h-[80px] w-full items-center justify-center bg-muted">
                  <span className="text-2xl opacity-30">🏠</span>
                </div>
              )}
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
                {jaVisto && (
                  <p data-testid="ja-visto" className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-body text-[11px] font-semibold text-muted-foreground">
                    <Eye className="h-3 w-3" aria-hidden="true" /> Você já viu
                  </p>
                )}
                <div className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-center font-body text-[12px] font-bold text-primary-foreground">
                  Ver imóvel →
                </div>
              </div>
            </div>
            {/* Pontinha apontando para o preço quando o card abre para cima */}
            {!abreBaixo && (
              <div className="relative z-10 h-[6px]">
                <div data-testid="seta-mini-card" data-direcao="baixo" className="absolute -top-[6px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-border bg-card" style={{ left: setaX }} />
              </div>
            )}
          </motion.div>
          );
        })()}
      </AnimatePresence>

      {onBoundsSearch && (
        <button type="button" aria-label={cheio ? "Mostrar lista" : "Ampliar mapa"} aria-pressed={cheio}
          onClick={() => { const n = !cheio; setCheio(n); document.body.classList.toggle("mapa-cheio", n); setTimeout(() => mapRef.current?.resize(), 50); }}
          className="mapa-ampliar absolute right-3 top-3 z-20 hidden h-10 w-10 place-items-center rounded-xl bg-card text-foreground shadow-lg lg:grid">
          {cheio ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      )}
      {carregando && <div aria-hidden className="mapa-carregando absolute inset-x-0 top-0 z-30 h-[3px] overflow-hidden"><span /></div>}
      {/* Map toolbar — draw, nearby */}
      {onBoundsSearch && !drawMode && !hasDrawn && (
        <div role="toolbar" aria-label="Ferramentas do mapa" className="absolute left-3 top-[68px] z-20 flex items-center gap-0.5 rounded-full bg-card p-1 shadow-lg lg:top-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("uhome:draw-area"))}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 font-body text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
          >
            <PenTool className="h-3.5 w-3.5" />
            Desenhar área
          </button>
          {onPertoDeVoce && (
            <button
              onClick={handlePertoDeVoceInternal}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 font-body text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
            >
              <Navigation className="h-3.5 w-3.5" />
              Perto de você
            </button>
          )}
        </div>
      )}

      {/* Draw mode indicator + confirm button */}
      <AnimatePresence>
        {drawMode && (
          <div className="absolute left-3 right-3 top-16 z-40 pointer-events-none flex flex-wrap items-center gap-2 [&>*]:pointer-events-auto sm:left-4 sm:right-auto sm:top-4">
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
          <div className="pointer-events-none absolute left-0 right-0 top-14 z-20 flex justify-center sm:top-4">
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
