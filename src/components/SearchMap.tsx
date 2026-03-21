import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";

const MAPBOX_TOKEN = "pk.eyJ1IjoibHVjYXN1aG9tZSIsImEiOiJjbW16c2l2dmUwYmxsMnJwdDI2bGxrazBkIn0.B4dp727gJlQQIWTci7GpFQ";

function formatPinPreco(preco: number): string {
  if (preco >= 1_000_000) return `R$${(preco / 1_000_000).toFixed(1)}M`;
  if (preco >= 1_000) return `R$${Math.round(preco / 1_000)}k`;
  return `R$${preco}`;
}

interface SearchMapProps {
  imoveis: Imovel[];
}

export function SearchMap({ imoveis }: SearchMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const navigate = useNavigate();

  // Expose navigation helper for popup clicks
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
        locale: { "NavigationControl.ZoomIn": "+", "NavigationControl.ZoomOut": "−" },
      });

      map.addControl(
        new mapboxgl.default.NavigationControl({ showCompass: false }),
        "top-right"
      );
      map.addControl(
        new mapboxgl.default.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
          showUserHeading: false,
        }),
        "top-right"
      );

      map.on("load", () => {
        if (cancelled) return;
        setMapLoaded(true);
      });

      mapRef.current = { map, mapboxgl: mapboxgl.default };
    }).catch(() => { setMapError(true); });

    return () => {
      cancelled = true;
      mapRef.current?.map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update data
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const { map, mapboxgl } = mapRef.current;

    const withCoords = imoveis.filter((p) => p.latitude && p.longitude);

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: withCoords.map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [p.longitude!, p.latitude!] },
        properties: {
          id: p.id,
          slug: p.slug,
          titulo: p.titulo,
          bairro: p.bairro,
          preco: p.preco,
          preco_label: formatPinPreco(p.preco),
          preco_formatted: formatPreco(p.preco),
          foto_url: fotoPrincipal(p),
          quartos: p.quartos ?? 0,
          area: p.area_total ?? p.area_util ?? 0,
        },
      })),
    };

    const source = map.getSource("imoveis");
    if (source) {
      source.setData(geojson);
    } else {
      map.addSource("imoveis", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 40,
      });

      // Cluster circles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "imoveis",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "hsl(235, 93%, 67%)",
          "circle-radius": ["step", ["get", "point_count"], 22, 10, 28, 50, 36, 200, 44],
          "circle-opacity": 0.92,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Cluster count
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "imoveis",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 13,
          "text-allow-overlap": true,
        },
        paint: { "text-color": "#ffffff" },
      });

      // Individual price pins
      map.addLayer({
        id: "imovel-pin-bg",
        type: "circle",
        source: "imoveis",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "hsl(235, 93%, 67%)",
          "circle-radius": 18,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "imovel-pin-label",
        type: "symbol",
        source: "imoveis",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["get", "preco_label"],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 10,
          "text-allow-overlap": false,
          "icon-allow-overlap": true,
        },
        paint: { "text-color": "#ffffff" },
      });

      // Click cluster → zoom
      map.on("click", "clusters", (e: any) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource("imoveis").getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          map.easeTo({ center: features[0].geometry.coordinates, zoom });
        });
      });

      // Click individual pin → navigate
      map.on("click", "imovel-pin-bg", (e: any) => {
        const slug = e.features[0].properties.slug;
        if (slug) navigate(`/imovel/${slug}`);
      });

      // Hover individual pin → popup
      map.on("mouseenter", "imovel-pin-bg", (e: any) => {
        map.getCanvas().style.cursor = "pointer";
        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates.slice();

        if (popupRef.current) popupRef.current.remove();

        const statsLine = [
          props.area > 0 ? `${props.area}m²` : null,
          props.quartos > 0 ? `${props.quartos} quartos` : null,
        ].filter(Boolean).join(" · ");

        popupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 20,
          className: "uhome-popup",
        })
          .setLngLat(coords)
          .setHTML(`
            <div style="width:220px;cursor:pointer;" onclick="window.__navigateImovel('${props.slug}')">
              <img src="${props.foto_url}" alt="" style="width:100%;height:110px;object-fit:cover;" />
              <div style="padding:10px 12px;">
                <p style="font-size:11px;color:#888;margin:0 0 2px;">${props.bairro}</p>
                <p style="font-size:13px;font-weight:600;margin:0 0 4px;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${props.titulo}</p>
                <p style="font-size:15px;font-weight:700;color:hsl(235,93%,67%);margin:0;">${props.preco_formatted}</p>
                ${statsLine ? `<p style="font-size:11px;color:#666;margin:4px 0 0;">${statsLine}</p>` : ""}
              </div>
            </div>
          `)
          .addTo(map);
      });

      map.on("mouseleave", "imovel-pin-bg", () => {
        map.getCanvas().style.cursor = "";
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      });

      // Cluster cursors
      map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
    }

    // Fit bounds
    if (withCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      withCoords.forEach((p) => bounds.extend([p.longitude!, p.latitude!]));
      if (withCoords.length > 1) {
        map.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 60, right: 60 }, maxZoom: 14, duration: 800 });
      } else {
        map.flyTo({ center: [withCoords[0].longitude!, withCoords[0].latitude!], zoom: 14, duration: 800 });
      }
    }
  }, [imoveis, mapLoaded, navigate]);

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
      <div ref={mapContainer} className="h-full w-full" />
    </>
  );
}
