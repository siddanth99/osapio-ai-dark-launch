import { Navigation } from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CallToAction from "@/components/CallToAction";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20"> {/* Add padding to account for fixed navigation */}
        <Hero />
        <Features />
        <CallToAction />
      </div>
    </div>
  );
};

export default Index;
