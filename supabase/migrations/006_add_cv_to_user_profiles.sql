-- Add CV URL to user profiles
ALTER TABLE user_profiles
ADD COLUMN cv_url TEXT;

-- Create a storage bucket for CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own CV
CREATE POLICY "Users can upload own CV"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own CV
CREATE POLICY "Users can update own CV"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own CV
CREATE POLICY "Users can delete own CV"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Anyone can download CVs (public portfolio)
CREATE POLICY "Anyone can download CVs"
ON storage.objects FOR SELECT
USING (bucket_id = 'cvs');
