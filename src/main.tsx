import { createRoot } from "react-dom/client";
// Build trigger: env vars injection v2
import { HelmetProvider } from "react-helmet-async";
import { captureUtmParams, captureLeadIdentity } from "./lib/session";
import { registrarVisita } from "./lib/leadTracking";
import { instalarFunilAnuncio } from "./lib/funilAnuncio";
import { instalarRastreioWhatsApp } from "./services/whatsappTracker";
import App from "./App.tsx";
import { instalarJornada } from "./lib/journeyBrowser";
import { initGA4 } from "./lib/gtag";
initGA4();

// Capture UTMs + referrer on first page load (first-touch attribution)
captureUtmParams();
// Capture ?telefone= and ?email= from URL for lead identity (Radar de Intenção)
captureLeadIdentity();
registrarVisita();
instalarRastreioWhatsApp();
instalarFunilAnuncio();
instalarJornada();
// Montserrat (400–800) is self-hosted in index.css; no other font families load
import "./index.css";

if (import.meta.env.DEV) {
  import("./utils/testCorretorFlow").then(m => m.setupCorretorFlowTest());
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root missing");
rootEl.innerHTML = ""; // Remove static SEO fallback before React mounts
createRoot(rootEl).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Fade out the branded splash once React has painted
requestAnimationFrame(() => requestAnimationFrame(() => {
  const splash = document.getElementById("uh-splash");
  if (!splash) return;
  splash.classList.add("uh-out");
  setTimeout(() => splash.remove(), 350);
}));
