-- Quick fix: Make tat-images bucket publicly uploadable
-- Drop the existing restrictive policies that require authentication
DROP POLICY IF EXISTS "Allow uploads to tat-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to tat-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from tat-images" ON storage.objects;

-- Create simple public policies for tat-images bucket
CREATE POLICY "Public uploads to tat-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'tat-images');

CREATE POLICY "Public updates to tat-images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'tat-images');

CREATE POLICY "Public deletes from tat-images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'tat-images');