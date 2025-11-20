import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import OpenAI from "https://esm.sh/openai@4.73.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

const SSBQuestionSchema = z.object({
  category: z.enum([
    'Leadership',
    'Decision Making',
    'Stress Management',
    'Team Dynamics',
    'Self Awareness',
    'Planning & Organization'
  ]),
  question: z.string(),
  psychological_basis: z.string(),
  what_to_listen_for: z.string(),
  follow_up_if_evasive: z.string()
});

const SSBQuestionsResponseSchema = z.object({
  questions: z.array(SSBQuestionSchema).min(6).max(8)
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { test_session_id, analysis_id, force_regenerate, user_id } = await req.json();

    if (!test_session_id || !analysis_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'test_session_id, analysis_id, and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check Pro status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('membership_type, membership_expires_at')
      .eq('clerk_id', user_id)
      .single();

    if (userError || !userData) {
      console.error('User fetch error:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isPro = userData.membership_type === 'pro' && 
                  new Date(userData.membership_expires_at) > new Date();

    if (!isPro) {
      console.log('User is not Pro or subscription expired');
      return new Response(
        JSON.stringify({ error: 'Pro membership required to access SSB questions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if questions already exist (cache)
    if (!force_regenerate) {
      const { data: existingAnalysis, error: cacheError } = await supabase
        .from('analysis_results')
        .select('ssb_questions, ssb_questions_generated_at')
        .eq('id', analysis_id)
        .single();

      if (!cacheError && existingAnalysis?.ssb_questions) {
        console.log('Returning cached SSB questions');
        return new Response(
          JSON.stringify({ questions: existingAnalysis.ssb_questions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch story and TAT test details
    const { data: testSession, error: sessionError } = await supabase
      .from('test_sessions')
      .select('story_content, tattest:tattest_id(title, prompt_text)')
      .eq('id', test_session_id)
      .single();

    if (sessionError || !testSession) {
      console.error('Test session fetch error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Test session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch analysis data
    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis_results')
      .select('analysis_data, murray_needs, murray_presses, military_assessment, selection_recommendation')
      .eq('id', analysis_id)
      .single();

    if (analysisError || !analysisData) {
      console.error('Analysis fetch error:', analysisError);
      return new Response(
        JSON.stringify({ error: 'Analysis not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating SSB questions via OpenAI...');

    const systemPrompt = `You are an expert SSB (Services Selection Board) psychologist specializing in TAT analysis for Indian Armed Forces selection.

CRITICAL RULES:
1. NEVER directly reference the TAT story the candidate wrote
2. Questions must be indirect, general situational questions
3. The interviewer doesn't know what story was written - they're testing patterns
4. Questions should probe the psychological patterns revealed in the analysis
5. Test consistency, leadership, decision-making, stress tolerance, team dynamics, self-awareness
6. Follow SSB psychology officer questioning style - conversational but penetrating

Based on the candidate's psychological profile from TAT analysis, generate 6-8 SSB interview questions that:
- Are general situational questions (NOT "In your story, you mentioned...")
- Probe deeper into revealed personality traits without referencing the story
- Test consistency of responses and explore contradictions
- Assess leadership qualities, stress responses, decision-making ability
- Are contextual to the psychological patterns identified
- Sound natural, like a real SSB interview

Each question MUST include:
- category: The quality being assessed
- question: The actual question to ask (general, not story-specific)
- psychological_basis: Why you're asking this based on their psychological profile
- what_to_listen_for: What reveals strength/weakness in their answer
- follow_up_if_evasive: A probing follow-up if they give a vague answer`;

    const dominantNeeds = analysisData.murray_needs?.slice(0, 3).map((n: any) => n.name).join(', ') || 'Not available';
    const dominantPresses = analysisData.murray_presses?.slice(0, 3).map((p: any) => p.name).join(', ') || 'Not available';
    const leadershipPotential = analysisData.military_assessment?.leadership_potential || 'Not available';
    const stressTolerance = analysisData.military_assessment?.stress_tolerance || 'Not available';
    const keyStrengths = analysisData.selection_recommendation?.key_strengths?.join(', ') || 'Not available';
    const areasForDevelopment = analysisData.selection_recommendation?.areas_for_development?.join(', ') || 'Not available';

    const userPrompt = `Candidate's Psychological Profile (from TAT analysis):

TAT Card Context: ${(testSession as any).tattest?.title || 'Unknown'}

Psychological Analysis Summary:
- Dominant Needs: ${dominantNeeds}
- Environmental Presses: ${dominantPresses}
- Leadership Potential: ${leadershipPotential}%
- Stress Tolerance: ${stressTolerance}%
- Key Strengths: ${keyStrengths}
- Areas for Development: ${areasForDevelopment}

Generate 6-8 SSB interview questions that probe these psychological patterns WITHOUT referencing their TAT story.`;

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      tools: [{
        type: "function",
        function: {
          name: "generate_ssb_questions",
          description: "Generate SSB interview questions based on TAT psychological analysis",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                minItems: 6,
                maxItems: 8,
                items: {
                  type: "object",
                  properties: {
                    category: {
                      type: "string",
                      enum: [
                        'Leadership',
                        'Decision Making',
                        'Stress Management',
                        'Team Dynamics',
                        'Self Awareness',
                        'Planning & Organization'
                      ]
                    },
                    question: {
                      type: "string",
                      description: "The interview question - must be general, NOT referencing the story"
                    },
                    psychological_basis: {
                      type: "string",
                      description: "Why this question based on their psychological profile"
                    },
                    what_to_listen_for: {
                      type: "string",
                      description: "What to listen for in their answer"
                    },
                    follow_up_if_evasive: {
                      type: "string",
                      description: "Follow-up question if they're vague"
                    }
                  },
                  required: [
                    "category",
                    "question",
                    "psychological_basis",
                    "what_to_listen_for",
                    "follow_up_if_evasive"
                  ]
                }
              }
            },
            required: ["questions"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "generate_ssb_questions" } }
    });

    const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in OpenAI response');
    }

    const questionsData = JSON.parse(toolCall.function.arguments);
    console.log('Raw OpenAI response:', JSON.stringify(questionsData, null, 2));

    // Validate with Zod
    const validatedQuestions = SSBQuestionsResponseSchema.parse(questionsData);

    // Store in database
    const { error: updateError } = await supabase
      .from('analysis_results')
      .update({
        ssb_questions: validatedQuestions.questions,
        ssb_questions_generated_at: new Date().toISOString()
      })
      .eq('id', analysis_id);

    if (updateError) {
      console.error('Failed to store SSB questions:', updateError);
      // Don't fail the request, still return questions
    } else {
      console.log('SSB questions stored successfully');
    }

    return new Response(
      JSON.stringify({ questions: validatedQuestions.questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating SSB questions:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate SSB questions',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
