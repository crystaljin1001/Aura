-- Add Logic Map feature: Pivot Points and Technical Decision Alternatives
-- This transforms the portfolio from "what I built" to "why I chose this over that"

-- 1. Add alternatives column to existing tech_decisions in technical_journey
ALTER TABLE project_technical_journey
ADD COLUMN IF NOT EXISTS tech_decisions_enhanced JSONB DEFAULT '[]';

COMMENT ON COLUMN project_technical_journey.tech_decisions_enhanced IS
'Enhanced technical decisions with alternatives and rejection reasoning. Structure:
[{
  "technology": "LangGraph",
  "problem": "How to manage complex multi-agent workflows",
  "alternativesConsidered": [{
    "name": "Custom workflow system",
    "pros": ["Full control", "Lightweight"],
    "cons": ["Reinventing the wheel", "Maintenance burden"],
    "whyRejected": "Would take 2+ weeks to build state management that LangGraph provides out of the box"
  }],
  "chosenSolution": {
    "name": "LangGraph",
    "rationale": "Robust state management and workflow orchestration designed for LLM agents",
    "tradeoffsAccepted": ["Steeper learning curve", "Framework dependency"],
    "evidenceLink": "https://github.com/user/repo/blob/main/src/workflow.ts#L10-L50"
  }
}]';

-- 2. Create pivot_points table for critical decision moments
CREATE TABLE IF NOT EXISTS project_pivot_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,

  -- The critical decision moment
  challenge TEXT NOT NULL, -- "How to handle conflicting agent interpretations"
  initial_approach TEXT NOT NULL, -- "Single model with majority vote"

  -- The pivot
  pivot_reasoning TEXT NOT NULL, -- Why you changed course
  new_approach TEXT NOT NULL, -- "Social Brain adversarial multi-agent"

  -- The outcome
  outcome TEXT, -- "30% improvement in interpretation accuracy"
  impact_metric TEXT, -- e.g., "accuracy", "performance", "user satisfaction"

  -- Evidence
  evidence_link TEXT, -- GitHub permalink to the pivot commit/PR
  commit_sha TEXT, -- Specific commit where pivot happened
  pivot_date TIMESTAMP WITH TIME ZONE, -- When the decision was made

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- For ordering/grouping pivot points
  sequence_order INTEGER DEFAULT 0
);

-- Create index for faster lookups
CREATE INDEX idx_pivot_points_user_repo ON project_pivot_points(user_id, repository_url);
CREATE INDEX idx_pivot_points_date ON project_pivot_points(pivot_date DESC);

-- Enable Row Level Security
ALTER TABLE project_pivot_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pivot_points
CREATE POLICY "Users can view their own pivot points"
  ON project_pivot_points
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pivot points"
  ON project_pivot_points
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pivot points"
  ON project_pivot_points
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pivot points"
  ON project_pivot_points
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pivot_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_pivot_points_timestamp
  BEFORE UPDATE ON project_pivot_points
  FOR EACH ROW
  EXECUTE FUNCTION update_pivot_points_updated_at();

-- 3. Add logic_map_enabled flag to track which projects use the new format
ALTER TABLE project_technical_journey
ADD COLUMN IF NOT EXISTS logic_map_enabled BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN project_technical_journey.logic_map_enabled IS
'Flag to indicate if this project uses the enhanced Logic Map format (alternatives + pivot points)';
