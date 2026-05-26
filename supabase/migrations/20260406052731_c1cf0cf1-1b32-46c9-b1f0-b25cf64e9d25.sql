-- Create the media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Anyone can view media files
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'media');

-- Admins can upload media
CREATE POLICY "Admins can upload media" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update media
CREATE POLICY "Admins can update media" ON storage.objects FOR UPDATE 
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete media
CREATE POLICY "Admins can delete media" ON storage.objects FOR DELETE 
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));