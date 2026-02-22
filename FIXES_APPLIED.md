# Fixes Applied - 2026-02-19

## Issues Fixed

### 1. ✅ Technical Assessment API Key
**Issue**: "Generate Technical Assessment" button showed authentication error
**API Key Required**: ANTHROPIC_API_KEY (not OpenAI!)
**Fixed**: Error messages now show clearly what's needed

### 2. ✅ HTML Entities (&quot;) on Portfolio
**Issue**: Project descriptions showed `&quot;` instead of `"`
**Fixed**: Applied HTML entity decoding to portfolio products page (RepoProductCard)

### 3. ✅ Next Steps Progress Tracking
**Issue**: "Generate Demo Scripts" showed as complete when only 2/4 projects had scripts
**Fixed**: Changed logic to only show step as complete when ALL projects have completed that step

### 4. ✅ README Fetch Failures (404 Errors)
**Issue**: Could not fetch README for oracle-plan-craft (404 error)
**Fixed**: Updated fetchGitHubReadme to use user's GitHub token from database instead of non-existent environment variable

## What You Need To Do

### Required: Set ANTHROPIC_API_KEY

The "Generate Technical Assessment" feature uses Claude AI (NOT OpenAI).

1. Get your API key from: https://console.anthropic.com/
2. Add to `.env.local`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```
3. Restart your dev server: `npm run dev`

### Check GitHub Token Permissions

If README fetch still fails (404), your GitHub token may need these scopes:

✅ Required Scopes:
- `repo` (full repository access) - **REQUIRED for private repos**
- `read:user`
- `read:org` (if applicable)

To update:
1. Go to https://github.com/settings/tokens
2. Click your token or create a new one
3. Ensure ALL the above scopes are checked
4. Copy the token
5. Update in Aura: Settings → Repositories → "Update GitHub Token"
6. Click "Refresh Impact Data" on the Repositories page

### Verify Impact Data is Cached

The "Impact Data Not Available Yet" message shows when:
- You haven't added a GitHub token yet (go to /repositories)
- You haven't clicked "Refresh Impact Data" yet
- The impact refresh failed (check console for errors)

To fix:
1. Go to `/repositories` page
2. Ensure your GitHub token is added
3. Click **"Refresh Impact Data"** button (top right)
4. Wait for "✅ Impact data refreshed successfully!"

This will:
- Fetch README lengths
- Calculate impact metrics
- Enable all features on case study pages

## Technical Details

### Files Modified

1. `/src/features/impact-engine/components/RepoProductCard.tsx`
   - Added HTML entity decoding for descriptions

2. `/src/features/projects/components/NextStepsGuidance.tsx`
   - Changed from `projects.some()` to `projects.every()` for completion checks

3. `/src/features/portfolio/api/github-readme.ts`
   - Added `githubToken` parameter
   - Removed dependency on `process.env.GITHUB_TOKEN`

4. `/src/app/portfolio/[repository]/page.tsx`
   - Fetches user's GitHub token from database
   - Passes token to README fetching functions

5. `/src/features/portfolio/components/ProfessionalProjectAssessment.tsx`
   - Added error state display for AI assessment failures

6. `/src/features/user-profile/api/actions.ts`
   - Added `cvUrl` to profile data mapping

7. `/src/app/repositories/page.tsx`
   - Added "Refresh Impact Data" button to page header

### Why README Fetch Failed

The original code tried to use `process.env.GITHUB_TOKEN` which:
- Doesn't exist in your environment
- Is different from the Personal Access Token you added via UI
- Your PAT is stored in Supabase `github_tokens` table

Now the code correctly:
1. Fetches YOUR token from the database
2. Passes it to GitHub API
3. Can access your private repositories (if token has `repo` scope)

## Testing Checklist

- [ ] Set ANTHROPIC_API_KEY in .env.local
- [ ] Restart dev server
- [ ] Go to /repositories
- [ ] Click "Refresh Impact Data"
- [ ] Wait for success message
- [ ] Check oracle-plan-craft case study page
- [ ] Verify "Comprehensive README" is checked
- [ ] Click "Generate Technical Assessment"
- [ ] Should work without authentication error
- [ ] Check portfolio home page (/)
- [ ] Verify descriptions show `"` not `&quot;`
- [ ] Check dashboard for Next Steps banner
- [ ] Should show accurate progress (not all green)
