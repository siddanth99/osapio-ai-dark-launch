import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { analysisId, fileContent, fileName } = await req.json();
    
    console.log('Processing document:', fileName, 'Analysis ID:', analysisId);

    // Determine document type and create appropriate prompt
    const isIdoc = fileName.toLowerCase().includes('idoc') || fileContent.includes('IDOC');
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    
    let systemPrompt = '';
    if (isIdoc) {
      systemPrompt = `You are an expert SAP consultant analyzing an IDOC (Intermediate Document). 
      Provide a detailed analysis including:
      1. Document type and purpose
      2. Key data fields and their meanings
      3. Business process context
      4. Potential issues or recommendations
      5. Integration points and dependencies
      
      Make your response clear and actionable for SAP professionals.`;
    } else {
      systemPrompt = `You are an expert SAP consultant analyzing a document. 
      Provide a comprehensive analysis including:
      1. Document type and content overview
      2. Key information extracted
      3. SAP-related processes or modules involved
      4. Recommendations and next steps
      5. Potential integration opportunities
      
      Focus on SAP-relevant insights and actionable recommendations.`;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze this ${isIdoc ? 'SAP IDOC' : 'document'}:\n\n${fileContent}` }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Update the analysis record in Supabase
    const { error: updateError } = await supabaseClient
      .from('document_analysis')
      .update({
        analysis_result: analysis,
        status: 'completed'
      })
      .eq('id', analysisId);

    if (updateError) {
      console.error('Error updating analysis:', updateError);
      throw updateError;
    }

    console.log('Analysis completed successfully for:', fileName);

    return new Response(JSON.stringify({ 
      success: true,
      analysis,
      analysisId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-document function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process document',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});