-- Migration: Add validation tables for Evidence Engine
-- Description: Stores critique results and planned improvements
-- Date: 2026-02-19

-- ============================================================================
-- Table: project_critiques
-- Stores AI critique results (architectural debt, production gaps, narrative gaps)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_critiques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repository_url TEXT NOT NULL,

  -- Critique results (JSONB for flexibility)
  architectural_debt JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ issue: "...", severity: "high|medium|low", evidence: "...", suggestion: "...", githubLink: "..." }]

  production_gaps JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ gap: "...", category: "security|testing|documentation|deployment", impact: "...", quickFix: "..." }]

  narrative_gaps JSONB DEFAULT '[]'::jsonb,
  -- Format: [{ critique: "...", missingContext: "...", suggestedPrompt: "..." }]

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, repository_url)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_critiques_user_id
  ON public.project_critiques(user_id);

CREATE INDEX IF NOT EXISTS idx_critiques_repository_url
  ON public.project_critiques(repository_url);

CREATE INDEX IF NOT EXISTS idx_critiques_user_repo
  ON public.project_critiques(user_id, repository_url);

-- Enable Row Level Security
ALTER TABLE public.project_critiques ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own critiques
CREATE POLICY "Users can read own critiques"
  ON public.project_critiques
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own critiques
CREATE POLICY "Users can insert own critiques"
  ON public.project_critiques
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own critiques
CREATE POLICY "Users can update own critiques"
  ON public.project_critiques
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own critiques
CREATE POLICY "Users can delete own critiques"
  ON public.project_critiques
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_critiques_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_critiques_updated_at
  BEFORE UPDATE ON public.project_critiques
  FOR EACH ROW
  EXECUTE FUNCTION update_critiques_updated_at();

-- ============================================================================
-- Table: project_improvements
-- Stores planned improvements with status tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repository_url TEXT NOT NULL,

  -- Improvement details
  area TEXT NOT NULL, -- "Testing Coverage", "Security", "Performance"
  current_state TEXT, -- "Manual testing only"
  planned_action TEXT NOT NULL, -- "Add Vitest + Playwright"
  rationale TEXT, -- "To enable CI/CD confidence"

  -- Status tracking
  priority TEXT DEFAULT 'p2', -- 'p0' | 'p1' | 'p2'
  status TEXT DEFAULT 'planned', -- 'planned' | 'in_progress' | 'completed'

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT valid_priority CHECK (priority IN ('p0', 'p1', 'p2')),
  CONSTRAINT valid_status CHECK (status IN ('planned', 'in_progress', 'completed'))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_improvements_user_id
  ON public.project_improvements(user_id);

CREATE INDEX IF NOT EXISTS idx_improvements_repository_url
  ON public.project_improvements(repository_url);

CREATE INDEX IF NOT EXISTS idx_improvements_user_repo
  ON public.project_improvements(user_id, repository_url);

CREATE INDEX IF NOT EXISTS idx_improvements_status
  ON public.project_improvements(status);

CREATE INDEX IF NOT EXISTS idx_improvements_priority
  ON public.project_improvements(priority);

-- Enable Row Level Security
ALTER TABLE public.project_improvements ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own improvements
CREATE POLICY "Users can read own improvements"
  ON public.project_improvements
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own improvements
CREATE POLICY "Users can insert own improvements"
  ON public.project_improvements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own improvements
CREATE POLICY "Users can update own improvements"
  ON public.project_improvements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own improvements
CREATE POLICY "Users can delete own improvements"
  ON public.project_improvements
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_improvements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Automatically set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;

  -- Clear completed_at if status changes back to non-completed
  IF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_improvements_updated_at
  BEFORE UPDATE ON public.project_improvements
  FOR EACH ROW
  EXECUTE FUNCTION update_improvements_updated_at();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.project_critiques IS
  'Stores AI-generated critique results for repositories including architectural debt, production gaps, and narrative gaps';

COMMENT ON TABLE public.project_improvements IS
  'Stores planned improvements for repositories with status tracking and priority levels';

COMMENT ON COLUMN public.project_critiques.architectural_debt IS
  'Array of architectural issues found in the codebase with severity levels';

COMMENT ON COLUMN public.project_critiques.production_gaps IS
  'Array of missing production readiness features (tests, security, deployment)';

COMMENT ON COLUMN public.project_critiques.narrative_gaps IS
  'Array of missing explanations or justifications in the technical journey';

COMMENT ON COLUMN public.project_improvements.priority IS
  'Priority level: p0 (critical), p1 (high), p2 (medium)';

COMMENT ON COLUMN public.project_improvements.status IS
  'Current status: planned, in_progress, or completed';
