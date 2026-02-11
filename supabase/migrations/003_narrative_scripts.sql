-- Narrative Scripts Table
-- Stores generated video demo scripts

CREATE TABLE IF NOT EXISTS narrative_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  readme_content TEXT NOT NULL,
  generated_script JSONB NOT NULL, -- { context, problem, process, outcome }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Users can only access their own scripts
ALTER TABLE narrative_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own scripts" ON narrative_scripts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_narrative_scripts_user_id ON narrative_scripts(user_id);
CREATE INDEX idx_narrative_scripts_created_at ON narrative_scripts(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE TRIGGER update_narrative_scripts_updated_at
  BEFORE UPDATE ON narrative_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
