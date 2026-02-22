# Case Study View - How It Works

This guide explains how the new Case Study View generates content and what data it needs.

## 📊 Health Score Calculation

The Product Health Score is calculated from **impact metrics** stored in the `impact_cache` table.

### Formula

```typescript
Health Score (0-100) =
  Issues Resolved (max 25 points) +
  Performance Optimizations (max 20 points) +
  Code Quality (max 20 points) +
  Features Delivered (max 20 points) +
  User Adoption (max 15 points)
```

### Grading Scale
- **90-100**: Grade A (Green)
- **80-89**: Grade B (Green)
- **70-79**: Grade C (Yellow)
- **60-69**: Grade D (Yellow)
- **0-59**: Grade F (Red)

### Data Source
Impact metrics come from analyzing your GitHub repository:
- **Issues Resolved**: Closed issues with labels like "bug", "critical", "security"
- **Performance**: Merged PRs with keywords like "optimize", "performance", "cache"
- **Code Quality**: Issues/PRs with "refactor", "cleanup", "tech-debt"
- **Features**: Issues/PRs with "feature", "enhancement", "new"
- **User Adoption**: Formula: `stars + (forks × 2)`

**Important**: If your project has **0 stars and 0 forks**, the impact cache likely has no data, resulting in **Health Score = 0/100 (F grade)**.

---

## 🎨 Context Blocks Generation

Context Blocks are 3 AI-generated sentences that tell your project's story:

1. **Problem Context** - What technical challenge does this solve?
2. **Your Solution** - How does your project solve it?
3. **Impact Delivered** - What measurable results did it achieve?

### Generation Process

```
User visits /portfolio/owner-repo
  ↓
Check if context blocks exist in database
  ↓ (if not)
Fetch README from GitHub API
  ↓
Send to OpenAI GPT-4o-mini with README + description + tech stack
  ↓
Parse 3-sentence response
  ↓
Save to portfolio_context_blocks table
  ↓
Display on page
```

### Requirements
- ✅ **README.md** exists in GitHub repository (minimum 100 characters)
- ✅ **Impact metrics** cached (proves it's a real project)
- ✅ **OpenAI API key** set in `.env.local`

### Why It's Not Showing
If you don't see Context Blocks, check:

1. **No impact data**
   ```
   Status: 0 stars, 0 forks
   Impact cache: empty
   Result: Context block generation skipped
   ```

2. **No README**
   ```
   GitHub API: 404 Not Found
   Result: Nothing to send to AI
   ```

3. **OpenAI API key missing**
   ```
   Error: OPENAI_API_KEY environment variable is not set
   Result: AI generation fails
   ```

---

## 🏗️ Architecture Diagram Generation

Architecture diagrams are generated using **Mermaid.js** syntax via OpenAI.

### Generation Process

```
User visits case study page
  ↓
Check if diagram exists
  ↓ (if not)
Fetch README from GitHub API
  ↓
Send to OpenAI: "Create Mermaid diagram for this project"
  ↓
Receive Mermaid syntax (flowchart, sequence, or class diagram)
  ↓
Render using Mermaid.js client-side
  ↓
Display with zoom controls and fullscreen
```

### Requirements
- ✅ **README.md** from GitHub (describes architecture)
- ✅ **Impact metrics** (proves it's worth diagramming)
- ✅ **OpenAI API key** set

### Diagram Types
OpenAI chooses the best type:
- **Flowchart** - Application flow, data pipelines
- **Sequence Diagram** - API interactions, user flows
- **Class Diagram** - Data models, object relationships
- **Architecture Diagram** - System components, microservices

---

## 📝 Project Descriptions

### Current Behavior
Descriptions come from your **GitHub repository description** (the short text under the repo name on GitHub).

### Data Flow
```
GitHub Repository Description
  ↓
Stored in impact_cache table
  ↓
Used in RepoProductCard, HeroSection, Context Blocks
```

### How to Update Descriptions

**Option 1: Update on GitHub** (Recommended)
1. Go to your GitHub repository
2. Click ⚙️ Settings
3. Edit "Description" field
4. Wait 24 hours for impact cache to refresh
5. Or force refresh by removing and re-adding the repo

**Option 2: Custom Descriptions** (Future Feature)
We should add a feature to override GitHub descriptions with custom text.

---

## 🔧 Troubleshooting

### "Impact Data Not Available Yet" Message

This means your project has no cached impact metrics. To fix:

1. **Go to Repositories Page**
   ```
   /repositories
   ```

2. **Add GitHub Token**
   - Click "Add GitHub Token"
   - Create a token at https://github.com/settings/tokens
   - Required scopes: `repo` (for private repos) or just `public_repo`
   - Paste token and save

3. **Wait for Impact Calculation**
   - Impact metrics refresh every 24 hours
   - Check `impact_cache` table in Supabase to see if data exists

4. **Manually Trigger Refresh** (if needed)
   - Remove the repository from tracking
   - Re-add it
   - Impact calculation runs immediately

### Context Blocks Not Generating

**Debug Steps:**

1. Check server logs for errors:
   ```bash
   npm run dev
   ```

2. Look for these log messages:
   ```
   📊 Case Study Debug: { hasMetrics: false, ... }
   ⚠️ README too short or not found, skipping context block generation
   ✅ Fetched README, generating context blocks...
   ❌ Context block generation failed: ...
   ```

3. Verify OpenAI API key:
   ```bash
   # In .env.local
   OPENAI_API_KEY=sk-...
   ```

4. Check README exists:
   ```bash
   curl https://api.github.com/repos/OWNER/REPO/readme
   ```

### Architecture Diagram Not Showing

Same requirements as Context Blocks:
- Impact metrics exist
- README is available
- OpenAI API key is set

---

## 🎯 Quick Fix Checklist

To see Context Blocks and Architecture Diagrams:

- [ ] Repository has a description on GitHub
- [ ] Repository has a README.md file (100+ characters)
- [ ] Repository is public or you have a GitHub token with `repo` access
- [ ] Impact metrics are cached (check `/repositories` page)
- [ ] OpenAI API key is set in `.env.local`
- [ ] Project has real activity (stars, forks, commits, issues)

---

## 📊 Example: Working vs Not Working

### ✅ Working Example
```
Repository: facebook/react
Stars: 200k+
Forks: 40k+
Description: "The library for web and native user interfaces"
README: Comprehensive 5000+ word README
Impact Cache: Full metrics (issues, PRs, performance data)
OpenAI Key: Set

Result:
- Health Score: 98/100 (Grade A)
- Context Blocks: Generated and cached
- Architecture Diagram: Generated
```

### ❌ Not Working Example
```
Repository: you/quorum-ai
Stars: 0
Forks: 0
Description: None
README: Exists but not fetched
Impact Cache: Empty (no data)
OpenAI Key: Set

Result:
- Health Score: 0/100 (Grade F)
- Context Blocks: Not generated (no impact data)
- Architecture Diagram: Not generated (no impact data)
- Shows: "Impact Data Not Available Yet" message
```

---

## 🚀 Next Steps

1. **Add GitHub Token** at `/repositories`
2. **Update Repository Descriptions** on GitHub
3. **Wait for Impact Calculation** (24 hours max)
4. **Visit Case Study Page** to see generated content

Once impact metrics are cached, Context Blocks and Architecture Diagrams will auto-generate on your first visit to the case study page.
