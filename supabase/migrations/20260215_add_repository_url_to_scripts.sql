-- Add repository_url column to narrative_scripts table
ALTER TABLE narrative_scripts
ADD COLUMN IF NOT EXISTS repository_url TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_narrative_scripts_repository_url
ON narrative_scripts(repository_url);

-- Add comment
COMMENT ON COLUMN narrative_scripts.repository_url IS 'Repository URL in format: owner/repo';
