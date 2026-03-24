import { useEffect, lazy, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { setJsonLd, removeJsonLd, buildOrganizationJsonLd } from "@/lib/jsonld";
import { useCanonical } from "@/hooks/useCanonical";

// Lazy load below-fold sections
const FeaturedNeighborhoods = lazy(() => import("@/components/FeaturedNeighborhoods").then(m => ({ default: m.FeaturedNeighborhoods })));
const FeaturedProperties = lazy(() => import("@/components/FeaturedProperties").then(m => ({ default: m.FeaturedProperties })));
const EmpreendimentosDestaque = lazy(() => import("@/components/EmpreendimentosDestaque").then(m => ({ default: m.EmpreendimentosDestaque })));
const PorQueUhome = lazy(() => import("@/components/PorQueUhome").then(m => ({ default: m.PorQueUhome })));

const Index = () => {
  useCanonical("/");

  useEffect(() => {
    setJsonLd("jsonld-org", buildOrganizationJsonLd());
    return () => removeJsonLd("jsonld-org");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <Suspense fallback={null}>
        <EmpreendimentosDestaque />
        <FeaturedNeighborhoods />
        <FeaturedProperties />
        <PorQueUhome />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Index;
