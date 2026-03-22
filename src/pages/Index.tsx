import { useEffect, lazy, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { setJsonLd, removeJsonLd, buildOrganizationJsonLd } from "@/lib/jsonld";
import { useCanonical } from "@/hooks/useCanonical";

// Lazy load below-fold sections
const FeaturedNeighborhoods = lazy(() => import("@/components/FeaturedNeighborhoods").then(m => ({ default: m.FeaturedNeighborhoods })));
const FeaturedProperties = lazy(() => import("@/components/FeaturedProperties").then(m => ({ default: m.FeaturedProperties })));

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
        <FeaturedNeighborhoods />
        <FeaturedProperties />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Index;
