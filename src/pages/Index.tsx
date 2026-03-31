import { useEffect, lazy, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { setJsonLd, removeJsonLd, buildOrganizationJsonLd, buildWebSiteJsonLd, buildLocalBusinessJsonLd } from "@/lib/jsonld";
import { useCanonical } from "@/hooks/useCanonical";

// Lazy load below-fold sections
const FeaturedNeighborhoods = lazy(() => import("@/components/FeaturedNeighborhoods").then(m => ({ default: m.FeaturedNeighborhoods })));
const FeaturedProperties = lazy(() => import("@/components/FeaturedProperties").then(m => ({ default: m.FeaturedProperties })));
const EmpreendimentosDestaque = lazy(() => import("@/components/EmpreendimentosDestaque").then(m => ({ default: m.EmpreendimentosDestaque })));
const PorQueUhome = lazy(() => import("@/components/PorQueUhome").then(m => ({ default: m.PorQueUhome })));
const SeoLinksSection = lazy(() => import("@/components/SeoLinksSection").then(m => ({ default: m.SeoLinksSection })));

const Index = () => {
  useCanonical("/");

  useEffect(() => {
    setJsonLd("jsonld-org", buildOrganizationJsonLd());
    setJsonLd("jsonld-website", buildWebSiteJsonLd());
    setJsonLd("jsonld-local", buildLocalBusinessJsonLd());
    return () => {
      removeJsonLd("jsonld-org");
      removeJsonLd("jsonld-website");
      removeJsonLd("jsonld-local");
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
          <SeoLinksSection />
          <PorQueUhome />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
