# Aura - Functional Map & Information Architecture

## Mission
Transform GitHub READMEs into compelling video scripts and portfolio showcases that prove your work to HR and hiring managers.

---

## INFORMATION ARCHITECTURE

### Layer 1: ENTRY POINT (The "Aha! Moment")
**Primary Action: GitHub URL → README-to-Script Conversion**

```
┌─────────────────────────────────────────────┐
│         LANDING PAGE (/)                    │
│  "Turn Your Code Into Your Career"          │
│                                              │
│  [Try It Now: Paste GitHub URL]             │
│            ↓                                 │
│    ✨ Instant Preview Demo ✨               │
│    README → AI Script in 10 seconds         │
│                                              │
│  [Sign Up to Save Your Portfolio]           │
└─────────────────────────────────────────────┘
```

**User Flow:**
1. User lands on homepage
2. Sees prominent GitHub URL input (no login required)
3. Pastes `https://github.com/user/repo`
4. AI instantly generates script preview
5. "Sign up to save this portfolio" CTA appears
6. User converts → becomes authenticated user

**Key Metric:** Time to "Aha!" < 15 seconds

---

### Layer 2: CORE WORKSPACE (Dashboard)
**Central Hub: Project Portfolio Management**

```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD (/dashboard)                                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Your Projects  [+ Add GitHub Project] (PRIMARY CTA)  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────┐  ┌──────────────────────┐ │
│  │ 📦 Project Card: repo-name  │  │ 📦 New Project Card  │ │
│  │                             │  │                      │ │
│  │ ⭐ 234  🍴 45  📊 12 issues │  │  [+ Convert README]  │ │
│  │                             │  │   (PRIMARY ACTION)   │ │
│  │ Status: ✅ Script Ready     │  │                      │ │
│  │         ⏹️ No Video Yet     │  │  Prove your work    │ │
│  │         🌐 No Domain        │  │  with video demos    │ │
│  │                             │  │                      │ │
│  │ ACTIONS:                    │  └──────────────────────┘ │
│  │ • 📝 Edit Script (secondary)│                           │
│  │ • 🎥 Record Video (CTA)     │                           │
│  │ • 🌐 Buy Domain (PRO Badge) │                           │
│  │ • 👁️ View Portfolio         │                           │
│  └─────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

**Project Card States:**
- **NEW** → Primary action: `[Convert README]` (green, prominent)
- **SCRIPT READY** → Primary action: `[🎥 Record Video]` (bright CTA)
- **VIDEO READY** → Primary action: `[🌐 Deploy to Domain]` (PRO badge)
- **DEPLOYED** → Primary action: `[📊 View Analytics]` / `[Share Link]`

**Navigation:**
```
┌──────────────────────────────────────────────────────┐
│ Logo  [Dashboard] [Projects] [Portfolio] [Settings] │
│                                    [🔔] [Profile ▾]  │
└──────────────────────────────────────────────────────┘
```

---

### Layer 3: INFRASTRUCTURE LAYER (Settings & Admin)
**Settings Sidebar/Tab: Power User Features**

```
┌──────────────────────────────────────────┐
│  SETTINGS (/settings)                    │
│  ┌────────────────────────────────────┐  │
│  │  TABS:                             │  │
│  │  • Account                         │  │
│  │  • Domain Management (PRO)         │  │
│  │  • AI Knowledge Audit              │  │
│  │  • GitHub Integration              │  │
│  │  • Billing & Upgrades              │  │
│  └────────────────────────────────────┘  │
│                                           │
│  DOMAIN MANAGEMENT TAB:                  │
│  ┌────────────────────────────────────┐  │
│  │ Connected Domains                  │  │
│  │ • yourname.com → Portfolio         │  │
│  │ • hiring.yoursite.com → Project 1  │  │
│  │                                    │  │
│  │ [+ Buy New Domain] (PRO)           │  │
│  │ [+ Connect Existing Domain]        │  │
│  │                                    │  │
│  │ DNS Status: ✅ SSL Active          │  │
│  │ Auto-renewal: ON                   │  │
│  └────────────────────────────────────┘  │
│                                           │
│  AI KNOWLEDGE AUDIT TAB:                 │
│  ┌────────────────────────────────────┐  │
│  │ What HR Sees About Your Projects: │  │
│  │                                    │  │
│  │ 🤖 AI-Generated Insights:          │  │
│  │ • Technical depth: Advanced        │  │
│  │ • Problem-solving: High impact     │  │
│  │ • Communication: Clear docs        │  │
│  │ • Code quality: Production-ready   │  │
│  │                                    │  │
│  │ 📊 Portfolio Health Score: 87/100  │  │
│  │                                    │  │
│  │ [Re-analyze All Projects]          │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**Key Features:**
- **Domain Management**: Cloudflare for SaaS integration, 1-click SSL
- **AI Knowledge Audit**: Run GPT-4 analysis on portfolio to see "what HR sees"
- **GitHub Integration**: PAT token management, sync settings, rate limits
- **Billing**: Domain purchases, PRO tier upgrades

---

### Layer 4: OUTPUT LAYER (Public Portfolio)
**What HR Sees: yourname.aura.dev**

```
┌──────────────────────────────────────────────────────┐
│  PUBLIC PORTFOLIO (yourname.aura.dev)                │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  [Hero Section]                                 │ │
│  │  Hi, I'm Jane Doe                               │ │
│  │  Full-Stack Engineer • Open Source Contributor  │ │
│  │  [Watch My Work ▶️] [Hire Me]                   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  [Featured Projects - Video Demos]                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ 🎥 Project 1 │  │ 🎥 Project 2 │  │ 🎥 Project │ │
│  │ [Play Demo]  │  │ [Play Demo]  │  │ [Play Demo]│ │
│  │ ⭐ 500 stars │  │ ⭐ 234 stars │  │ ⭐ 89 stars│ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                       │
│  [Impact Metrics Dashboard]                          │
│  • 1,234 developers using my code                    │
│  • 89 bugs fixed in production                       │
│  • 23 features shipped                               │
│                                                       │
│  [About] [Skills] [Contact]                          │
└──────────────────────────────────────────────────────┘
```

**Key Features:**
- Video demos embedded (Tella/Arcade integration)
- Live GitHub metrics (auto-sync every 24h)
- Social proof (stars, forks, user adoption)
- Clear CTAs for hiring managers
- Custom domain support (PRO)

---

## USER JOURNEY MAP

### Journey 1: First-Time User → Portfolio Creator
```
1. [ENTRY] Land on homepage → See GitHub URL input
2. [AHA!] Paste repo URL → AI generates script in 10s
3. [CONVERT] "Sign up to save" → Create account
4. [ONBOARD] Connect GitHub PAT → Auto-import repos
5. [BUILD] Generate scripts for 3-5 projects
6. [PROVE] Record first video with Tella
7. [SHARE] Get public portfolio link: yourname.aura.dev
8. [UPGRADE] See "Deploy to Custom Domain" PRO badge
```

### Journey 2: Power User → Professional Portfolio
```
1. [DASHBOARD] View all projects with status indicators
2. [ACTION] Click "Record Video" on script-ready project
3. [RECORD] Use Tella with AI-generated script
4. [UPLOAD] Video auto-links to project card
5. [UPGRADE] Click "Buy Domain" PRO badge
6. [DEPLOY] Purchase yourname.com in 1 click
7. [SHARE] Share professional domain with recruiters
8. [AUDIT] Run "AI Knowledge Audit" to optimize portfolio
```

### Journey 3: HR Recruiter → Convinced Hirer
```
1. [ARRIVE] Click yourname.aura.dev from resume
2. [WATCH] See video demo of candidate's best project (3min)
3. [VERIFY] Check live GitHub metrics (real-time proof)
4. [EXPLORE] Browse other project demos
5. [TRUST] See impact metrics (users, issues, features)
6. [CONTACT] Click "Hire Me" CTA
```

---

## NAVIGATION HIERARCHY

```
PRIMARY NAVIGATION (Always Visible)
├─ 🏠 Dashboard (default landing after login)
├─ 📦 Projects (repository management)
├─ 👁️ Portfolio (preview public view)
└─ ⚙️ Settings (admin features)

SECONDARY ACTIONS (Contextual)
├─ Dashboard
│  └─ [+ Add Project] (sticky header)
├─ Project Card (State-Dependent Primary CTA)
│  ├─ NEW → [Convert README] (green, large)
│  ├─ SCRIPT READY → [🎥 Record Video] (CTA)
│  ├─ VIDEO READY → [🌐 Buy Domain] (PRO, gold badge)
│  └─ DEPLOYED → [📊 Analytics]
└─ Settings
   ├─ Domain Management (PRO features)
   ├─ AI Knowledge Audit (analysis tools)
   └─ GitHub Integration (technical settings)

TERTIARY ACTIONS (Project Card Dropdown)
├─ Edit Script
├─ Re-generate Script
├─ Delete Project
└─ View on GitHub
```

---

## BUTTON PLACEMENT RULES

### Primary CTAs (Large, Color-Coded, Above Fold)
1. **NEW Project Card**: `[+ Convert README]` (green, 40px height)
2. **Script Ready**: `[🎥 Record Video]` (blue CTA)
3. **Video Ready**: `[🌐 Buy Domain]` (gold PRO badge)
4. **Dashboard Header**: `[+ Add GitHub Project]` (sticky)

### Secondary Actions (Subtle, Text Links)
- "Edit Script" (small link below primary CTA)
- "View Portfolio" (eye icon)
- "Settings" (gear icon in nav)

### PRO Upgrade Triggers (Gold Badge, Always Visible)
- `[🌐 Buy Domain]` on every video-ready project card
- "Upgrade to PRO" banner in settings sidebar
- Custom domain input with "(PRO)" label

---

## FEATURE PROGRESSION FUNNEL

```
FREE TIER (Prove Your Work)
→ Unlimited GitHub repo imports
→ Unlimited AI script generation
→ Public portfolio: yourname.aura.dev
→ Basic impact metrics
→ Video demo hosting (via Tella embeds)

PRO TIER $9/mo (Get Hired Faster)
→ Custom domain (yourname.com)
→ Auto-SSL + Cloudflare CDN
→ AI Knowledge Audit (monthly)
→ Priority script generation
→ Advanced analytics (clicks, views, conversions)
→ Remove "Powered by Aura" footer

ENTERPRISE (Coming Soon)
→ Team portfolios
→ White-label branding
→ API access
```

---

## DESIGN PRINCIPLES

### 1. Always Lead Toward Proof
- Every page should have a CTA that moves user closer to "proving their work"
- Project cards show completion status (script → video → domain)
- Empty states show clear next steps

### 2. Make PRO Visible, Not Annoying
- Gold "PRO" badges on premium features
- No paywalls on core features
- Upgrade prompts are helpful ("Deploy to your own domain")

### 3. Trust Through Transparency
- Show live GitHub data (not screenshots)
- Display sync timestamps ("Last updated 2h ago")
- AI Knowledge Audit shows "what HR actually sees"

### 4. Speed to Value
- No GitHub login required for demo
- Auto-fetch README from GitHub (not manual paste)
- 1-click domain purchases

---

## TECHNICAL IMPLEMENTATION NOTES

### Current State (from codebase)
✅ GitHub integration (PAT token, API client)
✅ AI script generation (OpenAI gpt-4o-mini)
✅ Impact metrics calculation
✅ Repository management (add/remove)
✅ Public portfolio display (QuickPeek)
✅ Auth (Supabase email/password)

### To Implement (based on this architecture)
⏳ **Unified Dashboard** (currently split: /repositories, /storyboard, /)
   - Combine into `/dashboard` with project cards
   - State-dependent primary CTAs per project
   - Add status indicators (script/video/domain)

⏳ **Public Portfolio Optimization**
   - Move from `/` to `/[username]` or subdomain
   - Add video demo embeds (Tella iframe integration)
   - Show project completion badges

⏳ **Domain Management UI** (infrastructure ready via Cloudflare)
   - Settings tab for domain purchases
   - DNS configuration wizard
   - SSL status dashboard

⏳ **AI Knowledge Audit**
   - New feature: Run GPT-4 on full portfolio
   - Generate "HR perspective" report
   - Suggest improvements to READMEs/scripts

⏳ **PRO Tier Features**
   - Billing integration (Stripe?)
   - Custom domain provisioning
   - Analytics dashboard

---

## REFACTORING PRIORITIES

### Phase 1: Consolidate Navigation (High Priority)
**Goal**: Create unified `/dashboard` as central hub

**Changes:**
1. Move `/repositories` functionality into dashboard
2. Move `/storyboard` into project-level action
3. Redesign project cards with state-dependent CTAs
4. Add "Convert README" as primary button on new projects

**Files to Modify:**
- `src/app/dashboard/page.tsx` (new)
- `src/features/impact-engine/components/QuickPeek.tsx` (refactor)
- `src/app/repositories/page.tsx` (integrate into dashboard)
- `src/app/storyboard/page.tsx` (convert to modal/drawer)

### Phase 2: Add PRO Badge UI (Medium Priority)
**Goal**: Make domain purchasing visible

**Changes:**
1. Add "Buy Domain" button to project cards (gold PRO badge)
2. Create `/settings/domains` page
3. Add Stripe billing integration
4. Show "(PRO)" labels on gated features

**Files to Create:**
- `src/app/settings/domains/page.tsx`
- `src/components/ui/pro-badge.tsx`
- `src/features/billing/` (new feature module)

### Phase 3: AI Knowledge Audit (Low Priority)
**Goal**: Help users optimize for HR perspective

**Changes:**
1. Add "AI Audit" tab in settings
2. Create OpenAI prompt for portfolio analysis
3. Display "what HR sees" insights
4. Suggest improvements

**Files to Create:**
- `src/features/ai-audit/` (new feature module)
- `src/lib/ai/portfolio-analyzer.ts`

---

## SUCCESS METRICS

### User Activation
- **Time to First Script**: < 2 minutes
- **Time to First Video**: < 1 day
- **Portfolio Completion Rate**: > 60%

### Conversion Funnel
- **Demo → Signup**: > 30%
- **Signup → First Script**: > 80%
- **First Script → First Video**: > 40%
- **Video Ready → PRO Upgrade**: > 15%

### Retention
- **Weekly Active Users**: Track portfolio views
- **Monthly Script Regenerations**: Measure ongoing usage
- **Domain Renewals**: PRO tier satisfaction

---

## COMPETITIVE POSITIONING

**Aura vs. Traditional Portfolio Sites**
- ❌ Static screenshots → ✅ Live video demos
- ❌ Manual portfolio updates → ✅ Auto-sync with GitHub
- ❌ Generic "About Me" → ✅ AI-generated narratives
- ❌ No proof of work → ✅ Real-time GitHub metrics

**Aura vs. GitHub Profile**
- ❌ Code-focused → ✅ Story-focused
- ❌ Technical audience → ✅ HR-friendly
- ❌ README fatigue → ✅ Video engagement
- ❌ No custom branding → ✅ Custom domains

---

## APPENDIX: FILE STRUCTURE MAPPING

```
CURRENT STRUCTURE                     → PROPOSED STRUCTURE
/app/page.tsx (landing)               → /app/page.tsx (marketing)
/app/repositories/page.tsx            → /app/dashboard/page.tsx (unified)
/app/storyboard/page.tsx              → /app/dashboard/[project]/script/page.tsx
                                      → /app/settings/domains/page.tsx (new)
                                      → /app/settings/ai-audit/page.tsx (new)
/features/impact-engine/              → (keep, enhance with video status)
/features/narrative-storyboarder/     → (keep, integrate into project flow)
                                      → /features/billing/ (new, PRO tier)
                                      → /features/ai-audit/ (new, knowledge audit)
```

End of Functional Map & Information Architecture
