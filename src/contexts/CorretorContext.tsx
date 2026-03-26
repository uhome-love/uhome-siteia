import { createContext, useContext, useMemo, useState, useEffect, useCallback, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const REF_KEY = "uhome_corretor_ref";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface CorretorData {
  id: string;
  nome: string;
  foto_url: string | null;
  telefone: string | null;
  creci: string | null;
  slug: string;
}

interface CorretorContextValue {
  /** Active slug (from URL or localStorage) — used for silent attribution */
  slug: string | null;
  /** Corretor data (fetched from DB) */
  corretor: CorretorData | null;
  /** Whether the user arrived via /c/ URL — controls banner & URL prefixing */
  isDirectAccess: boolean;
  /** Prefix links with /c/:slug only when isDirectAccess */
  prefixLink: (path: string) => string;
  /** Clear corretor reference from localStorage */
  clearCorretor: () => void;
}

const CorretorContext = createContext<CorretorContextValue>({
  slug: null,
  corretor: null,
  isDirectAccess: false,
  prefixLink: (path) => path,
  clearCorretor: () => {},
});

const STORAGE_KEYS = [
  REF_KEY, "corretor_ref_id", "corretor_ref_slug",
  "corretor_ref_nome", "corretor_ref_foto", "corretor_ref_ts",
];

/** Read slug from localStorage respecting TTL */
function getPersistedSlug(): string | null {
  const slug = localStorage.getItem(REF_KEY) || localStorage.getItem("corretor_ref_slug");
  if (!slug) return null;
  const ts = localStorage.getItem("corretor_ref_ts");
  if (ts && Date.now() - Number(ts) > TTL_MS) {
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
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

  // Check if current URL has /c/:slug
  const urlSlug = useMemo(() => {
    const match = location.pathname.match(/^\/c\/([^/]+)/);
    const raw = match?.[1] ?? null;
    // Reject invalid slugs (React Router param names, empty, or special chars)
    if (!raw || raw.startsWith(":") || raw.length < 2 || !/^[a-z0-9]/.test(raw)) return null;
    return raw;
  }, [location.pathname]);

  // isDirectAccess = user is currently on a /c/ URL
  const isDirectAccess = urlSlug !== null;

  // Active slug for attribution: URL > localStorage
  const activeSlug = urlSlug ?? getPersistedSlug();

  // Clear function
  const clearCorretor = useCallback(() => {
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    setCorretor(null);
    setFetchedSlug(null);
  }, []);

  // Fetch corretor data from Supabase once per slug
  useEffect(() => {
    if (!activeSlug) {
      setCorretor(null);
      setFetchedSlug(null);
      return;
    }

    if (fetchedSlug === activeSlug && corretor) return;

    // Hydrate from localStorage for instant render
    const cachedId = localStorage.getItem("corretor_ref_id");
    const cachedNome = localStorage.getItem("corretor_ref_nome");
    const cachedSlugStored = localStorage.getItem("corretor_ref_slug");
    if (cachedSlugStored === activeSlug && cachedId && cachedNome) {
      setCorretor({
        id: cachedId,
        nome: cachedNome,
        foto_url: localStorage.getItem("corretor_ref_foto") || null,
        telefone: null,
        creci: null,
        slug: activeSlug,
      });
    }

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
          localStorage.setItem(REF_KEY, activeSlug);
          localStorage.setItem("corretor_ref_slug", activeSlug);
          localStorage.setItem("corretor_ref_ts", Date.now().toString());
          setFetchedSlug(activeSlug);
        }
      });
  }, [activeSlug, fetchedSlug, corretor]);

  const value = useMemo(() => {
    // Only prefix links when user arrived via /c/ URL
    function prefixLink(path: string): string {
      if (!isDirectAccess || !activeSlug) return path;
      if (path.startsWith("/c/")) return path;
      return `/c/${activeSlug}${path.startsWith("/") ? path : "/" + path}`;
    }
    return { slug: activeSlug, corretor, isDirectAccess, prefixLink, clearCorretor };
  }, [activeSlug, corretor, isDirectAccess, clearCorretor]);

  return (
    <CorretorContext.Provider value={value}>
      {children}
    </CorretorContext.Provider>
  );
}

export function useCorretor() {
  return useContext(CorretorContext);
}
