import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  testSessionId: string;
  userId: string;
  storyContent: string;
}

interface WebhookPayload {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: {
    id: string;
    user_id: string;
    story_content: string;
    status: string;
  };
  old_record: {
    status: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Story analysis function called');
    
    const requestBody = await req.json();
    console.log('Request body type:', requestBody.type || 'direct');
    
    let testSessionId: string;
    let userId: string;
    let storyContent: string;
    
    // Check if this is a webhook payload or direct call
    if (requestBody.type === 'UPDATE' && requestBody.table === 'test_sessions') {
      // This is a webhook payload
      const payload = requestBody as WebhookPayload;
      
      // Only process if status changed to 'completed' and story is long enough
      if (payload.record.status === 'completed' && 
          payload.old_record.status !== 'completed' &&
          payload.record.story_content &&
          payload.record.story_content.length >= 250) {
        
        testSessionId = payload.record.id;
        userId = payload.record.user_id;
        storyContent = payload.record.story_content;
        
        console.log(`Webhook: Processing completed session ${testSessionId}, story length: ${storyContent.length}`);
      } else {
        console.log('Webhook: Skipping - not a completed status change or story too short');
        return new Response(
          JSON.stringify({ message: 'Webhook received but no processing needed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // This is a direct call
      const directRequest = requestBody as AnalysisRequest;
      testSessionId = directRequest.testSessionId;
      userId = directRequest.userId;
      storyContent = directRequest.storyContent;
      
      console.log(`Direct call: Analyzing story for session ${testSessionId}, length: ${storyContent.length}`);
    }
    
    if (!testSessionId || !userId || !storyContent) {
      throw new Error('Missing required parameters: testSessionId, userId, or storyContent');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call OpenAI API for story analysis
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const analysisPrompt = `
You are a professional psychologist specializing in Thematic Apperception Test (TAT) analysis. Analyze the following story written in response to a TAT image and provide insights into the person's personality traits, emotional patterns, and psychological themes.

Story to analyze:
"${storyContent}"

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "A 2-3 sentence summary of key personality insights",
  "personality_traits": {
    "openness": {"score": 0-100, "description": "brief explanation"},
    "conscientiousness": {"score": 0-100, "description": "brief explanation"},
    "extraversion": {"score": 0-100, "description": "brief explanation"},
    "agreeableness": {"score": 0-100, "description": "brief explanation"},
    "neuroticism": {"score": 0-100, "description": "brief explanation"}
  },
  "emotional_themes": ["theme1", "theme2", "theme3"],
  "narrative_structure": {
    "creativity": 0-100,
    "detail_orientation": 0-100,
    "emotional_depth": 0-100
  },
  "psychological_insights": [
    "insight 1",
    "insight 2", 
    "insight 3"
  ],
  "dominant_emotions": ["emotion1", "emotion2"],
  "coping_mechanisms": ["mechanism1", "mechanism2"],
  "interpersonal_style": "brief description of how they relate to others",
  "motivation_patterns": "what drives this person"
}

Provide scores and insights based on psychological principles and TAT interpretation guidelines. Be professional and constructive in your analysis.`;

    console.log('Calling OpenAI API for analysis');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional psychologist specializing in TAT analysis. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;
    
    console.log('Received analysis from OpenAI');
    
    let analysisData;
    try {
      analysisData = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback analysis if JSON parsing fails
      analysisData = {
        summary: "Analysis completed but format error occurred. The story shows creative expression and personal reflection.",
        error: "JSON parsing failed",
        raw_response: analysisText
      };
    }

    // Calculate confidence score based on story length and content quality
    const confidenceScore = Math.min(95, Math.max(60, 
      (storyContent.length / 500) * 40 + 
      (storyContent.split(' ').length / 50) * 30 + 25
    ));

    console.log(`Calculated confidence score: ${confidenceScore}`);

    // Insert analysis results into database
    const { error: insertError } = await supabase
      .from('analysis_results')
      .insert({
        test_session_id: testSessionId,
        user_id: userId,
        analysis_data: analysisData,
        confidence_score: Math.round(confidenceScore * 100) / 100
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to save analysis: ${insertError.message}`);
    }

    console.log(`Analysis saved successfully for session ${testSessionId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analysis completed and saved',
        confidence_score: Math.round(confidenceScore * 100) / 100
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in analyze-story function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});