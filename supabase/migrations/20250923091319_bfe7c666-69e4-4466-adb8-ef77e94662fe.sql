-- Create access_tokens table for storing API tokens
CREATE TABLE public.access_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (edge functions can read/write)
CREATE POLICY "Service role can manage access tokens" 
ON public.access_tokens 
FOR ALL 
USING (true);

-- Create index for efficient provider lookups
CREATE INDEX idx_access_tokens_provider ON public.access_tokens(provider);

-- Create index for expiration checks
CREATE INDEX idx_access_tokens_expires_at ON public.access_tokens(expires_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_access_tokens_updated_at
BEFORE UPDATE ON public.access_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();