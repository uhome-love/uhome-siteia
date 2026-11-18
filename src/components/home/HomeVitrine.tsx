import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaixaRolavel } from '@/components/FaixaRolavel';
import { PilulaBusca } from '@/components/PilulaBusca';
import { CatalogCard } from '@/components/search/CatalogCard';
import { useCorretor } from '@/contexts/CorretorContext';
import { useFavoritos } from '@/hooks/useFavoritos';
import { buscarSite, categorias3dVisiveis } from '@/services/buscaSite';
import { formatPreco, type Imovel } from '@/services/imoveis';
import { supabase } from '@/lib/supabaseLazy';
import { cardFotoUrl } from '@/lib/searchImages';
import { urlCategoria, registrarVisitaHome, novoDesdeVisita } from '@/lib/homeVitrine';

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
  const categorias = categorias3dVisiveis(novos.data?.categorias ?? {}, novos.data?.tipos ?? {}, (novos.data as any)?.comodidades ?? {});
  useEffect(() => { document.documentElement.classList.add('uh-home-vitrine'); return () => document.documentElement.classList.remove('uh-home-vitrine'); }, []);
  const card = (r: Imovel, i: number, base: number) => (
    <CatalogCard key={r.id} imovel={r} index={base + i} saved={isFavorito(r.id)} onSave={() => toggleFavorito(r.id)} highlighted={false} onHover={() => {}}
      selo={novoDesdeVisita((r as any).publicado_em, ultimaVisita) ? 'Novo desde a sua última visita' : undefined} />
  );
  return (
    <>
      <section data-uh-capa className="home-capa">
        <h1 className="home-titulo">Você e seu <span>novo lar</span>.</h1>
        <PilulaBusca compacta />
      </section>
      <nav aria-label="Categorias" className="home-categorias">
        <FaixaRolavel className="home-categorias-trilho" rotulo="categorias">
          {categorias.map((c) => <Link key={c.id} to={prefixLink(urlCategoria(c.filtros))} className="home-categoria"><img src={c.icone} alt="" width={32} height={32} loading="lazy" decoding="async" /><span>{c.nome}</span></Link>)}
        </FaixaRolavel>
        <Button asChild variant="outline" className="home-filtros"><Link to={prefixLink('/busca?filtros=1')}><SlidersHorizontal />Filtros</Link></Button>
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
