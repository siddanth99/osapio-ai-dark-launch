import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileUploadProps {
  onAnalysisComplete?: (analysis: string) => void;
}

export const FileUpload = ({ onAnalysisComplete }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Create analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from('document_analysis')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          status: 'processing'
        })
        .select()
        .single();

      if (analysisError) {
        throw analysisError;
      }

      setIsUploading(false);
      setIsAnalyzing(true);

      // Read file content for processing
      const fileContent = await file.text();

      // Call edge function to process document
      const { data: processResult, error: processError } = await supabase.functions
        .invoke('process-document', {
          body: {
            analysisId: analysisData.id,
            fileContent: fileContent.substring(0, 50000), // Limit content size
            fileName: file.name
          }
        });

      if (processError) {
        throw processError;
      }

      if (processResult.success) {
        setAnalysis(processResult.analysis);
        setIsAnalyzing(false);
        onAnalysisComplete?.(processResult.analysis);
        toast.success("Document analyzed successfully!");
      } else {
        throw new Error(processResult.error || 'Analysis failed');
      }

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
          <h3 className="text-lg font-semibold mb-2">Upload SAP Document</h3>
          <p className="text-sm text-muted-foreground">
            Upload an SAP IDOC, PDF, or XML file for AI-powered analysis
          </p>
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
              <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};