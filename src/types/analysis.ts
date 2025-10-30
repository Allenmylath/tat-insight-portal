// TypeScript interfaces for enhanced analysis data structures

export interface MurrayNeed {
  name: string;
  score: number;
  description: string;
  intensity: 'Low' | 'Moderate' | 'High' | 'Very High';
}

export interface MurrayPress {
  name: string;
  influence: number;
  description: string;
  category: 'Social' | 'Environmental' | 'Personal' | 'Professional';
}

export interface InnerState {
  state: string;
  intensity: number;
  description: string;
  valence: 'Positive' | 'Negative' | 'Neutral';
}

export interface MilitaryAssessmentScore {
  category: string;
  score: number;
  assessment: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement';
  recommendation: string;
}

export interface MilitaryAssessment {
  overall_rating: number;
  suitability: 'Highly Suitable' | 'Suitable' | 'Moderately Suitable' | 'Not Suitable';
  scores: MilitaryAssessmentScore[];
  leadership_potential: number;
  stress_tolerance: number;
  team_compatibility: number;
  adaptability: number;
  decision_making: number;
  effective_intelligence: number;
  planning_organizing: number;
  social_adaptability: number;
  cooperation: number;
  sense_of_responsibility: number;
  courage_determination: number;
  notes: string;
}

export interface SelectionRecommendation {
  overall_recommendation: 'Strongly Recommend' | 'Recommend' | 'Consider' | 'Not Recommended';
  confidence_level: number;
  key_strengths: string[];
  areas_for_development: string[];
  role_suitability: {
    role: string;
    suitability_score: number;
    rationale: string;
  }[];
  next_steps: string[];
  follow_up_assessments: string[];
}

export interface EnhancedAnalysisData {
  summary: string;
  personality_traits?: Record<string, any>;
  emotional_themes?: string[];
  coping_mechanisms?: string[];
  dominant_emotions?: string[];
  psychological_insights?: string[];
  interpersonal_style?: string;
  motivation_patterns?: string;
  murray_needs?: MurrayNeed[];
  murray_presses?: MurrayPress[];
  inner_states?: InnerState[];
  military_assessment?: MilitaryAssessment;
  selection_recommendation?: SelectionRecommendation;
  analysis_type?: string;
  confidence_score?: number;
}