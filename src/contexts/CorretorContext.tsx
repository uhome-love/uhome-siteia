import { createContext, useContext, useMemo, ReactNode } from "react";
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
  const value = useMemo(() => {
    const slug = getCorretorRef();

    function prefixLink(path: string): string {
      if (!slug) return path;
      if (path.startsWith("/c/")) return path;
      return `/c/${slug}${path.startsWith("/") ? path : "/" + path}`;
    }

    return { slug, prefixLink };
  }, []);

  return (
    <CorretorContext.Provider value={value}>
      {children}
    </CorretorContext.Provider>
  );
}

export function useCorretor() {
  return useContext(CorretorContext);
}
