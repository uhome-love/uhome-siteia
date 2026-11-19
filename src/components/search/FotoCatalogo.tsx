import { useEffect, useRef, useState } from 'react';
import { cardFotoUrl } from '@/lib/searchImages';

/** Keep offscreen photos out of the browser's generous native lazy-load margin. */
export function FotoCatalogo({ src, titulo, primeira }: { src: string; titulo: string; primeira: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [perto, setPerto] = useState(primeira);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || perto) return;
    if (typeof IntersectionObserver === 'undefined') { setPerto(true); return; }
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { setPerto(true); io.disconnect(); }
    }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [perto]);
  useEffect(() => setFallback(false), [src]);
  return <img ref={ref} src={perto ? (fallback ? src : cardFotoUrl(src)) : undefined} alt={`${titulo} - foto 1`} width={768} height={691} fetchPriority={primeira ? 'high' : 'low'} decoding="async" draggable={false} onError={() => { if (src && !fallback) setFallback(true); }} />;
}