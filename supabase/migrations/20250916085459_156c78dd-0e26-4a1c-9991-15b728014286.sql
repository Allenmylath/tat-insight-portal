-- Fix storage policies for tat-images bucket to work with Clerk authentication
-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated uploads to tat-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to tat-images" ON storage.objects;  
DROP POLICY IF EXISTS "Allow authenticated deletes from tat-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload TAT images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update TAT images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete TAT images" ON storage.objects;

-- Create new policies that work with Clerk JWT tokens
CREATE POLICY "Allow uploads to tat-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'tat-images' AND (
    auth.role() = 'authenticated' OR 
    current_setting('request.jwt.claims', true)::json ? 'sub' OR
    current_setting('request.jwt.claims', true)::json ? 'clerk_user_id'
  )
);

CREATE POLICY "Allow updates to tat-images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'tat-images' AND (
    auth.role() = 'authenticated' OR 
    current_setting('request.jwt.claims', true)::json ? 'sub' OR
    current_setting('request.jwt.claims', true)::json ? 'clerk_user_id'
  )
);

CREATE POLICY "Allow deletes from tat-images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'tat-images' AND (
    auth.role() = 'authenticated' OR 
    current_setting('request.jwt.claims', true)::json ? 'sub' OR
    current_setting('request.jwt.claims', true)::json ? 'clerk_user_id'
  )
);