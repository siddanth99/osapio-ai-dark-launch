import React, { useState } from 'react';

interface Logo {
  name: string;
  imageUrl: string;
  fallback: React.ReactNode;
}

const TrustedBy: React.FC = () => {
  // SAP Partner and Enterprise Logos - Using styled text logos (more reliable than external images)
  const logos: Logo[] = [
    {
      name: 'SAP',
      imageUrl: '', // Will use fallback
      fallback: (
        <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30">
          <span className="text-primary font-bold text-2xl">SAP</span>
          <span className="text-foreground/70 text-xs font-medium">Partner</span>
        </div>
      )
    },
    {
      name: 'Accenture',
      imageUrl: '',
      fallback: (
        <div className="px-6 py-3 rounded-lg bg-card/40 border border-border/40 hover:border-primary/60 transition-all">
          <div className="text-foreground font-bold text-xs tracking-[0.25em] uppercase whitespace-nowrap">
            ACCENTURE
          </div>
        </div>
      )
    },
    {
      name: 'Deloitte',
      imageUrl: '',
      fallback: (
        <div className="px-6 py-3 rounded-lg bg-card/40 border border-border/40 hover:border-primary/60 transition-all">
          <div className="text-foreground font-bold text-xs tracking-[0.25em] uppercase whitespace-nowrap">
            DELOITTE
          </div>
        </div>
      )
    },
    {
      name: 'IBM',
      imageUrl: '',
      fallback: (
        <div className="px-6 py-3 rounded-lg bg-card/40 border border-border/40 hover:border-primary/60 transition-all">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-6 bg-foreground/80"></div>
              <div className="w-1.5 h-6 bg-foreground/80"></div>
              <div className="w-1.5 h-6 bg-foreground/80"></div>
            </div>
            <span className="text-foreground font-bold text-lg">IBM</span>
          </div>
        </div>
      )
    },
    {
      name: 'Capgemini',
      imageUrl: '',
      fallback: (
        <div className="px-6 py-3 rounded-lg bg-card/40 border border-border/40 hover:border-primary/60 transition-all">
          <div className="text-foreground font-bold text-[10px] tracking-[0.2em] uppercase whitespace-nowrap">
            CAPGEMINI
          </div>
        </div>
      )
    },
    {
      name: 'PwC',
      imageUrl: '',
      fallback: (
        <div className="px-6 py-3 rounded-lg bg-card/40 border border-border/40 hover:border-primary/60 transition-all">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-foreground/80"></div>
            <span className="text-foreground font-bold text-base">PwC</span>
          </div>
        </div>
      )
    },
    {
      name: 'EY',
      imageUrl: '',
      fallback: (
        <div className="px-6 py-3 rounded-lg bg-card/40 border border-border/40 hover:border-primary/60 transition-all">
          <div className="text-foreground font-bold text-xl">EY</div>
        </div>
      )
    },
    {
      name: 'TCS',
      imageUrl: '',
      fallback: (
        <div className="px-6 py-3 rounded-lg bg-card/40 border border-border/40 hover:border-primary/60 transition-all">
          <div className="text-foreground font-bold text-sm tracking-wide">TCS</div>
        </div>
      )
    }
  ];

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos];

  const LogoItem: React.FC<{ logo: Logo; index: number }> = ({ logo, index }) => {
    // Always use fallback since external images are unreliable
    // If you want to use images, add proper logo URLs and uncomment the image logic
    return (
      <div
        key={`${logo.name}-${index}`}
        className="flex-shrink-0 flex items-center justify-center"
      >
        <div className="text-foreground/70 hover:text-foreground transition-all duration-300 hover:scale-105">
          {logo.fallback}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.8s' }}>
      <p className="text-sm text-muted-foreground mb-8 text-center font-medium">
        Trusted by leading enterprises worldwide
      </p>
      
      {/* Sliding Logo Carousel */}
      <div className="relative overflow-hidden py-6">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling container */}
        <div className="flex animate-scroll gap-12 items-center">
          {duplicatedLogos.map((logo, index) => (
            <LogoItem key={`${logo.name}-${index}`} logo={logo} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;

