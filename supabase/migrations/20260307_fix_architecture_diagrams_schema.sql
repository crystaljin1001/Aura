-- Migration: Fix architecture_diagrams to be project-specific, not repo-specific
-- This allows multiple projects from the same repository to have different diagrams

-- Drop the old table
DROP TABLE IF EXISTS architecture_diagrams CASCADE;

-- Create new table with project_id instead of repository_url
CREATE TABLE architecture_diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES user_repositories(id) ON DELETE CASCADE,
  mermaid_code TEXT NOT NULL,
  diagram_type TEXT NOT NULL CHECK (diagram_type IN ('flowchart', 'sequence', 'class', 'architecture')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id) -- One diagram per project (not per repository)
);

-- Enable RLS
ALTER TABLE architecture_diagrams ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own diagrams
CREATE POLICY "Users manage own diagrams" ON architecture_diagrams
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_architecture_diagrams_project
  ON architecture_diagrams(project_id);

CREATE INDEX IF NOT EXISTS idx_architecture_diagrams_user
  ON architecture_diagrams(user_id);

-- Add comment for documentation
COMMENT ON TABLE architecture_diagrams IS 'Stores AI-generated Mermaid.js architecture diagrams for Aura projects. Each project can have its own custom diagram, even if multiple projects share the same repository.';
