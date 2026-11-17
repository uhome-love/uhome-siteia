import { getJourneySession, getJourneyVisitorId, captureJourneyOrigin, origins } from "./journeyIdentity";
const UTM_KEY = 'uhome_utm_data';
const LEAD_TELEFONE_KEY = 'uhome_lead_telefone';
const LEAD_EMAIL_KEY = 'uhome_lead_email';

export function getSessionId(): string { return getJourneySession().id; }

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
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  landing_url?: string;
}

/** Capture lead identity params (?telefone=, ?email=) from CRM links and remember the person. */
export function captureLeadIdentity(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const tel = params.get('telefone');
    const email = params.get('email');
    if (tel || email) setLeadIdentity({ telefone: tel || undefined, email: email || undefined }, 'link_crm');
  } catch { /* silent */ }
}

/** Get remembered lead identity (persists across visits on this browser). */
export function getLeadIdentity(): { telefone?: string; email?: string } {
  try {
    const telefone = localStorage.getItem(LEAD_TELEFONE_KEY) || sessionStorage.getItem(LEAD_TELEFONE_KEY) || undefined;
    const email = localStorage.getItem(LEAD_EMAIL_KEY) || sessionStorage.getItem(LEAD_EMAIL_KEY) || undefined;
    return { telefone, email };
  } catch {
    return {};
  }
}

/**
 * Remember who this visitor is (after a form, LIA, visit booking or CRM link)
 * and link everything they did anonymously on this browser to their lead in the CRM.
 */
export function setLeadIdentity(id: { telefone?: string; email?: string; nome?: string }, origem: string): void {
  try {
    if (id.nome?.trim()) localStorage.setItem('uhome_lead_nome', id.nome.trim());
    const tel = id.telefone?.replace(/\D/g, '');
    const telOk = tel && tel.length >= 10 && tel.length <= 13 ? tel : undefined;
    const email = id.email?.trim().toLowerCase() || undefined;
    if (!telOk && !email) return;
    const atual = getLeadIdentity();
    if (telOk) localStorage.setItem(LEAD_TELEFONE_KEY, telOk);
    if (email) localStorage.setItem(LEAD_EMAIL_KEY, email);
    // Contact data stays in the lead pipeline, never in behavioral events.
    void getJourneyVisitorId();
  } catch { /* silent */ }
}

/** Capture UTMs from URL + referrer + device on first visit (first-touch attribution) */
export function captureUtmParams(): void { void captureJourneyOrigin(); }

function getPersistedUtm(): UtmData | null {
  const first = origins().primeira_origem;
  return Object.keys(first).length ? { ...first, first_visit_at: first.at } : null;
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
