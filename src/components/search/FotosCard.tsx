import { useEffect, useRef, useState } from 'react';

const prontas = new Set<string>();
/** Baixa e decodifica a foto antes de ela ser mostrada, para a troca ser instantânea. */
function preparar(url?: string) { if (!url) return; const u = cardFotoUrl(url); if (prontas.has(u)) return; prontas.add(u); const im = new Image(); im.decoding = 'async'; im.src = u; im.decode?.().catch(() => {}); }
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseLazy';
import { cardFotoUrl } from '@/lib/searchImages';

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

/** Camada de fotos extras sobre a 1ª foto (que fica intacta para a tela pronta). */
export function FotosCard({ id, produto, titulo, children }: { id: string; produto: boolean; titulo: string; children: React.ReactNode }) {
  const [fotos, setFotos] = useState<string[]>([]), [i, setI] = useState(0);
  const arrasto = useRef<{ x: number; moveu: boolean } | null>(null), bloqueia = useRef(false);
  const carregar = () => { void fotosDoCard(id, produto).then((f) => setFotos(f)); };
  const total = Math.max(fotos.length, 1);
  const ir = (d: number) => { carregar(); setI((v) => { const n = fotos.length || 1; return (v + d + n) % n; }); };
  useEffect(() => { if (fotos.length > 1) { preparar(fotos[(i + 1) % fotos.length]); preparar(fotos[(i + 2) % fotos.length]); if (i > 0) preparar(fotos[i - 1]); } }, [fotos, i]);
  const caixa = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = caixa.current; if (!el || !('IntersectionObserver' in window)) return; const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); carregar(); } }, { rootMargin: '200px' }); io.observe(el); return () => io.disconnect(); }, [id]);
  const atual = i > 0 ? fotos[i] : null;
  return (
    <div ref={caixa} className="fotos-card" onPointerEnter={carregar}
      onPointerDown={(e) => { carregar(); arrasto.current = { x: e.clientX, moveu: false }; }}
      onPointerUp={(e) => { const a = arrasto.current; arrasto.current = null; if (!a || Math.abs(e.clientX - a.x) <= 40) return; if ((e.currentTarget as HTMLElement).closest('.home-trilho,.gaveta-trilho')) return; const d = e.clientX < a.x ? 1 : -1; bloqueia.current = true; if (fotos.length > 1) ir(d); else void fotosDoCard(id, produto).then((f) => { setFotos(f); if (f.length > 1) setI((v) => (v + d + f.length) % f.length); }); }}
      onPointerCancel={() => { arrasto.current = null; }}
      onClickCapture={(e) => { if (bloqueia.current) { bloqueia.current = false; e.preventDefault(); e.stopPropagation(); } }}>
      {children}
      {atual && <img key={atual} className="fotos-card-extra" src={cardFotoUrl(atual)} alt={`${titulo} - foto ${i + 1}`} decoding="async" onError={(e) => { e.currentTarget.src = atual; }} />}
      {fotos.length > 1 && <>
        {i > 0 && <Button type="button" variant="secondary" size="icon" className="fotos-card-seta fotos-card-ant" aria-label="Foto anterior" onClick={(e) => { e.preventDefault(); e.stopPropagation(); ir(-1); }}><ChevronLeft /></Button>}
        <Button type="button" variant="secondary" size="icon" className="fotos-card-seta fotos-card-prox" aria-label="Próxima foto" onClick={(e) => { e.preventDefault(); e.stopPropagation(); ir(1); }}><ChevronRight /></Button>
        <div className="fotos-card-pontos" aria-hidden="true">{Array.from({ length: total }, (_, k) => <span key={k} data-ativo={k === i || undefined} />)}</div>
      </>}
    </div>
  );
}
