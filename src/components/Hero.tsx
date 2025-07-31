import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-12 h-12 text-primary animate-pulse-glow" />
              <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1 animate-pulse" />
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
          <Button variant="hero" size="lg" className="group">
            Start Your AI Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="hero-outline" size="lg">
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
      </div>
    </section>
  );
};

export default Hero;