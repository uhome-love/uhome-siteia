import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedNeighborhoods } from "@/components/FeaturedNeighborhoods";
import { FeaturedProperties } from "@/components/FeaturedProperties";

import { Footer } from "@/components/Footer";
import { setJsonLd, removeJsonLd, buildOrganizationJsonLd } from "@/lib/jsonld";
import { useCanonical } from "@/hooks/useCanonical";

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
      <FeaturedNeighborhoods />
      <FeaturedProperties />
      
      <Footer />
    </div>
  );
};

export default Index;
