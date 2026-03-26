import { createRoot } from "react-dom/client";
import { captureUtmParams } from "./lib/session";
import App from "./App.tsx";

// Capture UTMs + referrer on first page load (first-touch attribution)
captureUtmParams();
// Critical font weights only — load eagerly
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "./index.css";

// Non-critical font weights — lazy load
import("@fontsource/plus-jakarta-sans/500.css");
import("@fontsource/plus-jakarta-sans/600.css");
import("@fontsource/plus-jakarta-sans/800.css");
import("@fontsource/dm-mono/400.css");

if (import.meta.env.DEV) {
  import("./utils/testCorretorFlow").then(m => m.setupCorretorFlowTest());
}

createRoot(document.getElementById("root")!).render(<App />);
