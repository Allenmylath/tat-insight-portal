import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import OpenAI from "https://esm.sh/openai@4.73.1";
import { z } from "https://esm.sh/zod@3.24.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive Zod schemas matching the analysis components
const MurrayNeedSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  description: z.string(),
  intensity: z.enum(['Low', 'Moderate', 'High', 'Very High'])
});

const MurrayPressSchema = z.object({
  name: z.string(),
  influence: z.number().min(0).max(100),
  description: z.string(),
  category: z.enum(['Social', 'Environmental', 'Personal', 'Professional'])
});

const InnerStateSchema = z.object({
  state: z.string(),
  intensity: z.number().min(0).max(100),
  description: z.string(),
  valence: z.enum(['Positive', 'Negative', 'Neutral'])
});

const MilitaryAssessmentScoreSchema = z.object({
  category: z.string(),
  score: z.number().min(0).max(100),
  assessment: z.enum(['Excellent', 'Good', 'Satisfactory', 'Needs Improvement']),
  recommendation: z.string()
});

const MilitaryAssessmentSchema = z.object({
  overall_rating: z.number().min(0).max(100),
  suitability: z.enum(['Highly Suitable', 'Suitable', 'Moderately Suitable', 'Not Suitable']),
  scores: z.array(MilitaryAssessmentScoreSchema),
  leadership_potential: z.number().min(0).max(100),
  stress_tolerance: z.number().min(0).max(100),
  team_compatibility: z.number().min(0).max(100),
  adaptability: z.number().min(0).max(100),
  decision_making: z.number().min(0).max(100),
  effective_intelligence: z.number().min(0).max(100),
  planning_organizing: z.number().min(0).max(100),
  social_adaptability: z.number().min(0).max(100),
  cooperation: z.number().min(0).max(100),
  sense_of_responsibility: z.number().min(0).max(100),
  courage_determination: z.number().min(0).max(100),
  notes: z.string()
});

const RoleSuitabilitySchema = z.object({
  role: z.string(),
  suitability_score: z.number().min(0).max(100),
  rationale: z.string()
});

const SelectionRecommendationSchema = z.object({
  overall_recommendation: z.enum(['Strongly Recommend', 'Recommend', 'Consider', 'Not Recommended']),
  confidence_level: z.number().min(0).max(100),
  key_strengths: z.array(z.string()),
  areas_for_development: z.array(z.string()),
  role_suitability: z.array(RoleSuitabilitySchema),
  next_steps: z.array(z.string()),
  follow_up_assessments: z.array(z.string())
});

const PersonalityTraitSchema = z.object({
  score: z.number().min(0).max(100),
  description: z.string()
});

const EnhancedAnalysisSchema = z.object({
  summary: z.string(),
  personality_traits: z.object({
    openness: PersonalityTraitSchema,
    conscientiousness: PersonalityTraitSchema,
    extraversion: PersonalityTraitSchema,
    agreeableness: PersonalityTraitSchema,
    neuroticism: PersonalityTraitSchema
  }),
  emotional_themes: z.array(z.string()),
  coping_mechanisms: z.array(z.string()),
  dominant_emotions: z.array(z.string()),
  psychological_insights: z.array(z.string()),
  interpersonal_style: z.string(),
  motivation_patterns: z.string(),
  murray_needs: z.array(MurrayNeedSchema),
  murray_presses: z.array(MurrayPressSchema),
  inner_states: z.array(InnerStateSchema),
  military_assessment: MilitaryAssessmentSchema,
  selection_recommendation: SelectionRecommendationSchema,
  analysis_type: z.string().default('murray_tat'),
  confidence_score: z.number().min(0).max(100)
});

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

    // Initialize OpenAI client
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey: openAIApiKey,
    });

    // Fetch the TAT test image URL
    let imageUrl: string | null = null;
    try {
      const { data: testSession, error: testSessionError } = await supabase
        .from('test_sessions')
        .select('tattest_id, tattest(image_url)')
        .eq('id', testSessionId)
        .single();

      if (testSessionError || !testSession?.tattest?.image_url) {
        console.warn('Could not retrieve TAT image URL, proceeding with text-only analysis');
      } else {
        imageUrl = testSession.tattest.image_url;
        console.log('TAT test image URL retrieved:', imageUrl);
      }
    } catch (error) {
      console.warn('Error fetching image URL:', error);
    }

    // Download image and convert to base64 to avoid OpenAI timeout issues
    let imageBase64: string | null = null;
    if (imageUrl) {
      try {
        // Extract filename from the storage URL
        const urlParts = imageUrl.split('/tat-images/');
        if (urlParts.length > 1) {
          const fileName = urlParts[1];
          
          console.log('Downloading image from storage:', fileName);
          
          // Download image from storage
          const { data: imageData, error: downloadError } = await supabase
            .storage
            .from('tat-images')
            .download(fileName);
          
          if (downloadError) {
            console.error('Error downloading image:', downloadError);
            imageUrl = null; // Fall back to text-only analysis
          } else {
            // Convert to base64
            const arrayBuffer = await imageData.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            
            // Determine MIME type from blob
            const mimeType = imageData.type || 'image/png';
            imageBase64 = `data:${mimeType};base64,${base64}`;
            
            console.log(`Image converted to base64, MIME: ${mimeType}, size: ${base64.length} chars`);
          }
        }
      } catch (error) {
        console.error('Error processing image for base64:', error);
        imageUrl = null; // Fall back to text-only
        imageBase64 = null;
      }
    }

    console.log('Calling OpenAI API for comprehensive TAT analysis');
    
    // Comprehensive TAT analysis prompt
    const analysisPrompt = `You are a professional psychologist specializing in Thematic Apperception Test (TAT) analysis and Murray's personality theory.

${imageBase64 ? 
  `You are analyzing a TAT response where the subject was shown an image and asked to write a story about it. Both the TAT image and the subject's story are provided.

IMPORTANT: Analyze both:
1. What the TAT image actually depicts (visual elements, mood, context)
2. How the subject interpreted and responded to the image in their story
3. The psychological significance of any differences between the image and the story

Consider:
- What elements from the image did the subject emphasize or ignore?
- What did the subject add that isn't in the image? (projections)
- How does the subject's interpretation reveal their psychological state, needs, fears, or motivations?
- Does the story align with or diverge from the typical interpretation of this image?`
  : 
  'Note: The TAT image could not be retrieved. Analyzing story content only.'
}

Story written by the subject:
"${storyContent}"

Provide a complete Murray TAT analysis including:

1. **Murray Needs Assessment**: Analyze key psychological needs like Achievement, Affiliation, Aggression, Autonomy, Deference, Dominance, Exhibition, Harm Avoidance, Nurturance, Order, Play, Rejection, Sentience, Succorance, Understanding, etc. Rate each relevant need 0-100 and classify intensity.

2. **Murray Environmental Presses**: Identify environmental pressures and influences affecting the individual. Categorize as Social, Environmental, Personal, or Professional pressures.

3. **Inner Psychological States**: Assess current emotional and psychological states with valence (positive/negative/neutral) and intensity ratings.

4. **Military/Leadership Assessment**: Evaluate the following specific qualities on a 0-100 scale:
   - **Effective Intelligence**: Cognitive ability, problem-solving, analytical thinking, learning aptitude
   - **Planning & Organizing Ability**: Strategic thinking, resource management, task prioritization, systematic approach
   - **Social Adaptability**: Ability to adjust to diverse social contexts, cultural sensitivity, interpersonal flexibility
   - **Cooperation**: Teamwork, collaboration, willingness to work with others, team player attitude
   - **Sense of Responsibility**: Accountability, reliability, ownership of tasks, dependability
   - **Courage & Determination**: Resilience, perseverance, willingness to face challenges, mental toughness
   
   Also evaluate: leadership_potential, stress_tolerance, team_compatibility, adaptability, decision_making
   
   **CRITICAL**: ALL metrics MUST use a 0-100 scale:
   - 0-40: Needs Improvement/Low
   - 41-60: Satisfactory
   - 61-80: Good
   - 81-100: Excellent

5. **Selection Recommendations**: Provide structured recommendations with role suitability scores and development areas.

6. **Personality Analysis**: Assess Big Five personality traits with detailed psychological insights.

${imageBase64 ? 
  `7. **Image-Story Analysis**: Provide specific insights about:
   - How the subject's interpretation differs from the actual image content
   - What psychological projections are evident in their response
   - What the subject's unique perspective reveals about their inner world
   - Any significant omissions or additions in their narrative`
  : ''
}

Be thorough, professional, and provide actionable insights based on established psychological principles.`;

    try {
      // Use OpenAI structured output with Zod validation
      const response = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content: "You are a professional psychologist specializing in TAT analysis and Murray's personality theory. Provide comprehensive, structured psychological analysis."
          },
          {
            role: "user",
            content: imageBase64 ? [
              {
                type: "text",
                text: analysisPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                  detail: "high"
                }
              }
            ] : analysisPrompt
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "comprehensive_tat_analysis",
            schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                personality_traits: {
                  type: "object",
                  properties: {
                    openness: {
                      type: "object",
                      properties: {
                        score: { type: "number", minimum: 0, maximum: 100 },
                        description: { type: "string" }
                      },
                      required: ["score", "description"]
                    },
                    conscientiousness: {
                      type: "object",
                      properties: {
                        score: { type: "number", minimum: 0, maximum: 100 },
                        description: { type: "string" }
                      },
                      required: ["score", "description"]
                    },
                    extraversion: {
                      type: "object",
                      properties: {
                        score: { type: "number", minimum: 0, maximum: 100 },
                        description: { type: "string" }
                      },
                      required: ["score", "description"]
                    },
                    agreeableness: {
                      type: "object",
                      properties: {
                        score: { type: "number", minimum: 0, maximum: 100 },
                        description: { type: "string" }
                      },
                      required: ["score", "description"]
                    },
                    neuroticism: {
                      type: "object",
                      properties: {
                        score: { type: "number", minimum: 0, maximum: 100 },
                        description: { type: "string" }
                      },
                      required: ["score", "description"]
                    }
                  },
                  required: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]
                },
                emotional_themes: {
                  type: "array",
                  items: { type: "string" }
                },
                coping_mechanisms: {
                  type: "array",
                  items: { type: "string" }
                },
                dominant_emotions: {
                  type: "array",
                  items: { type: "string" }
                },
                psychological_insights: {
                  type: "array",
                  items: { type: "string" }
                },
                interpersonal_style: { type: "string" },
                motivation_patterns: { type: "string" },
                murray_needs: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      score: { type: "number", minimum: 0, maximum: 100 },
                      description: { type: "string" },
                      intensity: { type: "string", enum: ["Low", "Moderate", "High", "Very High"] }
                    },
                    required: ["name", "score", "description", "intensity"]
                  }
                },
                murray_presses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      influence: { type: "number", minimum: 0, maximum: 100 },
                      description: { type: "string" },
                      category: { type: "string", enum: ["Social", "Environmental", "Personal", "Professional"] }
                    },
                    required: ["name", "influence", "description", "category"]
                  }
                },
                inner_states: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      state: { type: "string" },
                      intensity: { type: "number", minimum: 0, maximum: 100 },
                      description: { type: "string" },
                      valence: { type: "string", enum: ["Positive", "Negative", "Neutral"] }
                    },
                    required: ["state", "intensity", "description", "valence"]
                  }
                },
                military_assessment: {
                  type: "object",
                  properties: {
                    overall_rating: { type: "number", minimum: 0, maximum: 100 },
                    suitability: { type: "string", enum: ["Highly Suitable", "Suitable", "Moderately Suitable", "Not Suitable"] },
                    scores: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          category: { type: "string" },
                          score: { type: "number", minimum: 0, maximum: 100 },
                          assessment: { type: "string", enum: ["Excellent", "Good", "Satisfactory", "Needs Improvement"] },
                          recommendation: { type: "string" }
                        },
                        required: ["category", "score", "assessment", "recommendation"]
                      }
                    },
                    leadership_potential: { type: "number", minimum: 0, maximum: 100 },
                    stress_tolerance: { type: "number", minimum: 0, maximum: 100 },
                    team_compatibility: { type: "number", minimum: 0, maximum: 100 },
                    adaptability: { type: "number", minimum: 0, maximum: 100 },
                    decision_making: { type: "number", minimum: 0, maximum: 100 },
                    effective_intelligence: { type: "number", minimum: 0, maximum: 100 },
                    planning_organizing: { type: "number", minimum: 0, maximum: 100 },
                    social_adaptability: { type: "number", minimum: 0, maximum: 100 },
                    cooperation: { type: "number", minimum: 0, maximum: 100 },
                    sense_of_responsibility: { type: "number", minimum: 0, maximum: 100 },
                    courage_determination: { type: "number", minimum: 0, maximum: 100 },
                    notes: { type: "string" }
                  },
                  required: ["overall_rating", "suitability", "scores", "leadership_potential", "stress_tolerance", "team_compatibility", "adaptability", "decision_making", "effective_intelligence", "planning_organizing", "social_adaptability", "cooperation", "sense_of_responsibility", "courage_determination", "notes"]
                },
                selection_recommendation: {
                  type: "object",
                  properties: {
                    overall_recommendation: { type: "string", enum: ["Strongly Recommend", "Recommend", "Consider", "Not Recommended"] },
                    confidence_level: { type: "number", minimum: 0, maximum: 100 },
                    key_strengths: {
                      type: "array",
                      items: { type: "string" }
                    },
                    areas_for_development: {
                      type: "array",
                      items: { type: "string" }
                    },
                    role_suitability: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          role: { type: "string" },
                          suitability_score: { type: "number", minimum: 0, maximum: 100 },
                          rationale: { type: "string" }
                        },
                        required: ["role", "suitability_score", "rationale"]
                      }
                    },
                    next_steps: {
                      type: "array",
                      items: { type: "string" }
                    },
                    follow_up_assessments: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["overall_recommendation", "confidence_level", "key_strengths", "areas_for_development", "role_suitability", "next_steps", "follow_up_assessments"]
                },
                analysis_type: { type: "string" },
                confidence_score: { type: "number", minimum: 0, maximum: 100 }
              },
              required: ["summary", "personality_traits", "emotional_themes", "coping_mechanisms", "dominant_emotions", "psychological_insights", "interpersonal_style", "motivation_patterns", "murray_needs", "murray_presses", "inner_states", "military_assessment", "selection_recommendation", "analysis_type", "confidence_score"]
            }
          }
        },
        max_completion_tokens: 4000
      });

      if (response.choices[0].finish_reason === 'length') {
        console.warn('OpenAI response was truncated due to length limits');
      }

      const analysisData = response.choices[0].message.parsed;

      if (!analysisData) {
        throw new Error('Failed to parse OpenAI response');
      }

      // Validate with Zod schema
      const validatedAnalysis = EnhancedAnalysisSchema.parse(analysisData);

      console.log('Received and validated comprehensive analysis from OpenAI');

      // Calculate confidence score based on story quality
      const storyLength = storyContent.length;
      const wordCount = storyContent.split(/\s+/).length;
      const calculatedConfidence = Math.min(95, Math.max(60, 
        (storyLength / 500) * 40 + (wordCount / 100) * 30 + 25
      ));

      // Override confidence score with calculated value
      validatedAnalysis.confidence_score = Math.round(calculatedConfidence * 100) / 100;

      console.log(`Calculated confidence score: ${validatedAnalysis.confidence_score}`);

      // Insert comprehensive analysis results into database
      const { error: insertError } = await supabase
        .from('analysis_results')
        .insert({
          test_session_id: testSessionId,
          user_id: userId,
          analysis_data: {
            summary: validatedAnalysis.summary,
            personality_traits: validatedAnalysis.personality_traits,
            emotional_themes: validatedAnalysis.emotional_themes,
            coping_mechanisms: validatedAnalysis.coping_mechanisms,
            dominant_emotions: validatedAnalysis.dominant_emotions,
            psychological_insights: validatedAnalysis.psychological_insights,
            interpersonal_style: validatedAnalysis.interpersonal_style,
            motivation_patterns: validatedAnalysis.motivation_patterns,
            analysis_type: validatedAnalysis.analysis_type
          },
          murray_needs: validatedAnalysis.murray_needs,
          murray_presses: validatedAnalysis.murray_presses,
          inner_states: validatedAnalysis.inner_states,
          military_assessment: validatedAnalysis.military_assessment,
          selection_recommendation: validatedAnalysis.selection_recommendation,
          confidence_score: validatedAnalysis.confidence_score,
          analysis_type: validatedAnalysis.analysis_type
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Failed to save analysis: ${insertError.message}`);
      }

      console.log(`Comprehensive analysis saved successfully for session ${testSessionId}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Comprehensive TAT analysis completed and saved',
          confidence_score: validatedAnalysis.confidence_score,
          analysis_components: {
            murray_needs: validatedAnalysis.murray_needs.length,
            murray_presses: validatedAnalysis.murray_presses.length,
            inner_states: validatedAnalysis.inner_states.length,
            has_military_assessment: !!validatedAnalysis.military_assessment,
            has_selection_recommendation: !!validatedAnalysis.selection_recommendation
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      
      // Create fallback analysis if OpenAI fails
      const fallbackAnalysis = {
        summary: "Analysis completed with limited data due to processing constraints. The story demonstrates creative expression and personal narrative construction.",
        personality_traits: {
          openness: { score: 50, description: "Unable to determine from limited analysis" },
          conscientiousness: { score: 50, description: "Unable to determine from limited analysis" },
          extraversion: { score: 50, description: "Unable to determine from limited analysis" },
          agreeableness: { score: 50, description: "Unable to determine from limited analysis" },
          neuroticism: { score: 50, description: "Unable to determine from limited analysis" }
        },
        emotional_themes: ["Limited analysis available"],
        coping_mechanisms: ["Story writing as expression"],
        dominant_emotions: ["Creative expression"],
        psychological_insights: ["Demonstrates narrative ability"],
        interpersonal_style: "Unable to determine from limited analysis",
        motivation_patterns: "Shows engagement with creative tasks",
        murray_needs: [],
        murray_presses: [],
        inner_states: [],
        military_assessment: {
          overall_rating: 50,
          suitability: "Moderately Suitable" as const,
          scores: [],
          leadership_potential: 50,
          stress_tolerance: 50,
          team_compatibility: 50,
          adaptability: 50,
          decision_making: 50,
          notes: "Analysis limited due to processing constraints"
        },
        selection_recommendation: {
          overall_recommendation: "Consider" as const,
          confidence_level: 30,
          key_strengths: ["Demonstrates narrative ability"],
          areas_for_development: ["Requires more detailed assessment"],
          role_suitability: [],
          next_steps: ["Conduct additional assessment"],
          follow_up_assessments: ["Consider in-person evaluation"]
        },
        analysis_type: "murray_tat_fallback",
        confidence_score: 30
      };

      // Insert fallback analysis
      const { error: fallbackInsertError } = await supabase
        .from('analysis_results')
        .insert({
          test_session_id: testSessionId,
          user_id: userId,
          analysis_data: {
            summary: fallbackAnalysis.summary,
            personality_traits: fallbackAnalysis.personality_traits,
            emotional_themes: fallbackAnalysis.emotional_themes,
            coping_mechanisms: fallbackAnalysis.coping_mechanisms,
            dominant_emotions: fallbackAnalysis.dominant_emotions,
            psychological_insights: fallbackAnalysis.psychological_insights,
            interpersonal_style: fallbackAnalysis.interpersonal_style,
            motivation_patterns: fallbackAnalysis.motivation_patterns,
            analysis_type: fallbackAnalysis.analysis_type,
            error: "OpenAI processing failed, fallback analysis provided"
          },
          murray_needs: fallbackAnalysis.murray_needs,
          murray_presses: fallbackAnalysis.murray_presses,
          inner_states: fallbackAnalysis.inner_states,
          military_assessment: fallbackAnalysis.military_assessment,
          selection_recommendation: fallbackAnalysis.selection_recommendation,
          confidence_score: fallbackAnalysis.confidence_score,
          analysis_type: fallbackAnalysis.analysis_type
        });

      if (fallbackInsertError) {
        console.error('Fallback database insert error:', fallbackInsertError);
        throw new Error(`Failed to save fallback analysis: ${fallbackInsertError.message}`);
      }

      console.log(`Fallback analysis saved for session ${testSessionId}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Analysis completed with fallback processing',
          confidence_score: 30,
          warning: 'Limited analysis due to processing constraints'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

  } catch (error) {
    console.error('Error in analyze-story function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});