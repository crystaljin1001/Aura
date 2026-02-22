# Debug: Why Impact Data Is Missing

## Quick Fix - Try This First! 🚀

1. **Go to your Dashboard**: http://localhost:3000/dashboard
2. **Click "Refresh Impact Data"** button (top right)
3. Wait for "✅ Impact data refreshed successfully!"
4. **Reload the page** or visit a case study

This will force-fetch impact data from GitHub for all your repositories.

---

## What's Happening

Your debug log shows:
```
📊 Case Study Debug: {
  repository: 'crystaljin1001/Quorum-AI',
  hasMetrics: false,           ← No impact data cached
  healthScore: 0,              ← 0 because no metrics
  hasDescription: false,       ← No description from GitHub
  hasContextBlock: false       ← Can't generate without metrics
}
```

### Root Cause

The `impact_cache` table has no data for Quorum-AI. This means:
1. ✅ Repository exists in `user_repositories` table
2. ✅ GitHub token is stored
3. ❌ Impact data hasn't been fetched from GitHub yet

---

## Why This Happens

### Scenario 1: First Time Setup
- You added the repository recently
- You haven't visited the homepage `/` since adding it
- The homepage automatically fetches impact data, but only when you visit it

### Scenario 2: Private Repository
- Quorum-AI might be a private repository
- Your GitHub token needs `repo` scope (not just `public_repo`)
- Without proper permissions, the fetch silently fails

### Scenario 3: GitHub API Rate Limit
- If you hit GitHub's rate limit (5000 requests/hour), fetches will fail
- The error is logged server-side but not shown to users

---

## Manual Debugging (If Button Doesn't Work)

### Step 1: Check if Repository Is in Database

Run this SQL in Supabase:

```sql
SELECT * FROM user_repositories
WHERE repo_name = 'Quorum-AI'
AND repo_owner = 'crystaljin1001';
```

**Expected Result**: Should return 1 row with `id`, `user_id`, `repo_owner`, `repo_name`, `added_at`

**If Empty**: The repository wasn't added properly. Go to `/dashboard` and re-add it.

---

### Step 2: Check if Impact Data Is Cached

Run this SQL in Supabase:

```sql
SELECT
  repo_full_name,
  cached_at,
  expires_at,
  impact_metrics,
  repo_data->>'description' as description,
  repo_data->>'stargazers_count' as stars
FROM impact_cache
WHERE repo_full_name = 'crystaljin1001/Quorum-AI';
```

**Expected Result**: Should return 1 row with impact metrics

**If Empty**: Impact data hasn't been fetched yet. Continue to Step 3.

---

### Step 3: Check GitHub Token Permissions

Run this SQL in Supabase:

```sql
SELECT
  token_last_four,
  created_at,
  updated_at
FROM github_tokens
WHERE user_id = auth.uid();
```

**Expected Result**: Should return your GitHub token (last 4 characters only)

**If Empty**: Token not stored. Go to `/repositories` and add it.

**If Exists**: Verify the token has the right scope on GitHub:
1. Go to https://github.com/settings/tokens
2. Find your token
3. Check scopes: `repo` (for private repos) or `public_repo` (for public only)

---

### Step 4: Check Server Logs for Errors

Look at your terminal where `npm run dev` is running. Search for errors like:

```bash
# GitHub API errors
Error fetching repository: 404 Not Found
Error fetching repository: 401 Unauthorized
Error fetching repository: 403 Rate limit exceeded

# Database errors
Failed to store impact data: ...
Error inserting into impact_cache: ...
```

If you see errors, that explains why impact data isn't being cached.

---

## Expected Behavior After Fix

Once impact data is cached:

1. **Health Score**: Should show 0-100 based on actual metrics
2. **Context Blocks**: Will auto-generate using README content
3. **Architecture Diagram**: Will auto-generate from README
4. **Description**: Will show your GitHub repository description
5. **Stars/Forks**: Will show actual counts from GitHub

---

## Test With a Public Repo First

To verify everything works, try adding a well-known public repo:

1. Go to `/dashboard`
2. Add: `facebook/react` or `vercel/next.js`
3. Click "Refresh Impact Data"
4. Check if that repo shows stars/forks/description
5. If it works, the issue is specific to Quorum-AI

---

## Still Not Working?

If the "Refresh Impact Data" button doesn't work, check:

1. **Browser Console (F12)**:
   - Look for JavaScript errors
   - Check Network tab for failed API requests

2. **Server Logs**:
   - Look for errors in terminal where `npm run dev` is running
   - Check for GitHub API errors, database errors

3. **Verify Repository Exists on GitHub**:
   - Go to https://github.com/crystaljin1001/Quorum-AI
   - Make sure it exists and isn't deleted
   - Check if it's public or private

4. **Force Clear Cache**:
   ```sql
   DELETE FROM impact_cache
   WHERE repo_full_name = 'crystaljin1001/Quorum-AI';
   ```
   Then click "Refresh Impact Data" again.

---

## What the Refresh Button Does

```typescript
1. Fetches all repositories from user_repositories table
2. For each repository:
   - Checks if cached data is valid (< 24 hours old)
   - If invalid or missing, fetches from GitHub:
     * Repository metadata (description, stars, forks, language)
     * Closed issues (for impact metrics)
     * Merged pull requests (for impact metrics)
   - Calculates impact scores
   - Saves to impact_cache table
3. Returns success/failure status
```

The whole process takes 5-30 seconds depending on how many repos you have.

---

## Next Steps

1. ✅ Run the migration: `supabase/migrations/20260218_add_context_blocks.sql`
2. ✅ Click "Refresh Impact Data" on dashboard
3. ✅ Wait for success message
4. ✅ Visit case study page: `/portfolio/crystaljin1001-Quorum-AI`
5. ✅ Context Blocks and Architecture Diagram should auto-generate

If it works for other repos but not Quorum-AI, the issue is likely:
- Quorum-AI is private and token doesn't have `repo` scope
- Quorum-AI doesn't exist or was renamed on GitHub
- README is too short (< 100 characters)
