import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Menu, Sparkles, BarChart3, Building2, MapPin, HelpCircle, Megaphone, Star, ChevronDown, Search, Gift,
} from "lucide-react";

import { UhomeLogo } from "@/components/UhomeLogo";
import { UserMenu } from "@/components/UserMenu";
import { useCorretor } from "@/contexts/CorretorContext";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchBusca } from "@/lib/prefetch";
import { useCampanhaDestaque } from "@/lib/produtosFoco";
import { NATAL_ART } from "@/components/foco/NatalArt";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const linkBase =
  "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 font-body text-[13px] font-semibold transition-colors";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { prefixLink } = useCorretor();
  const [bannerVisible, setBannerVisible] = useState(false);
  const queryClient = useQueryClient();
  const { campanha, black } = useCampanhaDestaque();

  const handlePrefetchBusca = useCallback(() => {
    prefetchBusca(queryClient);
    import("../pages/Search");
  }, [queryClient]);

  useEffect(() => {
    const check = () => setBannerVisible(!!document.getElementById("banner-corretor-spacer"));
    check();
    window.addEventListener("corretor-ref-ready", check);
    const t = setTimeout(check, 2000);
    return () => {
      window.removeEventListener("corretor-ref-ready", check);
      clearTimeout(t);
    };
  }, [location.pathname]);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const on = () => setRolou(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const path = location.pathname;
  const isSearchPage = path === "/busca" || path.endsWith("/busca");
  const modoIA = searchParams.get("modo") === "ia";

  // Durante uma campanha em destaque (Natal), ela ocupa o lugar do "Uhome em Foco".
  const destaque = campanha
    ? { to: `/campanha/${campanha.slug}`, label: black ? "Black Natal" : campanha.nome, campanha: true }
    : { to: "/em-foco", label: "Uhome em Foco", campanha: false };
  const destaqueAtivo = path.includes("/campanha/") || path.includes("/em-foco");


  const tab = (active: boolean) =>
    `${linkBase} ${active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`;

  return (
    <nav className={`fixed left-0 right-0 z-50 border-b backdrop-blur-lg transition-[background-color,box-shadow,border-color] duration-300 ${rolou ? "border-border/60 bg-background/80 shadow-sm" : "border-border/40 bg-background/95"} ${bannerVisible ? "top-10" : "top-0"}`}>
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={prefixLink("/")} className="flex flex-shrink-0 items-center" aria-label="Uhome, página inicial">
          <UhomeLogo variant="full" height={24} />
        </Link>

        {/* Desktop */}
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          <NavDropdown
            label="Comprar"
            active={isSearchPage}
            onHover={handlePrefetchBusca}
            items={[
              { to: "/busca?finalidade=venda", label: "Buscar imóveis", desc: "Filtros e mapa", icon: Search },
              { to: "/busca?modo=ia", label: "Busca com IA", desc: "Descreva o imóvel ideal", icon: Sparkles },
              { to: "/bairros", label: "Bairros", desc: "Guia dos melhores endereços", icon: MapPin },
              { to: "/condominios", label: "Condomínios", desc: "Prédios e empreendimentos", icon: Building2 },
              { to: "/imoveis-porto-alegre", label: "Imóveis em Porto Alegre", desc: "Tudo sobre a capital", icon: Star },
            ].map((i) => ({ ...i, to: prefixLink(i.to) }))}
          />
          <Link
            to={prefixLink(destaque.to)}
            className={`${linkBase} ${destaqueAtivo ? "bg-secondary text-foreground" : "text-foreground hover:bg-secondary"}`}
          >
            {destaque.campanha ? (
              <img src={NATAL_ART.chave} alt="" className="h-3 w-auto" />
            ) : (
              <Star className="h-3.5 w-3.5 text-primary" />
            )}
            {destaque.label}
            {destaque.campanha && <span className="h-1.5 w-1.5 rounded-full bg-natal-gold" aria-hidden />}
          </Link>
          <NavDropdown
            label="Proprietários"
            active={path.includes("/anunciar") || path.includes("/avaliar-imovel")}
            items={[
              { to: "/anunciar", label: "Anunciar imóvel", desc: "Venda com a Uhome", icon: Megaphone },
              { to: "/avaliar-imovel", label: "Quanto vale meu imóvel?", desc: "Avaliação gratuita", icon: BarChart3 },
            ].map((i) => ({ ...i, to: prefixLink(i.to) }))}
          />
          <Link to={prefixLink("/faq")} className={tab(path.endsWith("/faq"))}>Ajuda</Link>
        </div>

        <div className="ml-auto hidden flex-shrink-0 items-center lg:flex">
          <UserMenu />
        </div>

        {/* Mobile */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <UserMenu />
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary active:scale-95"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto p-0">
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <SheetTitle className="font-body text-base">Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-5 px-4 py-5">
            <Group title="Buscar">
              <MobileNavLink to={prefixLink("/busca?finalidade=venda")} icon={<Search className="h-4 w-4" />} label="Comprar imóvel" />
              <MobileNavLink to={prefixLink("/busca?modo=ia")} icon={<Sparkles className="h-4 w-4" />} label="Busca com IA" />
              <MobileNavLink to={prefixLink("/bairros")} icon={<MapPin className="h-4 w-4" />} label="Bairros" />
              <MobileNavLink to={prefixLink("/condominios")} icon={<Building2 className="h-4 w-4" />} label="Condomínios" />
              <MobileNavLink to={prefixLink("/imoveis-porto-alegre")} icon={<Star className="h-4 w-4" />} label="Imóveis em Porto Alegre" />
            </Group>

            <Link
              to={prefixLink(destaque.to)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-4 font-body text-sm font-bold ${
                destaque.campanha ? "bg-natal text-natal-gold" : "bg-primary/10 text-primary"
              }`}
            >
              {destaque.campanha ? <Gift className="h-5 w-5" /> : <Star className="h-5 w-5" />}
              <span className="flex-1">{destaque.label}</span>
              {destaque.campanha && <span className="font-normal text-natal-foreground/80">até 18/12</span>}
            </Link>

            <Group title="Para proprietários">
              <MobileNavLink to={prefixLink("/anunciar")} icon={<Megaphone className="h-4 w-4" />} label="Anunciar imóvel" />
              <MobileNavLink to={prefixLink("/avaliar-imovel")} icon={<BarChart3 className="h-4 w-4" />} label="Quanto vale meu imóvel?" />
            </Group>

            <Group title="Uhome">
              <MobileNavLink to={prefixLink("/faq")} icon={<HelpCircle className="h-4 w-4" />} label="Ajuda" />
            </Group>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}

type NavItem = { to: string; label: string; desc: string; icon: React.ComponentType<{ className?: string }> };

function NavDropdown({ label, items, active, onHover }: { label: string; items: NavItem[]; active?: boolean; onHover?: () => void }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        onMouseEnter={onHover}
        className={`${linkBase} ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"} data-[state=open]:bg-secondary data-[state=open]:text-foreground`}
      >
        {label} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={10} className="w-72 rounded-2xl p-2">
        {items.map((m) => (
          <DropdownMenuItem key={m.to} asChild className="cursor-pointer rounded-xl p-2.5">
            <Link to={m.to} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                <m.icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-body text-sm font-semibold text-foreground">{m.label}</span>
                <span className="block font-body text-xs text-muted-foreground">{m.desc}</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-3 pb-1 font-body text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function MobileNavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 font-body text-sm font-medium text-foreground transition-colors hover:bg-secondary active:scale-[0.98]"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Link>
  );
}
