import { useEffect, useState } from 'react';
import { useParams, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Layout for /c/:corretorSlug routes.
 * Registers visit in Supabase, then renders child routes.
 * Corretor data fetching/persistence is handled by CorretorContext.
 */
export function CorretorRefLayout() {
  const slug = useParams().corretorSlug;
  const location = useLocation();

  useEffect(() => {
    function registrar() {
      try {
        if (!slug) return;

        const jaRegistrado = sessionStorage.getItem('corretor_ref_registrado');

        if (jaRegistrado !== slug) {
          supabase
            .from('profiles')
            .select('id')
            .eq('slug_ref', slug)
            .eq('ativo', true)
            .maybeSingle()
            .then(({ data: corretor }) => {
              if (corretor) {
                supabase.from('corretor_visitas').insert({
                  corretor_id: corretor.id,
                  corretor_slug: slug,
                  user_agent: navigator.userAgent,
                  referrer: document.referrer,
                }).then(() => {
                  sessionStorage.setItem('corretor_ref_registrado', slug);
                });
              }
            });
        }
      } catch (err) {
        console.warn('[CorretorRef] Erro ao registrar visita:', err);
      }
    }

    registrar();
  }, [slug]);

  return <Outlet />;
}
