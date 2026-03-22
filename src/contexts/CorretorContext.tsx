import { createContext, useContext, useMemo, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getCorretorRef } from "@/lib/session";

interface CorretorContextValue {
  slug: string | null;
  prefixLink: (path: string) => string;
}

const CorretorContext = createContext<CorretorContextValue>({
  slug: null,
  prefixLink: (path) => path,
});

export function CorretorProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  // Recalcular quando a URL mudar — captura /c/:slug dinamicamente
  const value = useMemo(() => {
    const match = location.pathname.match(/^\/c\/([^/]+)/);
    const slugFromUrl = match?.[1] ?? null;

    // Priorizar URL, depois localStorage
    const slug = slugFromUrl || getCorretorRef();

    function prefixLink(path: string): string {
      if (!slug) return path;
      if (path.startsWith("/c/")) return path;
      return `/c/${slug}${path.startsWith("/") ? path : "/" + path}`;
    }

    return { slug, prefixLink };
  }, [location.pathname]);

  return (
    <CorretorContext.Provider value={value}>
      {children}
    </CorretorContext.Provider>
  );
}

export function useCorretor() {
  return useContext(CorretorContext);
}
