import { useState, useEffect } from "react";

interface PerfMetrics {
  mapaRequests: number;
  mapaPayloadKB: number;
  mapaLoadMs: number;
  pinsCarregados: number;
  listaPayloadKB: number;
  listaLoadMs: number;
  cacheHits: number;
}

const initial: PerfMetrics = {
  mapaRequests: 0,
  mapaPayloadKB: 0,
  mapaLoadMs: 0,
  pinsCarregados: 0,
  listaPayloadKB: 0,
  listaLoadMs: 0,
  cacheHits: 0,
};

export function PerformanceDebug() {
  // Only render in development mode
  if (!import.meta.env.DEV) return null;

  return <PerformanceDebugInner />;
}

function PerformanceDebugInner() {
  const [metrics, setMetrics] = useState<PerfMetrics>(initial);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setMetrics((prev) => ({
        ...prev,
        ...detail,
        mapaRequests:
          detail.mapaLoadMs !== undefined
            ? prev.mapaRequests + 1
            : prev.mapaRequests,
        cacheHits: detail.cacheHit ? prev.cacheHits + 1 : prev.cacheHits,
      }));
    };
    window.addEventListener("perf:update", handler);
    return () => window.removeEventListener("perf:update", handler);
  }, []);

  if (import.meta.env.PROD) return null;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          position: "fixed",
          bottom: 16,
          left: 16,
          background: "rgba(0,0,0,0.85)",
          color: "#00ff88",
          border: "1px solid rgba(0,255,136,0.3)",
          borderRadius: 8,
          padding: "6px 10px",
          fontSize: 11,
          fontFamily: "monospace",
          zIndex: 9999,
          cursor: "pointer",
        }}
      >
        ⚡ Perf
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        background: "rgba(0,0,0,0.9)",
        color: "#00ff88",
        padding: "12px 16px",
        borderRadius: 10,
        fontSize: 11,
        fontFamily: "monospace",
        zIndex: 9999,
        minWidth: 220,
        border: "1px solid rgba(0,255,136,0.3)",
        lineHeight: 1.7,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontWeight: 700, color: "white" }}>⚡ Performance</span>
        <button
          onClick={() => setCollapsed(true)}
          style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      <div>Mapa requests: <b>{metrics.mapaRequests}</b></div>
      <div>Payload (pins): <b>{metrics.mapaPayloadKB} KB</b></div>
      <div>Load time (pins): <b style={{ color: metrics.mapaLoadMs > 1000 ? "#ff4444" : "#00ff88" }}>{metrics.mapaLoadMs}ms</b></div>
      <div>Pins: <b>{metrics.pinsCarregados}</b></div>
      <div>Payload (lista): <b>{metrics.listaPayloadKB} KB</b></div>
      <div>Load time (lista): <b>{metrics.listaLoadMs}ms</b></div>
      <div>Cache hits: <b style={{ color: "#00ff88" }}>{metrics.cacheHits}</b></div>
    </div>
  );
}
