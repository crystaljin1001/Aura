-- Pulse Metrics Cache Table
-- Stores calculated velocity and uptime metrics with 24-hour TTL

CREATE TABLE IF NOT EXISTS pulse_metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repository_url TEXT NOT NULL,
  metrics JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, repository_url)
);

-- Index for faster lookups
CREATE INDEX idx_pulse_cache_user_repo ON pulse_metrics_cache(user_id, repository_url);
CREATE INDEX idx_pulse_cache_cached_at ON pulse_metrics_cache(cached_at);

-- RLS Policies
ALTER TABLE pulse_metrics_cache ENABLE ROW LEVEL SECURITY;

-- Users can view their own pulse metrics
CREATE POLICY "Users can view their own pulse metrics"
ON pulse_metrics_cache
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert/update their own pulse metrics
CREATE POLICY "Users can insert their own pulse metrics"
ON pulse_metrics_cache
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pulse metrics"
ON pulse_metrics_cache
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_pulse_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pulse_metrics_updated_at
BEFORE UPDATE ON pulse_metrics_cache
FOR EACH ROW
EXECUTE FUNCTION update_pulse_metrics_updated_at();
