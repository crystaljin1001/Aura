-- Migration: Add portfolio_context_blocks table
-- Description: Stores AI-generated context blocks for project case studies
-- Date: 2026-02-18

-- Create portfolio_context_blocks table
CREATE TABLE IF NOT EXISTS public.portfolio_context_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repository_url TEXT NOT NULL,
  project_name TEXT NOT NULL,
  problem_context TEXT NOT NULL,
  solution_context TEXT NOT NULL,
  impact_context TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_context_blocks_user_id
  ON public.portfolio_context_blocks(user_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_context_blocks_repository_url
  ON public.portfolio_context_blocks(repository_url);

CREATE INDEX IF NOT EXISTS idx_portfolio_context_blocks_user_repo
  ON public.portfolio_context_blocks(user_id, repository_url);

-- Enable Row Level Security
ALTER TABLE public.portfolio_context_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own context blocks
CREATE POLICY "Users can read own context blocks"
  ON public.portfolio_context_blocks
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own context blocks
CREATE POLICY "Users can insert own context blocks"
  ON public.portfolio_context_blocks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own context blocks
CREATE POLICY "Users can update own context blocks"
  ON public.portfolio_context_blocks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own context blocks
CREATE POLICY "Users can delete own context blocks"
  ON public.portfolio_context_blocks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_portfolio_context_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolio_context_blocks_updated_at
  BEFORE UPDATE ON public.portfolio_context_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_context_blocks_updated_at();

-- Add comment
COMMENT ON TABLE public.portfolio_context_blocks IS
  'Stores AI-generated context blocks (Problem/Solution/Impact) for project case studies';
