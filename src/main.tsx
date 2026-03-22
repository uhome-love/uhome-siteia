import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "./index.css";

import { setupCorretorFlowTest } from "./utils/testCorretorFlow";
if (import.meta.env.DEV) setupCorretorFlowTest();

console.log("[uhome] App mounting...");
createRoot(document.getElementById("root")!).render(<App />);
