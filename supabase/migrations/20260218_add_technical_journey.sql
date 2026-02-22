-- Migration: Add project_technical_journey table
-- Description: Stores user-written technical journey for case studies
-- Date: 2026-02-18

-- Create project_technical_journey table
CREATE TABLE IF NOT EXISTS public.project_technical_journey (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repository_url TEXT NOT NULL,

  -- Core journey components
  problem_statement TEXT NOT NULL,
  technical_approach TEXT NOT NULL,
  key_challenges TEXT,
  outcome TEXT,
  learnings TEXT[],

  -- Technical decisions (tech stack with reasoning)
  tech_decisions JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ tech: "Redis", reason: "Needed sub-10ms reads" }, ...]

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, repository_url)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_technical_journey_user_id
  ON public.project_technical_journey(user_id);

CREATE INDEX IF NOT EXISTS idx_technical_journey_repository_url
  ON public.project_technical_journey(repository_url);

CREATE INDEX IF NOT EXISTS idx_technical_journey_user_repo
  ON public.project_technical_journey(user_id, repository_url);

-- Enable Row Level Security
ALTER TABLE public.project_technical_journey ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own journeys
CREATE POLICY "Users can read own technical journey"
  ON public.project_technical_journey
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own journeys
CREATE POLICY "Users can insert own technical journey"
  ON public.project_technical_journey
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own journeys
CREATE POLICY "Users can update own technical journey"
  ON public.project_technical_journey
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own journeys
CREATE POLICY "Users can delete own technical journey"
  ON public.project_technical_journey
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_technical_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_technical_journey_updated_at
  BEFORE UPDATE ON public.project_technical_journey
  FOR EACH ROW
  EXECUTE FUNCTION update_technical_journey_updated_at();

-- Add comment
COMMENT ON TABLE public.project_technical_journey IS
  'Stores user-written technical journey narratives for project case studies';
