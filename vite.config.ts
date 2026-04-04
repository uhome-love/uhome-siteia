import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("mapbox-gl")) return "vendor-mapbox";
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) return "vendor-react";
          if (id.includes("react-router-dom")) return "vendor-router";
          if (id.includes("@tanstack/react-query")) return "vendor-query";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("@supabase/supabase-js")) return "vendor-supabase";
          // recharts only used in admin — isolate it
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          // cmdk + vaul are lazy-loaded components
          if (id.includes("cmdk")) return "vendor-cmdk";
          if (id.includes("vaul")) return "vendor-drawer";
          // Core UI primitives (Radix + sonner)
          if (id.includes("@radix-ui") || id.includes("sonner")) return "vendor-ui";
          if (id.includes("@fontsource")) return "vendor-fonts";
          if (id.includes("lucide-react")) return "vendor-icons";
        },
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
}));
