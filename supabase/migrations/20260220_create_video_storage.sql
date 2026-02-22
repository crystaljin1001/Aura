-- Create storage bucket for project videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-videos',
  'project-videos',
  true,
  52428800, -- 50MB limit (Supabase free tier)
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload videos to their own folder
CREATE POLICY "Users can upload videos to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own videos
CREATE POLICY "Users can update their own videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view videos (public bucket)
CREATE POLICY "Anyone can view videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-videos');
