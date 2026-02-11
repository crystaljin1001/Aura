-- Impact Engine Database Schema
-- Creates tables for GitHub token storage, impact data caching, and rate limit tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: github_tokens
-- Stores encrypted GitHub Personal Access Tokens per user
CREATE TABLE IF NOT EXISTS github_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_token TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  token_last_four CHAR(4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS: Users can only access their own tokens
ALTER TABLE github_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tokens" ON github_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Table 2: impact_cache
-- Caches calculated impact metrics for 24 hours
CREATE TABLE IF NOT EXISTS impact_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repo_full_name TEXT NOT NULL,
  repo_data JSONB NOT NULL,
  impact_metrics JSONB NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(user_id, repo_full_name)
);

-- RLS: Users can only access their own cache
ALTER TABLE impact_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cache" ON impact_cache
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Table 3: rate_limit_tracking
-- Tracks GitHub API usage per user
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requests_made INTEGER NOT NULL DEFAULT 0,
  rate_limit INTEGER NOT NULL DEFAULT 5000,
  rate_remaining INTEGER NOT NULL DEFAULT 5000,
  rate_reset_at TIMESTAMPTZ NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS: Users can only access their own rate limits
ALTER TABLE rate_limit_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own limits" ON rate_limit_tracking
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_github_tokens_user_id ON github_tokens(user_id);
CREATE INDEX idx_impact_cache_user_id ON impact_cache(user_id);
CREATE INDEX idx_impact_cache_expires_at ON impact_cache(expires_at);
CREATE INDEX idx_rate_limit_tracking_user_id ON rate_limit_tracking(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on github_tokens
CREATE TRIGGER update_github_tokens_updated_at
  BEFORE UPDATE ON github_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
