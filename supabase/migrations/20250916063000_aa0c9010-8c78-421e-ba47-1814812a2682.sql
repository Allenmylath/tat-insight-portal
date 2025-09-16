-- Create storage bucket for TAT test images
INSERT INTO storage.buckets (id, name, public) VALUES ('tat-images', 'tat-images', true);

-- Create policies for TAT images bucket
CREATE POLICY "TAT images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tat-images');

CREATE POLICY "Authenticated users can upload TAT images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'tat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update TAT images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'tat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete TAT images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'tat-images' AND auth.role() = 'authenticated');