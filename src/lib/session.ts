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

/** Capture ?ref=slug from URL once per session, persist all corretor data */
export async function captureCorretorRef(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (!ref) return;

  const slug = ref.toLowerCase().trim();

  // Clean the URL without reload
  params.delete('ref');
  const clean = params.toString();
  const newUrl = window.location.pathname + (clean ? `?${clean}` : '') + window.location.hash;
  window.history.replaceState(null, '', newUrl);

  // Evita registrar visita duplicada na mesma sessão
  if (sessionStorage.getItem(`ref_captured_${slug}`)) return;
  sessionStorage.setItem(`ref_captured_${slug}`, '1');

  try {
    // Buscar dados completos do corretor
    const { data: corretor } = await supabase
      .from('profiles')
      .select('id, nome, foto_url, slug_ref')
      .eq('slug_ref', slug)
      .eq('ativo', true)
      .maybeSingle();

    if (!corretor) {
      // Still save the slug for basic tracking
      localStorage.setItem(REF_KEY, slug);
      localStorage.setItem('corretor_ref_ts', Date.now().toString());
      return;
    }

    // Salvar tudo no localStorage — igual ao que /c/:slug faz
    localStorage.setItem(REF_KEY, slug);
    localStorage.setItem('corretor_ref_id', corretor.id);
    localStorage.setItem('corretor_ref_slug', slug);
    localStorage.setItem('corretor_ref_nome', corretor.nome || '');
    localStorage.setItem('corretor_ref_ts', Date.now().toString());

    // Registrar visita
    await (supabase as any).from('corretor_visitas').insert({
      corretor_id: corretor.id,
      corretor_slug: slug,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    });
  } catch (err) {
    console.error('captureCorretorRef error:', err);
  }
}

export function getCorretorRef(): string | null {
  const slug = localStorage.getItem(REF_KEY) || localStorage.getItem('corretor_ref_slug');
  if (!slug) return null;
  // Check TTL (30 days)
  const ts = localStorage.getItem('corretor_ref_ts');
  if (ts && Date.now() - Number(ts) > 30 * 24 * 60 * 60 * 1000) {
    clearCorretorRef();
    return null;
  }
  return slug;
}

export function getCorretorRefId(): string | null {
  if (!getCorretorRef()) return null; // respects TTL
  return localStorage.getItem('corretor_ref_id');
}

export function getCorretorRefNome(): string | null {
  if (!getCorretorRef()) return null;
  return localStorage.getItem('corretor_ref_nome');
}

export function clearCorretorRef(): void {
  [
    REF_KEY, 'corretor_ref_id', 'corretor_ref_slug',
    'corretor_ref_nome', 'corretor_ref_ts'
  ].forEach(k => localStorage.removeItem(k));
}
