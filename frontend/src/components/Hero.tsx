import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-12 h-12 text-primary" />
              <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              osapio
            </h1>
          </div>
        </div>

        {/* Hero headline */}
        <h2 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Make SAP{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Intelligent
          </span>
        </h2>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
          Empower your SAP ecosystem with cutting-edge AI capabilities. 
          Transform complex business processes into intelligent, automated workflows 
          that drive efficiency and innovation.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <Button 
            variant="hero" 
            size="lg" 
            className="group"
            onClick={() => navigate('/login')}
          >
            Start Your AI Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="hero-outline" 
            size="lg"
            onClick={() => navigate('/login')}
          >
            Watch Demo
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all duration-300">
            <Zap className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground text-center">
              AI-powered automation that works in real-time with your existing SAP infrastructure
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all duration-300">
            <Brain className="w-8 h-8 text-accent" />
            <h3 className="text-lg font-semibold">Smart Integration</h3>
            <p className="text-sm text-muted-foreground text-center">
              Seamlessly integrates with SAP modules to enhance decision-making capabilities
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all duration-300">
            <Sparkles className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-semibold">Enterprise Ready</h3>
            <p className="text-sm text-muted-foreground text-center">
              Built for scale with enterprise-grade security and compliance standards
            </p>
          </div>
        </div>

        {/* CTA to Login/Sign Up */}
        <div className="mt-20 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="max-w-2xl mx-auto">
            <Button 
              variant="hero" 
              size="lg" 
              className="group"
              onClick={() => navigate('/login')}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;