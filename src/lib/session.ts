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
  return localStorage.getItem(REF_KEY);
}

async function registerCorretorVisit(slug: string): Promise<void> {
  try {
    // Look up corretor by slug
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('slug_ref' as any, slug)
      .maybeSingle();

    await supabase.from('corretor_visitas' as any).insert({
      corretor_id: profile?.id || null,
      corretor_slug: slug,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    });
  } catch {
    // silent
  }
}
