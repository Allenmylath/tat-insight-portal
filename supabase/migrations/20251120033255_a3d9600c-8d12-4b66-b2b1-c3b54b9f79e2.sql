-- Add onboarding tracking fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for faster queries on onboarding status
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON public.users(has_completed_onboarding) WHERE has_completed_onboarding = FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.users.has_completed_onboarding IS 'Tracks whether user has completed the onboarding tour';
COMMENT ON COLUMN public.users.onboarding_completed_at IS 'Timestamp when user completed or skipped the onboarding tour';