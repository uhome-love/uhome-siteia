import { Navigate, Route, Routes } from "react-router-dom";
import {
  AdminCaptacoes,
  AdminConfig,
  AdminCorretores,
  AdminDashboard,
  AdminEmpreendimentos,
  AdminImoveis,
  AdminIntegracao,
  AdminLayout,
  AdminLeads,
  AdminLinks,
  AdminSync,
  Anunciar,
  AvaliacaoPage,
  Collection,
  Bairro,
  Bairros,
  Blog,
  BlogPostPage,
  Carreiras,
  CondominioDetail,
  Condominios,
  CorretorRefLayout,
  EmpreendimentoDetail,
  FAQ,
  Favoritos,
  GuiaBairros,
  Index,
  IntegracaoDiagnostico,
  MegaCyrela,
  Onboarding,
  Privacidade,
  PropertyDetail,
  ResetPassword,
  Search,
  SeoOrNotFound,
  Sobre,
  TipoImovel,
  Vitrine,
} from "@/routes/lazyPages";

export function AppRoutes() {
  return (
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
      <Route path="/casas-porto-alegre" element={<TipoImovel />} />
      <Route path="/coberturas-porto-alegre" element={<TipoImovel />} />
      <Route path="/studios-porto-alegre" element={<TipoImovel />} />
      <Route path="/comerciais-porto-alegre" element={<TipoImovel />} />

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
        <Route path="avaliar-imovel" element={<AvaliacaoPage />} />
        <Route path="vitrine/:id" element={<Vitrine />} />
      </Route>

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
  );
}
