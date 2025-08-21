import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "./Auth/ProtectedRoute";

interface FileUploadProps {
  onAnalysisComplete?: (analysis: string) => void;
}

const FileUploadContent = ({ onAnalysisComplete }: FileUploadProps) => {
  const { user, getIdToken } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/xml', 'application/xml', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, XML, or text file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setFileName(file.name);
    
    try {
      // Get Firebase ID token for authentication
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error("Authentication failed");
      }

      // Create upload record in backend
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/upload-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          filename: file.name,
          file_size: file.size
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed: ${response.status}`);
      }

      const uploadData = await response.json();
      
      setIsUploading(false);
      setIsAnalyzing(true);

      // Read file content for processing (simulated analysis for now)
      const fileContent = await file.text();
      
      // Simulate AI analysis processing
      setTimeout(() => {
        const mockAnalysis = `
File Analysis Results:
====================

📄 File: ${file.name}
📊 Size: ${(file.size / 1024).toFixed(2)} KB
🔍 Type: ${file.type}
👤 User: ${user.email}
📅 Upload Time: ${new Date().toLocaleString()}

📋 Content Summary:
This appears to be a SAP document containing structured data. 
The analysis shows potential optimization opportunities and 
data quality insights.

✅ Analysis completed successfully!
        `;
        
        setAnalysis(mockAnalysis);
        setIsAnalyzing(false);
        onAnalysisComplete?.(mockAnalysis);
        toast.success("Document analyzed successfully!");
      }, 3000);

    } catch (error) {
      console.error('Error processing file:', error);
      setIsUploading(false);
      setIsAnalyzing(false);
      toast.error(error instanceof Error ? error.message : "Failed to process document");
    }
  };

  const getStatusIcon = () => {
    if (isUploading) return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
    if (isAnalyzing) return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
    if (analysis) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <FileText className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (isUploading) return "Uploading...";
    if (isAnalyzing) return "Analyzing with AI...";
    if (analysis) return "Analysis Complete";
    return "Ready to upload";
  };

  return (
    <Card className="p-6 bg-card/50 border-primary/20">
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Secure Upload</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload SAP documents for AI-powered analysis (authenticated users only)
          </p>
          <div className="mt-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md inline-block">
            ✓ Logged in as {user?.email}
          </div>
        </div>

        <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button 
                  variant="glow" 
                  size="lg" 
                  disabled={isUploading || isAnalyzing}
                  asChild
                >
                  <span>
                    {isUploading ? "Uploading..." : isAnalyzing ? "Analyzing..." : "Choose File"}
                  </span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.xml,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploading || isAnalyzing}
                />
              </label>
            </div>

            <p className="text-xs text-muted-foreground">
              Supports PDF, XML, and TXT files up to 10MB
            </p>
          </div>
        </div>

        {fileName && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div className="text-sm">
                <div className="font-medium">{fileName}</div>
                <div className="text-muted-foreground">{getStatusText()}</div>
              </div>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-3">
            <h4 className="font-semibold text-primary">AI Analysis Results</h4>
            <div className="bg-muted/30 p-4 rounded-lg border border-primary/20">
              <pre className="whitespace-pre-wrap text-sm font-mono">{analysis}</pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export const FileUpload = (props: FileUploadProps) => {
  return (
    <ProtectedRoute>
      <FileUploadContent {...props} />
    </ProtectedRoute>
  );
};