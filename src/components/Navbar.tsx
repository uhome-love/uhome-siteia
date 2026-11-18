import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Menu, Search, SlidersHorizontal, Heart, House, Building2, ChartNoAxesCombined, MessageCircle } from "lucide-react";
import { UhomeLogo } from "@/components/UhomeLogo";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCorretor } from "@/contexts/CorretorContext";
import { useCampanhaDestaque } from "@/lib/produtosFoco";
import { SiteBottomBar } from "@/components/SiteBottomBar";
import { urlDeFiltros } from "@/lib/homeVitrine";
import { PilulaBusca } from "@/components/PilulaBusca";
const PainelBusca = lazy(() => import("@/components/search/SearchFilterDialog").then((m) => ({ default: m.SearchFilterDialog })));
import { BUSCA_URLS } from "../../supabase/functions/_shared/buscaConfig";

export function Navbar() {
  const [menu, setMenu] = useState(false), [busca, setBusca] = useState(false), [rolou, setRolou] = useState(false);
  const { prefixLink } = useCorretor(); const location = useLocation(), navigate = useNavigate();
  const [params] = useSearchParams(); const { campanha, black } = useCampanhaDestaque();
  const searchPath = location.pathname.replace(/^\/c\/[^/]+/, '');
  const isCatalog = searchPath === '/busca' || searchPath in BUSCA_URLS;
  useEffect(() => { const on = () => setRolou(window.scrollY > 120); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on); }, []);
  useEffect(() => { setMenu(false); setBusca(false); }, [location.pathname]);
  const tabs = [{ label: 'Imóveis', to: '/busca', icon: House }, { label: 'Lançamentos', to: '/busca?secao=lancamentos', icon: Building2 }, { label: 'Investir', to: '/busca?secao=investir', icon: ChartNoAxesCombined }];
  const ativo = params.get('secao') === 'investir' || location.pathname.includes('investir') ? 'Investir' : params.get('secao') === 'lancamentos' || /em-foco|campanha|lancamentos/.test(location.pathname) ? 'Lançamentos' : 'Imóveis';
  const abrirLia = () => window.dispatchEvent(new CustomEvent('uhome:abrir-lia'));
  return <>
    <nav data-uh-header className={`uhs-header uhs-site-header ${rolou ? 'uhs-header--compact' : ''}`} aria-label="Navegação principal">
      <div className="uhs-header__bar">
        <Link to={prefixLink('/')} aria-label="Uhome, página inicial"><UhomeLogo height={30} /></Link>
        <div className="uhs-desktop-tabs">{rolou ? <button type="button" className="pilula-compacta" aria-label="Abrir busca" onClick={() => { if (document.querySelector('.pilula-raiz')) window.dispatchEvent(new Event('uhome:pilula-abrir')); else if (isCatalog) window.dispatchEvent(new Event('uhome:abrir-filtros')); else setBusca(true); }}><img src="/categorias/apartamento.webp" alt="" width={28} height={28} /><span>{params.get('bairro') || params.get('q') || params.get('cidade') || 'Qualquer lugar'}</span><span>{params.get('tipo') ? 'Tipo escolhido' : 'Qualquer tipo'}</span><span>{params.get('preco_max') ? 'Valor escolhido' : 'Qualquer valor'}</span><i aria-hidden="true"><Search /></i></button> : isCatalog ? <div className="uhs-nav-pilula"><PilulaBusca inicial={Object.fromEntries(params)} /></div> : tabs.map(t => <Link className="uhs-tab" key={t.label} to={prefixLink(t.to)} aria-current={ativo === t.label ? 'page' : undefined}>{t.label}</Link>)}</div>
        <div className="uhs-header__lado--dir uhs-header-actions"><Button variant="ghost" className="uhs-desktop-lia" onClick={abrirLia}><MessageCircle />Falar com a Lia</Button><Button asChild variant="ghost" size="icon" aria-label="Favoritos"><Link to={prefixLink('/favoritos')}><Heart /></Link></Button><UserMenu /><Button variant="outline" size="icon" aria-label="Abrir menu" onClick={() => setMenu(true)}><Menu /></Button></div>
      </div>
      <div className="uhs-mobile-header"><div className="uhs-mobile-search-row"><Button variant="outline" className="uhs-busca-celular" onClick={() => { if (isCatalog) window.dispatchEvent(new Event('uhome:abrir-filtros')); else setBusca(true); }}><Search /><span>Onde vai ser seu novo lar?</span></Button><Button variant="outline" size="icon" aria-label="Abrir filtros" onClick={() => { if (isCatalog) window.dispatchEvent(new Event('uhome:abrir-filtros')); else setBusca(true); }}><SlidersHorizontal /></Button></div><div className="uhs-mobile-tabs">{tabs.map(t => <Link key={t.label} to={prefixLink(t.to)} className="uhs-tab" aria-current={ativo === t.label ? 'page' : undefined}><t.icon />{t.label}</Link>)}</div></div>
    </nav>
    <SiteBottomBar />
    <Sheet open={menu} onOpenChange={setMenu}><SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Uhome</SheetTitle></SheetHeader><div className="mt-6 flex flex-col gap-2">{tabs.map(t => <Button asChild variant="ghost" className="justify-start" key={t.label}><Link to={prefixLink(t.to)}><t.icon />{t.label}</Link></Button>)}<Button asChild variant="outline"><Link to={prefixLink(campanha ? '/campanha/' + campanha.slug : '/em-foco')}>{campanha ? black ? 'Black Natal' : campanha.nome : 'Uhome em Foco'}</Link></Button>{[['/anunciar','Anunciar imóvel'],['/avaliar-imovel','Quanto vale meu imóvel?'],['/bairros','Bairros'],['/condominios','Condomínios'],['/sobre','Sobre a Uhome'],['/faq','Ajuda']].map(([to,l]) => <Button asChild variant="ghost" className="justify-start" key={to}><Link to={prefixLink(to)}>{l}</Link></Button>)}<Button variant="outline" onClick={() => { setMenu(false); abrirLia(); }}>Falar com a Lia</Button></div></SheetContent></Sheet>
    {busca && <Suspense fallback={null}><PainelBusca open={busca} onClose={() => setBusca(false)} filtros={{ secao: 'imoveis', ordem: 'recentes' }} onApply={(f) => navigate(prefixLink(urlDeFiltros(f)))} /></Suspense>}
  </>;
}
