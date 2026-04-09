import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Link } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CorretorProvider, useCorretor } from "@/contexts/CorretorContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import FeaturedNeighborhoods from "@/components/FeaturedNeighborhoods";
import { HomeFaqSection } from "@/components/HomeFaqSection";
import { useCanonical } from "@/hooks/useCanonical";
import { setJsonLd, removeJsonLd, buildLocalBusinessJsonLd } from "@/lib/jsonld";
import { lazyRetry } from "@/lib/lazyRetry";

const ExitIntentModal = lazyRetry(() => import("@/components/ExitIntentModal").then(m => ({ default: m.ExitIntentModal })));
const FloatingWhatsApp = lazyRetry(() => import("@/components/FloatingWhatsApp"));

import { BannerCorretor } from "@/components/BannerCorretor";
const WhatsAppLeadModal = lazyRetry(() => import("@/components/WhatsAppLeadModal").then(m => ({ default: m.WhatsAppLeadModal })));

// Eager load homepage
import Index from "./pages/Index.tsx";

// Lazy load non-critical pages
const Search = lazyRetry(() => import("./pages/Search.tsx"));
const PropertyDetail = lazyRetry(() => import("./pages/PropertyDetail.tsx"));
const Anunciar = lazyRetry(() => import("./pages/Anunciar.tsx"));
const Carreiras = lazyRetry(() => import("./pages/Carreiras.tsx"));
const Bairro = lazyRetry(() => import("./pages/Bairro.tsx"));
const Bairros = lazyRetry(() => import("./pages/Bairros.tsx"));
const FAQ = lazyRetry(() => import("./pages/FAQ.tsx"));
const Onboarding = lazyRetry(() => import("./pages/Onboarding.tsx"));
const Blog = lazyRetry(() => import("./pages/Blog.tsx"));
const BlogPostPage = lazyRetry(() => import("./pages/BlogPost.tsx"));
const Favoritos = lazyRetry(() => import("./pages/Favoritos.tsx"));
const SeoOrNotFound = lazyRetry(() => import("./components/SeoOrNotFound"));
const TipoImovel = lazyRetry(() => import("./pages/TipoImovel.tsx"));
const Condominios = lazyRetry(() => import("./pages/Condominios.tsx"));
const CondominioDetail = lazyRetry(() => import("./pages/CondominioDetail.tsx"));
const AvaliacaoPage = lazyRetry(() => import("./pages/AvaliacaoPage.tsx"));
const Privacidade = lazyRetry(() => import("./pages/Privacidade.tsx"));
const ResetPassword = lazyRetry(() => import("./pages/ResetPassword.tsx"));

// Admin
const AdminLayout = lazyRetry(() => import("./pages/admin/AdminLayout.tsx"));
const AdminDashboard = lazyRetry(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminImoveis = lazyRetry(() => import("./pages/admin/AdminImoveis.tsx"));
const AdminLeads = lazyRetry(() => import("./pages/admin/AdminLeads.tsx"));
const AdminCaptacoes = lazyRetry(() => import("./pages/admin/AdminCaptacoes.tsx"));
const AdminSync = lazyRetry(() => import("./pages/admin/AdminSync.tsx"));
const AdminConfig = lazyRetry(() => import("./pages/admin/AdminConfig.tsx"));
const AdminIntegracao = lazyRetry(() => import("./pages/admin/AdminIntegracao.tsx"));
const IntegracaoDiagnostico = lazyRetry(() => import("./pages/admin/IntegracaoDiagnostico.tsx"));
const AdminLinks = lazyRetry(() => import("./pages/admin/AdminLinks.tsx"));
const AdminCorretores = lazyRetry(() => import("./pages/admin/AdminCorretores.tsx"));
const AdminEmpreendimentos = lazyRetry(() => import("./pages/admin/AdminEmpreendimentos.tsx"));
const EmpreendimentoDetail = lazyRetry(() => import("./pages/EmpreendimentoDetail.tsx"));
const MegaCyrela = lazyRetry(() => import("./pages/MegaCyrela.tsx"));
const SeoLanding = lazyRetry(() => import("./pages/SeoLanding.tsx"));
const Vitrine = lazyRetry(() => import("./pages/Vitrine.tsx"));
const Sobre = lazyRetry(() => import("./pages/Sobre.tsx"));
const GuiaBairros = lazyRetry(() => import("./pages/GuiaBairros.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

const PORTO_ALEGRE_PILLAR_LINKS = [
  { href: "/apartamentos-porto-alegre", label: "Apartamentos" },
  { href: "/casas-porto-alegre", label: "Casas" },
  { href: "/coberturas-porto-alegre", label: "Coberturas" },
  { href: "/studios-porto-alegre", label: "Studios" },
  { href: "/comerciais-porto-alegre", label: "Comerciais" },
];

const PORTO_ALEGRE_PILLAR_FAQS = [
  {
    q: "Quais imóveis estão à venda em Porto Alegre?",
    a: "Você encontra apartamentos, casas, coberturas, studios e imóveis comerciais à venda em diferentes bairros de Porto Alegre.",
  },
  {
    q: "Como buscar imóveis por bairro em Porto Alegre?",
    a: "Na Uhome você pode explorar bairros em destaque e filtrar a busca por localização, preço, quartos e tipo de imóvel.",
  },
  {
    q: "Vale a pena comprar imóvel em Porto Alegre?",
    a: "Porto Alegre reúne bairros valorizados, boa infraestrutura e opções para morar ou investir, com oportunidades em várias faixas de preço.",
  },
];

function PortoAlegrePilarPage() {
  const { prefixLink } = useCorretor();

  useCanonical("/imoveis-porto-alegre");

  useEffect(() => {
    document.title = "Imóveis à venda em Porto Alegre | Uhome";

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute(
      "content",
      "Encontre imóveis à venda em Porto Alegre com busca por tipo, bairro e faixa de preço nos melhores endereços da cidade.",
    );

    setJsonLd("jsonld-porto-alegre-pilar", buildLocalBusinessJsonLd());

    return () => {
      removeJsonLd("jsonld-porto-alegre-pilar");
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 sm:pt-28">
        <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
          <div className="container-uhome">
            <h1 className="max-w-4xl text-h1 text-balance text-foreground">
              Imóveis à venda em Porto Alegre
            </h1>
            <p className="mt-4 max-w-2xl font-body text-lg text-muted-foreground">
              Explore apartamentos, casas, coberturas, studios e imóveis comerciais nos principais bairros de Porto Alegre.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={prefixLink("/busca")}
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Buscar imóveis
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="container-uhome">
            <h2 className="text-h2 text-foreground">Explore por tipo</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PORTO_ALEGRE_PILLAR_LINKS.map((item) => (
                <Link
                  key={item.href}
                  to={prefixLink(item.href)}
                  className="rounded-2xl border border-border bg-card px-6 py-5 font-body text-base font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FeaturedNeighborhoods />
        <HomeFaqSection faqs={PORTO_ALEGRE_PILLAR_FAQS} />
      </main>
      <Footer />
    </div>
  );
}

const CorretorRefLayout = lazyRetry(() => import("./components/CorretorRef").then(m => ({ default: m.CorretorRefLayout })));
const PortoAlegrePilar = PortoAlegrePilarPage;

const App = () => (
  <ErrorBoundary>
  <BrowserRouter>
    
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CorretorProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BannerCorretor />
            <WhatsAppLeadModal />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Rotas normais */}
                <Route path="/" element={<Index />} />
                <Route path="/busca" element={<Search />} />
                <Route path="/imovel/:slug" element={<PropertyDetail />} />
                <Route path="/ia-search" element={<Navigate to="/busca?modo=ia" replace />} />
                <Route path="/anunciar" element={<Anunciar />} />
                <Route path="/carreiras" element={<Carreiras />} />
                <Route path="/bairros" element={<Bairros />} />
                <Route path="/bairros/:slug" element={<Bairro />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/favoritos" element={<Favoritos />} />
                <Route path="/apartamentos-porto-alegre" element={<TipoImovel />} />
                <Route path="/condominios" element={<Condominios />} />
                <Route path="/condominios/:slug" element={<CondominioDetail />} />
                <Route path="/avaliar-imovel" element={<AvaliacaoPage />} />
                <Route path="/politica-de-privacidade" element={<Privacidade />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/empreendimentos" element={<Condominios />} />
                <Route path="/empreendimentos/:slug" element={<EmpreendimentoDetail />} />
                <Route path="/lancamentos" element={<Navigate to="/condominios" replace />} />
                <Route path="/imoveis" element={<Navigate to="/busca" replace />} />
                <Route path="/comprar" element={<Navigate to="/busca" replace />} />
                <Route path="/venda" element={<Navigate to="/busca?finalidade=venda" replace />} />
                <Route path="/vitrine/:id" element={<Vitrine />} />
                <Route path="/mega-cyrela" element={<MegaCyrela />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/guia-bairros" element={<GuiaBairros />} />
                <Route path="/imoveis-porto-alegre" element={<PortoAlegrePilar />} />
                <Route path="/casas-porto-alegre" element={<TipoImovel />} />
                <Route path="/coberturas-porto-alegre" element={<TipoImovel />} />
                <Route path="/studios-porto-alegre" element={<TipoImovel />} />
                <Route path="/comerciais-porto-alegre" element={<TipoImovel />} />

                {/* SEO landing pages are handled by the catch-all SeoOrNotFound below */}

                {/* Rotas do corretor — mesmas páginas, mantendo /c/:slug na URL */}
                <Route path="/c/:corretorSlug" element={<CorretorRefLayout />}>
                  <Route index element={<Index />} />
                  <Route path="busca" element={<Search />} />
                  <Route path="imovel/:slug" element={<PropertyDetail />} />
                  <Route path="anunciar" element={<Anunciar />} />
                  <Route path="carreiras" element={<Carreiras />} />
                  <Route path="bairros" element={<Bairros />} />
                  <Route path="bairros/:slug" element={<Bairro />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/:slug" element={<BlogPostPage />} />
                  <Route path="favoritos" element={<Favoritos />} />
                  <Route path="condominios" element={<Condominios />} />
                  <Route path="condominios/:slug" element={<CondominioDetail />} />
                  <Route path="empreendimentos/:slug" element={<EmpreendimentoDetail />} />
                  <Route path="mega-cyrela" element={<MegaCyrela />} />
                  <Route path="sobre" element={<Sobre />} />
                  <Route path="guia-bairros" element={<GuiaBairros />} />
                  <Route path="imoveis-porto-alegre" element={<PortoAlegrePilar />} />
                  <Route path="avaliar-imovel" element={<AvaliacaoPage />} />
                  <Route path="vitrine/:id" element={<Vitrine />} />
                </Route>

                {/* Admin */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="imoveis" element={<AdminImoveis />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="captacoes" element={<AdminCaptacoes />} />
                  <Route path="sync" element={<AdminSync />} />
                  <Route path="integracao" element={<AdminIntegracao />} />
                  <Route path="integracao/diagnostico" element={<IntegracaoDiagnostico />} />
                  <Route path="config" element={<AdminConfig />} />
                  <Route path="links" element={<AdminLinks />} />
                  <Route path="corretores" element={<AdminCorretores />} />
                  <Route path="empreendimentos" element={<AdminEmpreendimentos />} />
                </Route>
                <Route path="*" element={<SeoOrNotFound />} />
              </Routes>
            </Suspense>
            <ExitIntentModal />
            <FloatingWhatsApp />
            
          </TooltipProvider>
        </CorretorProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
  </ErrorBoundary>
);

export default App;
