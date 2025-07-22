-- Create storage bucket for video processing
INSERT INTO storage.buckets (id, name, public) 
VALUES ('video-processing', 'video-processing', false);

-- Create policies for video processing bucket
CREATE POLICY "Users can upload to video processing bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'video-processing');

CREATE POLICY "Users can read from video processing bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'video-processing');

CREATE POLICY "Users can update video processing files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'video-processing');

CREATE POLICY "Users can delete video processing files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'video-processing');