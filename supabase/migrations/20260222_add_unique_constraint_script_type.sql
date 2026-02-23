-- Add unique constraint to narrative_scripts to allow one script per (user_id, repository_url, script_type)
-- This allows storing both User Journey and Technical Architecture scripts separately

-- First, clean up any existing duplicates (keep most recent of each type)
WITH ranked_scripts AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, repository_url, script_type
      ORDER BY created_at DESC
    ) AS rn
  FROM narrative_scripts
  WHERE script_type IS NOT NULL
)
DELETE FROM narrative_scripts
WHERE id IN (
  SELECT id FROM ranked_scripts WHERE rn > 1
);

-- Add unique constraint
-- Note: We need to handle NULL script_type (legacy scripts) by excluding them from constraint
-- Create a partial unique index that only applies to non-null script_types
CREATE UNIQUE INDEX IF NOT EXISTS idx_narrative_scripts_unique_type
ON narrative_scripts(user_id, repository_url, script_type)
WHERE script_type IS NOT NULL;

-- Add comment explaining the constraint
COMMENT ON INDEX idx_narrative_scripts_unique_type IS
'Ensures one script per (user_id, repository_url, script_type). Allows both User Journey and Technical Architecture scripts per project.';

-- Add index for faster lookups by type
CREATE INDEX IF NOT EXISTS idx_narrative_scripts_script_type ON narrative_scripts(script_type);
