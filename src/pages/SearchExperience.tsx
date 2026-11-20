import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { lazyRetry } from '@/lib/lazyRetry';
import { SkeletonCard } from '@/components/SkeletonCard';
import { CatalogCard } from '@/components/search/CatalogCard';
const BrokerRequest = lazy(() => import('@/components/search/BrokerRequest').then(m => ({ default: m.BrokerRequest })));
import { TIPOS, reais } from '@/components/search/filtroRotulos';
const SearchFilterDialog = lazy(() => import('@/components/search/SearchFilterDialog').then(m => ({ default: m.SearchFilterDialog })));
const PriceNotice = lazy(() => import('@/components/search/PriceNotice').then(m => ({ default: m.PriceNotice })));
import { useFavoritos } from '@/hooks/useFavoritos';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCanonical } from '@/hooks/useCanonical';
import { useCorretor } from '@/contexts/CorretorContext';
import { buscarSite, normalizarBusca, BUSCA_URLS, SECOES, categoriasVisiveis, categorias3dVisiveis, tituloBuscaComTotal, type BuscaSiteResult } from '@/services/buscaSite';
import { FaixaRolavel } from '@/components/FaixaRolavel';
import { GavetaMapa } from '@/components/search/GavetaMapa';
import { PilulaBusca } from '@/components/PilulaBusca';
import { tituloBusca } from '../../supabase/functions/_shared/buscaConfig';
import { trackEvent } from '@/lib/trackEvent';
import { salvarBusca, filtrosUteis } from '@/lib/buscasRecentes';
import { SalvarBusca } from '@/components/search/SalvarBusca';
import { BuscaSelecaoCard, SelecaoAnuncio } from '@/components/busca/BuscaSelecaoCard';
import { visitanteDeAnuncio, resumoBusca } from '@/lib/visitanteAnuncio';
import { Building2, House, Building, Castle, PanelsTopLeft, MapPin, Map as MapIcon, SlidersHorizontal, X, Loader2, LandPlot, KeyRound, Banknote, Search as SearchIcon } from 'lucide-react';
const SearchMap = lazy(() => import('@/components/SearchMap').then(m => ({ default: m.SearchMap })));
const LegacyAI = lazyRetry(() => import('@/pages/Search'));
const icons: Record<string, typeof House> = { apartamento: Building2, casa: House, studio: Building2, terreno: LandPlot, pronto: KeyRound, valor: Banknote, local: MapPin };
const mobileIcons: Record<string, typeof House> = { apartamento: Building, casa: Castle, studio: PanelsTopLeft, terreno: LandPlot, pronto: KeyRound, valor: Banknote, local: MapPin };
export { urlFiltros } from '@/lib/buscaUrl';
import { urlFiltros } from '@/lib/buscaUrl';
const brl=(v:unknown)=>reais(Number(v));
const AREAS:Record<string,string>={areaUtilMin:'Área priv. a partir de',areaUtilMax:'Área priv. até',areaMin:'Área total a partir de',areaMax:'Área total até'};
/** Texto legível de cada filtro aplicado. */
/** Nome oficial da cidade (como está no cadastro), ignorando maiúsculas e acentos do que foi digitado. */
const TIPO_PLURAL:Record<string,string>={apartamento:'apartamentos',casa:'casas',cobertura:'coberturas',studio:'studios',terreno:'terrenos',garden:'gardens',sobrado:'sobrados','studio,loft':'studios',loft:'lofts',casa_condominio:'casas em condomínio'};
const TIPO_SINGULAR:Record<string,string>={apartamento:'apartamento',casa:'casa',cobertura:'cobertura',studio:'studio',terreno:'terreno',garden:'garden',sobrado:'sobrado','studio,loft':'studio',loft:'loft',casa_condominio:'casa em condomínio'};
/** Cards na abertura: 12 no computador, 6 no celular. */
export function loteInicial(): number { return typeof window !== 'undefined' && window.innerWidth >= 1024 ? 12 : 6; }
export function comTipo(tipo:unknown,t:string):string{const k=typeof tipo==='string'?tipo.toLowerCase():'';const pl=TIPO_PLURAL[k];if(!pl)return t;return t.replace(/\bimóveis\b/,pl).replace(/\bimóvel\b/,TIPO_SINGULAR[k]).replace(/^Nenhum (casa|cobertura)/,'Nenhuma $1').replace(/^([a-zà-ú])/,m=>m.toUpperCase());}
export function nomeCidade(filtro:unknown, rows:{cidade?:string|null}[]):string{
  const t=String(filtro??''); if(!t)return '';
  const norm=(x:unknown)=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  return rows.find(r=>norm(r.cidade)===norm(t))?.cidade ?? t;
}
export function rotuloChip(k:string,v:unknown):string{
  if(k==='novidades')return 'Novidades';
  if(k==='tipo')return String(v).split(',').map(x=>TIPOS[x]??x).join(', ');
  if(k==='precoMax')return `Até ${brl(v)}`; if(k==='precoMin')return `A partir de ${brl(v)}`; if(k==='condominioMax')return `Condomínio até ${brl(v)}`;
  if(k==='quartos'||k==='banheiros'||k==='vagas')return `${v}+ ${k}`;
  if(k in AREAS)return `${AREAS[k]} ${v} m²`;
  if(k==='fase')return String(v).replace('novo,usado','Pronto pra morar').replace('na_planta','Na planta').replace('em_construcao','Em obras');
  if(k==='comodidades')return String(v).split(',').map(c=>c==='Pet friendly'?'Aceita pet':c).join(', ');
  if(k==='bounds')return 'Área do mapa';
  return String(v);
}
export default function SearchEntry() { const [params]=useSearchParams(); return params.get('modo')==='ia' ? <Suspense fallback={<Loader2 className="animate-spin"/>}><LegacyAI/></Suspense> : <SearchExperience/>; }
function SearchExperience() {
  const location = useLocation(); const [params, setParams] = useSearchParams(); const { prefixLink } = useCorretor(); useCanonical();
  const path = location.pathname.replace(/^\/c\/[^/]+/,''); const preset = BUSCA_URLS[path as keyof typeof BUSCA_URLS];
  const filtros = useMemo(() => urlFiltros(params, preset?.filtros), [params.toString(), path]);
  const { isFavorito, toggleFavorito } = useFavoritos();
  const [notice,setNotice]=useState(false), [modal,setModal]=useState(()=>params.get('filtros')==='1'), [map,setMap]=useState(false), [hover,setHover]=useState<string|null>(null), [area,setArea]=useState<any>(null), [more,setMore]=useState<any[]>([]), [loadingMore,setLoadingMore]=useState(false), [visible,setVisible]=useState(loteInicial), [q,setQ]=useState(filtros.q ?? '');
  const opener = useRef<HTMLElement>(null), near=useRef<HTMLDivElement>(null); const mobile=useIsMobile(1024);
  const [anuncio]=useState(visitanteDeAnuncio); const resumo=resumoBusca(filtros as any);
  useEffect(()=>{if(!anuncio||!mobile)return;document.body.classList.add('sem-menu-app');return()=>document.body.classList.remove('sem-menu-app');},[anuncio,mobile]);
  // Visitante de anúncio: esconde "Mostrar mapa" e o avatar da LIA enquanto um cartão de seleção estiver na tela, para nunca cobrir o envio.
  useEffect(()=>{if(!anuncio||!mobile)return;let raf=0;
    // Checagem direta pela posição: não depende de qual nó do cartão o observador viu (hidratação/re-render trocam o elemento).
    const checar=()=>{raf=0;const h=window.innerHeight;const na=[...document.querySelectorAll('[data-busca-selecao]')].some(el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<h&&r.height>0;});if(document.body.classList.contains('selecao-na-tela')!==na)document.body.classList.toggle('selecao-na-tela',na);};
    const agendar=()=>{if(!raf)raf=requestAnimationFrame(checar);};
    checar();agendar();
    // O CSS principal chega depois (carregamento assíncrono) e muda o layout sem mexer no DOM: rechecar nos primeiros segundos, no load e a cada mudança de tamanho.
    const ts=[100,500,1000,2000,3000].map(ms=>setTimeout(checar,ms));window.addEventListener('load',agendar);
    const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(agendar):null;ro?.observe(document.body);
    window.addEventListener('scroll',agendar,{passive:true});window.addEventListener('resize',agendar);
    const mo=new MutationObserver(agendar);mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});mo.observe(document.head,{childList:true});
    return()=>{cancelAnimationFrame(raf);ts.forEach(clearTimeout);ro?.disconnect();window.removeEventListener('load',agendar);window.removeEventListener('scroll',agendar);window.removeEventListener('resize',agendar);mo.disconnect();document.body.classList.remove('selecao-na-tela');};},[anuncio,mobile]);
  const fkey=JSON.stringify(filtros); const key=JSON.stringify([filtros,area]);
  useEffect(()=>{setArea(null);},[fkey]);
  const rotuloBusca=Object.entries(filtrosUteis(filtros)??{}).map(([k,v])=>rotuloChip(k,v)).join(' · ');
  useEffect(()=>{if(rotuloBusca)salvarBusca(filtros,rotuloBusca);},[fkey]);
  const initial = useMemo(() => { const seed = (window as any).__UH_BUSCA_V3__; return seed?.path === path && !params.toString() ? normalizarBusca(seed) : undefined; }, []);
  const { data, isLoading, isFetching, error } = useQuery({queryKey:['busca-site',key],queryFn:()=>buscarSite({...filtros,bounds:area??undefined,limit:40}), initialData: area?undefined:initial, initialDataUpdatedAt: 0, placeholderData: keepPreviousData, staleTime:180000});
  const rows=[...(data?.rows ?? []),...more]; const count=data?.count; const categories=categorias3dVisiveis(data?.categorias ?? {}, data?.tipos ?? {}, (data as any)?.comodidades ?? {});
  useEffect(() => { setMore([]); setVisible(loteInicial()); }, [key]);
  // No celular, só o toque em Mostrar mapa importa o mapa. No desktop, o mapa visível monta normalmente.
  // Expand the loaded page only as the reader approaches its last rendered card.
  useEffect(() => {
    const el = near.current;
    if (!el || visible >= rows.length) return;
    if (typeof IntersectionObserver === 'undefined') { setVisible(rows.length); return; }
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { io.disconnect(); setVisible(v => Math.min(v + 12, rows.length)); }
    }, { rootMargin: '1200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [rows.length, visible, key]);
  useEffect(() => { const a=()=>setNotice(true);window.addEventListener('uhome:aviso-preco',a);const b=()=>setModal(true);window.addEventListener('uhome:abrir-filtros',b);return()=>{window.removeEventListener('uhome:aviso-preco',a);window.removeEventListener('uhome:abrir-filtros',b);}; },[]);
  useEffect(() => { if (isLoading || !data) return; const t=setTimeout(()=>{void trackEvent({tipo:'busca_feita',dados:{secao:filtros.secao,filtros}});},500);return()=>clearTimeout(t); },[key,isLoading]);
  useEffect(() => { document.title=preset ? `${preset.titulo} | Uhome` : `Imóveis${filtros.cidade ? ` em ${filtros.cidade}` : ' à venda'} | Uhome`; },[path,filtros.cidade]);
  const apply = (next: Record<string, any>) => { const p=new URLSearchParams(); const keys:Record<string,string>={precoMax:'preco_max',precoMin:'preco_min',areaMin:'area_min',areaMax:'area_max',areaUtilMin:'area_util_min',areaUtilMax:'area_util_max'};Object.entries(next).forEach(([k,v])=>{if(v && k!=='bounds')p.set(keys[k]??k,String(v));});setParams(p);void trackEvent({tipo:'filtro_aplicado',dados:{secao:next.secao,filtros:next}}); };
  const remove = (k:string) => { const next={...filtros};next[k]=typeof next[k]==='number'?0:'';apply(next); };
  const cidadeUnica = (filtros.bairro || filtros.q) && rows.length && rows.every(r => r.cidade && r.cidade === rows[0].cidade) ? rows[0].cidade as string : '';
  const cidadeNome = cidadeUnica || nomeCidade(filtros.cidade, rows);
  const chips=Object.entries(filtros).filter(([k,v])=>v && !['ordem','secao'].includes(k)).map(([k,v])=>({k,label:k==='cidade'?cidadeNome:rotuloChip(k,v)}));
  const areaChip=area&&<Button variant="secondary" aria-label="Remover filtro Área do mapa" onClick={()=>setArea(null)}>Área do mapa<X/></Button>;
  const [restriction,setRestriction]=useState<{k:string;label:string;count:number}|null>(null);
  useEffect(()=>{let ativo=true;if(data?.count!==0){setRestriction(null);return;}Promise.all(chips.map(async c=>({ ...c,count:(await buscarSite({...filtros,[c.k]:typeof filtros[c.k]==='number'?0:'',limit:0})).count }))).then(all=>{if(ativo)setRestriction(all.sort((a,b)=>b.count-a.count)[0]??null);});return()=>{ativo=false;};},[key,data?.count]);
  const mapPins=rows.slice(0,Math.max(visible,40)).filter(r=>r.latitude!==null&&r.longitude!==null).map(r=>({...r,latitude:Number(r.latitude),longitude:Number(r.longitude),foto:(r as any).foto ?? r.foto_principal ?? "",publicado_em:(r as any).publicado_em,fase:r.fase}));
  const appliedChips = (chips.length>0||area)&&<div className="search-chips" aria-label="Filtros aplicados">{areaChip}{chips.map(c=><Button key={c.k} variant="secondary" aria-label={`Remover filtro ${c.label}`} onClick={()=>remove(c.k)}>{c.label}<X/></Button>)}<Button variant="ghost" onClick={()=>apply({secao:'imoveis',cidade:'',ordem:'recentes'})}>Limpar filtros</Button></div>;
  return <div className="search-page bg-background text-foreground"><Navbar/><div className="uh-header-spacer"/><div className="search-mobile-chips">{appliedChips}</div><div className="border-b border-border"><div className="search-cat-linha"><FaixaRolavel className="search-categories" rotulo="categorias">{categories.map(c=>{const selected=Object.entries(c.filtros).every(([k,v])=>String(filtros[k])===String(v));return <Button key={c.id} variant="ghost" aria-pressed={selected} className="search-category" onClick={()=>{const next={secao:filtros.secao,cidade:'',ordem:'recentes',...c.filtros};apply(next);void trackEvent({tipo:'categoria_tocada',dados:{categoria:c.id,secao:filtros.secao,filtros:next}});}}><img src={c.icone} alt="" width={32} height={32} loading="lazy" decoding="async" className="search-category-3d"/><span>{c.nome}</span></Button>;})}</FaixaRolavel><Button variant="outline" className="search-cat-filtros" onClick={e=>{opener.current=e.currentTarget;setModal(true);}}><SlidersHorizontal/>Filtros</Button></div></div>
    <div className="search-pilula-linha"><PilulaBusca inicial={filtros} onApply={apply} compacta/><Button variant="outline" className="search-pilula-filtros" onClick={e=>{opener.current=e.currentTarget;setModal(true);}}><SlidersHorizontal/>Filtros</Button></div><div className="search-toolbar border-b border-border"><form className="flex min-w-0 flex-1 items-center gap-2" onSubmit={e=>{e.preventDefault();apply({...filtros,q});}}><SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground"/><input aria-label="Bairro, endereço ou código" className="min-h-11 w-full min-w-0 bg-transparent text-sm outline-none" placeholder="Bairro, endereço ou código" value={q} onChange={e=>setQ(e.target.value)}/></form><Button variant="outline" onClick={e=>{opener.current=e.currentTarget;setModal(true);}}><SlidersHorizontal/>Filtros</Button><select aria-label="Ordenar imóveis" className="hidden min-h-11 rounded-md border border-input bg-background px-3 text-sm sm:block" value={filtros.ordem} onChange={e=>apply({...filtros,ordem:e.target.value})}>{[['recentes','Mais recentes'],['preco_asc','Menor preço'],['preco_desc','Maior preço'],['area_desc','Maior área']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
    
    <div className="search-main"><main className="search-list"><div className="search-desktop-chips">{appliedChips}</div><header className="search-results-heading mb-6"><div className="search-titulo-linha"><h1 className="text-lg font-semibold sm:text-xl">{preset?.titulo ?? comTipo(filtros.tipo, count==null?tituloBusca(cidadeNome):(area?tituloBuscaComTotal(count,cidadeNome).replace(/ em .*$/,'')+' na área do mapa':tituloBuscaComTotal(count,cidadeNome)))}</h1><select aria-label="Ordenar imóveis" className="search-ordem" value={filtros.ordem} onChange={e=>apply({...filtros,ordem:e.target.value})}>{[['recentes','Mais recentes'],['preco_asc','Menor preço'],['preco_desc','Maior preço'],['area_desc','Maior área']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>{rotuloBusca&&<div className="search-salvar-linha"><SalvarBusca filtros={filtros} rotulo={rotuloBusca}/></div>}{preset&&count!=null&&<p className="search-total">{tituloBuscaComTotal(count,cidadeNome).replace(/ à venda em .*/,'')}</p>}{preset&&<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{preset.texto}</p>}</header>
      {error ? <div className="py-16 text-center"><p>Não foi possível carregar os imóveis.</p><Button variant="outline" onClick={()=>window.location.reload()}>Tentar novamente</Button></div>:isLoading?<div className="search-grid">{[0,1,2,3].map(i=><SkeletonCard key={i}/>)}</div>:count===0?<div className="search-empty"><SearchIcon className="h-10 w-10 text-muted-foreground"/><h2 className="text-xl font-bold">Nenhum imóvel com esses filtros</h2>{restriction&&<><p className="text-sm text-muted-foreground">{restriction.label} é o filtro que mais restringe esta busca.</p><Button variant="outline" onClick={()=>remove(restriction.k)}>Tirar só {restriction.label}</Button></>}<Suspense fallback={null}><BrokerRequest filtros={filtros}/></Suspense></div>:<><SelecaoAnuncio anuncio={anuncio} resumo={resumo} id="busca-selecao"/>{anuncio&&<div className="h-5"/>}<div className="search-grid" aria-busy={isFetching}>{rows.slice(0,visible).map((r,i)=><div key={r.id} className="contents"><CatalogCard imovel={r} index={i} highlighted={hover===r.id} onHover={setHover} saved={isFavorito(r.id)} onSave={()=>void toggleFavorito(r.id)}/>{i===5&&<div className="col-span-full">{anuncio?<BuscaSelecaoCard resumo={resumo}/>:<Suspense fallback={null}><BrokerRequest filtros={filtros}/></Suspense>}</div>}</div>)}</div>{visible<rows.length&&<div ref={near} className="h-px"/>}{rows.length<(count??0)&&<div className="flex justify-center py-8"><Button variant="outline" disabled={loadingMore} onClick={async()=>{setLoadingMore(true);try{const next=await buscarSite({...filtros,bounds:area??undefined,offset:rows.length,limit:40});setMore(prev=>[...prev,...next.rows]);setVisible(v=>v+40);}finally{setLoadingMore(false);}}}>{loadingMore?<Loader2 className="animate-spin"/>:null}Mostrar mais imóveis</Button></div>}</>}
    </main>{!mobile&&<aside className="search-map border-l border-border"><Suspense fallback={<div className="mapa-fantasma h-full" aria-label="Carregando mapa"/>}><SearchMap pins={mapPins} hoveredId={hover} onPinHover={setHover} onBoundsSearch={setArea} fitToPins={!area} autoSearchPadrao carregando={isFetching}/></Suspense></aside>}</div>
    {anuncio&&<div data-barra-anuncio className="uhs-contact-bar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"><Button className="w-full" onClick={()=>document.getElementById('busca-selecao')?.scrollIntoView({behavior:'smooth',block:'start'})}>Mais informações</Button></div>}
    <Button className="search-show-map lg:hidden" variant="outline" onClick={()=>setMap(true)}><MapIcon/>Mostrar mapa</Button>{map&&mobile&&<div className="fixed inset-0 z-50 bg-background"><Button className="absolute left-4 top-4 z-50" variant="outline" onClick={()=>setMap(false)}><X/>Voltar à lista</Button><Suspense fallback={<div className="mapa-fantasma h-full" aria-label="Carregando mapa"/>}><SearchMap pins={mapPins} hoveredId={hover} onPinHover={setHover} onBoundsSearch={setArea} fitToPins={!area} carregando={isFetching}/></Suspense><GavetaMapa titulo={count==null?"Carregando…":count===0?"Nenhum imóvel":count>1000?"Mais de 1.000 imóveis":`${count.toLocaleString("pt-BR")} ${count===1?"imóvel":"imóveis"}`} onCheia={()=>setMap(false)}><div className="gaveta-trilho">{rows.slice(0,12).map((p,i)=><CatalogCard key={p.id} imovel={p} index={i+5} highlighted={hover===p.id} onHover={setHover} saved={isFavorito(p.id)} onSave={()=>toggleFavorito(p.id)}/>)}</div></GavetaMapa></div>}
    <Suspense fallback={null}>{modal&&<SearchFilterDialog open onClose={()=>setModal(false)} filtros={filtros} onApply={apply} opener={opener}/ >}{notice&&<PriceNotice open onClose={()=>setNotice(false)}/>}</Suspense>
  </div>;
}