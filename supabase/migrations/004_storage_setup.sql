-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('signatures', 'signatures', false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']),
  ('logos', 'logos', false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']);

-- Set up RLS policies for storage
CREATE POLICY "Users can upload their own signatures" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'signatures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own signatures" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'signatures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own signatures" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'signatures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own signatures" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'signatures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Logo policies (similar to signatures)
CREATE POLICY "Users can upload their own logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own logos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );