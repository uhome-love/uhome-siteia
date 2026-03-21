import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { FloatingCTA } from "@/components/FloatingCTA";
import Index from "./pages/Index.tsx";
import Search from "./pages/Search.tsx";
import PropertyDetail from "./pages/PropertyDetail.tsx";
import Anunciar from "./pages/Anunciar.tsx";
import Carreiras from "./pages/Carreiras.tsx";
import Bairro from "./pages/Bairro.tsx";
import Bairros from "./pages/Bairros.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
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
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ExitIntentModal />
        <FloatingCTA />
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
