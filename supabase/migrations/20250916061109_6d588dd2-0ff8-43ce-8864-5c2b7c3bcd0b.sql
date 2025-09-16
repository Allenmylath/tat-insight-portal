-- Create enum for user membership types
CREATE TYPE public.membership_type AS ENUM ('free', 'pro');

-- Create enum for test session status
CREATE TYPE public.session_status AS ENUM ('active', 'completed', 'abandoned');

-- Create users table for Clerk sync and pro membership tracking
CREATE TABLE public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    membership_type membership_type NOT NULL DEFAULT 'free',
    membership_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tattest table for individual tests with images & prompts
CREATE TABLE public.tattest (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchases table for payment tracking per user per test
CREATE TABLE public.purchases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tattest_id UUID NOT NULL REFERENCES public.tattest(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    stripe_payment_intent_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, tattest_id)
);

-- Create test_sessions table for story writing sessions with timer
CREATE TABLE public.test_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tattest_id UUID NOT NULL REFERENCES public.tattest(id) ON DELETE CASCADE,
    story_content TEXT,
    session_duration_seconds INTEGER,
    status session_status NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analysis_results table for AI psychological analysis
CREATE TABLE public.analysis_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    test_session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    analysis_data JSONB NOT NULL,
    personality_traits JSONB,
    confidence_score DECIMAL(3,2),
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(test_session_id)
);

-- Create offers table for discount campaigns (regular users only)
CREATE TABLE public.offers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    discount_percentage INTEGER NOT NULL,
    discount_amount DECIMAL(10,2),
    code TEXT NOT NULL UNIQUE,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    for_regular_users_only BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_offers table for tracking which users can use which offers
CREATE TABLE public.user_offers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, offer_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tattest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_offers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id'));

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id'));

-- Create RLS policies for tattest table (public read)
CREATE POLICY "Anyone can view active tests" 
ON public.tattest 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for purchases table
CREATE POLICY "Users can view their own purchases" 
ON public.purchases 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id')));

CREATE POLICY "Users can create their own purchases" 
ON public.purchases 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id')));

-- Create RLS policies for test_sessions table
CREATE POLICY "Users can manage their own test sessions" 
ON public.test_sessions 
FOR ALL 
USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id')));

-- Create RLS policies for analysis_results table
CREATE POLICY "Users can view their own analysis results" 
ON public.analysis_results 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id')));

-- Create RLS policies for offers table
CREATE POLICY "Anyone can view active offers" 
ON public.offers 
FOR SELECT 
USING (is_active = true AND valid_from <= now() AND valid_until >= now());

-- Create RLS policies for user_offers table
CREATE POLICY "Users can view their own offers" 
ON public.user_offers 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id')));

CREATE POLICY "Users can update their own offer usage" 
ON public.user_offers 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = (current_setting('request.jwt.claims', true)::json->>'clerk_user_id')));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    return NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tattest_updated_at
    BEFORE UPDATE ON public.tattest
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_users_clerk_id ON public.users(clerk_id);
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_test_sessions_user_id ON public.test_sessions(user_id);
CREATE INDEX idx_analysis_results_user_id ON public.analysis_results(user_id);
CREATE INDEX idx_user_offers_user_id ON public.user_offers(user_id);
CREATE INDEX idx_offers_active_dates ON public.offers(is_active, valid_from, valid_until);