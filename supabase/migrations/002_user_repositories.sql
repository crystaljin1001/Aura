-- User Repositories Table
-- Stores which repositories each user wants to track

CREATE TABLE IF NOT EXISTS user_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, repo_owner, repo_name)
);

-- RLS: Users can only access their own repositories
ALTER TABLE user_repositories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own repositories" ON user_repositories
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_repositories_user_id ON user_repositories(user_id);

-- Add a constraint to limit max repositories per user
CREATE OR REPLACE FUNCTION check_repository_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM user_repositories WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'Maximum 10 repositories allowed per user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_repository_limit
  BEFORE INSERT ON user_repositories
  FOR EACH ROW
  EXECUTE FUNCTION check_repository_limit();
