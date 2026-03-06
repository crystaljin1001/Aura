-- Add draft_data column to store AI-generated content
-- and status column for tracking repository analysis state

-- Add new columns to user_repositories table
ALTER TABLE user_repositories
ADD COLUMN IF NOT EXISTS draft_data JSONB,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- Add check constraint for valid status values
ALTER TABLE user_repositories
ADD CONSTRAINT check_repository_status
CHECK (status IN ('analyzing', 'draft', 'new', 'script_ready', 'video_ready', 'deployed'));

-- Create index for efficient status filtering
CREATE INDEX IF NOT EXISTS idx_user_repositories_status ON user_repositories(status);

-- Create index for efficient draft_data queries
CREATE INDEX IF NOT EXISTS idx_user_repositories_draft_data ON user_repositories USING GIN(draft_data);

-- Add comment for documentation
COMMENT ON COLUMN user_repositories.draft_data IS 'AI-generated draft content including title, TL;DR, and impact metrics';
COMMENT ON COLUMN user_repositories.status IS 'Repository processing status: analyzing | draft | new | script_ready | video_ready | deployed';
