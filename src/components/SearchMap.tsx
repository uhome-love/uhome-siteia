import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Imovel, fotoPrincipal, formatPreco } from "@/services/imoveis";

const MAPBOX_TOKEN = "pk.eyJ1IjoibHVjYXN1aG9tZSIsImEiOiJjbW16c2l2dmUwYmxsMnJwdDI2bGxrazBkIn0.B4dp727gJlQQIWTci7GpFQ";

interface SearchMapProps {
  imoveis: Imovel[];
}

export function SearchMap({ imoveis }: SearchMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const navigate = useNavigate();

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
        style: "mapbox://styles/mapbox/light-v11",
        center: [-51.18, -30.04],
        zoom: 12,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

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

  // Update source data when imoveis change
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
          precoLabel:
            p.preco >= 1000000
              ? `R$${(p.preco / 1000000).toFixed(1)}M`
              : `R$${(p.preco / 1000).toFixed(0)}k`,
          image: fotoPrincipal(p),
          precoFormatted: formatPreco(p.preco),
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
        clusterMaxZoom: 13,
        clusterRadius: 50,
      });

      // Cluster circles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "imoveis",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "hsl(235, 93%, 67%)",
          "circle-radius": ["step", ["get", "point_count"], 22, 10, 28, 50, 36],
          "circle-stroke-width": 3,
          "circle-stroke-color": "hsl(235, 93%, 80%)",
        },
      });

      // Cluster count text
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "imoveis",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 13,
        },
        paint: { "text-color": "#ffffff" },
      });

      // Individual points (unclustered)
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "imoveis",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "hsl(235, 93%, 67%)",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Click on cluster → zoom in
      map.on("click", "clusters", (e: any) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource("imoveis").getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          map.easeTo({ center: features[0].geometry.coordinates, zoom });
        });
      });

      // Click on individual point → popup
      map.on("click", "unclustered-point", (e: any) => {
        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates.slice();

        const popup = new mapboxgl.Popup({ offset: 12, closeButton: false, maxWidth: "220px" })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;" onclick="window.__navigateImovel('${props.slug}')">
              <img src="${props.image}" alt="" style="width:100%;height:90px;object-fit:cover;border-radius:8px 8px 0 0;" />
              <div style="padding:8px 10px;">
                <p style="font-size:11px;font-weight:600;color:#333;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${props.titulo}</p>
                <p style="font-size:10px;color:#888;margin:3px 0 0;">${props.bairro}</p>
                <p style="font-size:14px;font-weight:700;color:hsl(235,93%,67%);margin:5px 0 0;">${props.precoFormatted}</p>
              </div>
            </div>
          `)
          .addTo(map);
      });

      // Cursor pointers
      map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "unclustered-point", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "unclustered-point", () => { map.getCanvas().style.cursor = ""; });
    }

    // Fit bounds
    if (withCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      withCoords.forEach((p) => bounds.extend([p.longitude!, p.latitude!]));
      if (withCoords.length > 1) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 600 });
      } else {
        map.flyTo({ center: [withCoords[0].longitude!, withCoords[0].latitude!], zoom: 14, duration: 600 });
      }
    }
  }, [imoveis, mapLoaded, navigate]);

  // Expose navigation helper for popup clicks
  useEffect(() => {
    (window as any).__navigateImovel = (slug: string) => navigate(`/imovel/${slug}`);
    return () => { delete (window as any).__navigateImovel; };
  }, [navigate]);

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
        .mapboxgl-popup-content { background:#fff!important;border:1px solid hsl(0 0% 90%)!important;border-radius:10px!important;padding:0!important;overflow:hidden;box-shadow:0 6px 24px hsl(0 0% 0%/.1)!important; }
        .mapboxgl-popup-tip { border-top-color:#fff!important; }
      `}</style>
      <div ref={mapContainer} className="h-full w-full" />
    </>
  );
}
