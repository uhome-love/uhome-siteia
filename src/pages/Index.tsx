import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedNeighborhoods } from "@/components/FeaturedNeighborhoods";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { AISearchSection } from "@/components/AISearchSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturedNeighborhoods />
      <FeaturedProperties />
      <AISearchSection />
      <Footer />
    </div>
  );
};

export default Index;
