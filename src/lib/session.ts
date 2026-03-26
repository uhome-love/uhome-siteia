const SESSION_KEY = 'uhome_session_id';

export function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  };
}

// --- Corretor reference: URL-based + module-level cache ---
// CorretorContext calls setCorretorCache when it fetches data.
// Services call getCorretorRef / getCorretorRefId for attribution.

let _cachedSlug: string | null = null;
let _cachedId: string | null = null;

/** Called by CorretorContext to update the module-level cache */
export function setCorretorCache(slug: string | null, id: string | null): void {
  _cachedSlug = slug;
  _cachedId = id;
}

/** Get active corretor slug — reads from URL pathname, falls back to cache */
export function getCorretorRef(): string | null {
  const match = window.location.pathname.match(/^\/c\/([^/]+)/);
  if (match?.[1]) return match[1];
  return _cachedSlug;
}

/** Get active corretor profile ID — available after CorretorContext fetches */
export function getCorretorRefId(): string | null {
  if (!getCorretorRef()) return null;
  return _cachedId;
}
