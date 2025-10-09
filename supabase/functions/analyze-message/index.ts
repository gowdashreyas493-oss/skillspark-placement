import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageId, content } = await req.json();

    if (!messageId || !content) {
      throw new Error('Message ID and content are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Analyzing message:', messageId);

    // Call Lovable AI to analyze the message
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an AI content moderation system. Analyze the following message and return a JSON object with these fields:
- sentiment_score: -1 to 1 (negative to positive)
- credibility_score: 0 to 1 (low to high credibility)
- toxicity_score: 0 to 1 (not toxic to very toxic)
- fake_news_probability: 0 to 1 (unlikely to very likely fake news)
- threat_level: "none", "low", "medium", or "high"
- is_flagged: boolean (true if content should be flagged)
- flag_reason: string (reason for flagging, or empty if not flagged)

Respond ONLY with valid JSON, no other text.`
          },
          {
            role: 'user',
            content: content
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('AI Analysis result:', analysisText);

    // Parse the AI response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Provide default safe values if parsing fails
      analysis = {
        sentiment_score: 0,
        credibility_score: 0.5,
        toxicity_score: 0,
        fake_news_probability: 0,
        threat_level: 'none',
        is_flagged: false,
        flag_reason: ''
      };
    }

    // Store analysis in database
    const { error: insertError } = await supabase
      .from('ai_message_analysis')
      .upsert({
        message_id: messageId,
        sentiment_score: analysis.sentiment_score,
        credibility_score: analysis.credibility_score,
        toxicity_score: analysis.toxicity_score,
        fake_news_probability: analysis.fake_news_probability,
        threat_level: analysis.threat_level,
        is_flagged: analysis.is_flagged,
        flag_reason: analysis.flag_reason,
        analyzed_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Database error:', insertError);
      throw insertError;
    }

    console.log('Analysis stored successfully');

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-message function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});