import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
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

interface SearchMapProps {
  pins?: MapPinData[];
  hoveredId?: string | null;
  onPinHover?: (id: string | null) => void;
  onBoundsSearch?: (bounds: { lat_min: number; lat_max: number; lng_min: number; lng_max: number }) => void;
}

export function SearchMap({ pins = [], hoveredId, onPinHover, onBoundsSearch }: SearchMapProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const initRef = useRef(false);
  const mapReadyRef = useRef(false);
  const boundsRef = useRef<mapboxgl.LngLatBounds | null>(null);
  const pinsRef = useRef(pins);
  const [mapMoved, setMapMoved] = useState(false);

  // Keep ref in sync
  useEffect(() => { imoveisRef.current = imoveis; }, [imoveis]);

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

      // Set initial data — the imoveis effect may have already fired before map loaded
      const source = map.getSource("imoveis") as mapboxgl.GeoJSONSource | undefined;
      if (source && imoveisRef.current.length > 0) {
        const geo = toGeoJSON(imoveisRef.current);
        source.setData(geo);
        const validos = imoveisRef.current.filter((i) => {
          const lat = Number(i.latitude);
          const lng = Number(i.longitude);
          return lat && lng && lat < -28 && lat > -32 && lng < -49 && lng > -54;
        });
        if (validos.length > 0) {
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

  // Update data via source.setData — no DOM, no flicker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    const source = map.getSource("imoveis") as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData(toGeoJSON(imoveis));

    // Fit bounds
    const validos = imoveis.filter((i) => {
      const lat = Number(i.latitude);
      const lng = Number(i.longitude);
      return lat && lng && lat < -28 && lat > -32 && lng < -49 && lng > -54;
    });

    if (validos.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      validos.forEach((i) => bounds.extend([Number(i.longitude), Number(i.latitude)]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 500 });
    }
  }, [imoveis]);

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
