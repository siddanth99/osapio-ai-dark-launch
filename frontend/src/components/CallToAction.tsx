import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TrustedBy from "./TrustedBy";

const CallToAction = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-6 animate-fade-in">
          <Sparkles className="w-8 h-8 text-primary animate-pulse mr-3" />
          <span className="text-lg font-semibold text-primary">Ready to Transform?</span>
          <Sparkles className="w-8 h-8 text-accent animate-pulse ml-3" />
        </div>

        <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Make SAP Work{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Smarter
          </span>
        </h2>

        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
          Join thousands of enterprises who have already transformed their SAP environment 
          with osapio's AI-powered intelligence. Start your journey today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <Button 
            variant="glow" 
            size="lg" 
            className="group text-lg px-8 py-4"
            onClick={() => navigate('/login')}
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="hero-outline" 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => navigate('/login')}
          >
            Schedule Demo
          </Button>
        </div>

        <TrustedBy />
      </div>
    </section>
  );
};

export default CallToAction;