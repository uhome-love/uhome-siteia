import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Menu, Sparkles, BarChart3, Building2, MapPin, HelpCircle, Megaphone, Star, ChevronDown, Search, Gift, BookOpen,
} from "lucide-react";

import { UhomeLogo } from "@/components/UhomeLogo";
import { UserMenu } from "@/components/UserMenu";
import { useCorretor } from "@/contexts/CorretorContext";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchBusca } from "@/lib/prefetch";
import { useCampanhaDestaque } from "@/lib/produtosFoco";
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

  const path = location.pathname;
  const isSearchPage = path === "/busca" || path.endsWith("/busca");
  const modoIA = searchParams.get("modo") === "ia";

  // Durante uma campanha em destaque (Natal), ela ocupa o lugar do "Uhome em Foco".
  const destaque = campanha
    ? { to: `/campanha/${campanha.slug}`, label: black ? "Black Natal" : campanha.nome, campanha: true }
    : { to: "/em-foco", label: "Uhome em Foco", campanha: false };
  const destaqueAtivo = path.includes("/campanha/") || path.includes("/em-foco");

  const mais = [
    { to: "/avaliar-imovel", label: "Quanto vale meu imóvel?", icon: BarChart3 },
    { to: "/bairros", label: "Bairros", icon: MapPin },
    { to: "/condominios", label: "Condomínios", icon: Building2 },
    { to: "/blog", label: "Blog", icon: BookOpen },
    { to: "/faq", label: "Ajuda", icon: HelpCircle },
  ];

  const tab = (active: boolean) =>
    `${linkBase} ${active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`;

  return (
    <nav className={`fixed left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-lg ${bannerVisible ? "top-10" : "top-0"}`}>
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={prefixLink("/")} className="flex flex-shrink-0 items-center" aria-label="Uhome, página inicial">
          <UhomeLogo variant="full" height={24} />
        </Link>

        {/* Desktop */}
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          <Link
            to={prefixLink("/busca?finalidade=venda")}
            onMouseEnter={handlePrefetchBusca}
            onMouseDown={handlePrefetchBusca}
            className={tab(isSearchPage && !modoIA)}
          >
            Comprar
          </Link>
          <Link to={prefixLink("/busca?modo=ia")} className={tab(isSearchPage && modoIA)}>
            <Sparkles className="h-3.5 w-3.5" /> Busca IA
          </Link>
          <Link
            to={prefixLink(destaque.to)}
            className={
              destaque.campanha
                ? `${linkBase} border border-natal-gold/50 bg-natal text-natal-gold hover:bg-natal-deep`
                : tab(destaqueAtivo)
            }
          >
            {destaque.campanha ? <Gift className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
            {destaque.label}
          </Link>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className={`${linkBase} text-muted-foreground hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary`}>
              Mais <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-60 rounded-xl p-1.5">
              {mais.map((m) => (
                <DropdownMenuItem key={m.to} asChild className="cursor-pointer rounded-lg px-3 py-2.5">
                  <Link to={prefixLink(m.to)} className="flex items-center gap-3 font-body text-sm">
                    <m.icon className="h-4 w-4 text-muted-foreground" /> {m.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-auto hidden flex-shrink-0 items-center gap-2 lg:flex">
          <Link
            to={prefixLink("/anunciar")}
            className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-border px-4 font-body text-[13px] font-semibold text-foreground transition-colors hover:border-foreground"
          >
            Anunciar imóvel
          </Link>
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
              <MobileNavLink to={prefixLink("/blog")} icon={<BookOpen className="h-4 w-4" />} label="Blog" />
              <MobileNavLink to={prefixLink("/faq")} icon={<HelpCircle className="h-4 w-4" />} label="Ajuda" />
            </Group>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
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
