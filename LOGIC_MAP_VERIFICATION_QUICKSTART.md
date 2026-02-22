# Logic Map AI Verification - Quick Start

## TL;DR

✅ **Evidence Links**: Already support commit SHAs + line numbers - Production Ready
⚠️ **JSON-LD Injection**: Fixed to ensure bots can discover Logic Map

## Quick Verification (30 seconds)

### Test if JSON-LD is visible to bots:

```bash
# Start your dev server
npm run dev

# In a new terminal, run:
curl http://localhost:3000/portfolio/YOUR-REPO | grep "application/ld+json"

# ✅ Should output: <script type="application/ld+json">
# ❌ No output = JSON-LD not visible to bots
```

### Or use the automated script:

```bash
./scripts/verify-logic-map-jsonld.sh http://localhost:3000/portfolio/owner-repo
```

---

## What Was Fixed

### Problem:
```tsx
// ❌ BEFORE: JSON-LD loaded AFTER page hydration
<Script type="application/ld+json" ... />
// Bots couldn't see it in initial HTML
```

### Solution:
```tsx
// ✅ AFTER: JSON-LD in initial HTML
<script type="application/ld+json" suppressHydrationWarning ... />
// Bots can read it immediately
```

**File Changed**: `/src/features/portfolio/components/LogicMapJsonLd.tsx`

---

## Evidence Link Format

### Supported GitHub URLs:

```
✅ https://github.com/owner/repo/blob/main/src/auth.ts#L45-L67
✅ https://github.com/owner/repo/blob/abc123def/src/auth.ts#L45-L67
✅ https://github.com/owner/repo/blob/main/src/auth.ts#L45
```

### How to Get a Good Evidence Link:

1. **Go to GitHub** → Open your file
2. **Click line number** (e.g., line 45)
3. **Hold Shift** → Click end line (e.g., line 67)
4. **URL updates**: `#L45-L67`
5. **Copy entire URL** (includes commit SHA if you're on a commit)
6. **Paste in Evidence Link field**

**Pro Tip**: Use commit permalinks (not branch links) for immutable proof!

---

## Testing Checklist

### Before Claiming "Production Ready":

- [ ] Run verification script
- [ ] View page source → see JSON-LD
- [ ] Add 1 decision with GitHub permalink
- [ ] Click evidence link → code preview expands
- [ ] Test with curl (see command above)

### After Deploy:

- [ ] Test production URL with verification script
- [ ] Check Google Rich Results Test
- [ ] Monitor Google Search Console

---

## Quick Commands

```bash
# Verify JSON-LD injection
./scripts/verify-logic-map-jsonld.sh http://localhost:3000/portfolio/owner-repo

# Test bot visibility
curl -A "Googlebot" http://localhost:3000/portfolio/owner-repo | grep "ld+json" -A 20

# Build and test production
npm run build
npm start
curl http://localhost:3000/portfolio/owner-repo | grep "ld+json"
```

---

## Documentation

- **Full Report**: `LOGIC_MAP_AI_VERIFICATION_STATUS.md`
- **Summary**: `VERIFICATION_SUMMARY.md`
- **Verification Script**: `scripts/verify-logic-map-jsonld.sh`

---

## Support

If verification fails:
1. Check if LogicMapJsonLd component is rendered
2. Verify decisions exist in database
3. Check browser console for errors
4. Review `VERIFICATION_SUMMARY.md` for troubleshooting

---

**Status**: ✅ Ready to verify on dev server
