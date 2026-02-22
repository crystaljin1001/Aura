# Logic Map AI Verification - Status Report

## ✅ Evidence Link Deep-Linking (VERIFIED)

### Current Implementation
The GitHub permalink parser (`/src/lib/github/parse-permalink.ts`) supports:

**Supported URL Formats:**
- ✅ Branch permalinks: `https://github.com/owner/repo/blob/main/path/file.ts`
- ✅ Commit SHA permalinks: `https://github.com/owner/repo/blob/abc123def/path/file.ts`
- ✅ Single line: `#L10`
- ✅ Line ranges: `#L10-L20`

**Parser Capabilities:**
```typescript
interface GitHubPermalink {
  owner: string       // Repository owner
  repo: string        // Repository name
  branch: string      // Branch name OR commit SHA
  path: string        // Full file path
  startLine?: number  // Start line number (from #L10)
  endLine?: number    // End line number (from #L10-L20)
}
```

**Verification:**
- Line number parsing: `urlObj.hash.match(/^#L(\d+)(?:-L(\d+))?$/)`
- Works for both branches and commit SHAs (both use `/blob/` path)
- Auto-fetches code with ±3 lines context for verification

**UI Integration:**
- Form placeholders show example: `https://github.com/owner/repo/blob/main/src/file.ts#L10-L25`
- Code snippets auto-display when GitHub permalinks detected
- Recruiters can verify claims without leaving the page

**Status:** ✅ FULLY IMPLEMENTED - Claims become Facts with instant audit capability

---

## ⚠️ AI Manifest Verification (CRITICAL ISSUE FOUND)

### Current Implementation
**Location:** `/src/features/portfolio/components/LogicMapJsonLd.tsx`

**Problem Identified:**
```tsx
// ❌ CURRENT: Uses Next.js Script component
<Script
  id={`logic-map-jsonld-${repositoryUrl.replace('/', '-')}`}
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
/>
```

**Why This is a Problem:**
1. **Next.js Script component** loads AFTER page hydration
2. AI bots (2027 scrapers) crawl static HTML before JavaScript executes
3. JSON-LD is NOT in the initial HTML `<head>` - bots can't see it
4. Component is rendered in page BODY (line 338 of page.tsx), not HEAD

**Impact:**
- ❌ AI agents cannot discover Logic Map data during initial page load
- ❌ Technical Discernment is invisible to bots that don't execute JavaScript
- ❌ Defeats the purpose of "bot-readable" structured data

### Required Fix

**Solution 1: Use Regular Script Tag in Server Component**
```tsx
// ✅ RECOMMENDED: Direct HTML injection in <head>
export async function LogicMapJsonLd({ repositoryUrl, projectName }: LogicMapJsonLdProps) {
  const decisions = await getEnhancedDecisions(repositoryUrl)
  const pivots = await getPivotPoints(repositoryUrl)
  const jsonLd = generateLogicMapJsonLd({ decisions, pivots }, projectName, repositoryUrl)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

**Solution 2: Use Next.js Metadata API (Alternative)**
```tsx
// In page.tsx:
export async function generateMetadata({ params }): Promise<Metadata> {
  const jsonLd = await generateLogicMapJsonLd(...)
  return {
    other: {
      'ld+json': JSON.stringify(jsonLd)
    }
  }
}
```

**Placement Fix:**
The component must be moved to the page's `<head>` section, or the page structure must ensure JSON-LD is in the initial HTML.

### Verification Checklist

To verify the fix works:

1. **Build the page:** `npm run build && npm start`
2. **View page source:** Right-click → "View Page Source" (NOT inspect element)
3. **Check for JSON-LD in `<head>`:**
   ```html
   <head>
     ...
     <script type="application/ld+json">
     {
       "@context": "https://schema.org",
       "@type": "CreativeWork",
       "name": "Project - Technical Decision Map",
       "designProcess": [...]
     }
     </script>
   </head>
   ```
4. **Test with bot simulator:** Use `curl` or `wget` to fetch HTML:
   ```bash
   curl -A "Googlebot" https://yourdomain.com/portfolio/owner-repo | grep -A 50 "application/ld+json"
   ```

**Status:** ⚠️ CRITICAL FIX NEEDED - JSON-LD not in <head> for bot discovery

---

## JSON-LD Structure (VERIFIED)

**Generator:** `/src/features/portfolio/utils/logic-map-json-ld.ts`

**Schema.org Compliance:**
```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Project Name - Technical Decision Map",
  "designProcess": [
    {
      "@type": "Decision",
      "name": "Technology decision",
      "about": "Problem statement",
      "option": [
        {
          "@type": "Thing",
          "name": "Alternative rejected",
          "description": "Why NOT reasoning"
        }
      ],
      "result": {
        "@type": "Thing",
        "name": "Chosen solution",
        "description": "Rationale"
      }
    }
  ],
  "pivotPoints": [...],
  "author": { repository URL },
  "datePublished": "ISO timestamp"
}
```

**Status:** ✅ SCHEMA VERIFIED - Proper Schema.org structure

---

## Recommendations

### Priority 1: Fix JSON-LD Injection (URGENT)
1. Replace `<Script>` with regular `<script>` tag
2. Ensure server-side rendering in initial HTML
3. Move to `<head>` section if possible
4. Test with curl/wget to verify bot-visible

### Priority 2: Enhance Evidence Links
1. ✅ Already supports commit SHAs and line numbers
2. Consider adding visual indicator for "verified" vs "unverified" links
3. Add tooltip showing "This link has been verified and code is cached"

### Priority 3: Add Verification Endpoint
Create API endpoint for bots to query Logic Map:
```
GET /api/logic-map?repo=owner/repo
Returns: Pure JSON-LD data
```

This allows AI agents to:
- Query Logic Map programmatically
- Verify evidence links
- Cross-reference claims with code

---

## Testing Protocol

### Manual Testing
1. Add decision with GitHub permalink
2. View page source (not inspect)
3. Search for "application/ld+json"
4. Verify JSON-LD is in `<head>`
5. Click evidence link → code snippet loads

### Automated Testing
```bash
# Test 1: Check if JSON-LD is in initial HTML
curl -s http://localhost:3000/portfolio/owner-repo | grep -c "application/ld+json"
# Expected: 1 or more

# Test 2: Validate JSON-LD structure
curl -s http://localhost:3000/portfolio/owner-repo | \
  sed -n '/<script type="application\/ld+json">/,/<\/script>/p' | \
  jq '.["@type"]'
# Expected: "CreativeWork"

# Test 3: Verify evidence links are clickable
curl -s http://localhost:3000/portfolio/owner-repo | grep "https://github.com"
# Expected: Evidence link URLs present
```

---

## Conclusion

**Evidence Link Deep-Linking:** ✅ Production Ready
- Supports commit SHAs, branches, line numbers
- Auto-fetches code for instant verification
- High ROI for recruiter experience

**AI Manifest Verification:** ⚠️ Needs Immediate Fix
- JSON-LD exists but not properly injected
- Bots cannot discover Logic Map data
- Simple fix: Replace Script component with regular script tag

**Next Steps:**
1. Implement JSON-LD head injection fix
2. Test with curl to verify bot visibility
3. Deploy and re-verify with Google's Rich Results Test
4. Consider adding /api/logic-map endpoint for programmatic access
