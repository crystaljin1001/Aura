# Simple JSON-LD Test Guide

## Why the verification failed:

The page redirected to `/auth` because:
1. Portfolio pages require authentication
2. The verification script can't authenticate via curl

## How to test properly:

### Step 1: Check if you have decisions added

1. Log in to your Aura account at http://localhost:3000
2. Navigate to: http://localhost:3000/portfolio/crystaljin1001-Quorum-AI
3. Scroll down to the "Logic Map" section
4. Check if you have any decisions displayed

**If NO decisions:**
- The JSON-LD component won't render (it only renders when decisions exist)
- Add at least 1 decision first using the "Add Manual Decision" button

**If YES decisions exist:**
- Continue to Step 2

### Step 2: Verify JSON-LD is in the HTML

1. While on your portfolio page (logged in)
2. Right-click anywhere → "View Page Source"
3. Press Ctrl+F (Windows) or Cmd+F (Mac)
4. Search for: `type="application/ld+json"`

**Expected result:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Quorum-AI - Technical Decision Map",
  "designProcess": [
    {
      "@type": "Decision",
      ...
    }
  ]
}
</script>
```

**If you see this:** ✅ JSON-LD is working! Bots can discover it.

**If you don't see this:** ⚠️ JSON-LD might not be rendering. Check:
- Are you viewing "Page Source" (not "Inspect Element")?
- Do you have at least 1 decision in your Logic Map?

### Step 3: Test Code Snippet Preview

1. Click "Add Manual Decision" button
2. Fill in the form:
   - Technology: "Backend API"
   - Problem: "Need authentication system"
   - Add an alternative: "Firebase Auth"
   - Why NOT?: "Vendor lock-in, expensive at scale"
   - Chosen Solution: "Custom JWT Auth"
   - Why This?: "Full control, cheaper, learning opportunity"
   - **Evidence Link**: Paste a real GitHub permalink from your repo:
     ```
     https://github.com/crystaljin1001/Quorum-AI/blob/main/[PATH_TO_FILE]#L10-L30
     ```
3. Click "Save Decision"
4. Click on the green "Chosen Solution" box to expand it
5. Look for "💎 Code Proof" section
6. Click to expand it
7. **Expected:** Code from GitHub appears inline with line numbers

**If code appears:** ✅ Code snippet preview is working!

**If it doesn't load:** Check:
- Is the GitHub URL correct and public?
- Does it follow the format: `https://github.com/owner/repo/blob/branch/file.ext#L10-L20`?
- Check browser console for errors

## Alternative: Test After Deployment

If you deploy to production (Vercel, etc.), the verification script will work:

```bash
./scripts/verify-logic-map-jsonld.sh https://your-domain.com/portfolio/crystaljin1001-Quorum-AI
```

Production pages are typically public and don't require authentication, so curl can access them.

## Summary

**Current Status:**
- ✅ Code is fixed (JSON-LD will be in initial HTML)
- ✅ Code snippet feature is implemented
- ⚠️ Need to test while logged in (curl can't authenticate)

**To verify:**
1. Log in to your account
2. Add at least 1 Logic Map decision
3. View page source → search for "application/ld+json"
4. Add GitHub permalink → verify code preview appears
