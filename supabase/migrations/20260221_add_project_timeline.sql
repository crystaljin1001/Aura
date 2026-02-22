-- Create project_timeline table to store user-defined project boundaries
-- This allows users to specify when they started/completed a project (including planning time)

CREATE TABLE IF NOT EXISTS project_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,

  -- User-defined dates
  project_start_date TIMESTAMP WITH TIME ZONE, -- When user started thinking/planning
  project_end_date TIMESTAMP WITH TIME ZONE,   -- When project was completed (null if ongoing)

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one timeline per user per repo
  UNIQUE(user_id, repository_url)
);

-- Create index for faster lookups
CREATE INDEX idx_project_timeline_user_repo ON project_timeline(user_id, repository_url);

-- Enable Row Level Security
ALTER TABLE project_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own project timelines"
  ON project_timeline
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project timelines"
  ON project_timeline
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project timelines"
  ON project_timeline
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project timelines"
  ON project_timeline
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_timeline_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_project_timeline_timestamp
  BEFORE UPDATE ON project_timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_project_timeline_updated_at();
