import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCorretor } from '@/contexts/CorretorContext';
import { urlDeFiltros } from '@/lib/homeVitrine';

const Painel = lazy(() => import('@/components/search/SearchFilterDialog').then((m) => ({ default: m.SearchFilterDialog })));
const NOMES_TIPO: Record<string, string> = { apartamento: 'Apartamento', casa: 'Casa', casa_condominio: 'Casa em condomínio', cobertura: 'Cobertura', 'studio,loft': 'Studio', garden: 'Garden', terreno: 'Terreno' };
const valor = (v: number) => (v >= 1_000_000 ? `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} mi` : `R$ ${Math.round(v / 1000)} mil`);

/** Pílula Onde · Tipo · Quartos · Valor: cada parte abre o painel completo de busca. */
export function PilulaBusca({ inicial = {}, onApply }: { inicial?: Record<string, any>; onApply?: (f: Record<string, any>) => void }) {
  const navigate = useNavigate(); const { prefixLink } = useCorretor();
  const [aberto, setAberto] = useState(false);
  const f: Record<string, any> = { secao: 'imoveis', ordem: 'recentes', ...inicial };
  const aplicar = (n: Record<string, any>) => (onApply ? onApply(n) : navigate(prefixLink(urlDeFiltros(n))));
  const partes: [string, string, string][] = [
    ['Onde', f.bairro || f.q || f.cidade || '', 'Bairro, cidade ou código'],
    ['Tipo', NOMES_TIPO[f.tipo] ?? '', 'Qualquer tipo'],
    ['Quartos', f.quartos ? `${f.quartos}+ quartos` : '', 'Qualquer'],
    ['Valor', f.precoMax ? `até ${valor(f.precoMax)}` : f.precoMin ? `a partir de ${valor(f.precoMin)}` : '', 'Qualquer valor'],
  ];
  return <>
    <div role="search" className="home-pilula">
      {partes.map(([r, v, ph], i) => <button type="button" key={r} className={`home-campo${i === 0 ? ' home-campo-onde' : ''}`} onClick={() => setAberto(true)}><span>{r}</span><strong data-vazio={!v || undefined}>{v || ph}</strong></button>)}
      <Button type="button" className="home-buscar" aria-label="Buscar" onClick={() => setAberto(true)}><Search /><span>Buscar</span></Button>
    </div>
    {aberto && <Suspense fallback={null}><Painel open={aberto} onClose={() => setAberto(false)} filtros={f} onApply={aplicar} /></Suspense>}
  </>;
}
