# Engineering Rigor Implementation

## Overview

The Engineering Rigor scoring system analyzes GitHub repositories to evaluate code quality, testing practices, infrastructure, and maintenance habits. It provides a comprehensive 0-10 score alongside the existing Velocity score, creating a "Dual-Pulse" view of projects.

## Architecture

### Components

1. **DualPulseCard** (`src/features/engineering-rigor/components/DualPulseCard.tsx`)
   - Main UI component displaying both Velocity and Engineering Rigor scores
   - Large, attractive score displays with badges and AI context
   - Collapsible detailed breakdown section
   - Automatic data fetching and refresh capability

2. **API Route** (`src/app/api/engineering-rigor/[repository]/route.ts`)
   - GET endpoint for fetching engineering rigor metrics
   - Supports `?refresh=true` query parameter for force refresh
   - Returns cached data (24hr TTL) or calculates fresh metrics

3. **Server Actions** (`src/features/engineering-rigor/api/actions.ts`)
   - `calculateRepositoryRigor()` - Fetches GitHub data and calculates scores
   - `getCachedRigorMetrics()` - Retrieves cached results from database

### Scoring Dimensions

The system evaluates 5 key dimensions:

#### 1. Tooling Intent (0-2 points)
**What it measures:** Presence of configuration files for linting/formatting

**Signals detected:**
- Prettier (.prettierrc, prettier.config.js)
- ESLint (.eslintrc, eslint.config.mjs)
- TypeScript (tsconfig.json)
- Python tools (ruff.toml, .black, .pylintrc)
- EditorConfig (.editorconfig)

**Scoring:**
- 0.5 pts: Formatter (Prettier/Black)
- 0.75 pts: Linter (ESLint/Pylint/Ruff)
- 0.5 pts: TypeScript config
- 0.25 pts: EditorConfig
- Max: 2.0 points

#### 2. Stability Infrastructure (0-3 points)
**What it measures:** CI/CD pipeline complexity and features

**Signals detected:**
- Presence of `.github/workflows` directory
- Workflow file count and content analysis
- Features: testing, linting, deployment, security scanning, multi-stage jobs, caching

**Scoring:**
- 0 pts: No CI/CD
- 1 pt: Basic (1 feature, e.g., just tests)
- 2 pts: Intermediate (2-3 features)
- 3 pts: Advanced (4+ features, multi-stage)

#### 3. Testing Ratio (0-2.5 points)
**What it measures:** Test file coverage vs source files

**Signals detected:**
- Test directories (test/, spec/, __tests__/)
- Test file patterns (*.test.ts, *.spec.js, *_test.py)
- Test frameworks (Jest, Vitest, pytest, Mocha, Cypress, Playwright)
- Source file count (excluding node_modules, dist, build)

**Scoring:**
- 0.5 pts: Has test directory
- 0.5 pts: Test framework detected
- 0.25-1.5 pts: Testing ratio (0.1-0.8+ coverage)
- Max: 2.5 points

**Formula:** `testing_ratio = test_files / source_files`

#### 4. Refactor Signal (0-1.5 points)
**What it measures:** Technical debt management (deletions vs additions)

**Signals detected:**
- Last 30 days of commits with full stats
- Net lines changed (additions - deletions)
- Commits with net deletions (more deletions than additions)
- Refactor ratio (deletions / additions)

**Categories:**
- **Technical Debt Management** (1.5 pts): Net negative lines OR refactor ratio > 0.7 OR 30%+ commits are cleanup
- **Balanced** (1.0 pt): Normal development, some refactoring
- **Feature Bloat** (0.5 pt): Rapid growth without cleanup (ratio < 0.2, net > 1000 lines)

#### 5. Documentation Depth (0-1 point)
**What it measures:** README quality and additional docs

**Signals detected:**
- README.md existence and length
- Key sections: Setup, Architecture, API Reference, Contributing, Testing, Deployment
- Additional docs (docs/, CONTRIBUTING.md, ARCHITECTURE.md)

**Scoring:**
- 0.2 pts: Has README
- 0.2 pts: README > 500 chars
- 0.1 pts: README > 2000 chars
- 0.1 pts per section (up to 0.6 pts)
- 0.2 pts: Additional doc files
- Max: 1.0 point

### Overall Scoring

**Total Score:** Sum of all dimensions (0-10 scale)

**Grades:**
- A+ (9.5-10): Elite engineering practices
- A (8.5-9.4): Excellent quality
- B+ (7.5-8.4): Strong practices
- B (6.5-7.4): Good quality
- C+ (5.5-6.4): Adequate
- C (4.5-5.4): Basic practices
- D (3.5-4.4): Minimal practices
- F (<3.5): Early stage/prototype

**Categories & Badges:**
- 8.5+: Production Ready → "Clean Architect"
- 7-8.4: Professional → "Quality Focused"
- 5-6.9: Growing → "Active Builder"
- 3-4.9: Hobby Project → "Learning"
- <3: Early Stage → "Quick Prototype"

## Database Schema

```sql
CREATE TABLE engineering_rigor_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,
  rigor_metrics JSONB NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, repository_url)
);
```

**Cache TTL:** 24 hours

## Setup Instructions

### 1. Apply Database Migration

Run the migration file in Supabase SQL Editor:
```bash
supabase/migrations/20260224_engineering_rigor_cache.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of migration file
3. Execute SQL

### 2. Verify RLS Policies

Ensure Row Level Security is enabled with policies:
- Users can only view/modify their own engineering rigor cache
- Automatic on insert: `auth.uid() = user_id`

### 3. Test the Feature

1. Navigate to any project case study page
2. The Dual-Pulse card should appear below the Impact Metrics section
3. Click "Refresh" to force recalculation
4. Click "View Detailed Breakdown" to see dimension scores

## API Usage

### Fetch Engineering Rigor Metrics

```typescript
// Client-side
const response = await fetch(`/api/engineering-rigor/${encodeURIComponent(repositoryUrl)}`)
const { success, data, cached } = await response.json()

// data: EngineeringRigorMetrics
```

### Force Refresh

```typescript
const response = await fetch(
  `/api/engineering-rigor/${encodeURIComponent(repositoryUrl)}?refresh=true`
)
```

### Server-side Action

```typescript
import { calculateRepositoryRigor } from '@/features/engineering-rigor'

const result = await calculateRepositoryRigor(repositoryUrl, forceRefresh)
if (result.success) {
  const metrics: EngineeringRigorMetrics = result.data
}
```

## UI Components

### DualPulseCard

```tsx
import { DualPulseCard } from '@/features/engineering-rigor'

<DualPulseCard
  repositoryUrl="https://github.com/owner/repo"
  velocityMetrics={optionalVelocityData}
  rigorMetrics={optionalRigorData}
/>
```

**Features:**
- Fetches data automatically if not provided
- Refresh button for force recalculation
- Collapsible detailed breakdown
- AI-readable context summaries
- Visual score displays with gradients

## Key Signals for AI

The system generates concise signals for AI systems:

**Velocity Pulse:**
- Score: 8.5/10 (Very High)
- Key Signal: "4.4 Commits/Day"
- Badge: "Intense Sprint"
- AI Context: "High execution momentum, ideal for rapid prototyping"

**Engineering Rigor:**
- Score: 8.5/10 (Production Ready)
- Key Signals: ["92% Test Coverage", "CI/CD Verified", "Active Refactoring"]
- Badge: "Clean Architect"
- AI Context: "Production Ready project with A grade. 92% Test Coverage, CI/CD Verified. Technical Debt Management."

## Improvements Suggestions

The system automatically generates improvement suggestions:

- "Add more unit tests to increase coverage"
- "Set up CI/CD pipeline (GitHub Actions)"
- "Add linting and formatting configuration"
- "Add Setup, Architecture, and API sections to README"
- "Consider refactoring to reduce codebase complexity"

## GitHub API Requirements

**Data fetched:**
1. Repository tree (recursive)
2. Workflow files (.github/workflows/*.yml)
3. Last 30 days of commits with stats
4. README content

**Rate limits:**
- Authenticated: 5,000 requests/hour
- Unauthenticated: 60 requests/hour

**Caching:** All data cached for 24 hours to minimize API calls

## Future Enhancements

1. **Dependency Security Score**
   - Detect outdated dependencies
   - Check for security advisories
   - Use Snyk/npm audit data

2. **Code Coverage Integration**
   - Parse coverage reports from CI
   - Display percentage alongside testing ratio

3. **Performance Metrics**
   - Bundle size tracking
   - Lighthouse scores for web projects
   - Load time analysis

4. **Contributor Metrics**
   - Number of contributors
   - Pull request review quality
   - Community engagement

5. **Documentation Quality**
   - API documentation completeness
   - Code comment density
   - Example code presence

## Troubleshooting

### No metrics showing

1. Check if GitHub token is configured (for private repos)
2. Verify repository URL format: `https://github.com/owner/repo`
3. Check browser console for API errors
4. Ensure database migration has been applied

### Scores seem incorrect

1. Force refresh with the refresh button
2. Check if repository has recent commits (last 30 days)
3. Verify test files are in standard locations
4. Ensure CI workflow files are in `.github/workflows/`

### Cache not updating

- Cache TTL is 24 hours
- Use `?refresh=true` to force recalculation
- Check `engineering_rigor_cache` table for `cached_at` timestamp

## Credits

Designed and implemented as part of the Aura portfolio platform to provide comprehensive project quality assessment for software engineers and hiring managers.
