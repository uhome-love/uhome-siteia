import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCorretor } from '@/contexts/CorretorContext';
import { urlDeFiltros } from '@/lib/homeVitrine';

const Painel = lazy(() => import('@/components/search/SearchFilterDialog').then((m) => ({ default: m.SearchFilterDialog })));
const Secoes = lazy(() => import('@/components/search/SearchFilterDialog').then((m) => ({ default: m.FiltroSecoes })));
const NOMES_TIPO: Record<string, string> = { apartamento: 'Apartamento', casa: 'Casa', casa_condominio: 'Casa em condomínio', cobertura: 'Cobertura', 'studio,loft': 'Studio', garden: 'Garden', terreno: 'Terreno' };
const valor = (v: number) => (v >= 1_000_000 ? `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} mi` : `R$ ${Math.round(v / 1000)} mil`);
/** Remove valores vazios; sem filtros vira a busca completa. */
export function limparVazios(f: Record<string, any>) { const o: Record<string, any> = {}; for (const [k, v] of Object.entries(f)) if (v !== '' && v !== 0 && v != null) o[k] = v; return { secao: 'imoveis', ordem: 'recentes', cidade: '', ...o }; }
export type Campo = 'onde' | 'tipo' | 'quartos' | 'valor';
/** Seções do painel que cada campo da pílula abre. */
export const SECOES_DO_CAMPO: Record<Campo, ('onde' | 'tipo' | 'recomendados' | 'quartos' | 'preco')[]> = { onde: ['onde'], tipo: ['tipo', 'recomendados'], quartos: ['quartos'], valor: ['preco'] };

/** Texto exibido em cada campo da pílula. */
export function textosPilula(f: Record<string, any>): [Campo, string, string, string][] {
  const faixa = f.precoMin && f.precoMax ? `${valor(f.precoMin)} – ${valor(f.precoMax)}` : f.precoMax ? `até ${valor(f.precoMax)}` : f.precoMin ? `a partir de ${valor(f.precoMin)}` : '';
  return [
    ['onde', 'Onde', f.bairro || f.q || f.cidade || '', 'Bairro, cidade, rua ou código'],
    ['tipo', 'Tipo', NOMES_TIPO[f.tipo] ?? '', 'Qualquer tipo'],
    ['quartos', 'Quartos', f.quartos ? `${f.quartos}+ quartos` : '', 'Qualquer'],
    ['valor', 'Valor', faixa, 'Qualquer valor'],
  ];
}

/** Pílula estilo Airbnb: cada campo abre o seu painel logo abaixo; Buscar busca direto. No celular abre o painel completo. */
export function PilulaBusca({ inicial = {}, onApply }: { inicial?: Record<string, any>; onApply?: (f: Record<string, any>) => void; compacta?: boolean }) {
  const navigate = useNavigate(); const { prefixLink } = useCorretor();
  const base: Record<string, any> = { secao: 'imoveis', ordem: 'recentes', ...inicial };
  const [draft, setDraft] = useState(base), [campo, setCampo] = useState<Campo | null>(null), [cheio, setCheio] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!campo) setDraft({ secao: 'imoveis', ordem: 'recentes', ...inicial }); }, [JSON.stringify(inicial)]);
  useEffect(() => {
    if (!campo) return;
    const fora = (e: PointerEvent) => { if (raiz.current && !raiz.current.contains(e.target as Node)) setCampo(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setCampo(null); };
    document.addEventListener('pointerdown', fora); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', fora); document.removeEventListener('keydown', esc); };
  }, [campo]);
  useEffect(() => {
    const abrirDoTopo = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); window.setTimeout(() => abrir('onde'), 280); };
    window.addEventListener('uhome:pilula-abrir', abrirDoTopo); return () => window.removeEventListener('uhome:pilula-abrir', abrirDoTopo);
  }, []);
  const aplicar = (n: Record<string, any>) => { setCampo(null); onApply ? onApply(n) : navigate(prefixLink(urlDeFiltros(n))); };
  const abrir = (c: Campo) => { if (window.matchMedia('(max-width: 743px)').matches) { setCheio(true); return; } setCampo((a) => (a === c ? null : c)); };
  /** Buscar sem nada escolhido mostra todos os imóveis (todas as cidades). */
  return <div ref={raiz} className="pilula-raiz">
    <div role="search" className="home-pilula" data-ativa={campo || undefined}>
      {textosPilula(draft).map(([id, r, v, ph]) => <button type="button" key={id} aria-expanded={campo === id} aria-controls="pilula-painel" data-campo={id} className={`home-campo${id === 'onde' ? ' home-campo-onde' : ''}`} onClick={() => abrir(id)}><span>{r}</span><strong data-vazio={!v || undefined}>{v || ph}</strong></button>)}
      <Button type="button" className="home-buscar" aria-label="Buscar" onClick={() => aplicar(limparVazios(draft))}><Search /><span>Buscar</span></Button>
    </div>
    {campo && <div id="pilula-painel" className="pilula-painel" data-campo={campo} role="dialog" aria-label={`Escolher ${campo}`}>
      <Suspense fallback={<div className="pilula-painel-carregando" />}><Secoes key={campo} draft={draft} setDraft={setDraft} secoes={SECOES_DO_CAMPO[campo]} autoFocoOnde /></Suspense>
    </div>}
    {cheio && <Suspense fallback={null}><Painel open={cheio} onClose={() => setCheio(false)} filtros={draft} onApply={aplicar} /></Suspense>}
  </div>;
}
