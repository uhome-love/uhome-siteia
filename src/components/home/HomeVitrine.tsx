import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, ChevronRight, Building, Castle, PanelsTopLeft, LandPlot, KeyRound, Banknote, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CatalogCard } from '@/components/search/CatalogCard';
import { useCorretor } from '@/contexts/CorretorContext';
import { useFavoritos } from '@/hooks/useFavoritos';
import { buscarSite, categoriasVisiveis } from '@/services/buscaSite';
import { formatPreco, type Imovel } from '@/services/imoveis';
import { supabase } from '@/lib/supabaseLazy';
import { cardFotoUrl } from '@/lib/searchImages';
import { urlBuscaHome, urlCategoria, registrarVisitaHome, novoDesdeVisita } from '@/lib/homeVitrine';

const ICONES: Record<string, typeof Building> = { apartamento: Building, casa: Castle, studio: PanelsTopLeft, terreno: LandPlot, pronto: KeyRound, valor: Banknote, local: MapPin };
const TIPOS = [['', 'Qualquer tipo'], ['apartamento', 'Apartamento'], ['casa', 'Casa'], ['casa_condominio', 'Casa em condomínio'], ['cobertura', 'Cobertura'], ['studio,loft', 'Studio'], ['terreno', 'Terreno']];
const QUARTOS = [['', 'Qualquer'], ['1', '1+'], ['2', '2+'], ['3', '3+'], ['4', '4+']];
const VALORES = [['', 'Qualquer valor'], ['400000', 'R$ 400 mil'], ['700000', 'R$ 700 mil'], ['1000000', 'R$ 1 milhão'], ['2000000', 'R$ 2 milhões']];

function PilulaBusca() {
  const navigate = useNavigate(); const { prefixLink } = useCorretor();
  const [onde, setOnde] = useState(''), [tipo, setTipo] = useState(''), [quartos, setQuartos] = useState(''), [valor, setValor] = useState('');
  return (
    <form role="search" className="home-pilula" onSubmit={(e) => { e.preventDefault(); navigate(prefixLink(urlBuscaHome({ onde, tipo, quartos, valor }))); }}>
      <label className="home-campo home-campo-onde"><span>Onde</span><input value={onde} onChange={(e) => setOnde(e.target.value)} placeholder="Bairro, cidade ou empreendimento" /></label>
      <label className="home-campo"><span>Tipo</span><select value={tipo} onChange={(e) => setTipo(e.target.value)}>{TIPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <label className="home-campo"><span>Quartos</span><select value={quartos} onChange={(e) => setQuartos(e.target.value)}>{QUARTOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <label className="home-campo"><span>Valor até</span><select value={valor} onChange={(e) => setValor(e.target.value)}>{VALORES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <Button type="submit" className="home-buscar"><Search />Buscar</Button>
    </form>
  );
}

function Fileira({ titulo, verTodos, children }: { titulo: React.ReactNode; verTodos?: string; children: React.ReactNode }) {
  return (
    <section className="home-fileira">
      <div className="home-fileira-topo"><h2>{titulo}</h2>{verTodos && <Link to={verTodos}>Ver todos</Link>}</div>
      <div className="home-trilho">{children}</div>
    </section>
  );
}

function ContinueDeOndeParou() {
  const { prefixLink } = useCorretor();
  const ids = useMemo(() => { try { return (JSON.parse(localStorage.getItem('imoveis_vistos') || '[]') as unknown[]).filter((v): v is string => typeof v === 'string').slice(-3).reverse(); } catch { return []; } }, []);
  const { data = [] } = useQuery({
    queryKey: ['home-vistos', ids], enabled: ids.length > 0, staleTime: 300000,
    queryFn: async () => {
      const { data } = await supabase.from('imoveis').select('id, slug, titulo, tipo, bairro, quartos, preco, foto_principal').in('id', ids).eq('status', 'disponivel');
      return ids.map((id) => (data ?? []).find((r: any) => r.id === id)).filter(Boolean) as any[];
    },
  });
  if (!data.length) return null;
  return (
    <section className="home-fileira">
      <div className="home-fileira-topo"><h2>Continue de onde parou</h2></div>
      <div className="home-trilho home-trilho-vistos">
        {data.map((r) => (
          <Link key={r.id} to={prefixLink(`/imovel/${r.slug}`)} className="home-visto">
            {r.foto_principal && <img src={cardFotoUrl(r.foto_principal)} alt="" width={80} height={72} loading="lazy" decoding="async" />}
            <span className="home-visto-texto"><strong>{r.titulo}</strong><span>{[r.bairro, r.quartos ? `${r.quartos} quarto${r.quartos > 1 ? 's' : ''}` : null].filter(Boolean).join(' · ')}</span><b>{formatPreco(r.preco)}</b></span>
            <ChevronRight className="home-visto-seta" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomeVitrine({ entreFileiras }: { entreFileiras?: React.ReactNode }) {
  const { prefixLink } = useCorretor(); const { isFavorito, toggleFavorito } = useFavoritos();
  const [ultimaVisita] = useState(() => (typeof window === 'undefined' ? null : registrarVisitaHome()));
  const novos = useQuery({ queryKey: ['home-novos'], queryFn: () => buscarSite({ secao: 'imoveis', cidade: 'Porto Alegre', ordem: 'recentes', limit: 5 }), staleTime: 180000 });
  const ate700 = useQuery({ queryKey: ['home-ate700'], queryFn: () => buscarSite({ secao: 'imoveis', cidade: 'Porto Alegre', ordem: 'recentes', precoMax: 700000, limit: 5 }), staleTime: 180000 });
  const categorias = categoriasVisiveis(novos.data?.categorias ?? {});
  useEffect(() => { document.documentElement.classList.add('uh-home-vitrine'); return () => document.documentElement.classList.remove('uh-home-vitrine'); }, []);
  const card = (r: Imovel, i: number, base: number) => (
    <CatalogCard key={r.id} imovel={r} index={base + i} saved={isFavorito(r.id)} onSave={() => toggleFavorito(r.id)} highlighted={false} onHover={() => {}}
      selo={novoDesdeVisita((r as any).publicado_em, ultimaVisita) ? 'Novo desde a sua última visita' : undefined} />
  );
  return (
    <>
      <section data-uh-capa className="home-capa">
        <h1 className="home-titulo">Você e seu <span>novo lar</span>.</h1>
        <PilulaBusca />
      </section>
      <nav aria-label="Categorias" className="home-categorias">
        <div className="home-categorias-trilho">
          {categorias.map((c) => { const Icone = ICONES[c.icone] ?? Building; return <Link key={c.id} to={prefixLink(urlCategoria(c.filtros))} className="home-categoria"><Icone aria-hidden="true" /><span>{c.nome}</span></Link>; })}
        </div>
        <Button asChild variant="outline" className="home-filtros"><Link to={prefixLink('/busca')}><SlidersHorizontal />Filtros</Link></Button>
      </nav>
      <div className="home-conteudo">
        <ContinueDeOndeParou />
        <Fileira titulo={<>Novos no site<span className="hidden sm:inline"> em Porto Alegre</span></>} verTodos={prefixLink('/busca?ordem=recentes')}>
          {novos.data ? novos.data.rows.map((r, i) => card(r, i, 0)) : Array.from({ length: 5 }, (_, i) => <div key={i} className="catalog-card"><div className="catalog-photo" /></div>)}
        </Fileira>
        {entreFileiras}
        <Fileira titulo="Até R$ 700 mil" verTodos={prefixLink('/busca?preco_max=700000')}>
          {(ate700.data?.rows ?? []).map((r, i) => card(r, i, 10))}
        </Fileira>
      </div>
    </>
  );
}
