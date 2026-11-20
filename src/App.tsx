import { CookieNotice } from "@/components/privacy/CookieNotice";
import React, { Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CorretorProvider } from "@/contexts/CorretorContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BannerCorretor } from "@/components/BannerCorretor";
import { PageFallback } from "@/components/PageFallback";
import { AppRoutes } from "@/routes/AppRoutes";
import { lazyRetry } from "@/lib/lazyRetry"; // hmr-trigger
import { useWhatsAppLeadStore } from "@/stores/whatsappLeadStore";
import { useAuth } from "@/hooks/useAuth";
import { LiaLauncher } from "@/components/lia/LiaLauncher";
import { depoisDoLoadOcioso } from "@/lib/depoisDoLoadOcioso";

const Sonner = lazyRetry(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));
const Toaster = lazyRetry(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));
const ExitIntentTrigger = lazyRetry(() => import("./components/ExitIntentTrigger.tsx").then((m) => ({ default: m.ExitIntentTrigger })));

/** Lia, avisos e janelas só baixam depois da primeira pintura e do carregamento da página, para não disputar com o conteúdo principal. */
const SalvarNaPasta = lazyRetry(() => import('@/components/favoritos/SalvarNaPasta').then((m) => ({ default: m.SalvarNaPasta })));
const ConviteWhatsApp = React.lazy(() => import("@/components/ConviteWhatsApp"));
function ContatosSobDemanda() {
  const aberto = useWhatsAppLeadStore(s => s.isOpen);
  const { user } = useAuth();
  return <Suspense fallback={null}>{aberto && <WhatsAppLeadModal />}{user && <ConviteWhatsApp />}</Suspense>;
}
function PastasSobDemanda() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const abrir = (event: Event) => setId((event as CustomEvent<string>).detail);
    window.addEventListener('uhome:salvo-favorito', abrir);
    return () => window.removeEventListener('uhome:salvo-favorito', abrir);
  }, []);
  return id ? <Suspense fallback={null}><SalvarNaPasta initialId={id} /></Suspense> : null;
}
function DepoisDaPintura({ children }: { children: React.ReactNode }) {
  const [pronta, setPronta] = useState(false);
  useEffect(() => depoisDoLoadOcioso(() => setPronta(true)), []);
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
            <>
              <CookieNotice />
              <BannerCorretor />
              <Suspense fallback={<PageFallback />}>
                <AppRoutes />
              </Suspense>
              <DepoisDaPintura>
                <Toaster />
                <Sonner />
                <ContatosSobDemanda />
                <ExitIntentTrigger />
                <LiaLauncher />
                <PastasSobDemanda />
              </DepoisDaPintura>
            </>
          </CorretorProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
