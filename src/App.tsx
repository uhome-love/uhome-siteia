import { CookieNotice } from "@/components/privacy/CookieNotice";
import React, { Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CorretorProvider } from "@/contexts/CorretorContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BannerCorretor } from "@/components/BannerCorretor";
import { PageFallback } from "@/components/PageFallback";
import { AppRoutes } from "@/routes/AppRoutes";
import { lazyRetry } from "@/lib/lazyRetry"; // hmr-trigger

const Sonner = lazyRetry(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));
const Toaster = lazyRetry(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));
const ExitIntentModal = lazyRetry(() => import("./components/ExitIntentModal.tsx").then((m) => ({ default: m.ExitIntentModal })));
const LiaChat = lazyRetry(() => import("./components/lia/LiaChat.tsx"));

/** Lia, avisos e janelas só baixam depois da primeira pintura e do carregamento da página, para não disputar com o conteúdo principal. */
const SalvarNaPasta = lazyRetry(() => import('@/components/favoritos/SalvarNaPasta').then((m) => ({ default: m.SalvarNaPasta })));
const ConviteWhatsApp = React.lazy(() => import("@/components/ConviteWhatsApp"));
function DepoisDaPintura({ children }: { children: React.ReactNode }) {
  const [pronta, setPronta] = useState(false);
  useEffect(() => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const go = () => (ric ? ric(() => setPronta(true), { timeout: 3000 }) : setTimeout(() => setPronta(true), 1500));
    if (document.readyState === "complete") go(); else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);
  return pronta ? <Suspense fallback={null}>{children}</Suspense> : null;
}
const WhatsAppLeadModal = lazyRetry(() => import("./components/WhatsAppLeadModal.tsx").then((m) => ({ default: m.WhatsAppLeadModal })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      retryDelay: 1000,
      // Evita que listas mudem "do nada" quando o usuário troca de aba
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
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
              <CookieNotice />
              <BannerCorretor />
              <Suspense fallback={<PageFallback />}>
                <AppRoutes />
              </Suspense>
              <DepoisDaPintura>
                <Toaster />
                <Sonner />
                <WhatsAppLeadModal />
                <ExitIntentModal />
                <LiaChat />
                <SalvarNaPasta />
                <Suspense fallback={null}><ConviteWhatsApp /></Suspense>
              </DepoisDaPintura>
            </TooltipProvider>
          </CorretorProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
