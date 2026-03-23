import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const REF_KEY = "uhome_corretor_ref";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface CorretorData {
  id: string;
  nome: string;
  foto_url: string | null;
  telefone: string | null;
  creci: string | null;
  slug: string;
}

interface CorretorContextValue {
  slug: string | null;
  corretor: CorretorData | null;
  prefixLink: (path: string) => string;
}

const CorretorContext = createContext<CorretorContextValue>({
  slug: null,
  corretor: null,
  prefixLink: (path) => path,
});

/** Read slug from localStorage respecting TTL */
function getPersistedSlug(): string | null {
  const slug = localStorage.getItem(REF_KEY) || localStorage.getItem("corretor_ref_slug");
  if (!slug) return null;
  const ts = localStorage.getItem("corretor_ref_ts");
  if (ts && Date.now() - Number(ts) > TTL_MS) {
    // Expired — clean up
    [REF_KEY, "corretor_ref_id", "corretor_ref_slug", "corretor_ref_nome", "corretor_ref_foto", "corretor_ref_ts"].forEach(k => localStorage.removeItem(k));
    return null;
  }
  return slug;
}

/** Persist corretor data to localStorage */
function persistCorretor(data: CorretorData) {
  localStorage.setItem(REF_KEY, data.slug);
  localStorage.setItem("corretor_ref_slug", data.slug);
  localStorage.setItem("corretor_ref_id", data.id);
  localStorage.setItem("corretor_ref_nome", data.nome);
  localStorage.setItem("corretor_ref_foto", data.foto_url || "");
  localStorage.setItem("corretor_ref_ts", Date.now().toString());
}

export function CorretorProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [corretor, setCorretor] = useState<CorretorData | null>(null);
  const [fetchedSlug, setFetchedSlug] = useState<string | null>(null);

  // Determine active slug: URL > localStorage
  const activeSlug = useMemo(() => {
    const match = location.pathname.match(/^\/c\/([^/]+)/);
    return match?.[1] ?? getPersistedSlug();
  }, [location.pathname]);

  // Fetch corretor data from Supabase once per slug
  useEffect(() => {
    if (!activeSlug) {
      setCorretor(null);
      setFetchedSlug(null);
      return;
    }

    // Already fetched for this slug
    if (fetchedSlug === activeSlug && corretor) return;

    // Try to hydrate from localStorage first for instant render
    const cachedId = localStorage.getItem("corretor_ref_id");
    const cachedNome = localStorage.getItem("corretor_ref_nome");
    const cachedSlugStored = localStorage.getItem("corretor_ref_slug");
    if (cachedSlugStored === activeSlug && cachedId && cachedNome) {
      const cached: CorretorData = {
        id: cachedId,
        nome: cachedNome,
        foto_url: localStorage.getItem("corretor_ref_foto") || null,
        telefone: null, // will be updated after fetch
        creci: null,
        slug: activeSlug,
      };
      setCorretor(cached);
    }

    // Fetch from DB
    supabase
      .from("profiles")
      .select("id, nome, foto_url, telefone, creci, slug_ref")
      .eq("slug_ref", activeSlug)
      .eq("ativo", true)
      .maybeSingle()
      .then(({ data }) => {
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
          persistCorretor(c);
          window.dispatchEvent(new Event("corretor-ref-ready"));
        } else {
          // Slug not found — still persist slug for basic tracking
          localStorage.setItem(REF_KEY, activeSlug);
          localStorage.setItem("corretor_ref_slug", activeSlug);
          localStorage.setItem("corretor_ref_ts", Date.now().toString());
          setFetchedSlug(activeSlug);
        }
      });
  }, [activeSlug, fetchedSlug, corretor]);

  const value = useMemo(() => {
    function prefixLink(path: string): string {
      if (!activeSlug) return path;
      if (path.startsWith("/c/")) return path;
      return `/c/${activeSlug}${path.startsWith("/") ? path : "/" + path}`;
    }
    return { slug: activeSlug, corretor, prefixLink };
  }, [activeSlug, corretor]);

  return (
    <CorretorContext.Provider value={value}>
      {children}
    </CorretorContext.Provider>
  );
}

export function useCorretor() {
  return useContext(CorretorContext);
}
