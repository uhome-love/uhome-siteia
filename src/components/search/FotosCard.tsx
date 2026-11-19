import { useEffect, useRef, useState } from 'react';

const prontas = new Set<string>();
/** Baixa e decodifica a foto antes de ela ser mostrada, para a troca ser instantânea. */
function preparar(url?: string) { if (!url) return; const u = cardFotoUrl(url); if (prontas.has(u)) return; prontas.add(u); const im = new Image(); im.decoding = 'async'; im.src = u; im.decode?.().catch(() => {}); }
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseLazy';
import { cardFotoUrl } from '@/lib/searchImages';
import { indiceDoScroll } from './fotosIndice';

const cache = new Map<string, Promise<string[]>>();
/** Até 5 fotos do card, pedidas só na primeira interação. */
export function fotosDoCard(id: string, produto: boolean): Promise<string[]> {
  if (!cache.has(id)) cache.set(id, (async () => {
    if (produto) {
      const { data } = await supabase.from('produtos_foco').select('galeria').eq('id', id).maybeSingle();
      return ((data?.galeria as any[]) ?? []).map((g) => g?.url_mobile || g?.url).filter(Boolean).slice(0, 5);
    }
    const { data } = await supabase.from('imoveis').select('fotos').eq('id', id).maybeSingle();
    return ((data?.fotos as any[]) ?? []).slice().sort((a, b) => (a?.ordem ?? 0) - (b?.ordem ?? 0)).map((f) => f?.url).filter(Boolean).slice(0, 5);
  })().catch(() => []));
  return cache.get(id)!;
}

/** Fotos do card num trilho que desliza com o dedo (1ª foto original intacta). */
export function FotosCard({ id, produto, titulo, children }: { id: string; produto: boolean; titulo: string; children: React.ReactNode }) {
  const [fotos, setFotos] = useState<string[]>([]), [i, setI] = useState(0);
  const caixa = useRef<HTMLDivElement>(null), trilho = useRef<HTMLDivElement>(null), raf = useRef(0);
  const carregar = () => { void fotosDoCard(id, produto).then((f) => setFotos(f)); };
  const extras = fotos.slice(1);
  const total = Math.max(fotos.length, 1);
  useEffect(() => { if (fotos.length > 1) { preparar(fotos[(i + 1) % fotos.length]); if (i > 0) preparar(fotos[i - 1]); } }, [fotos, i]);
  useEffect(() => { const el = caixa.current; if (!el || !('IntersectionObserver' in window)) return; let io: IntersectionObserver | null = null, vivo = true;
    // Fotos extras só depois da página pronta: não disputam com a 1ª foto.
    const iniciar = () => { if (!vivo) return; io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io?.disconnect(); carregar(); } }, { rootMargin: '200px' }); io.observe(el); };
    const ocioso = () => ((window as any).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 300)))(iniciar, { timeout: 2500 });
    if (document.readyState === 'complete') ocioso(); else window.addEventListener('load', ocioso, { once: true });
    return () => { vivo = false; io?.disconnect(); window.removeEventListener('load', ocioso); }; }, [id]);
  const aoRolar = () => { cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(() => { const t = trilho.current; if (t) setI(indiceDoScroll(t.scrollLeft, t.clientWidth, total)); }); };
  const ir = (d: number) => { const t = trilho.current; if (!t) return; const n = (i + d + total) % total; t.scrollTo({ left: n * t.clientWidth, behavior: 'smooth' }); };
  const abrir = () => { caixa.current?.querySelector<HTMLAnchorElement>('.fotos-card-trilho > a')?.click(); };
  return (
    <div ref={caixa} className="fotos-card" onPointerEnter={carregar} onTouchStart={carregar}>
      <div ref={trilho} className="fotos-card-trilho" onScroll={aoRolar}>
        {children}
        {extras.map((u, k) => (
          <div key={u} className="fotos-card-slide" role="link" tabIndex={-1} onClick={abrir}>
            <img src={cardFotoUrl(u)} alt={`${titulo} - foto ${k + 2}`} loading="lazy" decoding="async" draggable={false} onError={(e) => { if (e.currentTarget.src !== u) e.currentTarget.src = u; }} />
          </div>
        ))}
      </div>
      {fotos.length > 1 && <>
        {i > 0 && <Button type="button" variant="secondary" size="icon" className="fotos-card-seta fotos-card-ant" aria-label="Foto anterior" onClick={(e) => { e.preventDefault(); e.stopPropagation(); ir(-1); }}><ChevronLeft /></Button>}
        {i < total - 1 && <Button type="button" variant="secondary" size="icon" className="fotos-card-seta fotos-card-prox" aria-label="Próxima foto" onClick={(e) => { e.preventDefault(); e.stopPropagation(); ir(1); }}><ChevronRight /></Button>}
        <div className="fotos-card-pontos" aria-hidden="true">{Array.from({ length: total }, (_, k) => <span key={k} data-ativo={k === i || undefined} />)}</div>
      </>}
    </div>
  );
}
