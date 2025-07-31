import { CoupleHero } from "@/components/CoupleHero";
import { FeaturesSection } from "@/components/FeaturesSection";
import { AuthSection } from "@/components/AuthSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <CoupleHero />
      <FeaturesSection />
      <AuthSection />
    </div>
  );
};

export default Index;
