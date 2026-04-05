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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        manualChunks(id) {
          // Mapbox — chunk isolado, carregado apenas quando mapa é exibido
          if (id.includes("mapbox-gl")) return "mapbox-gl";
          // React core — sempre necessário, carregado primeiro
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) return "react-core";
          // React Router — necessário para navegação
          if (id.includes("node_modules/react-router")) return "react-router";
          // Radix UI — grande conjunto de componentes
          if (id.includes("node_modules/@radix-ui/")) return "radix-ui";
          // Supabase — cliente de dados
          if (id.includes("node_modules/@supabase/")) return "supabase";
          // Tanstack Query — gerenciamento de estado assíncrono
          if (id.includes("node_modules/@tanstack/")) return "tanstack-query";
          // Framer Motion — animações
          if (id.includes("node_modules/framer-motion")) return "framer-motion";
          // Lucide icons
          if (id.includes("node_modules/lucide-react")) return "lucide-icons";
          // Recharts — gráficos, só usado em admin
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-") || id.includes("node_modules/victory-")) return "charts";
          // Date utilities
          if (id.includes("node_modules/date-fns") || id.includes("node_modules/react-day-picker")) return "date-utils";
          // Form utilities
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform/") || id.includes("node_modules/zod")) return "form-utils";
          // Outros node_modules — vendor genérico
          if (id.includes("node_modules/")) return "vendor";
        },
      },
    },
  },
}));
