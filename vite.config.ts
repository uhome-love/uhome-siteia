import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { bundleAnalysis } from "./scripts/bundleAnalysis";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://huigglwvvzuwwyqvpmec.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1aWdnbHd2dnp1d3d5cXZwbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTMzNzcsImV4cCI6MjA4OTYyOTM3N30.mi8RveT9gYhxP-sfq0GIN1jog-vU3Sxq511LCq5hhw4";

// https://vitejs.dev/config/
/** CSS principal não bloqueia a primeira pintura: carrega como preload e vira stylesheet ao chegar.
 *  O splash (estilo embutido no HTML) cobre a tela até o CSS aplicar — ver main.tsx. */
const cssAssincrono = {
  name: "uh-css-assincrono",
  apply: "build" as const,
  transformIndexHtml: {
    order: "post" as const,
    handler(html: string) {
      return html.replace(/<link rel="stylesheet"( crossorigin)? href="([^"]+\.css)">/g, (_m, co = "", href) =>
        `<link rel="preload" as="style" data-uh-css${co} href="${href}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet"${co} href="${href}"></noscript>`);
    },
  },
};

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), cssAssincrono, bundleAnalysis(), mode === "development" && componentTagger()].filter(Boolean),
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent duplicate React instances
    dedupe: ["react", "react-dom", "react-router-dom"],
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 2000,
    sourcemap: false,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        // No manualChunks — let Rollup decide chunk order to avoid circular dependencies.
        // The previous manualChunks caused react-vendor ↔ charts circular imports
        // because recharts/d3 shared helpers were placed in the charts chunk,
        // which react-vendor needed before charts was initialized.
      },
    },
  },
}));
