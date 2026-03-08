-- Create about_sections table
CREATE TABLE IF NOT EXISTS about_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  headline TEXT NOT NULL DEFAULT 'I build products that make a difference',
  headline_highlight TEXT DEFAULT 'make a difference',
  bio TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  years_experience TEXT,
  availability_label TEXT,
  skills JSONB NOT NULL DEFAULT '[]',
  experience JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can view (public portfolio)
CREATE POLICY "Public can view about sections"
  ON about_sections FOR SELECT
  USING (true);

-- Only owner can insert/update/delete
CREATE POLICY "Users can manage own about section"
  ON about_sections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
