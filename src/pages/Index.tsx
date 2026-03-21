import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedNeighborhoods } from "@/components/FeaturedNeighborhoods";
import { FeaturedProperties } from "@/components/FeaturedProperties";

import { Footer } from "@/components/Footer";
import { setJsonLd, removeJsonLd, buildOrganizationJsonLd } from "@/lib/jsonld";
import { useCanonical } from "@/hooks/useCanonical";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const done = localStorage.getItem("uhome_onboarding_done");
    if (!done) {
      navigate("/onboarding", { replace: true });
    }
  }, [navigate]);

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
