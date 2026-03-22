import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { AuthProvider } from "@/hooks/useAuth";
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

// Admin
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminImoveis = lazy(() => import("./pages/admin/AdminImoveis.tsx"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads.tsx"));
const AdminCaptacoes = lazy(() => import("./pages/admin/AdminCaptacoes.tsx"));
const AdminSync = lazy(() => import("./pages/admin/AdminSync.tsx"));
const AdminConfig = lazy(() => import("./pages/admin/AdminConfig.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min cache
      gcTime: 10 * 60 * 1000, // 10 min garbage collection
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

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<PageFallback />}>
            <Routes>
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
              <Route path="/casas-porto-alegre" element={<TipoImovel />} />
              <Route path="/coberturas-porto-alegre" element={<TipoImovel />} />
              <Route path="/studios-porto-alegre" element={<TipoImovel />} />
              <Route path="/comerciais-porto-alegre" element={<TipoImovel />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="imoveis" element={<AdminImoveis />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="captacoes" element={<AdminCaptacoes />} />
                <Route path="sync" element={<AdminSync />} />
                <Route path="config" element={<AdminConfig />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ExitIntentModal />
          <FloatingWhatsApp />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
