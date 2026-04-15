import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CorretorProvider } from "@/contexts/CorretorContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BannerCorretor } from "@/components/BannerCorretor";
import { PageFallback } from "@/components/PageFallback";
import { AppRoutes } from "@/routes/AppRoutes";
import { lazyRetry } from "@/lib/lazyRetry"; // hmr-trigger

const ExitIntentModal = lazyRetry(() => import("./components/ExitIntentModal.tsx").then((m) => ({ default: m.ExitIntentModal })));
const FloatingWhatsApp = lazyRetry(() => import("./components/FloatingWhatsApp.tsx"));
const WhatsAppLeadModal = lazyRetry(() => import("./components/WhatsAppLeadModal.tsx").then((m) => ({ default: m.WhatsAppLeadModal })));

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
                <AppRoutes />
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
