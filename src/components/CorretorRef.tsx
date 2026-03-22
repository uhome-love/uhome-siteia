import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function CorretorRef() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function registrar() {
      if (!slug) { navigate('/'); return; }

      const { data: corretor } = await supabase
        .from('profiles')
        .select('id, nome')
        .eq('slug_ref', slug)
        .eq('ativo', true)
        .maybeSingle();

      if (corretor) {
        localStorage.setItem('corretor_ref_id', corretor.id);
        localStorage.setItem('corretor_ref_slug', slug);
        localStorage.setItem('corretor_ref_nome', corretor.nome || '');
        localStorage.setItem('corretor_ref_ts', Date.now().toString());

        await supabase.from('corretor_visitas').insert({
          corretor_id: corretor.id,
          corretor_slug: slug,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
        });
      }

      const destino = searchParams.get('para') || '/busca';
      navigate(decodeURIComponent(destino), { replace: true });
    }

    registrar();
  }, [slug, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="font-body text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
