# Design Proposal: Adaptive Project Scoring System

## Problem Statement

The current "Health Score" system has fundamental flaws:

### Issues with Current Design

1. **Assumes Open Source Workflow**
   - Requires GitHub Issues for bug tracking
   - Requires PRs from multiple contributors
   - Penalizes solo developers

2. **Confuses Popularity with Quality**
   - Stars/forks measure virality, not code quality
   - New projects always score 0/100 (F grade)
   - Private projects can never improve score

3. **Not Adaptable**
   - Personal projects: No issues/PRs → 0/100
   - Prototypes: No stars → 0/100
   - Contract work: Private → 0/100
   - Side projects: Solo dev → 0/100

4. **Demotivating**
   - Users see "F grade" on projects they're proud of
   - Scoring feels arbitrary and unfair
   - Doesn't reflect actual engineering quality

---

## Proposed Solution: Three-Tier Scoring System

### Tier 1: Project Completeness Score (Always Available)

**Measures:** How well-documented and production-ready the project is

```typescript
Completeness Score (0-100):

📚 Documentation (30 points)
├─ Has README.md (10 pts)
├─ README >500 characters (10 pts)
└─ Has repository description (10 pts)

🔧 Code Quality (30 points)
├─ Has tests directory (10 pts)
├─ Has CI/CD (GitHub Actions) (10 pts)
└─ Active development (commit in last 6 months) (10 pts)

🚀 Production Readiness (25 points)
├─ Has LICENSE file (10 pts)
├─ Has .gitignore (5 pts)
└─ Has tagged releases (10 pts)

🔒 Security (15 points)
├─ Has .env.example or security doc (10 pts)
└─ No hardcoded secrets (5 pts)
```

**Grading:**
- 90-100: A (Excellent)
- 80-89: B (Professional)
- 70-79: C (Good)
- 60-69: D (Needs Work)
- 0-59: F (Incomplete)

**Benefits:**
- ✅ Works for solo projects
- ✅ Works for new projects
- ✅ Works for private projects
- ✅ Measures real quality signals
- ✅ Everyone can achieve high scores

---

### Tier 2: Community Impact (Optional, for OSS)

**Only shown if project has community engagement**

```typescript
Community Impact:

👥 Adoption
├─ Stargazers
├─ Forks
└─ Watchers

🤝 Collaboration
├─ Contributors count
├─ Open/closed issues
└─ Merged PRs

📈 Momentum
├─ Commit frequency
├─ Recent releases
└─ Growth trend
```

**Display:**
- Don't calculate a score
- Show raw metrics: "1.2k stars, 45 contributors, 230 issues resolved"
- Add context: "Top 5% of TypeScript projects" (if applicable)

---

### Tier 3: Manual Impact Input (User-Provided)

**For projects without measurable GitHub activity**

```typescript
interface ManualImpact {
  // Required
  problem: string  // "What problem does this solve?" (150-500 chars)
  solution: string // "How does your solution work?" (150-500 chars)
  impact: string   // "What results did you achieve?" (150-500 chars)

  // Optional
  metrics?: {
    usersImpacted?: number
    timeSaved?: string  // "Saves 2 hours/week per user"
    costReduction?: string  // "Reduces AWS costs by $500/month"
    performanceGain?: string  // "50% faster than previous solution"
    revenue?: string  // "Generated $10k in first 3 months"
  }

  technologies: string[]  // ["React", "Node.js", "PostgreSQL"]
  challenges: string[]  // ["Real-time sync", "Data privacy", "Scalability"]
}
```

**UI Flow:**
1. If no GitHub activity, show: "Add Custom Impact"
2. User fills out form with project context
3. System generates Context Blocks from user input
4. Shows badge: "Self-Reported Impact" (to indicate it's not computed)

**Benefits:**
- ✅ Works for proprietary projects
- ✅ Works for client work (can't share metrics)
- ✅ Works for internal tools
- ✅ Lets users tell their story

---

## Adaptive Display Strategy

### Decision Tree

```
Has GitHub activity?
  ├─ YES: Show Completeness Score + Community Impact
  │   └─ High activity? → Show computed metrics
  │   └─ Low activity? → Show Completeness Score only
  │
  └─ NO: Prompt for Manual Impact Input
      └─ User provided? → Show custom impact story
      └─ Not provided? → Show README preview + tech stack
```

### UI Examples

#### Scenario 1: Popular Open Source Project
```
┌─────────────────────────────────┐
│ Completeness: 92/100 (A)       │
│ ✅ Excellent documentation      │
│ ✅ CI/CD, tests, releases      │
└─────────────────────────────────┘

Community Impact:
├─ 12.5k stars, 1.2k forks
├─ 145 contributors
└─ 450 issues resolved

Context Blocks:
[AI-generated from README]
```

#### Scenario 2: Personal Project (Low Activity)
```
┌─────────────────────────────────┐
│ Completeness: 75/100 (C)       │
│ ✅ Well documented              │
│ ⚠️ No tests detected            │
│ ⚠️ No CI/CD                     │
└─────────────────────────────────┘

Manual Impact:
"This tool automates my weekly reporting,
saving 3 hours every Friday. Used by my
team of 5 developers."

Metrics: 5 users, 15 hours/week saved
```

#### Scenario 3: New Project (No Data)
```
┌─────────────────────────────────┐
│ Completeness: 40/100 (F)       │
│ ⚠️ Add README documentation     │
│ ⚠️ Add tests                    │
│ ⚠️ Add CI/CD                    │
└─────────────────────────────────┘

💡 Improve Your Score:
1. Write a README explaining the project
2. Add a description to your GitHub repo
3. Set up GitHub Actions for CI/CD

[Add Custom Impact] button
```

---

## Implementation Plan

### Phase 1: Rename "Health Score" → "Completeness Score"
- Update scoring logic to measure documentation + readiness
- Remove dependency on stars/issues/PRs
- Show helpful improvement suggestions

### Phase 2: Add Manual Impact Input
- Create form for custom impact data
- Store in new `manual_impact` table
- Generate Context Blocks from user input

### Phase 3: Adaptive Display
- Show different UI based on available data
- Gracefully handle missing metrics
- Add "Improve Score" tips

### Phase 4: Optional Community Metrics
- Show community stats separately
- Don't penalize projects without stars
- Add comparison context (e.g., "Top 10% for Go projects")

---

## Database Schema Changes

```sql
-- New table for manual impact data
CREATE TABLE manual_project_impact (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repository_url TEXT NOT NULL,

  -- Core impact statement
  problem_statement TEXT NOT NULL,
  solution_description TEXT NOT NULL,
  impact_summary TEXT NOT NULL,

  -- Optional metrics
  users_impacted INTEGER,
  time_saved TEXT,
  cost_reduction TEXT,
  performance_gain TEXT,
  revenue_impact TEXT,

  -- Context
  technologies TEXT[], -- ["React", "Node.js"]
  challenges TEXT[],   -- ["Real-time sync", "Scalability"]

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, repository_url)
);

-- Add RLS policies
ALTER TABLE manual_project_impact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own manual impact"
  ON manual_project_impact
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## API Changes

### New Server Action: `saveManualImpact`

```typescript
export async function saveManualImpact(
  repositoryUrl: string,
  data: ManualImpact
): Promise<ApiResponse<void>> {
  // Validate input
  // Store in database
  // Regenerate Context Blocks from manual input
}
```

### Update: `getCaseStudyData`

```typescript
// Check for manual impact first
const { data: manualImpact } = await supabase
  .from('manual_project_impact')
  .select('*')
  .eq('repository_url', repositoryUrl)
  .single()

if (manualImpact) {
  // Use manual impact for Context Blocks
  contextBlock = {
    problem: manualImpact.problem_statement,
    solution: manualImpact.solution_description,
    impact: manualImpact.impact_summary,
  }
}
```

---

## Benefits Summary

### For Users
- ✅ Fair scoring for all project types
- ✅ Control over their narrative
- ✅ Useful feedback on project quality
- ✅ Works for personal, private, and OSS projects

### For Platform
- ✅ More users can showcase work
- ✅ Less reliance on GitHub API
- ✅ Better user retention
- ✅ Differentiates from GitHub profile

---

## Open Questions

1. **Should we keep "Health Score" terminology?**
   - Pro: Familiar term
   - Con: Implies something is "sick"
   - Proposal: Use "Completeness Score" or "Quality Score"

2. **How to prevent fake manual impact data?**
   - Add badge: "Self-Reported Impact"
   - Option: Allow viewers to flag suspicious claims
   - Trust users to be honest (it's their portfolio)

3. **Should community metrics affect Completeness Score?**
   - Proposal: NO - keep them separate
   - Completeness = objective quality signals
   - Community = popularity/adoption

4. **How to verify CI/CD, tests, etc?**
   - Check for `.github/workflows/*.yml` files
   - Check for common test directories (`test/`, `__tests__/`, `spec/`)
   - Check for test dependencies in `package.json`, `requirements.txt`, etc.

---

## Rollout Strategy

### Week 1: Update Scoring Logic
- Implement Completeness Score calculation
- Update UI to show new score
- Keep old score in database for comparison

### Week 2: Add Manual Impact Input
- Create form UI
- Create database table
- Integrate with Context Block generation

### Week 3: Polish & Feedback
- A/B test with users
- Gather feedback on new system
- Iterate based on usage data

### Week 4: Launch
- Migrate all users to new system
- Remove old "Health Score" code
- Write blog post explaining changes

---

## Success Metrics

1. **User Engagement**
   - % of users who complete manual impact form
   - % of users who improve their Completeness Score

2. **Score Distribution**
   - Average score should be 60-75 (not 0-20 like current system)
   - 20% of users should achieve A grade (90+)

3. **Retention**
   - Do users return after seeing fair scores?
   - Do users share portfolio links more often?

---

## Conclusion

The current "Health Score" system is fundamentally broken for most real-world use cases. By introducing a three-tier system (Completeness + Community + Manual), we can:

1. **Serve everyone** - from OSS maintainers to solo devs
2. **Measure quality** - not just popularity
3. **Empower users** - let them tell their story
4. **Provide value** - actionable feedback on project quality

This makes Aura useful for **all builders**, not just those with viral open-source projects.
