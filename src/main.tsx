import { createRoot } from "react-dom/client";
// Build trigger: env vars injection v2
import { HelmetProvider } from "react-helmet-async";
import { captureUtmParams, captureLeadIdentity } from "./lib/session";
import App from "./App.tsx";

// Capture UTMs + referrer on first page load (first-touch attribution)
captureUtmParams();
// Capture ?telefone= and ?email= from URL for lead identity (Radar de Intenção)
captureLeadIdentity();
// All fonts lazy-loaded — system font stack covers initial render
import "./index.css";

const loadDeferredFonts = () => {
  import("@fontsource/plus-jakarta-sans/400.css");
  import("@fontsource/plus-jakarta-sans/700.css");
  import("@fontsource/plus-jakarta-sans/500.css");
  import("@fontsource/plus-jakarta-sans/600.css");
  import("@fontsource/plus-jakarta-sans/800.css");
  import("@fontsource/dm-mono/400.css");
};

const scheduleIdleCallback = (
  globalThis as typeof globalThis & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  }
).requestIdleCallback;

// Load fonts after initial paint to avoid render-blocking
if (typeof scheduleIdleCallback === "function") {
  scheduleIdleCallback(loadDeferredFonts, { timeout: 2000 });
} else {
  setTimeout(loadDeferredFonts, 1);
}

if (import.meta.env.DEV) {
  import("./utils/testCorretorFlow").then(m => m.setupCorretorFlowTest());
}

const rootEl = document.getElementById("root")!;
rootEl.innerHTML = ""; // Remove static SEO fallback before React mounts
createRoot(rootEl).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
