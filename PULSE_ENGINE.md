# Pulse Engine - Drive & Velocity Tracker

## Overview

The **Pulse Engine** proves candidates are **"High-Velocity" builders** who don't stall mid-project. It tracks two critical metrics:

1. **Velocity** - Development speed and intensity (commit frequency × code complexity)
2. **Uptime** - Whether the project is actually live (for deployed projects)

This engine is designed to be read by both **Humans** (via visual dashboards) and **AI agents** (via structured JSON-LD data).

---

## Features

### 1. Semantic Velocity Tracker

**What It Does:**
- Fetches commits from GitHub API with detailed diff stats
- Calculates a "velocity score" (0-10 scale) based on:
  - Commit frequency over 30 days
  - Lines of code changed (additions + deletions)
  - Complexity factor (logarithmic scale to prevent gaming)
  - Days active (days with at least one commit)

**Anti-Gaming Measures:**
- **Filters boilerplate commits**: Initial commits, package-lock.json, merge commits, etc.
- **Complexity factor**: Uses logarithmic scale so 100 tiny commits ≠ one substantial commit
- **Days active**: Velocity = (commits × complexity) / days active, not just total commits

**Visual Output:**
- Velocity score badge (color-coded: green = high, yellow = medium, gray = low)
- Trend indicator (📈 increasing, ➡️ stable, 📉 decreasing)
- Activity heatmap (GitHub-style contribution graph)
- Raw stats: commits, avg commits/day, lines changed

### 2. Uptime Monitor

**What It Does:**
- Performs HEAD requests to project URL (if deployed)
- Retries 3 times before marking as "Offline" (handles cold starts on free tiers)
- Measures average latency
- Calculates uptime percentage

**Why It Matters:**
- Proves the project isn't just code—it's **actually live**
- Shows professional deployment practices
- Demonstrates reliability

**Visual Output:**
- Live/Offline badge (● Live in green, ○ Offline in red)
- Uptime percentage (e.g., 99.8%)
- Average latency (e.g., 240ms)
- Last verified timestamp

---

## Velocity Calculation Formula

```
Velocity Score = (Total Commits × Complexity Factor) / Days Active

Where:
- Total Commits = Real commits (filters out boilerplate)
- Complexity Factor = log₁₀(avg lines changed per commit + 1) / 2.7
- Days Active = Number of days with at least one commit
```

**Score Ranges:**
- **0-3**: Low Velocity (occasional commits)
- **3-6**: Medium Velocity (steady progress)
- **6-8**: High Velocity (consistent daily work)
- **8-10**: Very High Velocity (intense development)

**Reference Point:**
- 2+ substantial commits/day with moderate complexity = score of 7-8

---

## JSON-LD Output (For AI Agents)

Every project exposes structured pulse metrics at `/api/pulse/:repository`:

```json
{
  "project_id": "quorum-ai-123",
  "repository_url": "crystaljin1001/Quorum-AI",
  "metrics": {
    "velocity": {
      "score": 8.4,
      "label": "Very High Velocity",
      "trend": "increasing",
      "raw_data": {
        "commits_30d": 42,
        "avg_commits_per_day": 3.8,
        "total_additions": 12453,
        "total_deletions": 3201,
        "net_lines_changed": 15654,
        "days_active": 11,
        "complexity_factor": 1.2
      }
    },
    "uptime": {
      "current_status": "Live",
      "uptime_percentage": 99.8,
      "avg_latency": "240ms",
      "last_verified": "2026-02-21T20:30:00Z",
      "checks_successful": 1,
      "checks_total": 1
    }
  },
  "verification_badge": "Verified by Aura Agent",
  "last_updated": "2026-02-21T20:30:00Z"
}
```

---

## Implementation Details

### Database

**Table:** `pulse_metrics_cache`
- Stores calculated metrics with 24-hour TTL
- Prevents hitting GitHub API rate limits
- Schema:
  ```sql
  - user_id (UUID)
  - repository_url (TEXT)
  - metrics (JSONB) -- Full pulse metrics object
  - cached_at (TIMESTAMP)
  ```

### API Routes

1. **GET /api/pulse/:repository**
   - Returns full pulse metrics (velocity + uptime)
   - Caches results for 24 hours
   - Example: `/api/pulse/crystaljin1001%2FQuorum-AI`

2. **GET /api/pulse/:repository/heatmap?days=30**
   - Returns activity heatmap data
   - Array of daily stats (commits, additions, deletions, intensity)

### Components

1. **PulseMetricsCard** - Main dashboard card showing all metrics
2. **VelocityBadge** - Color-coded velocity score badge
3. **UptimeBadge** - Live/Offline status badge
4. **VelocityHeatmap** - GitHub-style activity graph

### Server Actions

1. **calculatePulseMetrics()** - Main calculation engine
2. **getVelocityHeatmap()** - Generate heatmap data

---

## Rate Limiting Strategy

**GitHub API Limits:**
- 5,000 requests/hour for authenticated users
- Each pulse calculation uses ~10-15 API calls (depends on commit count)

**Our Strategy:**
- Cache results for **24 hours**
- Only recalculate when:
  1. Cache is older than 24 hours
  2. User explicitly refreshes
- Display "Last updated" timestamp to users

---

## Anti-Gaming Measures

### 1. Boilerplate Detection

Filters out commits with keywords:
- "initial commit", "generated", "scaffolded"
- "npm install", "yarn add", "package-lock"
- "merge branch", "merge pull request"
- "auto-generated", "prettier", "eslint"

Also filters:
- Huge commits (>5000 lines) with tiny messages (<30 chars)
- Only deletions (>100 deletions, <10 additions)

### 2. Complexity Factor Logarithmic Scale

```
avg_lines_per_commit = total_lines / commits
complexity_factor = log₁₀(avg_lines_per_commit + 1) / 2.7
```

This means:
- 1 commit with 10,000 lines ≠ 100 commits with 100 lines each
- Sweet spot: 100-500 lines per commit = factor of 1.0
- Capped at 2.0 to prevent extreme outliers

### 3. Days Active Normalization

```
velocity = (commits × complexity) / days_active
```

- 100 commits in 1 day = score of 10 (suspicious)
- 100 commits in 10 days = score of 10 (realistic)
- 100 commits in 100 days = score of 1 (slow)

---

## Cold Start Handling (Uptime Checks)

**Problem:** Free-tier hosting (Render, Heroku, etc.) "sleeps" servers after inactivity.

**Solution:**
- Try **3 times** before marking as "Offline"
- Wait **2 seconds** between retries
- Timeout after **15 seconds** per request

**Code:**
```typescript
async function pingUrlWithRetries(url: string, maxRetries = 3, retryDelay = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(15000)
      })

      if (response.status >= 200 && response.status < 400) {
        return { success: true, latency: Date.now() - startTime }
      }
    } catch (error) {
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }
  return { success: false }
}
```

---

## Trend Calculation

**How It Works:**
- Compare first half of 30-day window vs. second half
- Calculate avg commits/day for each half
- Determine trend:
  - **Increasing**: Second half > First half × 1.2
  - **Decreasing**: Second half < First half × 0.8
  - **Stable**: Otherwise

**Why It Matters:**
- Shows if builder is ramping up (good!)
- Or burning out (warning sign)
- Or consistently steady (reliable)

---

## Integration Points

### Case Study Page

The Pulse Engine appears on every project case study:

```tsx
<PulseMetricsCard repositoryUrl="crystaljin1001/Quorum-AI" />
```

Location: Between "Impact Metrics" and "Architecture Diagram" sections

### Portfolio Landing Page

Can be integrated to show aggregate velocity across all projects:

```tsx
<AggregateVelocityBadge projects={userProjects} />
```

---

## Usage for Recruiters/HR

### What They See

1. **Velocity Badge**: "Very High Velocity (8.4/10)"
2. **Activity Heatmap**: Visual proof of consistent work
3. **Uptime Status**: ● Live (99.8% uptime, 240ms latency)
4. **Trend**: 📈 Increasing (ramping up)

### What It Proves

- **High velocity**: Candidate ships code fast
- **Consistency**: Works regularly (not cramming at deadlines)
- **Professionalism**: Deploys projects (not just local demos)
- **Reliability**: Site actually works (not 404s)

---

## Future Enhancements

### Phase 2 (Optional)

1. **Multi-week trends**: Track velocity over 3 months, show burndown/ramp-up
2. **Peer comparison**: "Top 10% velocity for React projects"
3. **Time-of-day analysis**: "Most productive 2-6pm EST"
4. **Collaboration score**: Separate solo vs. team contributions

### Phase 3 (Advanced)

1. **AI code quality scoring**: Distinguish between "good" and "copy-paste" commits
2. **Deployment frequency**: Track how often features ship to production
3. **Bug fix velocity**: Time from issue creation → PR merge → deploy
4. **Documentation velocity**: README updates, inline comments added

---

## Testing

### Manual Test Flow

1. **Add a project** with recent commits
2. **Navigate to case study page**
3. **Scroll to "Development Pulse" section**
4. **Verify**:
   - Velocity score displayed
   - Heatmap shows daily activity
   - Trend indicator matches reality
   - (If deployed) Uptime status shows "Live"

### Debug Endpoints

- `/api/pulse/:repository` - View raw JSON metrics
- `/api/pulse/:repository/heatmap?days=30` - View heatmap data

### Cache Verification

Check `pulse_metrics_cache` table:
```sql
SELECT repository_url, cached_at, metrics->>'last_updated'
FROM pulse_metrics_cache
WHERE user_id = 'YOUR_USER_ID';
```

---

## Performance

**Average Calculation Time:**
- 30-day window with ~50 commits: **2-5 seconds**
- Cached response: **<100ms**

**GitHub API Usage:**
- Initial calculation: ~10-15 requests
- Cached for 24 hours: 0 additional requests

**Uptime Check:**
- Single ping: **200-500ms**
- With retries (cold start): **5-10 seconds**

---

## Troubleshooting

### "Failed to load pulse metrics"

**Causes:**
1. GitHub token not configured
2. Repository not accessible
3. Rate limit exceeded

**Fix:** Check `/dashboard/settings` → GitHub Token

### Velocity score seems wrong

**Check:**
1. Are there many boilerplate commits?
2. Is this a new project (<10 commits)?
3. Are commits mostly deletions (cleanup)?

**Solution:** Velocity reflects *productive* work, not just commit count.

### Uptime shows "Offline" but site works

**Causes:**
1. Site on free tier (cold start took >15s)
2. Site requires authentication
3. CORS blocking HEAD requests

**Fix:** Increase timeout or use direct URL checks

---

## Credits

Inspired by:
- GitHub contribution graphs
- Vercel deployment velocity metrics
- Linear cycle time analytics
