import { lazyRetry } from "@/lib/lazyRetry";

// Eager load homepage
export { default as Index } from "@/pages/Index";

// Public pages
export const Search = lazyRetry(() => import("@/pages/Search"));
export const PropertyDetail = lazyRetry(() => import("@/pages/PropertyDetail"));
export const Anunciar = lazyRetry(() => import("@/pages/Anunciar"));
export const Carreiras = lazyRetry(() => import("@/pages/Carreiras"));
export const Bairro = lazyRetry(() => import("@/pages/Bairro"));
export const Bairros = lazyRetry(() => import("@/pages/Bairros"));
export const FAQ = lazyRetry(() => import("@/pages/FAQ"));
export const Onboarding = lazyRetry(() => import("@/pages/Onboarding"));
export const Blog = lazyRetry(() => import("@/pages/Blog"));
export const BlogPostPage = lazyRetry(() => import("@/pages/BlogPost"));
export const Favoritos = lazyRetry(() => import("@/pages/Favoritos"));
export const TipoImovel = lazyRetry(() => import("@/pages/TipoImovel"));
export const Condominios = lazyRetry(() => import("@/pages/Condominios"));
export const CondominioDetail = lazyRetry(() => import("@/pages/CondominioDetail"));
export const AvaliacaoPage = lazyRetry(() => import("@/pages/AvaliacaoPage"));
export const Privacidade = lazyRetry(() => import("@/pages/Privacidade"));
export const ResetPassword = lazyRetry(() => import("@/pages/ResetPassword"));
export const EmpreendimentoDetail = lazyRetry(() => import("@/pages/EmpreendimentoDetail"));
export const MegaCyrela = lazyRetry(() => import("@/pages/MegaCyrela"));
export const SeoLanding = lazyRetry(() => import("@/pages/SeoLanding"));
export const Vitrine = lazyRetry(() => import("@/pages/Vitrine"));
export const Sobre = lazyRetry(() => import("@/pages/Sobre"));
export const GuiaBairros = lazyRetry(() => import("@/pages/GuiaBairros"));
export const Collection = lazyRetry(() => import("@/pages/Collection"));
export const PortoAlegrePilar = lazyRetry(() => import("@/pages/PortoAlegrePilar"));

// Catch-all
export const SeoOrNotFound = lazyRetry(() => import("@/components/SeoOrNotFound"));

// Corretor layout
export const CorretorRefLayout = lazyRetry(() => import("@/components/CorretorRef").then(m => ({ default: m.CorretorRefLayout })));

// Admin pages
export const AdminLayout = lazyRetry(() => import("@/pages/admin/AdminLayout"));
export const AdminDashboard = lazyRetry(() => import("@/pages/admin/AdminDashboard"));
export const AdminImoveis = lazyRetry(() => import("@/pages/admin/AdminImoveis"));
export const AdminLeads = lazyRetry(() => import("@/pages/admin/AdminLeads"));
export const AdminCaptacoes = lazyRetry(() => import("@/pages/admin/AdminCaptacoes"));
export const AdminSync = lazyRetry(() => import("@/pages/admin/AdminSync"));
export const AdminConfig = lazyRetry(() => import("@/pages/admin/AdminConfig"));
export const AdminIntegracao = lazyRetry(() => import("@/pages/admin/AdminIntegracao"));
export const IntegracaoDiagnostico = lazyRetry(() => import("@/pages/admin/IntegracaoDiagnostico"));
export const AdminLinks = lazyRetry(() => import("@/pages/admin/AdminLinks"));
export const AdminCorretores = lazyRetry(() => import("@/pages/admin/AdminCorretores"));
export const AdminEmpreendimentos = lazyRetry(() => import("@/pages/admin/AdminEmpreendimentos"));
