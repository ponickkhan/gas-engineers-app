-- Create storage buckets for signatures and logos
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('signatures', 'signatures', true),
  ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for signatures bucket
CREATE POLICY "Users can view own signatures" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'signatures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own signatures" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'signatures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own signatures" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'signatures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own signatures" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'signatures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Set up RLS policies for logos bucket
CREATE POLICY "Users can view own logos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );