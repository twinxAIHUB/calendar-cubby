-- Fix storage policies for post-images bucket
CREATE POLICY "Authenticated users can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'post-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-images');

CREATE POLICY "Users can update their own images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'post-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'post-images' AND auth.uid() IS NOT NULL);