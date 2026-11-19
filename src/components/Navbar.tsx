import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Menu, Search, SlidersHorizontal, Heart, House, Building2, ChartNoAxesCombined, MessageCircle } from "lucide-react";
import { UhomeLogo } from "@/components/UhomeLogo";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { useCorretor } from "@/contexts/CorretorContext";
import { useCampanhaDestaque } from "@/lib/produtosFoco";
import { SiteBottomBar } from "@/components/SiteBottomBar";
import { urlDeFiltros } from "@/lib/homeVitrine";
import { lerBuscas } from "@/lib/buscasRecentes";
const Etapas = lazy(() => import("@/components/search/BuscaEtapas").then((m) => ({ default: m.BuscaEtapas })));
const MenuSite = lazy(() => import("@/components/MenuSite").then((m) => ({ default: m.MenuSite })));
const PainelBusca = lazy(() => import("@/components/search/SearchFilterDialog").then((m) => ({ default: m.SearchFilterDialog })));
import { BUSCA_URLS } from "../../supabase/functions/_shared/buscaConfig";

export function Navbar() {
  const [menu, setMenu] = useState(false), [busca, setBusca] = useState(false), [etapas, setEtapas] = useState(false), [rolou, setRolou] = useState(false), [menuUsado, setMenuUsado] = useState(false);
  useEffect(() => { if (menu) setMenuUsado(true); }, [menu]);
  const { prefixLink } = useCorretor(); const location = useLocation(), navigate = useNavigate();
  const [ultimaBusca, setUltimaBusca] = useState<string | null>(null);
  useEffect(() => { setUltimaBusca(lerBuscas()[0]?.rotulo ?? null); }, [location.key]);
  const [params] = useSearchParams(); const { campanha, black } = useCampanhaDestaque();
  const searchPath = location.pathname.replace(/^\/c\/[^/]+/, '');
  const isCatalog = searchPath === '/busca' || searchPath in BUSCA_URLS;
  useEffect(() => { const on = () => setRolou(window.scrollY > 120); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on); }, []);
  useEffect(() => { setMenu(false); setBusca(false); setEtapas(false); }, [location.pathname]);
  useEffect(() => { const f = () => setBusca(true); window.addEventListener('uhome:abrir-painel', f); return () => window.removeEventListener('uhome:abrir-painel', f); }, []);
  const tabs = [{ label: 'Imóveis', to: '/busca', icon: House }, { label: 'Lançamentos', to: '/busca?secao=lancamentos', icon: Building2 }, { label: 'Investir', to: '/busca?secao=investir', icon: ChartNoAxesCombined }];
  const ativo = params.get('secao') === 'investir' || location.pathname.includes('investir') ? 'Investir' : params.get('secao') === 'lancamentos' || /em-foco|campanha|lancamentos/.test(location.pathname) ? 'Lançamentos' : 'Imóveis';
  const abrirLia = () => window.dispatchEvent(new CustomEvent('uhome:abrir-lia'));
  return <>
    <nav data-uh-header className={`uhs-header uhs-site-header ${rolou ? 'uhs-header--compact' : ''}`} aria-label="Navegação principal">
      <div className="uhs-header__bar">
        <Link to={prefixLink('/')} aria-label="Uhome, página inicial"><UhomeLogo height={30} /></Link>
        <div className="uhs-desktop-tabs">{(rolou || searchPath !== '/') ? <button type="button" className="pilula-compacta" aria-label="Abrir busca" onClick={() => { if (isCatalog) window.dispatchEvent(new Event('uhome:abrir-filtros')); else if (document.querySelector('.pilula-raiz')) window.dispatchEvent(new Event('uhome:pilula-abrir')); else if (isCatalog) window.dispatchEvent(new Event('uhome:abrir-filtros')); else setBusca(true); }}><img src="/categorias/apartamento.webp" alt="" width={28} height={28} /><span>{params.get('bairro') || params.get('q') || params.get('cidade') || 'Qualquer lugar'}</span><span>{params.get('tipo') ? 'Tipo escolhido' : 'Qualquer tipo'}</span><span>{params.get('preco_max') ? 'Valor escolhido' : 'Qualquer valor'}</span><i aria-hidden="true"><Search /></i></button> : tabs.map(t => <Link className="uhs-tab" key={t.label} to={prefixLink(t.to)} aria-current={ativo === t.label ? 'page' : undefined}>{t.label}</Link>)}</div>
        <div className="uhs-header__lado--dir uhs-header-actions"><Button variant="ghost" className="uhs-desktop-lia" onClick={abrirLia}><MessageCircle />Falar com a Lia</Button><Button asChild variant="ghost" size="icon" aria-label="Favoritos"><Link to={prefixLink('/favoritos')}><Heart /></Link></Button><UserMenu /><Button variant="outline" size="icon" aria-label="Abrir menu" onClick={() => setMenu(true)}><Menu /></Button></div>
      </div>
      <div className={`uhs-mobile-header${/(^|\/)imovel\//.test(location.pathname) ? " uhs-mobile-header--oculto" : ""}`}><div className="uhs-mobile-search-row"><Link to={prefixLink('/')} className="uhs-mobile-logo" aria-label="Uhome, página inicial"><img src="/favicon-192.png" alt="" width={40} height={40} /></Link><Button variant="outline" className="uhs-busca-celular" onClick={() => { if (isCatalog) window.dispatchEvent(new Event('uhome:abrir-filtros')); else setEtapas(true); }}><Search /><span className="uhs-busca-linhas"><span>Onde vai ser seu novo lar?</span><small>{ultimaBusca ? `Última: ${ultimaBusca}` : 'Cidade, bairro ou código'}</small></span></Button><Button variant="outline" size="icon" aria-label="Abrir filtros" onClick={() => { if (isCatalog) window.dispatchEvent(new Event('uhome:abrir-filtros')); else setBusca(true); }}><SlidersHorizontal /></Button></div></div>
    </nav>
    <SiteBottomBar />
    {menuUsado && <Suspense fallback={null}><MenuSite open={menu} onOpenChange={setMenu} tabs={tabs} campanha={campanha} black={black} abrirLia={abrirLia} /></Suspense>}
    {etapas && <Suspense fallback={null}><Etapas open={etapas} onClose={() => setEtapas(false)} filtros={{ secao: 'imoveis', ordem: 'recentes' }} onApply={(f) => navigate(prefixLink(urlDeFiltros(f)))} /></Suspense>}
    {busca && <Suspense fallback={null}><PainelBusca open={busca} onClose={() => setBusca(false)} filtros={{ secao: 'imoveis', ordem: 'recentes' }} onApply={(f) => navigate(prefixLink(urlDeFiltros(f)))} /></Suspense>}
  </>;
}
