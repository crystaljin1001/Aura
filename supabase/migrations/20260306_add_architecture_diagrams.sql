-- Create table for storing architecture diagrams
CREATE TABLE IF NOT EXISTS architecture_diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,
  mermaid_code TEXT NOT NULL,
  diagram_type TEXT NOT NULL CHECK (diagram_type IN ('flowchart', 'sequence', 'class', 'architecture')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, repository_url)
);

-- Enable RLS
ALTER TABLE architecture_diagrams ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own diagrams
CREATE POLICY "Users manage own diagrams" ON architecture_diagrams
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_architecture_diagrams_user_repo
  ON architecture_diagrams(user_id, repository_url);

-- Add comment for documentation
COMMENT ON TABLE architecture_diagrams IS 'Stores AI-generated Mermaid.js architecture diagrams for projects';
