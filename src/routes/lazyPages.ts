import { lazyRetry } from "@/lib/lazyRetry";

// Eager load homepage only
export { default as Index } from "../pages/Index.tsx";
export { default as Collection } from "../pages/Collection.tsx";
export { default as PortoAlegrePilar } from "../pages/PortoAlegrePilar.tsx";

// Secondary pages – lazy loaded

// Public pages
export const Search = lazyRetry(() => import("../pages/Search.tsx"));
export const PropertyDetail = lazyRetry(() => import("../pages/PropertyDetail.tsx"));
export const Anunciar = lazyRetry(() => import("../pages/Anunciar.tsx"));
export const Carreiras = lazyRetry(() => import("../pages/Carreiras.tsx"));
export const Bairro = lazyRetry(() => import("../pages/Bairro.tsx"));
export const Bairros = lazyRetry(() => import("../pages/Bairros.tsx"));
export const FAQ = lazyRetry(() => import("../pages/FAQ.tsx"));
export const Onboarding = lazyRetry(() => import("../pages/Onboarding.tsx"));
export const Blog = lazyRetry(() => import("../pages/Blog.tsx"));
export const BlogPostPage = lazyRetry(() => import("../pages/BlogPost.tsx"));
export const Favoritos = lazyRetry(() => import("../pages/Favoritos.tsx"));
export const TipoImovel = lazyRetry(() => import("../pages/TipoImovel.tsx"));
export const Condominios = lazyRetry(() => import("../pages/Condominios.tsx"));
export const CondominioDetail = lazyRetry(() => import("../pages/CondominioDetail.tsx"));
export const AvaliacaoPage = lazyRetry(() => import("../pages/AvaliacaoPage.tsx"));
export const Privacidade = lazyRetry(() => import("../pages/Privacidade.tsx"));
export const ResetPassword = lazyRetry(() => import("../pages/ResetPassword.tsx"));
export const EmpreendimentoDetail = lazyRetry(() => import("../pages/EmpreendimentoDetail.tsx"));
export const MegaCyrela = lazyRetry(() => import("../pages/MegaCyrela.tsx"));
export const SeoLanding = lazyRetry(() => import("../pages/SeoLanding.tsx"));
export const Vitrine = lazyRetry(() => import("../pages/Vitrine.tsx"));
export const Sobre = lazyRetry(() => import("../pages/Sobre.tsx"));
export const GuiaBairros = lazyRetry(() => import("../pages/GuiaBairros.tsx"));

// Catch-all
export const SeoOrNotFound = lazyRetry(() => import("../components/SeoOrNotFound.tsx"));

// Corretor layout
export const CorretorRefLayout = lazyRetry(() => import("../components/CorretorRef.tsx").then((m) => ({ default: m.CorretorRefLayout })));

// Admin pages
export const AdminLayout = lazyRetry(() => import("../pages/admin/AdminLayout.tsx"));
export const AdminDashboard = lazyRetry(() => import("../pages/admin/AdminDashboard.tsx"));
export const AdminImoveis = lazyRetry(() => import("../pages/admin/AdminImoveis.tsx"));
export const AdminLeads = lazyRetry(() => import("../pages/admin/AdminLeads.tsx"));
export const AdminCaptacoes = lazyRetry(() => import("../pages/admin/AdminCaptacoes.tsx"));
export const AdminSync = lazyRetry(() => import("../pages/admin/AdminSync.tsx"));
export const AdminConfig = lazyRetry(() => import("../pages/admin/AdminConfig.tsx"));
export const AdminIntegracao = lazyRetry(() => import("../pages/admin/AdminIntegracao.tsx"));
export const IntegracaoDiagnostico = lazyRetry(() => import("../pages/admin/IntegracaoDiagnostico.tsx"));
export const AdminLinks = lazyRetry(() => import("../pages/admin/AdminLinks.tsx"));
export const AdminCorretores = lazyRetry(() => import("../pages/admin/AdminCorretores.tsx"));
export const AdminEmpreendimentos = lazyRetry(() => import("../pages/admin/AdminEmpreendimentos.tsx"));
