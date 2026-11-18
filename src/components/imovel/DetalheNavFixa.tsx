import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const SECOES = [['fotos', 'Fotos'], ['detalhes', 'Detalhes'], ['comodidades', 'Comodidades'], ['localizacao', 'Localização']] as const;

/** Faixa fixa da página do imóvel (padrão Airbnb): aparece depois das fotos; preço e botão quando o cartão lateral sai da tela. */
export function DetalheNavFixa({ preco, onAgendar }: { preco: string; onAgendar?: () => void }) {
  const [visivel, setVisivel] = useState(false), [cta, setCta] = useState(false), [secoes, setSecoes] = useState<string[]>([]);
  useEffect(() => {
    setSecoes(SECOES.filter(([id]) => document.getElementById(id)).map(([id]) => id));
    const fotos = document.getElementById('fotos'), cartao = document.querySelector('.detalhe-cartao')?.parentElement;
    const o1 = new IntersectionObserver(([e]) => setVisivel(!e.isIntersecting && e.boundingClientRect.top < 0));
    const o2 = new IntersectionObserver(([e]) => setCta(!e.isIntersecting));
    if (fotos) o1.observe(fotos); if (cartao) o2.observe(cartao);
    return () => { o1.disconnect(); o2.disconnect(); };
  }, []);
  const ir = (id: string) => { const el = document.getElementById(id); if (!el) return; window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (id === 'fotos' ? 120 : 90), behavior: 'smooth' }); };
  return <div className="detalhe-nav-fixa" data-on={visivel || undefined} aria-hidden={!visivel}>
    <div className="mx-auto flex h-full max-w-[1120px] items-center justify-between px-6">
      <nav aria-label="Seções do imóvel" className="flex h-full gap-6">{SECOES.filter(([id]) => secoes.includes(id)).map(([id, nome]) => <button key={id} type="button" tabIndex={visivel ? 0 : -1} onClick={() => ir(id)}>{nome}</button>)}</nav>
      {onAgendar && <div className="detalhe-nav-cta" data-on={cta || undefined}><strong>{preco}</strong><Button tabIndex={visivel && cta ? 0 : -1} onClick={onAgendar}>Agendar visita</Button></div>}
    </div>
  </div>;
}
