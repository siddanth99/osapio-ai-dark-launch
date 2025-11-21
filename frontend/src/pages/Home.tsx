import { Navigation } from "@/components/Navigation";
import { FileUpload } from "@/components/FileUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Zap, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Brain
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Brain className="w-10 h-10 text-primary" />
                <Sparkles className="w-5 h-5 text-accent absolute -top-1 -right-1" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Welcome to osapio
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your SAP documents with AI-powered analysis. Upload Excel, XML, PDF, or IDOC files 
              to get intelligent insights and integration recommendations.
            </p>
            {user && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Signed in as {user.email}</span>
              </div>
            )}
          </div>
        </section>

        {/* Upload Section - Main Focus */}
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <Card className="border-primary/20 shadow-lg bg-gradient-card">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Upload className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">Upload Your SAP Document</CardTitle>
              </div>
              <CardDescription className="text-base">
                Analyze Excel exports, IDOCs, XML files, or PDFs with AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload />
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate('/my-uploads')}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">My Uploads</CardTitle>
                </div>
                <CardDescription>
                  View and manage all your uploaded documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:text-primary transition-colors">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-accent/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <BarChart3 className="w-5 h-5 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Analytics</CardTitle>
                </div>
                <CardDescription>
                  Track your document analysis history and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate('/profile')}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Profile</CardTitle>
                </div>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:text-primary transition-colors">
                  Manage <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Why Choose osapio?</h2>
            <p className="text-muted-foreground">
              Powerful AI-driven analysis for your SAP integration needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant AI-powered analysis of your SAP documents
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-accent/10 mb-4">
                    <Brain className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI understands SAP structures and provides intelligent insights
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade security with Firebase authentication
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-accent/10 mb-4">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Multi-Format</h3>
                  <p className="text-sm text-muted-foreground">
                    Supports Excel, XML, PDF, IDOC, and text files
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

