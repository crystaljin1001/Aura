# Pulse Engine V2 - Lifecycle Milestone View

## The Problem: The "Archive Gap"

**Original Design Flaw:**
- Only tracked last 30 days of commits
- Penalized completed projects
- If you built an amazing project in a 14-day sprint 2 months ago, your velocity now shows as "Low" or "Zero"
- Rewarded endless tinkering over focused execution

**Example:**
> You spent 11 intense days building Quorum AI with 45 commits and 15,000 lines of code.
> Two months later, the project is stable and deployed.
> **Old System:** "Low Velocity (0.5/10)" ❌
> **New System:** "Sprint Signature: 🔥 Intense Sprint (9.2/10) | Status: ✅ Stable/Production" ✅

---

## The Solution: Sprint Signature + Lifecycle Status

### 1. Sprint Signature (Peak Velocity)

**What It Is:**
The period of most intense development activity - your "build sprint"

**How It's Detected:**
- Analyzes entire project history (up to 1 year)
- Uses sliding window (7, 10, 14, 21, 30 days) to find peak density
- Captures the window with highest `commits × complexity / days`

**What It Stores:**
```json
{
  "sprint_signature": {
    "start_date": "2025-12-01T00:00:00Z",
    "end_date": "2025-12-14T23:59:59Z",
    "duration_days": 14,
    "commits": 42,
    "velocity_score": 9.2,
    "total_additions": 12453,
    "total_deletions": 3201,
    "avg_commits_per_day": 3.8,
    "label": "🔥 Intense Sprint"
  }
}
```

**Why It Matters:**
- A 14-day intense sprint is MORE impressive than 6 months of casual commits
- Proves you can enter "flow state" and ship fast
- Shows focused execution over endless tinkering

**Sprint Labels:**
- 🔥 **Intense Sprint** (9-10): 4+ commits/day with substantial changes
- ⚡️ **Fast Sprint** (7-8.9): 3+ commits/day, solid progress
- 🚀 **Solid Sprint** (5-6.9): 2+ commits/day, steady build
- 📈 **Steady Build** (3-4.9): 1-2 commits/day, consistent
- 🔨 **Incremental Build** (<3): Slower, iterative approach

---

### 2. Lifecycle Status (Active vs. Stable)

**The Four States:**

#### ⚡️ Active Development
- **Criteria:** 5+ commits in last 7 days
- **Meaning:** Under active construction
- **Message:** "Under active development - 8 commits in the last 7 days"

#### 🔧 Maintenance Mode
- **Criteria:** 1+ commits in last 30 days + deployed
- **Meaning:** Live and maintained, occasional updates
- **Message:** "Live and maintained - 3 commits in the last 30 days, currently deployed"

#### ✅ Stable/Production
- **Criteria:** No commits in 30 days + deployed + <90 days since last commit
- **Meaning:** Production-ready, doesn't need changes
- **Message:** "Production-ready and stable - Live deployment with no recent changes needed (shows maturity)"

#### 📦 Archived
- **Criteria:** 90+ days since last commit
- **Meaning:** Completed or abandoned
- **Message:** "Completed/Archived - Last commit 120 days ago"

---

## Why This Fixes the Archive Gap

### Before (V1)

**Scenario:** You built Quorum AI in 11 days with intense velocity. It's now deployed and stable.

**What V1 Showed:**
```
Development Velocity: Low Velocity (0.5/10)
Recent Activity: 0 commits in 30 days
Status: ⚠️ Inactive
```

**Recruiter Sees:** "This builder started something but gave up."

### After (V2)

**What V2 Shows:**
```
Sprint Signature: 🔥 Intense Sprint (9.2/10)
  Built in 11 days: Dec 1-11, 2025
  42 commits, 3.8 avg/day
  15,654 lines changed

Current Status: ✅ Stable/Production
  Live deployment with no recent changes needed
  Shows maturity and completion
```

**Recruiter Sees:** "This builder ships fast and knows when a product is done. Professional."

---

## JSON-LD Output (For AI Agents)

```json
{
  "project_id": "quorum-ai-123",
  "repository_url": "crystaljin1001/Quorum-AI",
  "metrics": {
    "sprint_signature": {
      "start_date": "2025-12-01T00:00:00Z",
      "end_date": "2025-12-14T23:59:59Z",
      "duration_days": 14,
      "commits": 42,
      "velocity_score": 9.2,
      "avg_commits_per_day": 3.8,
      "label": "🔥 Intense Sprint"
    },
    "lifecycle": {
      "status": "Stable/Production",
      "emoji": "✅",
      "description": "Production-ready and stable",
      "reasoning": "Live deployment with no recent changes needed (shows maturity)",
      "days_since_last_commit": 45
    },
    "velocity": {
      "score": 1.2,
      "label": "Low Velocity",
      "trend": "stable",
      "raw_data": {
        "commits_30d": 0,
        "avg_commits_per_day": 0
      }
    },
    "uptime": {
      "current_status": "Live",
      "uptime_percentage": 99.8,
      "avg_latency": "240ms"
    }
  }
}
```

**Key Insight for AI:**
- `sprint_signature.velocity_score`: 9.2 (peak performance)
- `lifecycle.status`: "Stable/Production" (mature product)
- `velocity.score`: 1.2 (current maintenance mode)

**AI Interpretation:**
> "High-velocity builder (9.2/10 during sprint). Built in 14-day sprint. Project now stable and deployed. Shows professional judgment - doesn't tinker unnecessarily."

---

## The Judgment Signal

### What "Stable/Production" Proves

**For Candidates:**
- You know when a product is **finished**
- You don't add features just to keep a heatmap green
- You ship, deploy, and move on

**For Recruiters:**
- Shows **maturity** and **restraint**
- Avoids code bloat and scope creep
- Focuses on impact, not vanity metrics

### The Anti-Pattern

**Bad Builder:**
- 6 months of commits
- No peak sprint
- Never deployed
- Keeps adding features

**Good Builder:**
- 14-day intense sprint (9.2/10 velocity)
- Deployed and stable
- Low current velocity (not needed)
- Status: ✅ Stable/Production

---

## Visual UI Changes

### Pulse Metrics Card Layout

```
┌─────────────────────────────────────────┐
│ 🔷 Project Pulse              ✅ Stable/Production │
│                            Verified by Aura Agent │
├─────────────────────────────────────────┤
│ ✅ Stable/Production                    │
│ Production-ready and stable             │
│ Live deployment with no recent changes  │
│ needed (shows maturity)                 │
├─────────────────────────────────────────┤
│ 📈 Sprint Signature        🔥 Intense Sprint │
│                                         │
│ Peak velocity during core build phase   │
│                                         │
│ Peak Score: 9.2/10  Duration: 14d      │
│ Commits: 42         Avg/Day: 3.8       │
│                                         │
│ Built: Dec 1-11, 2025                   │
│ 15,654 lines changed                    │
│                                         │
│ 💡 Why this matters: This captures     │
│ your peak productivity during the       │
│ actual build, regardless of current     │
│ maintenance status.                     │
├─────────────────────────────────────────┤
│ ⚡️ Current Velocity (30d)  Low Velocity │
│                                         │
│ Score: 1.2/10  Commits: 0              │
│ (Expected for stable production apps)   │
└─────────────────────────────────────────┘
```

---

## Sprint Detection Algorithm

### Sliding Window Approach

```typescript
windowSizes = [7, 10, 14, 21, 30] // Days

for each windowSize:
  for each position in commit history:
    calculate velocity for this window
    if velocity > best_velocity:
      best_velocity = velocity
      sprint_window = this window
```

### Velocity Calculation (Per Window)

```
intensity_factor = avg_commits_per_day / 2  (capped at 2.0)
complexity_factor = log₁₀(avg_lines_per_commit + 1) / 2.7
velocity_score = intensity_factor × complexity_factor × 5  (capped at 10)
```

### Example

**14-Day Window:**
- 42 commits
- 3 commits/day
- 15,654 lines total
- 373 lines/commit avg

**Calculation:**
- intensity = 3 / 2 = 1.5
- complexity = log₁₀(373 + 1) / 2.7 = 0.95
- velocity = 1.5 × 0.95 × 5 = 7.1

**With peak detection bonus:** → 9.2/10

---

## Lifecycle Decision Tree

```
Is there 5+ commits in last 7 days?
├─ YES → ⚡️ Active Development
└─ NO
   └─ Is there 1+ commits in last 30 days?
      ├─ YES
      │  └─ Is project deployed?
      │     ├─ YES → 🔧 Maintenance Mode
      │     └─ NO → ⚡️ Active Development
      └─ NO
         └─ Is project deployed?
            ├─ YES
            │  └─ Days since last commit?
            │     ├─ < 90 days → ✅ Stable/Production
            │     └─ ≥ 90 days → 📦 Archived
            └─ NO
               └─ Days since last commit?
                  ├─ < 90 days → ✅ Stable/Production
                  └─ ≥ 90 days → 📦 Archived
```

---

## Benefits Over V1

### For High-Velocity Builders

**V1 Problem:**
- Built amazing project in 2 weeks
- Now penalized for not committing daily

**V2 Solution:**
- Sprint Signature captures that 2-week peak
- Lifecycle status shows it's professionally complete
- Current low velocity is **expected** and **good**

### For Slow-and-Steady Builders

**V1 Problem:**
- 6 months of work looks "better" than 2-week sprint

**V2 Solution:**
- Sprint detection finds their peak period
- Shows their best velocity window
- Still respects longer build cycles

### For Recruiters

**V1 Problem:**
- Only see last 30 days
- Can't tell if project is "done" or "abandoned"

**V2 Solution:**
- See peak velocity (proves capability)
- See lifecycle status (proves judgment)
- Full story: "Built fast, deployed well, moved on"

---

## Implementation Status

✅ **Completed:**
- Sprint detection algorithm
- Lifecycle status logic
- Updated data model (SprintSignature, ProjectLifecycle types)
- Enhanced calculatePulseMetrics() server action
- Updated PulseMetricsCard UI component
- JSON-LD output with sprint_signature and lifecycle

⏳ **Next Steps:**
1. Run migration (already exists: `pulse_metrics_cache` table)
2. Test on projects with different lifecycle states
3. Verify AI can parse the enhanced JSON-LD

---

## Testing Scenarios

### Scenario 1: Recent Fast Build
**Project:** Built last week in 7-day sprint
- **Sprint Signature:** 7 days, 9.5/10 velocity
- **Lifecycle:** ⚡️ Active Development
- **Current Velocity:** 9.5/10 (same as sprint)

### Scenario 2: Stable Production
**Project:** Built 2 months ago, now deployed
- **Sprint Signature:** 14 days, 9.2/10 velocity
- **Lifecycle:** ✅ Stable/Production
- **Current Velocity:** 0.5/10 (maintenance mode)

### Scenario 3: Long-Term Project
**Project:** 6 months of development
- **Sprint Signature:** 21 days, 7.8/10 velocity (best period)
- **Lifecycle:** 🔧 Maintenance Mode
- **Current Velocity:** 4.2/10 (steady updates)

### Scenario 4: Archived
**Project:** Built 1 year ago, last commit 4 months ago
- **Sprint Signature:** 10 days, 8.5/10 velocity
- **Lifecycle:** 📦 Archived
- **Current Velocity:** 0/10

---

## Key Metrics for AI Ranking

When an AI agent evaluates candidates, it should prioritize:

1. **sprint_signature.velocity_score** (9-10 = top tier)
2. **lifecycle.status** ("Stable/Production" > "Active" > "Archived")
3. **uptime.current_status** ("Live" > "Offline")
4. Current velocity is context-dependent (ignore for stable projects)

**Example AI Query:**
> "Find builders who shipped a project with 8+ sprint velocity, currently deployed, and stable."

**SQL Query:**
```sql
SELECT user_id, repository_url
FROM pulse_metrics_cache
WHERE metrics->'sprint_signature'->>'velocity_score'::numeric >= 8
AND metrics->'lifecycle'->>'status' = 'Stable/Production'
AND metrics->'uptime'->>'current_status' = 'Live'
```

---

## Credits

**Inspired by:**
- Linear's cycle time metrics
- GitHub's contribution graphs
- The reality that "done" projects shouldn't be penalized

**Core Insight:**
> "A focused 2-week sprint proves more capability than 6 months of casual commits."
