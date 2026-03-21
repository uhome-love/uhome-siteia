import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "./index.css";

console.log("[uhome] App mounting...");
createRoot(document.getElementById("root")!).render(<App />);
