const TTL = 30 * 24 * 60 * 60 * 1000; // 30 dias

export interface CorretorRefData {
  id: string;
  slug: string;
  nome: string;
}

export function useCorretorRef() {
  function getRef(): CorretorRefData | null {
    const id = localStorage.getItem('corretor_ref_id');
    const slug = localStorage.getItem('corretor_ref_slug');
    const nome = localStorage.getItem('corretor_ref_nome');
    const ts = localStorage.getItem('corretor_ref_ts');

    if (!id || !slug) return null;

    // Expirar após 30 dias
    if (ts && Date.now() - Number(ts) > TTL) {
      ['corretor_ref_id', 'corretor_ref_slug', 'corretor_ref_nome', 'corretor_ref_ts']
        .forEach(k => localStorage.removeItem(k));
      return null;
    }

    return { id, slug, nome: nome ?? '' };
  }

  function buildLeadPayload(extra: Record<string, any> = {}) {
    const ref = getRef();
    return {
      ...extra,
      corretor_ref_id: ref?.id ?? null,
      corretor_ref_slug: ref?.slug ?? null,
      origem_ref: ref ? 'link_corretor' : 'organico',
    };
  }

  function buildWhatsApp(numero: string, msg: string): string {
    const ref = getRef();
    const msgFinal = ref
      ? `${msg}\n\n_Atendimento: ${ref.nome}_`
      : msg;
    return `https://wa.me/${numero}?text=${encodeURIComponent(msgFinal)}`;
  }

  return { getRef, buildLeadPayload, buildWhatsApp };
}
