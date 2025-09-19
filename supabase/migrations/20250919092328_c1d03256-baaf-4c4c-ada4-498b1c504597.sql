-- Create storage bucket for documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public access to documents
CREATE POLICY "Documents are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');

-- Create policy for authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');