-- Engineering Rigor Cache Table
-- Stores calculated engineering rigor metrics for repositories

CREATE TABLE IF NOT EXISTS engineering_rigor_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,
  rigor_metrics JSONB NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure one cache entry per user per repository
  UNIQUE(user_id, repository_url)
);

-- Create indexes
CREATE INDEX idx_engineering_rigor_cache_user_id ON engineering_rigor_cache(user_id);
CREATE INDEX idx_engineering_rigor_cache_repository_url ON engineering_rigor_cache(repository_url);
CREATE INDEX idx_engineering_rigor_cache_cached_at ON engineering_rigor_cache(cached_at);

-- Enable Row Level Security
ALTER TABLE engineering_rigor_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own engineering rigor cache"
  ON engineering_rigor_cache
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own engineering rigor cache"
  ON engineering_rigor_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own engineering rigor cache"
  ON engineering_rigor_cache
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own engineering rigor cache"
  ON engineering_rigor_cache
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_engineering_rigor_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER engineering_rigor_cache_updated_at
  BEFORE UPDATE ON engineering_rigor_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_engineering_rigor_cache_updated_at();

-- Add comment
COMMENT ON TABLE engineering_rigor_cache IS 'Caches engineering rigor analysis for repositories (24hr TTL)';
