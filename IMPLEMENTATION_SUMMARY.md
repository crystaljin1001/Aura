# Aura Implementation Summary
**Functional Map & Information Architecture - Quick Start Guide**

## 📋 What I Created For You

I've created a complete Functional Map and Information Architecture for Aura with three detailed documents:

### 1. **FUNCTIONAL_MAP.md** (High-Level Strategy)
- Information architecture with 4 clear layers (Entry → Workspace → Infrastructure → Output)
- User journey maps (Discovery → Onboarding → Proving Work → Getting Hired)
- Navigation hierarchy optimized for "Prove Your Work" flow
- Feature progression funnel (Free → PRO tiers)
- Success metrics and competitive positioning

### 2. **REFACTORING_PLAN.md** (Detailed Implementation)
- Phase-by-phase refactoring plan (3 phases)
- Complete code examples for all new components
- Database schema changes needed
- File migration checklist
- Visual design specifications
- Testing checklist

### 3. **USER_FLOW_DIAGRAM.md** (Visual Wireframes)
- ASCII wireframes for every screen
- Detailed user journey maps
- Button state specifications
- Responsive design breakpoints
- Animation timing guidelines

---

## 🎯 Key Changes Summarized

### Navigation Refactor
**Before:**
```
/ (landing) → /repositories → /storyboard
```

**After:**
```
/ (marketing) → /dashboard (unified hub) → /settings (domains, AI audit)
```

### Button Placement Strategy

#### Primary CTAs (Large, Prominent, State-Dependent)
1. **NEW Project** → `[Convert README]` (green, 48px height)
2. **Script Ready** → `[🎥 Record Video]` (blue CTA)
3. **Video Ready** → `[🌐 Buy Domain]` (gold with PRO badge)
4. **Deployed** → `[👁️ View Portfolio]` (neutral)

#### Secondary Actions (Dropdown Menu)
- Edit Script
- Re-generate Script
- View on GitHub
- Delete Project

### Project Card Status Flow
```
NEW → SCRIPT_READY → VIDEO_READY → DEPLOYED
 ↓         ↓              ↓            ↓
[Convert] [Record]     [Deploy]    [Analytics]
```

---

## 🚀 Immediate Next Steps (Priority Order)

### PHASE 1: Unified Dashboard (Weeks 1-2) - HIGH PRIORITY

#### Step 1: Create Dashboard Route
```bash
# Create new dashboard page
mkdir -p src/app/dashboard
touch src/app/dashboard/page.tsx
```

**What to build:**
- Unified dashboard that combines repository management + portfolio display
- Project grid with "Add Project" as first card
- State-dependent primary CTAs on each project card

**Key Files:**
- `/src/app/dashboard/page.tsx` (new)
- `/src/features/projects/components/ProjectCard.tsx` (new)
- `/src/features/projects/components/AddProjectCard.tsx` (new)

#### Step 2: Create Project Card Component
**Features:**
- Status indicators (script/video/domain completion)
- Large, color-coded primary CTA button (changes based on state)
- Impact metrics preview
- Secondary actions in dropdown menu

#### Step 3: Update Navigation
**Changes:**
- Remove "Repositories" and "Storyboard" links
- Add "Dashboard" as primary link
- Add "Portfolio" (public view preview)
- Add "Settings" (domains, AI audit, GitHub)

**File to modify:**
- `/src/components/layout/Navigation.tsx`

#### Step 4: Migrate Storyboard to Modal
**Goal:** Convert `/storyboard` page into a modal triggered by project card actions

**New file:**
- `/src/features/projects/components/ScriptEditorModal.tsx`

---

### PHASE 2: PRO Badge & Domain UI (Week 3) - MEDIUM PRIORITY

#### Step 1: Create PRO Badge Component
```bash
touch src/components/ui/pro-badge.tsx
```

**Usage:**
```typescript
<Button>
  🌐 Deploy to Domain <ProBadge />
</Button>
```

#### Step 2: Create Settings Layout
```bash
mkdir -p src/app/settings
touch src/app/settings/page.tsx
touch src/app/settings/domains/page.tsx
touch src/components/layout/SettingsLayout.tsx
```

**Settings Sidebar:**
- Account
- Domain Management (PRO badge)
- AI Knowledge Audit
- GitHub Integration
- Billing & Upgrades

#### Step 3: Domain Purchase Flow
**New feature module:**
```bash
mkdir -p src/features/domains
touch src/features/domains/components/BuyDomainButton.tsx
touch src/features/domains/actions.ts
```

**Integration points:**
- Stripe for payment processing
- Cloudflare API for domain provisioning
- DNS configuration wizard

---

### PHASE 3: AI Knowledge Audit (Weeks 4-5) - LOW PRIORITY

#### Step 1: Create AI Audit Page
```bash
touch src/app/settings/ai-audit/page.tsx
```

#### Step 2: Portfolio Analyzer
```bash
mkdir -p src/features/ai-audit
touch src/lib/ai/portfolio-analyzer.ts
touch src/features/ai-audit/actions.ts
```

**What it does:**
- Runs GPT-4 analysis on user's full portfolio
- Generates "HR perspective" report with scores
- Suggests improvements to READMEs and projects

---

## 📊 Database Changes Needed

### New Tables to Create

```sql
-- Run these migrations in Supabase

CREATE TABLE project_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  cloudflare_zone_id TEXT,
  ssl_status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE portfolio_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL, -- 'free' or 'pro'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎨 Design System Updates

### Color Palette (Add to Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'state-new': '#16a34a', // green-600
        'state-script': '#2563eb', // blue-600
        'state-video': '#f59e0b', // amber-500
        'state-deployed': '#10b981', // emerald-500
        'pro-gold': {
          from: '#f59e0b', // amber-500
          to: '#ea580c', // orange-600
        }
      }
    }
  }
}
```

### Component Sizes

```javascript
// Button heights
{
  'h-12': '48px', // Primary CTAs
  'h-10': '40px', // Secondary buttons
  'h-8': '32px',  // Tertiary actions
}

// Card dimensions
{
  'min-h-[300px]': 'Minimum card height',
  'max-w-[400px]': 'Maximum card width in grid',
  'p-6': '24px padding',
  'rounded-xl': '12px border radius',
}
```

---

## ✅ Implementation Checklist

### Week 1-2: Dashboard Foundation
- [ ] Create `/src/app/dashboard/page.tsx`
- [ ] Build `ProjectCard` component with state-dependent CTAs
- [ ] Build `AddProjectCard` component
- [ ] Create `getUserProjectsWithStatus()` server action
- [ ] Update Navigation component (remove old links, add Dashboard)
- [ ] Migrate storyboard to `ScriptEditorModal`
- [ ] Test all project card states (NEW, SCRIPT_READY, VIDEO_READY, DEPLOYED)
- [ ] Ensure responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)

### Week 3: PRO Features UI
- [ ] Create `ProBadge` component
- [ ] Build Settings layout with sidebar
- [ ] Create `/settings/domains` page
- [ ] Add "Buy Domain" button to video-ready project cards
- [ ] Show PRO upgrade modal for free users
- [ ] Create domain purchase form (UI only, can mock backend)
- [ ] Add Stripe checkout integration (if ready)

### Week 4-5: AI Audit
- [ ] Create `/settings/ai-audit` page
- [ ] Build `portfolio-analyzer.ts` AI client
- [ ] Create `runPortfolioAudit()` server action
- [ ] Design audit report display component
- [ ] Add "Run Audit" button in settings
- [ ] Test GPT-4 analysis with sample portfolios
- [ ] Store audit results in `portfolio_audits` table

### Database Setup
- [ ] Create `project_videos` table
- [ ] Create `project_domains` table
- [ ] Create `portfolio_audits` table
- [ ] Create `user_subscriptions` table
- [ ] Add indexes for performance
- [ ] Set up Row Level Security (RLS) policies

### Testing & Polish
- [ ] Visual QA on all breakpoints (mobile, tablet, desktop)
- [ ] Accessibility audit (keyboard navigation, screen readers)
- [ ] Performance testing (dashboard load time < 2s)
- [ ] E2E tests for critical flows (add project → generate script → record video)
- [ ] Analytics tracking setup (track CTA clicks, conversions)

---

## 📈 Success Metrics to Track

### User Activation
- Time to first script generation: **Target < 2 minutes**
- Conversion from demo to signup: **Target > 30%**
- Portfolio completion rate: **Target > 60%**

### Engagement
- Primary CTA click rate: **Target > 40%**
- Video creation rate: **Target > 25%**
- PRO upgrade interest (clicked domain CTA): **Target > 10%**

### Retention
- Weekly active users (portfolio views)
- Monthly script regenerations
- Domain renewal rate (for PRO users)

---

## 🛠️ Technical Dependencies

### Required Integrations

#### Already Implemented ✅
- Supabase (auth, database)
- GitHub API (repo fetching, README extraction)
- OpenAI API (script generation)

#### To Implement ⏳
- **Stripe** (payment processing for domains/PRO)
- **Cloudflare for SaaS API** (custom domain provisioning)
- **Tella/Arcade API** (optional: direct video embedding)

### Environment Variables Needed

```bash
# .env.local

# Existing
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=

# New (for Phase 2)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# New (for Domain Management)
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_ACCOUNT_ID=

# New (for PRO tier pricing)
NEXT_PUBLIC_PRO_MONTHLY_PRICE=9
NEXT_PUBLIC_PRO_YEARLY_PRICE=90
```

---

## 🎯 Quick Win: Start Here

**If you want to see immediate visual impact, start with this:**

### 1. Create the Dashboard Route (30 minutes)
```bash
mkdir -p src/app/dashboard
touch src/app/dashboard/page.tsx
```

Copy the dashboard code from `REFACTORING_PLAN.md` Section 1.1.

### 2. Update Navigation (10 minutes)
Add a "Dashboard" link to your existing navigation:
```typescript
<Link href="/dashboard">Dashboard</Link>
```

### 3. Create Simple Project Card (1 hour)
Build a basic version of the project card with:
- Repository name
- GitHub stats (stars, forks)
- One large primary CTA button

You'll immediately see the new layout and can iterate from there.

---

## 📚 Documentation References

- **Full Architecture**: See `FUNCTIONAL_MAP.md`
- **Code Examples**: See `REFACTORING_PLAN.md`
- **Wireframes**: See `USER_FLOW_DIAGRAM.md`

---

## 🤝 Need Help?

**Common Questions:**

**Q: Do I need to remove the old `/repositories` and `/storyboard` pages?**
A: No! Keep them for now. Once the dashboard is working, you can deprecate them gradually. Add redirects after users migrate.

**Q: Should I implement all phases at once?**
A: No. Start with Phase 1 (Dashboard), get it working, then move to Phase 2 (PRO features). Phase 3 (AI Audit) is optional for launch.

**Q: Can I modify the designs?**
A: Absolutely! The wireframes are guidelines. Adapt colors, spacing, and layouts to match your brand. The key principles are:
1. State-dependent primary CTAs
2. Clear progression (NEW → SCRIPT → VIDEO → DOMAIN)
3. PRO features are visible but not blocking

**Q: What about mobile?**
A: All designs are mobile-first. Use Tailwind responsive classes:
- Mobile (default): 1-column grid
- Tablet (`md:`): 2-column grid
- Desktop (`lg:`): 3-column grid

---

## 🎉 Expected Outcomes

After implementing this architecture, you'll have:

✅ **Clear User Journey**: Users know exactly what to do next (always see primary CTA)
✅ **Unified Workspace**: No more jumping between separate pages
✅ **Visible PRO Features**: "Buy Domain" button shows value without being pushy
✅ **Professional Portfolio**: HR sees video demos, live metrics, custom domains
✅ **Scalable Architecture**: Easy to add new project states or features

---

## 📞 Final Checklist Before Starting

- [ ] Read through all three documents (FUNCTIONAL_MAP, REFACTORING_PLAN, USER_FLOW_DIAGRAM)
- [ ] Understand the 4-layer architecture (Entry → Workspace → Infrastructure → Output)
- [ ] Review the state progression (NEW → SCRIPT_READY → VIDEO_READY → DEPLOYED)
- [ ] Set up database tables (project_videos, project_domains, etc.)
- [ ] Choose which phase to start with (recommend: Phase 1)
- [ ] Create a feature branch: `git checkout -b feature/unified-dashboard`
- [ ] Start coding! 🚀

---

Good luck with the implementation! This architecture will transform Aura into a clear, conversion-focused portfolio builder that guides users toward proving their work with every interaction.

**Remember:** The goal is to always lead users toward "Proving Their Work" through clear, state-dependent CTAs and a logical progression from GitHub URL to hired.
