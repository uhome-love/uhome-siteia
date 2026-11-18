import { useRef, useState } from 'react';

export type Altura = 'baixa' | 'meia' | 'cheia';
/** Próxima altura da gaveta a partir do arraste (px, positivo = para cima). */
export function proximaAltura(atual: Altura, dy: number): Altura {
  const ordem: Altura[] = ['baixa', 'meia', 'cheia']; const i = ordem.indexOf(atual);
  if (dy > 40) return ordem[Math.min(2, i + 1)];
  if (dy < -40) return ordem[Math.max(0, i - 1)];
  return atual;
}

/** Gaveta do mapa no celular (padrão Airbnb): alça arrastável em três alturas sobre o mapa. */
export function GavetaMapa({ titulo, children, onCheia }: { titulo: string; children: React.ReactNode; onCheia: () => void }) {
  const [altura, setAltura] = useState<Altura>('meia'), [arraste, setArraste] = useState(0);
  const inicio = useRef<number | null>(null);
  const soltar = (y: number) => { if (inicio.current == null) return; const n = proximaAltura(altura, inicio.current - y); inicio.current = null; setArraste(0); setAltura(n); if (n === 'cheia') window.setTimeout(onCheia, 220); };
  return <section className="gaveta-mapa" data-altura={altura} style={arraste ? { transform: `translateY(${-arraste}px)`, transition: 'none' } : undefined} aria-label="Lista de imóveis no mapa">
    <div className="gaveta-alca" role="button" tabIndex={0} aria-label={altura === 'baixa' ? 'Mostrar imóveis' : 'Mostrar lista completa'}
      onPointerDown={(e) => { inicio.current = e.clientY; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => { if (inicio.current != null) setArraste(Math.max(-200, Math.min(200, inicio.current - e.clientY))); }}
      onPointerUp={(e) => soltar(e.clientY)} onPointerCancel={() => { inicio.current = null; setArraste(0); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const n = proximaAltura(altura, 100); setAltura(n); if (n === 'cheia') onCheia(); } }}>
      <span aria-hidden="true" /><strong>{titulo}</strong>
    </div>
    <div className="gaveta-conteudo">{children}</div>
  </section>;
}
