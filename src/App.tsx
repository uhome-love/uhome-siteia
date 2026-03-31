import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CorretorProvider } from "@/contexts/CorretorContext";

const ExitIntentModal = lazy(() => import("@/components/ExitIntentModal").then(m => ({ default: m.ExitIntentModal })));
const FloatingWhatsApp = lazy(() => import("@/components/FloatingWhatsApp").then(m => ({ default: m.FloatingWhatsApp })));

import { BannerCorretor } from "@/components/BannerCorretor";

// Eager load homepage
import Index from "./pages/Index.tsx";

// Lazy load non-critical pages
const Search = lazy(() => import("./pages/Search.tsx"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail.tsx"));
const Anunciar = lazy(() => import("./pages/Anunciar.tsx"));
const Carreiras = lazy(() => import("./pages/Carreiras.tsx"));
const Bairro = lazy(() => import("./pages/Bairro.tsx"));
const Bairros = lazy(() => import("./pages/Bairros.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPostPage = lazy(() => import("./pages/BlogPost.tsx"));
const Favoritos = lazy(() => import("./pages/Favoritos.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const TipoImovel = lazy(() => import("./pages/TipoImovel.tsx"));
const Condominios = lazy(() => import("./pages/Condominios.tsx"));
const CondominioDetail = lazy(() => import("./pages/CondominioDetail.tsx"));
const AvaliacaoPage = lazy(() => import("./pages/AvaliacaoPage.tsx"));
const Privacidade = lazy(() => import("./pages/Privacidade.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));

// Admin
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminImoveis = lazy(() => import("./pages/admin/AdminImoveis.tsx"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads.tsx"));
const AdminCaptacoes = lazy(() => import("./pages/admin/AdminCaptacoes.tsx"));
const AdminSync = lazy(() => import("./pages/admin/AdminSync.tsx"));
const AdminConfig = lazy(() => import("./pages/admin/AdminConfig.tsx"));
const AdminIntegracao = lazy(() => import("./pages/admin/AdminIntegracao.tsx"));
const IntegracaoDiagnostico = lazy(() => import("./pages/admin/IntegracaoDiagnostico.tsx"));
const AdminLinks = lazy(() => import("./pages/admin/AdminLinks.tsx"));
const AdminCorretores = lazy(() => import("./pages/admin/AdminCorretores.tsx"));
const AdminEmpreendimentos = lazy(() => import("./pages/admin/AdminEmpreendimentos.tsx"));
const EmpreendimentoDetail = lazy(() => import("./pages/EmpreendimentoDetail.tsx"));
const MegaCyrela = lazy(() => import("./pages/MegaCyrela.tsx"));
const SeoLanding = lazy(() => import("./pages/SeoLanding.tsx"));
const Vitrine = lazy(() => import("./pages/Vitrine.tsx"));
const Sobre = lazy(() => import("./pages/Sobre.tsx"));
const GuiaBairros = lazy(() => import("./pages/GuiaBairros.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min cache
      gcTime: 10 * 60 * 1000, // 10 min garbage collection
      retry: 1, // Single retry — faster error recovery
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


const CorretorRefLayout = lazy(() => import("./components/CorretorRef").then(m => ({ default: m.CorretorRefLayout })));

const App = () => (
  <BrowserRouter>
    
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CorretorProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BannerCorretor />
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
                <Route path="/vitrine/:id" element={<Vitrine />} />
                <Route path="/mega-cyrela" element={<MegaCyrela />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/guia-bairros" element={<GuiaBairros />} />
                <Route path="/casas-porto-alegre" element={<TipoImovel />} />
                <Route path="/coberturas-porto-alegre" element={<TipoImovel />} />
                <Route path="/studios-porto-alegre" element={<TipoImovel />} />
                <Route path="/comerciais-porto-alegre" element={<TipoImovel />} />

                {/* SEO landing pages: intent pages */}
                <Route path="/apartamentos-a-venda-porto-alegre" element={<SeoLanding />} />
                <Route path="/casas-a-venda-porto-alegre" element={<SeoLanding />} />
                <Route path="/coberturas-a-venda-porto-alegre" element={<SeoLanding />} />
                <Route path="/terrenos-a-venda-porto-alegre" element={<SeoLanding />} />
                <Route path="/imoveis-de-luxo-porto-alegre" element={<SeoLanding />} />
                <Route path="/investimento-imobiliario-porto-alegre" element={<SeoLanding />} />
                <Route path="/lancamentos-porto-alegre" element={<SeoLanding />} />
                {/* Dynamic SEO: tipo+bairro e tipo+quartos+bairro */}
                <Route path="/apartamentos-*" element={<SeoLanding />} />
                <Route path="/casas-*" element={<SeoLanding />} />
                <Route path="/coberturas-*" element={<SeoLanding />} />
                <Route path="/studios-*" element={<SeoLanding />} />
                <Route path="/terrenos-*" element={<SeoLanding />} />
                <Route path="/comerciais-*" element={<SeoLanding />} />
                <Route path="/imoveis-*" element={<SeoLanding />} />

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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <ExitIntentModal />
            <FloatingWhatsApp />
            
          </TooltipProvider>
        </CorretorProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
