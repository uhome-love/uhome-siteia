const SESSION_KEY = 'uhome_session_id';
const UTM_KEY = 'uhome_utm_data';
const LEAD_TELEFONE_KEY = 'uhome_lead_telefone';
const LEAD_EMAIL_KEY = 'uhome_lead_email';

export function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// --- UTM first-touch persistence ---

interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  first_visit_at?: string;
  device?: string;
}

/** Capture lead identity params (?telefone=, ?email=) into sessionStorage */
export function captureLeadIdentity(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const tel = params.get('telefone');
    const email = params.get('email');
    if (tel) sessionStorage.setItem(LEAD_TELEFONE_KEY, tel);
    if (email) sessionStorage.setItem(LEAD_EMAIL_KEY, email);
  } catch { /* silent */ }
}

/** Get captured lead identity (telefone/email from URL params) */
export function getLeadIdentity(): { telefone?: string; email?: string } {
  try {
    const telefone = sessionStorage.getItem(LEAD_TELEFONE_KEY) || undefined;
    const email = sessionStorage.getItem(LEAD_EMAIL_KEY) || undefined;
    return { telefone, email };
  } catch {
    return {};
  }
}

/** Capture UTMs from URL + referrer + device on first visit (first-touch attribution) */
export function captureUtmParams(): void {
  const params = new URLSearchParams(window.location.search);

  const incoming: UtmData = {};
  const keys: (keyof UtmData)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  for (const k of keys) {
    const v = params.get(k);
    if (v) incoming[k] = v;
  }

  // Always capture referrer / landing_page / device on first visit
  const existing = getPersistedUtm();
  if (!existing) {
    // First visit — save everything
    const data: UtmData = {
      ...incoming,
      referrer: document.referrer || undefined,
      landing_page: window.location.pathname + window.location.search,
      first_visit_at: new Date().toISOString(),
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    };
    try { localStorage.setItem(UTM_KEY, JSON.stringify(data)); } catch { /* silent */ }
  } else if (Object.keys(incoming).length > 0 && !existing.utm_source) {
    // Existing visit without utm_source but new UTMs arrived — update UTMs only (keep first touch meta)
    const merged = { ...existing, ...incoming };
    try { localStorage.setItem(UTM_KEY, JSON.stringify(merged)); } catch { /* silent */ }
  }
}

function getPersistedUtm(): UtmData | null {
  try {
    const raw = localStorage.getItem(UTM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Get all persisted UTM + tracking data for lead submission */
export function getTrackingData(): UtmData {
  return getPersistedUtm() || {};
}

/** Get UTM params — backward compatible, returns persisted first-touch data */
export function getUtmParams() {
  const data = getPersistedUtm();
  return {
    utm_source: data?.utm_source || undefined,
    utm_medium: data?.utm_medium || undefined,
    utm_campaign: data?.utm_campaign || undefined,
    utm_term: data?.utm_term || undefined,
    utm_content: data?.utm_content || undefined,
  };
}

/** Classify the lead channel based on UTM + referrer */
export function classifyOrigemCanal(data: UtmData): string {
  const src = (data.utm_source || '').toLowerCase();
  const ref = (data.referrer || '').toLowerCase();

  // Priority: utm_source over referrer
  if (src) {
    if (src === 'google' || src === 'googleads') return 'Google Ads';
    if (src === 'facebook' || src === 'fb' || src === 'instagram' || src === 'ig' || src === 'meta') return 'Meta Ads';
    if (src === 'tiktok') return 'TikTok Ads';
    if (src === 'linkedin') return 'LinkedIn Ads';
    return `Campanha: ${data.utm_source}`;
  }

  // Fallback to referrer
  if (ref) {
    if (ref.includes('google')) return 'Google Orgânico';
    if (ref.includes('facebook') || ref.includes('instagram') || ref.includes('fb.com') || ref.includes('l.facebook')) return 'Social Orgânico';
    if (ref.includes('linkedin')) return 'Social Orgânico';
    if (ref.includes('youtube')) return 'YouTube';
    return 'Referral';
  }

  return 'Direto';
}

// --- Corretor reference: URL-based + module-level cache ---

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
