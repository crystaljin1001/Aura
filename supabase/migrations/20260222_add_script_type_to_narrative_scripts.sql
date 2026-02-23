-- Add script_type column to narrative_scripts table
-- Supports two types of demo scripts: user_journey and technical_architecture

-- Add script_type column (nullable to support legacy scripts)
ALTER TABLE narrative_scripts
ADD COLUMN IF NOT EXISTS script_type TEXT
CHECK (script_type IS NULL OR script_type IN ('user_journey', 'technical_architecture'));

-- Add comment explaining the column
COMMENT ON COLUMN narrative_scripts.script_type IS 'Type of demo script: user_journey (outcome-focused) or technical_architecture (technical deep-dive). NULL for legacy scripts.';

-- Create index for filtering by script type
CREATE INDEX IF NOT EXISTS idx_narrative_scripts_script_type ON narrative_scripts(script_type);
