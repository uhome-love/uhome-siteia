import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { FloatingCTA } from "@/components/FloatingCTA";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Search from "./pages/Search.tsx";
import PropertyDetail from "./pages/PropertyDetail.tsx";
import Anunciar from "./pages/Anunciar.tsx";
import Carreiras from "./pages/Carreiras.tsx";
import Bairro from "./pages/Bairro.tsx";
import Bairros from "./pages/Bairros.tsx";
import FAQ from "./pages/FAQ.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPostPage from "./pages/BlogPost.tsx";
import Favoritos from "./pages/Favoritos.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ExitIntentModal />
          <FloatingCTA />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
