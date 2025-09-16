-- Add INSERT policy for tattest table to allow authenticated users to create tests
CREATE POLICY "Authenticated users can create tests" 
ON public.tattest 
FOR INSERT 
WITH CHECK (true);

-- Add INSERT policy for users table to allow users to create their own profile
CREATE POLICY "Users can create their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (true);