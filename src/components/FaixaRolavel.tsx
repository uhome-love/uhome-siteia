import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Faixa com rolagem lateral e setas redondas que só aparecem quando há mais itens (padrão Airbnb). */
export function FaixaRolavel({ className, children, rotulo = 'itens' }: { className?: string; children: React.ReactNode; rotulo?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lados, setLados] = useState({ esq: false, dir: false });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const medir = () => setLados({ esq: el.scrollLeft > 4, dir: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    medir(); el.addEventListener('scroll', medir, { passive: true });
    const ro = new ResizeObserver(medir); ro.observe(el);
    const seguir = () => { Array.from(el.children).forEach((c) => ro.observe(c)); medir(); };
    seguir(); const mo = new MutationObserver(seguir); mo.observe(el, { childList: true });
    return () => { el.removeEventListener('scroll', medir); ro.disconnect(); mo.disconnect(); };
  }, []);
  const ir = (d: number) => { const el = ref.current; if (el) el.scrollBy({ left: d * el.clientWidth * 0.85, behavior: 'smooth' }); };
  return <div className="faixa-rolavel" data-esq={lados.esq || undefined} data-dir={lados.dir || undefined}>
    <button type="button" className="faixa-seta faixa-seta-esq" aria-label={`Ver ${rotulo} anteriores`} tabIndex={lados.esq ? 0 : -1} onClick={() => ir(-1)}><ChevronLeft aria-hidden="true" /></button>
    <div ref={ref} className={className}>{children}</div>
    <button type="button" className="faixa-seta faixa-seta-dir" aria-label={`Ver mais ${rotulo}`} tabIndex={lados.dir ? 0 : -1} onClick={() => ir(1)}><ChevronRight aria-hidden="true" /></button>
  </div>;
}
