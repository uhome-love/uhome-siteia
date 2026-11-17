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
performance.mark("uh-app-evaluation");
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

// Recuperação de arquivo ausente concluída: limpa a marca e o parâmetro técnico da URL.
try {
  sessionStorage.removeItem("uh_rec");
  const u = new URL(location.href);
  if (u.searchParams.has("__uh_novo")) { u.searchParams.delete("__uh_novo"); history.replaceState(history.state, "", u.toString()); }
} catch { /* ignore */ }

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

/** O CSS principal chega sem bloquear (ver vite.config.ts); o splash só sai depois dele aplicado. */
function cssPronto(): Promise<void> {
  const link = document.querySelector<HTMLLinkElement>("link[data-uh-css]");
  if (!link || (link.rel === "stylesheet" && link.sheet)) return Promise.resolve();
  return new Promise((ok) => {
    const fim = () => ok();
    link.addEventListener("load", fim, { once: true });
    link.addEventListener("error", fim, { once: true });
    setTimeout(fim, 4000);
  });
}

// Fade out the branded splash once React has painted and the stylesheet applied
cssPronto().then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
  const splash = document.getElementById("uh-splash");
  if (!splash) return;
  splash.classList.add("uh-out");
  setTimeout(() => splash.remove(), 350);
})));
