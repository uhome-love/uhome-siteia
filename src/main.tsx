import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./index.css";

// Lazy load mono font — not needed for initial render
import("@fontsource/dm-mono/400.css");

if (import.meta.env.DEV) {
  import("./utils/testCorretorFlow").then(m => m.setupCorretorFlowTest());
}

createRoot(document.getElementById("root")!).render(<App />);
