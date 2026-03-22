import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = 'uhome_session_id';
const REF_KEY = 'uhome_corretor_ref';

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

/** Capture ?ref=slug from URL once per session and persist it */
export function captureCorretorRef(): void {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    // Always overwrite — latest link wins
    localStorage.setItem(REF_KEY, ref.toLowerCase().trim());
    // Clean the URL without reload
    params.delete('ref');
    const clean = params.toString();
    const newUrl = window.location.pathname + (clean ? `?${clean}` : '') + window.location.hash;
    window.history.replaceState(null, '', newUrl);
    // Fire-and-forget: register visit
    registerCorretorVisit(ref.toLowerCase().trim());
  }
}

export function getCorretorRef(): string | null {
  const slug = localStorage.getItem(REF_KEY) || localStorage.getItem('corretor_ref_slug');
  if (!slug) return null;
  // Check TTL
  const ts = localStorage.getItem('corretor_ref_ts');
  if (ts && Date.now() - Number(ts) > 30 * 24 * 60 * 60 * 1000) {
    [REF_KEY, 'corretor_ref_id', 'corretor_ref_slug', 'corretor_ref_nome', 'corretor_ref_ts']
      .forEach(k => localStorage.removeItem(k));
    return null;
  }
  return slug;
}

export function getCorretorRefId(): string | null {
  if (!getCorretorRef()) return null; // respects TTL
  return localStorage.getItem('corretor_ref_id');
}

async function registerCorretorVisit(slug: string): Promise<void> {
  try {
    // Look up corretor by slug
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('id')
      .eq('slug_ref', slug)
      .maybeSingle();

    await (supabase as any).from('corretor_visitas').insert({
      corretor_id: profile?.id || null,
      corretor_slug: slug,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    });
  } catch {
    // silent
  }
}
