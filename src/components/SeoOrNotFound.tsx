import { lazy, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { parseSeoSlug } from "@/data/seoPages";

const SeoLanding = lazy(() => import("../pages/SeoLanding.tsx"));
const NotFound = lazy(() => import("../pages/NotFound.tsx"));

/**
 * Catch-all route component: if the current path matches a SEO slug pattern,
 * render SeoLanding; otherwise render NotFound.
 *
 * This fixes the React Router v6 issue where wildcard routes like
 * `/apartamentos-/*` require a `/` separator and don't match
 * `/apartamentos-auxiliadora`.
 */
export default function SeoOrNotFound() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, "");
  const isSeo = useMemo(() => !!parseSeoSlug(slug), [slug]);

  return isSeo ? <SeoLanding /> : <NotFound />;
}
