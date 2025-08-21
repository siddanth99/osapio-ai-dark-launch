-- Fix the function search path security issue by dropping trigger first
DROP TRIGGER IF EXISTS update_document_analysis_updated_at ON public.document_analysis;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_document_analysis_updated_at
BEFORE UPDATE ON public.document_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();