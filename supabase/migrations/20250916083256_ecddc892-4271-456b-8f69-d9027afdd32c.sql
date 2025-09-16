-- Update RLS policies to work better with Clerk authentication
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;

-- Create improved policies that work with both Clerk JWT and direct clerk_id matching
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (
  clerk_id = auth.jwt() ->> 'clerk_user_id' OR
  clerk_id = auth.jwt() ->> 'sub' OR
  clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'clerk_user_id'::text) OR
  clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (
  clerk_id = auth.jwt() ->> 'clerk_user_id' OR
  clerk_id = auth.jwt() ->> 'sub' OR
  clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'clerk_user_id'::text) OR
  clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);

CREATE POLICY "Users can create their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (
  clerk_id = auth.jwt() ->> 'clerk_user_id' OR
  clerk_id = auth.jwt() ->> 'sub' OR
  clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'clerk_user_id'::text) OR
  clerk_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);