-- Create storage policies for the tat-images bucket

-- Allow authenticated users to upload files to tat-images bucket
CREATE POLICY "Allow authenticated uploads to tat-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'tat-images' AND auth.role() = 'authenticated');

-- Allow public access to read files from tat-images bucket
CREATE POLICY "Public access to tat-images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tat-images');

-- Allow authenticated users to update their own files in tat-images bucket
CREATE POLICY "Allow authenticated updates to tat-images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'tat-images' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'tat-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own files in tat-images bucket
CREATE POLICY "Allow authenticated deletes from tat-images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'tat-images' AND auth.role() = 'authenticated');