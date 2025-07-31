import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Database, TrendingUp, Shield, Workflow, BarChart3 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Automation",
      description: "Transform manual SAP processes with intelligent automation that learns and adapts to your business needs.",
      gradient: "from-primary to-primary-glow"
    },
    {
      icon: Database,
      title: "Intelligent Data Processing",
      description: "Extract insights from your SAP data with advanced AI algorithms that identify patterns and opportunities.",
      gradient: "from-accent to-accent-glow"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Leverage machine learning to forecast trends, optimize resources, and make data-driven decisions.",
      gradient: "from-primary to-accent"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Built with enterprise-grade security ensuring your SAP data remains protected and compliant.",
      gradient: "from-accent to-primary"
    },
    {
      icon: Workflow,
      title: "Smart Workflows",
      description: "Create intelligent workflows that automatically adapt to changing business conditions and requirements.",
      gradient: "from-primary-glow to-primary"
    },
    {
      icon: BarChart3,
      title: "Real-time Insights",
      description: "Get instant visibility into your SAP environment with AI-powered dashboards and reporting.",
      gradient: "from-accent-glow to-accent"
    }
  ];

  return (
    <section className="py-24 px-6 bg-background relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Supercharge Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              SAP Experience
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Discover how osapio transforms traditional SAP operations into intelligent, 
            AI-driven business processes that deliver measurable results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-500 shadow-card-elevated hover:shadow-primary-glow/20 animate-slide-up"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;