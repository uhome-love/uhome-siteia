import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Menu, Search, SlidersHorizontal, Heart, House, Building2, ChartNoAxesCombined, MessageCircle } from "lucide-react";
import { UhomeLogo } from "@/components/UhomeLogo";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCorretor } from "@/contexts/CorretorContext";
import { useCampanhaDestaque } from "@/lib/produtosFoco";
import { SiteBottomBar } from "@/components/SiteBottomBar";
import { BUSCA_URLS } from "../../supabase/functions/_shared/buscaConfig";

export function Navbar() {
  const [menu, setMenu] = useState(false), [busca, setBusca] = useState(false), [rolou, setRolou] = useState(false);
  const [local, setLocal] = useState(''), [cidade, setCidade] = useState('Porto Alegre');
  const { prefixLink } = useCorretor(); const location = useLocation(), navigate = useNavigate();
  const [params] = useSearchParams(); const { campanha, black } = useCampanhaDestaque();
  const searchPath = location.pathname.replace(/^\/c\/[^/]+/, '');
  const isCatalog = searchPath === '/busca' || searchPath in BUSCA_URLS;
  useEffect(() => { const on = () => setRolou(window.scrollY > 120); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on); }, []);
  useEffect(() => { setMenu(false); setBusca(false); }, [location.pathname]);
  const tabs = [{ label: 'Imóveis', to: '/busca', icon: House }, { label: 'Lançamentos', to: '/busca?secao=lancamentos', icon: Building2 }, { label: 'Investir', to: '/busca?secao=investir', icon: ChartNoAxesCombined }];
  const ativo = params.get('secao') === 'investir' || location.pathname.includes('investir') ? 'Investir' : params.get('secao') === 'lancamentos' || /em-foco|campanha|lancamentos/.test(location.pathname) ? 'Lançamentos' : 'Imóveis';
  const abrirLia = () => window.dispatchEvent(new CustomEvent('uhome:abrir-lia'));
  const pesquisar = () => { const q = new URLSearchParams(isCatalog ? params : undefined); q.set('cidade', cidade); if (local.trim()) q.set('q', local.trim()); else q.delete('q'); navigate(prefixLink((isCatalog ? searchPath : '/busca') + '?' + q)); setBusca(false); };
  return <>
    <nav data-uh-header className={`uhs-header uhs-site-header ${rolou ? 'uhs-header--compact' : ''}`} aria-label="Navegação principal">
      <div className="uhs-header__bar">
        <Link to={prefixLink('/')} aria-label="Uhome, página inicial"><UhomeLogo height={30} /></Link>
        <div className="uhs-desktop-tabs">{rolou ? <Button variant="outline" onClick={() => setBusca(true)}><Search />{params.get('q') || params.get('cidade') || 'Onde vai ser seu novo lar?'}</Button> : tabs.map(t => <Link className="uhs-tab" key={t.label} to={prefixLink(t.to)} aria-current={ativo === t.label ? 'page' : undefined}>{t.label}</Link>)}</div>
        <div className="uhs-header__lado--dir uhs-header-actions"><Button variant="ghost" className="uhs-desktop-lia" onClick={abrirLia}><MessageCircle />Falar com a Lia</Button><Button asChild variant="ghost" size="icon" aria-label="Favoritos"><Link to={prefixLink('/favoritos')}><Heart /></Link></Button><UserMenu /><Button variant="outline" size="icon" aria-label="Abrir menu" onClick={() => setMenu(true)}><Menu /></Button></div>
      </div>
      <div className="uhs-mobile-header"><div className="uhs-mobile-search-row"><Button variant="outline" className="uhs-busca-celular" onClick={() => {setLocal(params.get('q') || '');setCidade(params.get('cidade') || 'Porto Alegre');setBusca(true);}}><Search /><span>Onde vai ser seu novo lar?</span></Button><Button variant="outline" size="icon" aria-label="Abrir filtros" onClick={() => { if (isCatalog) window.dispatchEvent(new Event('uhome:abrir-filtros')); else setBusca(true); }}><SlidersHorizontal /></Button></div><div className="uhs-mobile-tabs">{tabs.map(t => <Link key={t.label} to={prefixLink(t.to)} className="uhs-tab" aria-current={ativo === t.label ? 'page' : undefined}><t.icon />{t.label}</Link>)}</div></div>
    </nav>
    <SiteBottomBar />
    <Sheet open={menu} onOpenChange={setMenu}><SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Uhome</SheetTitle></SheetHeader><div className="mt-6 flex flex-col gap-2">{tabs.map(t => <Button asChild variant="ghost" className="justify-start" key={t.label}><Link to={prefixLink(t.to)}><t.icon />{t.label}</Link></Button>)}<Button asChild variant="outline"><Link to={prefixLink(campanha ? '/campanha/' + campanha.slug : '/em-foco')}>{campanha ? black ? 'Black Natal' : campanha.nome : 'Uhome em Foco'}</Link></Button>{[['/anunciar','Anunciar imóvel'],['/avaliar-imovel','Quanto vale meu imóvel?'],['/bairros','Bairros'],['/condominios','Condomínios'],['/sobre','Sobre a Uhome'],['/faq','Ajuda']].map(([to,l]) => <Button asChild variant="ghost" className="justify-start" key={to}><Link to={prefixLink(to)}>{l}</Link></Button>)}<Button variant="outline" onClick={() => { setMenu(false); abrirLia(); }}>Falar com a Lia</Button></div></SheetContent></Sheet>
    <Sheet open={busca} onOpenChange={setBusca}><SheetContent side="bottom" className="h-[100dvh] rounded-none"><SheetHeader><SheetTitle>Onde vai ser seu novo lar?</SheetTitle></SheetHeader><form className="mx-auto mt-8 flex max-w-xl flex-col gap-6" onSubmit={e => { e.preventDefault(); pesquisar(); }}><label className="flex flex-col gap-2">Cidade<select className="min-h-11 rounded-md border border-input bg-background px-3" value={cidade} onChange={e => setCidade(e.target.value)}>{['Porto Alegre','Canoas','Cachoeirinha','Gravataí','Guaíba'].map(c => <option key={c}>{c}</option>)}</select></label><label className="flex flex-col gap-2">Bairro, endereço ou código<input className="min-h-11 rounded-md border border-input bg-background px-3" value={local} onChange={e => setLocal(e.target.value)} placeholder="Bairro, endereço ou código" /></label><Button type="submit"><Search />Buscar imóveis</Button><Button variant="outline" type="button" onClick={() => { setBusca(false); if(isCatalog)window.dispatchEvent(new Event('uhome:abrir-filtros'));else navigate(prefixLink('/busca')); }}>Todos os filtros</Button></form></SheetContent></Sheet>
  </>;
}
