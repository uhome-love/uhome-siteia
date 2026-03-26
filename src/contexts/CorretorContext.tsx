import { createContext, useContext, useMemo, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { setCorretorCache } from "@/lib/session";

export interface CorretorData {
  id: string;
  nome: string;
  foto_url: string | null;
  telefone: string | null;
  creci: string | null;
  slug: string;
}

interface CorretorContextValue {
  /** Active slug — only set when URL contains /c/:slug */
  slug: string | null;
  /** Corretor data (fetched from DB) */
  corretor: CorretorData | null;
  /** Whether the user is on a /c/ URL */
  isDirectAccess: boolean;
  /** Prefix links with /c/:slug when on a corretor URL */
  prefixLink: (path: string) => string;
}

const CorretorContext = createContext<CorretorContextValue>({
  slug: null,
  corretor: null,
  isDirectAccess: false,
  prefixLink: (path) => path,
});

export function CorretorProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [corretor, setCorretor] = useState<CorretorData | null>(null);
  const [fetchedSlug, setFetchedSlug] = useState<string | null>(null);
  const fetchingRef = useRef<string | null>(null);

  // Active slug comes exclusively from the current URL
  const activeSlug = useMemo(() => {
    const match = location.pathname.match(/^\/c\/([^/]+)/);
    const raw = match?.[1] ?? null;
    if (!raw || raw.startsWith(":") || raw.length < 2 || !/^[a-z0-9]/.test(raw)) return null;
    return raw;
  }, [location.pathname]);

  const isDirectAccess = activeSlug !== null;

  // Fetch corretor data from DB once per slug
  useEffect(() => {
    if (!activeSlug) {
      setCorretor(null);
      setFetchedSlug(null);
      fetchingRef.current = null;
      setCorretorCache(null, null);
      return;
    }

    if (fetchedSlug === activeSlug || fetchingRef.current === activeSlug) return;

    fetchingRef.current = activeSlug;

    supabase
      .from("profiles")
      .select("id, nome, foto_url, telefone, creci, slug_ref")
      .eq("slug_ref", activeSlug)
      .eq("ativo", true)
      .maybeSingle()
      .then(({ data }) => {
        if (fetchingRef.current !== activeSlug) return;

        if (data) {
          const c: CorretorData = {
            id: data.id,
            nome: data.nome || activeSlug,
            foto_url: data.foto_url,
            telefone: data.telefone,
            creci: data.creci,
            slug: activeSlug,
          };
          setCorretor(c);
          setFetchedSlug(activeSlug);
          setCorretorCache(activeSlug, c.id);
          window.dispatchEvent(new Event("corretor-ref-ready"));
        } else {
          setCorretor(null);
          setFetchedSlug(activeSlug);
          setCorretorCache(activeSlug, null);
        }
      });
  }, [activeSlug, fetchedSlug]);

  const value = useMemo(() => {
    function prefixLink(path: string): string {
      if (!isDirectAccess || !activeSlug) return path;
      if (path.startsWith("/c/")) return path;
      return `/c/${activeSlug}${path.startsWith("/") ? path : "/" + path}`;
    }
    return { slug: activeSlug, corretor, isDirectAccess, prefixLink };
  }, [activeSlug, corretor, isDirectAccess]);

  return (
    <CorretorContext.Provider value={value}>
      {children}
    </CorretorContext.Provider>
  );
}

export function useCorretor() {
  return useContext(CorretorContext);
}
