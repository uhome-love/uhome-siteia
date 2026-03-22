import { useEffect, useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function CorretorRefLayout() {
  const slug = useParams().corretorSlug;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function registrar() {
      if (!slug) { setReady(true); return; }

      // Evita registrar visita duplicada na mesma sessão
      const jaRegistrado = sessionStorage.getItem('corretor_ref_registrado');

      const { data: corretor } = await supabase
        .from('profiles')
        .select('id, nome, foto_url')
        .eq('slug_ref', slug)
        .eq('ativo', true)
        .maybeSingle();

      if (corretor) {
        localStorage.setItem('corretor_ref_id', corretor.id);
        localStorage.setItem('corretor_ref_slug', slug);
        localStorage.setItem('uhome_corretor_ref', slug);
        localStorage.setItem('corretor_ref_nome', corretor.nome || '');
        localStorage.setItem('corretor_ref_foto', corretor.foto_url || '');
        localStorage.setItem('corretor_ref_ts', Date.now().toString());

        if (jaRegistrado !== slug) {
          await supabase.from('corretor_visitas').insert({
            corretor_id: corretor.id,
            corretor_slug: slug,
            user_agent: navigator.userAgent,
            referrer: document.referrer,
          });
          sessionStorage.setItem('corretor_ref_registrado', slug);
        }
      }

      setReady(true);
    }

    registrar();
  }, [slug]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="font-body text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
