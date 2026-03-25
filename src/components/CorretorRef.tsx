import { useEffect, useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Layout for /c/:corretorSlug routes.
 * Registers visit in Supabase, then renders child routes.
 * Corretor data fetching/persistence is handled by CorretorContext.
 */
export function CorretorRefLayout() {
  const slug = useParams().corretorSlug;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function registrar() {
      try {
        if (!slug) { setReady(true); return; }

        const jaRegistrado = sessionStorage.getItem('corretor_ref_registrado');

        if (jaRegistrado !== slug) {
          const { data: corretor } = await supabase
            .from('profiles')
            .select('id')
            .eq('slug_ref', slug)
            .eq('ativo', true)
            .maybeSingle();

          if (corretor) {
            await supabase.from('corretor_visitas').insert({
              corretor_id: corretor.id,
              corretor_slug: slug,
              user_agent: navigator.userAgent,
              referrer: document.referrer,
            });
            sessionStorage.setItem('corretor_ref_registrado', slug);
          }
        }
      } catch (err) {
        console.warn('[CorretorRef] Erro ao registrar visita:', err);
      } finally {
        setReady(true);
      }
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
