-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public, allowed_mime_types) 
VALUES ('documents', 'documents', false, ARRAY['application/pdf', 'text/xml', 'application/xml', 'text/plain']);

-- Create table for document processing results
CREATE TABLE public.document_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  analysis_result TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on document_analysis table
ALTER TABLE public.document_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for document_analysis
CREATE POLICY "Users can view their own analyses" 
ON public.document_analysis 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create analyses" 
ON public.document_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own analyses" 
ON public.document_analysis 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Storage policies for documents bucket
CREATE POLICY "Users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_document_analysis_updated_at
BEFORE UPDATE ON public.document_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();