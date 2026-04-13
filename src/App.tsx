import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CorretorProvider } from "@/contexts/CorretorContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BannerCorretor } from "@/components/BannerCorretor";
import { PageFallback } from "@/components/PageFallback";
import { lazyRetry } from "@/lib/lazyRetry";

import {
  Index, Search, PropertyDetail, Anunciar, Carreiras,
  Bairro, Bairros, FAQ, Onboarding, Blog, BlogPostPage,
  Favoritos, TipoImovel, Condominios, CondominioDetail,
  AvaliacaoPage, Privacidade, ResetPassword, EmpreendimentoDetail,
  MegaCyrela, Vitrine, Sobre, GuiaBairros, Collection,
  PortoAlegrePilar, SeoOrNotFound, CorretorRefLayout,
  AdminLayout, AdminDashboard, AdminImoveis, AdminLeads,
  AdminCaptacoes, AdminSync, AdminConfig, AdminIntegracao,
  IntegracaoDiagnostico, AdminLinks, AdminCorretores,
  AdminEmpreendimentos,
} from "@/routes/lazyPages";

const ExitIntentModal = lazyRetry(() => import("@/components/ExitIntentModal").then(m => ({ default: m.ExitIntentModal })));
const FloatingWhatsApp = lazyRetry(() => import("@/components/FloatingWhatsApp"));
const WhatsAppLeadModal = lazyRetry(() => import("@/components/WhatsAppLeadModal").then(m => ({ default: m.WhatsAppLeadModal })));

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
                <Route path="/collection" element={<Collection />} />
                <Route path="/imoveis-porto-alegre" element={<PortoAlegrePilar />} />
                <Route path="/casas-porto-alegre" element={<TipoImovel />} />
                <Route path="/coberturas-porto-alegre" element={<TipoImovel />} />
                <Route path="/studios-porto-alegre" element={<TipoImovel />} />
                <Route path="/comerciais-porto-alegre" element={<TipoImovel />} />

                {/* Rotas do corretor */}
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
                  <Route path="collection" element={<Collection />} />
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
