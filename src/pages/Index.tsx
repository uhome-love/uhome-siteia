import { useEffect, lazy, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";


const Footer = lazy(() => import("../components/Footer.tsx").then(m => ({ default: m.Footer })));
import { setJsonLd, removeJsonLd, buildOrganizationJsonLd, buildWebSiteJsonLd, buildLocalBusinessJsonLd } from "@/lib/jsonld";
import { useCanonical } from "@/hooks/useCanonical";

// Lazy load below-fold sections
const FeaturedNeighborhoods = lazy(() => import("../components/FeaturedNeighborhoods.tsx"));
const FeaturedProperties = lazy(() => import("../components/FeaturedProperties.tsx").then(m => ({ default: m.FeaturedProperties })));
const EmpreendimentosDestaque = lazy(() => import("../components/EmpreendimentosDestaque.tsx").then(m => ({ default: m.EmpreendimentosDestaque })));
const PorQueUhome = lazy(() => import("../components/PorQueUhome.tsx").then(m => ({ default: m.PorQueUhome })));
const SeoLinksSection = lazy(() => import("../components/SeoLinksSection.tsx").then(m => ({ default: m.SeoLinksSection })));
const HomeFaqSection = lazy(() => import("../components/HomeFaqSection.tsx").then(m => ({ default: m.HomeFaqSection })));

const HOME_FAQS = [
  { q: "Quanto custa um apartamento em Porto Alegre?", a: "O preço varia de R$ 250 mil em bairros como Cidade Baixa até R$ 5 milhões+ em Moinhos de Vento e Três Figueiras. Use nossa busca com filtro de preço para encontrar opções no seu orçamento." },
  { q: "Quais os melhores bairros para morar em Porto Alegre?", a: "Moinhos de Vento (alto padrão), Petrópolis (famílias), Bela Vista (modernidade), Três Figueiras (exclusividade), Menino Deus (vista Guaíba) e Tristeza (zona sul). Compare na nossa página de bairros." },
  { q: "Como funciona a busca por IA da Uhome?", a: "Descreva em linguagem natural o que procura — por exemplo, 'apartamento 3 quartos perto do Parcão até 900 mil' — e a IA encontra os resultados mais relevantes automaticamente." },
  { q: "Como financiar um imóvel em Porto Alegre?", a: "O financiamento cobre até 80% do valor com prazos de até 35 anos. Taxas entre 8% e 12% ao ano. Entrada mínima de 20%. Use nosso simulador de financiamento para calcular." },
];

const Index = () => {
  useCanonical("/");

  useEffect(() => {
    setJsonLd("jsonld-org", buildOrganizationJsonLd());
    setJsonLd("jsonld-website", buildWebSiteJsonLd());
    setJsonLd("jsonld-local", buildLocalBusinessJsonLd());
    setJsonLd("jsonld-home-faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: HOME_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    return () => {
      removeJsonLd("jsonld-org");
      removeJsonLd("jsonld-website");
      removeJsonLd("jsonld-local");
      removeJsonLd("jsonld-home-faq");
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <Suspense fallback={null}>
          <EmpreendimentosDestaque />
          <FeaturedNeighborhoods />
          <FeaturedProperties />
          <PorQueUhome />
          <SeoLinksSection />
          <HomeFaqSection faqs={HOME_FAQS} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
