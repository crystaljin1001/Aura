-- Allow public (unauthenticated) read access to portfolio data.
-- These tables contain intentionally public content (GitHub data, portfolio decisions).
-- Write access is still restricted to the authenticated owner.

-- user_repositories (repo owner/name are already public on GitHub)
CREATE POLICY "Public can read user_repositories"
  ON user_repositories FOR SELECT
  USING (true);

-- impact_cache (aggregated from public GitHub data)
CREATE POLICY "Public can read impact_cache"
  ON impact_cache FOR SELECT
  USING (true);

-- architecture_diagrams
CREATE POLICY "Public can read architecture_diagrams"
  ON architecture_diagrams FOR SELECT
  USING (true);

-- project_technical_journey (tech decisions enhanced / logic map)
CREATE POLICY "Public can read project_technical_journey"
  ON project_technical_journey FOR SELECT
  USING (true);

-- project_pivot_points (critical pivots)
CREATE POLICY "Public can read project_pivot_points"
  ON project_pivot_points FOR SELECT
  USING (true);

-- project_videos
CREATE POLICY "Public can read project_videos"
  ON project_videos FOR SELECT
  USING (true);
