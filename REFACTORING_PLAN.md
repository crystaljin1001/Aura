# Aura Refactoring Plan - Navigation & Button Placement

## Executive Summary

Transform Aura's navigation from a split dashboard model (`/`, `/repositories`, `/storyboard`) into a unified workspace that guides users toward "Proving Their Work" through clear, state-dependent CTAs.

---

## PHASE 1: UNIFIED DASHBOARD (Priority: HIGH)
**Timeline**: 1-2 weeks
**Goal**: Create `/dashboard` as the central hub with project cards showing state-dependent actions

### 1.1 Create Unified Dashboard Route

**New File**: `/src/app/dashboard/page.tsx`

```typescript
// Unified dashboard that combines repository management + portfolio display
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProjectGrid } from '@/features/projects/components/ProjectGrid'
import { AddProjectCard } from '@/features/projects/components/AddProjectCard'
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'

export default async function DashboardPage() {
  // Server component: fetch user's projects, scripts, video status, domain status
  const projects = await getUserProjectsWithStatus() // New server action

  return (
    <DashboardLayout>
      <DashboardHeader />
      <ProjectGrid>
        <AddProjectCard /> {/* Always first card */}
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </ProjectGrid>
    </DashboardLayout>
  )
}
```

**Key Features**:
- Server-side fetch all project data (repos, scripts, videos, domains)
- Grid layout with "Add Project" as first card
- Each project card shows status badges
- State-dependent primary CTA

---

### 1.2 Create Enhanced Project Card Component

**New File**: `/src/features/projects/components/ProjectCard.tsx`

```typescript
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProBadge } from '@/components/ui/pro-badge'

type ProjectStatus = 'new' | 'script_ready' | 'video_ready' | 'deployed'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    repository: string
    status: ProjectStatus
    hasScript: boolean
    hasVideo: boolean
    hasDomain: boolean
    stars: number
    forks: number
    impactMetrics: ImpactMetrics
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const primaryCTA = getPrimaryCTA(project.status)

  return (
    <Card className="project-card">
      {/* Header */}
      <div className="card-header">
        <h3>{project.name}</h3>
        <StatusBadges project={project} />
      </div>

      {/* Impact Metrics Preview */}
      <ImpactMetricsMini metrics={project.impactMetrics} />

      {/* Status Indicators */}
      <div className="status-row">
        <StatusIndicator
          icon="📝"
          label="Script"
          status={project.hasScript ? 'complete' : 'pending'}
        />
        <StatusIndicator
          icon="🎥"
          label="Video"
          status={project.hasVideo ? 'complete' : 'pending'}
        />
        <StatusIndicator
          icon="🌐"
          label="Domain"
          status={project.hasDomain ? 'complete' : 'pending'}
        />
      </div>

      {/* PRIMARY CTA (Large, Color-Coded) */}
      <PrimaryCTAButton project={project} />

      {/* Secondary Actions (Dropdown) */}
      <SecondaryActionsMenu project={project} />
    </Card>
  )
}

function PrimaryCTAButton({ project }: { project: ProjectCardProps['project'] }) {
  switch (project.status) {
    case 'new':
      return (
        <Button
          size="lg"
          variant="default"
          className="w-full bg-green-600 hover:bg-green-700 h-12"
          onClick={() => handleConvertREADME(project.id)}
        >
          ✨ Convert README
        </Button>
      )

    case 'script_ready':
      return (
        <Button
          size="lg"
          variant="default"
          className="w-full bg-blue-600 hover:bg-blue-700 h-12"
          onClick={() => handleRecordVideo(project.id)}
        >
          🎥 Record Video Demo
        </Button>
      )

    case 'video_ready':
      return (
        <Button
          size="lg"
          variant="default"
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 h-12"
          onClick={() => handleBuyDomain(project.id)}
        >
          🌐 Deploy to Domain <ProBadge className="ml-2" />
        </Button>
      )

    case 'deployed':
      return (
        <Button
          size="lg"
          variant="outline"
          className="w-full h-12"
          onClick={() => handleViewPortfolio(project.id)}
        >
          👁️ View Live Portfolio
        </Button>
      )
  }
}

function SecondaryActionsMenu({ project }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">⋯</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {project.hasScript && (
          <DropdownMenuItem onClick={() => handleEditScript(project.id)}>
            Edit Script
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleRegenerateScript(project.id)}>
          Re-generate Script
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleViewOnGitHub(project.repository)}>
          View on GitHub
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleDeleteProject(project.id)}
          className="text-red-600"
        >
          Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Key Features**:
- State-dependent primary CTA (large, prominent, color-coded)
- Status indicators for script/video/domain completion
- Impact metrics preview (stars, forks, key achievements)
- PRO badge on "Deploy to Domain" button
- Secondary actions in dropdown menu (not prominent)

---

### 1.3 Create Add Project Card

**New File**: `/src/features/projects/components/AddProjectCard.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addRepository } from '@/features/projects/actions'

export function AddProjectCard() {
  const [isAdding, setIsAdding] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')

  if (!isAdding) {
    return (
      <Card className="add-project-card border-dashed border-2">
        <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">Add New Project</h3>
          <p className="text-muted-foreground mb-6 text-center">
            Turn your GitHub repo into a portfolio piece
          </p>
          <Button
            size="lg"
            onClick={() => setIsAdding(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            + Add GitHub Project
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="add-project-card">
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-4">Add GitHub Repository</h3>
        <Input
          type="text"
          placeholder="owner/repo or https://github.com/owner/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="mb-4"
        />
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">Add Project</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsAdding(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await addRepository(repoUrl)
    setIsAdding(false)
    setRepoUrl('')
  }
}
```

**Key Features**:
- Always appears as first card in grid
- Inline form for adding repos (no separate page)
- Clear CTA: "Turn your GitHub repo into a portfolio piece"

---

### 1.4 Update Navigation Component

**File to Modify**: `/src/components/layout/Navigation.tsx`

```typescript
// Before: Links to /, /repositories, /storyboard
// After: Links to /dashboard, /portfolio, /settings

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="navigation">
      <div className="nav-left">
        <Link href="/dashboard">
          <Logo />
        </Link>

        <NavLinks>
          <NavLink
            href="/dashboard"
            active={pathname === '/dashboard'}
          >
            🏠 Dashboard
          </NavLink>

          <NavLink
            href="/portfolio"
            active={pathname === '/portfolio'}
          >
            👁️ Portfolio
          </NavLink>

          <NavLink
            href="/settings"
            active={pathname.startsWith('/settings')}
          >
            ⚙️ Settings
          </NavLink>
        </NavLinks>
      </div>

      <div className="nav-right">
        <NotificationBell />
        <UserMenu />
      </div>
    </nav>
  )
}
```

**Changes**:
- Remove "Repositories" link (now in dashboard)
- Remove "Storyboard" link (now project-level action)
- Add "Dashboard" as primary link
- Add "Portfolio" (preview of public view)
- Add "Settings" (for domains, AI audit, GitHub)

---

### 1.5 Create Server Actions for Project Status

**New File**: `/src/features/projects/actions.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUserProjectsWithStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Fetch repositories
  const { data: repos } = await supabase
    .from('user_repositories')
    .select('*')
    .eq('user_id', user.id)

  // Fetch scripts
  const { data: scripts } = await supabase
    .from('narrative_scripts')
    .select('project_name, repository_url')
    .eq('user_id', user.id)

  // Fetch videos (TODO: create table)
  const { data: videos } = await supabase
    .from('project_videos')
    .select('repository_url')
    .eq('user_id', user.id)

  // Fetch domains (TODO: create table)
  const { data: domains } = await supabase
    .from('project_domains')
    .select('repository_url')
    .eq('user_id', user.id)

  // Combine data and determine status
  return repos?.map(repo => {
    const hasScript = scripts?.some(s => s.repository_url === repo.full_name)
    const hasVideo = videos?.some(v => v.repository_url === repo.full_name)
    const hasDomain = domains?.some(d => d.repository_url === repo.full_name)

    let status: ProjectStatus = 'new'
    if (hasDomain) status = 'deployed'
    else if (hasVideo) status = 'video_ready'
    else if (hasScript) status = 'script_ready'

    return {
      id: repo.id,
      name: repo.name,
      repository: repo.full_name,
      status,
      hasScript,
      hasVideo,
      hasDomain,
      stars: repo.stars || 0,
      forks: repo.forks || 0,
      impactMetrics: {} // Fetch from impact_cache
    }
  }) || []
}

export async function addRepository(repoUrl: string) {
  // Existing logic from /src/app/repositories/page.tsx
  // Move server action here
  const supabase = await createClient()
  // ... add repository logic
  revalidatePath('/dashboard')
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  // Delete from user_repositories
  await supabase
    .from('user_repositories')
    .delete()
    .eq('id', projectId)

  revalidatePath('/dashboard')
}
```

---

### 1.6 Migrate Storyboard to Modal/Drawer

**New File**: `/src/features/projects/components/ScriptEditorModal.tsx`

```typescript
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StoryboardForm } from '@/features/narrative-storyboarder/components/StoryboardForm'

interface ScriptEditorModalProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export function ScriptEditorModal({ projectId, isOpen, onClose }: ScriptEditorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Video Script</DialogTitle>
        </DialogHeader>

        {/* Reuse existing StoryboardForm component */}
        <StoryboardForm projectId={projectId} onComplete={onClose} />
      </DialogContent>
    </Dialog>
  )
}
```

**Changes to StoryboardForm**:
- Accept `projectId` prop instead of repository selector
- Auto-fetch README using existing `fetchReadmeFromGitHub`
- On successful generation, close modal and refresh dashboard

---

### 1.7 Update Landing Page Routing

**File to Modify**: `/src/app/page.tsx`

```typescript
// Before: Landing page with portfolio sections
// After: Marketing page for unauthenticated users, redirect for authenticated

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  // Otherwise, show marketing landing page
  return <LandingPage />
}
```

**Alternate Approach** (if you want landing page accessible to all):
- Keep `/` as marketing page
- Add navbar link "Dashboard" that goes to `/dashboard`
- Show different navbar for authenticated vs unauthenticated users

---

## PHASE 2: PRO BADGE & DOMAIN UI (Priority: MEDIUM)
**Timeline**: 1 week
**Goal**: Make domain purchasing visible with gold PRO badges

### 2.1 Create ProBadge Component

**New File**: `/src/components/ui/pro-badge.tsx`

```typescript
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProBadgeProps {
  className?: string
  variant?: 'default' | 'small'
}

export function ProBadge({ className, variant = 'default' }: ProBadgeProps) {
  return (
    <Badge
      className={cn(
        'bg-gradient-to-r from-amber-500 to-orange-600',
        'text-white font-semibold',
        'border-amber-600',
        variant === 'small' ? 'text-xs px-1.5 py-0' : 'text-sm px-2 py-0.5',
        className
      )}
    >
      PRO
    </Badge>
  )
}
```

---

### 2.2 Create Domain Management Settings Page

**New File**: `/src/app/settings/domains/page.tsx`

```typescript
import { SettingsLayout } from '@/components/layout/SettingsLayout'
import { DomainList } from '@/features/domains/components/DomainList'
import { BuyDomainButton } from '@/features/domains/components/BuyDomainButton'
import { ProBadge } from '@/components/ui/pro-badge'

export default async function DomainsSettingsPage() {
  const domains = await getUserDomains() // Server action
  const hasPro = await checkProSubscription() // Server action

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Domain Management <ProBadge />
            </h1>
            <p className="text-muted-foreground">
              Deploy your portfolio to custom domains
            </p>
          </div>

          {hasPro && (
            <BuyDomainButton />
          )}
        </div>

        {!hasPro && (
          <UpgradeToProCard feature="custom domains" />
        )}

        {hasPro && (
          <>
            <DomainList domains={domains} />
            <DomainGuide /> {/* How to configure DNS */}
          </>
        )}
      </div>
    </SettingsLayout>
  )
}
```

---

### 2.3 Create Domain Purchase Flow

**New File**: `/src/features/domains/components/BuyDomainButton.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useState } from 'react'

export function BuyDomainButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="lg">
        🌐 Buy New Domain
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DomainPurchaseForm onComplete={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function DomainPurchaseForm({ onComplete }) {
  const [domain, setDomain] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Purchase Custom Domain</h2>

      <Input
        type="text"
        placeholder="yourawesomeportfolio.com"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />

      <Button
        onClick={handleCheckAvailability}
        disabled={!domain || isChecking}
      >
        {isChecking ? 'Checking...' : 'Check Availability'}
      </Button>

      {isAvailable === true && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <p className="text-green-800 font-semibold">
            ✅ {domain} is available!
          </p>
          <p className="text-sm text-green-700 mt-2">
            Price: $12/year • Includes SSL • Auto-renewal
          </p>
          <Button
            onClick={handlePurchase}
            className="mt-4 w-full"
          >
            Purchase for $12/year
          </Button>
        </div>
      )}

      {isAvailable === false && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-800">
            ❌ {domain} is not available
          </p>
          <p className="text-sm text-red-700 mt-2">
            Try a different domain name
          </p>
        </div>
      )}
    </div>
  )

  async function handleCheckAvailability() {
    setIsChecking(true)
    const available = await checkDomainAvailability(domain) // Server action
    setIsAvailable(available)
    setIsChecking(false)
  }

  async function handlePurchase() {
    await purchaseDomain(domain) // Server action + Stripe integration
    onComplete()
  }
}
```

---

### 2.4 Create Settings Layout with Sidebar

**New File**: `/src/components/layout/SettingsLayout.tsx`

```typescript
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProBadge } from '@/components/ui/pro-badge'

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/10 p-6">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>

        <nav className="space-y-2">
          <SettingsLink href="/settings" active={pathname === '/settings'}>
            Account
          </SettingsLink>

          <SettingsLink
            href="/settings/domains"
            active={pathname === '/settings/domains'}
            badge={<ProBadge variant="small" />}
          >
            Domain Management
          </SettingsLink>

          <SettingsLink
            href="/settings/ai-audit"
            active={pathname === '/settings/ai-audit'}
          >
            AI Knowledge Audit
          </SettingsLink>

          <SettingsLink
            href="/settings/github"
            active={pathname === '/settings/github'}
          >
            GitHub Integration
          </SettingsLink>

          <SettingsLink
            href="/settings/billing"
            active={pathname === '/settings/billing'}
          >
            Billing & Upgrades
          </SettingsLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

function SettingsLink({ href, active, badge, children }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between px-3 py-2 rounded-md',
        active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
      )}
    >
      <span>{children}</span>
      {badge}
    </Link>
  )
}
```

---

## PHASE 3: AI KNOWLEDGE AUDIT (Priority: LOW)
**Timeline**: 1-2 weeks
**Goal**: Help users see "what HR sees" about their portfolio

### 3.1 Create AI Audit Settings Page

**New File**: `/src/app/settings/ai-audit/page.tsx`

```typescript
import { SettingsLayout } from '@/components/layout/SettingsLayout'
import { AuditReport } from '@/features/ai-audit/components/AuditReport'
import { Button } from '@/components/ui/button'

export default async function AIAuditPage() {
  const latestAudit = await getLatestPortfolioAudit() // Server action

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Knowledge Audit</h1>
            <p className="text-muted-foreground">
              See what hiring managers learn about you from your portfolio
            </p>
          </div>

          <form action={runPortfolioAudit}>
            <Button type="submit" size="lg">
              🤖 Run New Audit
            </Button>
          </form>
        </div>

        {latestAudit ? (
          <AuditReport audit={latestAudit} />
        ) : (
          <EmptyAuditState />
        )}
      </div>
    </SettingsLayout>
  )
}
```

---

### 3.2 Create AI Audit Server Action

**New File**: `/src/features/ai-audit/actions.ts`

```typescript
'use server'

import { generatePortfolioAudit } from '@/lib/ai/portfolio-analyzer'
import { createClient } from '@/lib/supabase/server'

export async function runPortfolioAudit() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Fetch all user projects, scripts, READMEs
  const projects = await getUserProjectsWithStatus()

  // Run GPT-4 analysis
  const audit = await generatePortfolioAudit({
    projects,
    userId: user.id
  })

  // Save to database
  await supabase.from('portfolio_audits').insert({
    user_id: user.id,
    audit_data: audit,
    created_at: new Date().toISOString()
  })

  revalidatePath('/settings/ai-audit')

  return audit
}
```

---

### 3.3 Create Portfolio Analyzer AI Client

**New File**: `/src/lib/ai/portfolio-analyzer.ts`

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generatePortfolioAudit({ projects, userId }) {
  const prompt = `
You are an experienced technical recruiter reviewing a developer's portfolio.
Analyze the following projects and provide a detailed assessment of what this
portfolio tells you about the candidate's skills, experience, and potential fit
for a senior engineering role.

PROJECTS:
${projects.map(p => `
- ${p.name} (${p.stars} stars, ${p.forks} forks)
  README: ${p.readme}
  Impact: ${JSON.stringify(p.impactMetrics)}
`).join('\n')}

Provide your assessment in the following structure:
1. Technical Depth (score 1-10)
2. Problem-Solving Ability (score 1-10)
3. Communication Skills (score 1-10)
4. Code Quality (score 1-10)
5. Overall Portfolio Health (score out of 100)
6. Key Strengths (3-5 bullet points)
7. Improvement Suggestions (3-5 actionable recommendations)
8. Red Flags (if any)
9. Best Projects to Highlight (top 3)
10. Recommended Job Titles (3-5 roles they're qualified for)
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an experienced technical recruiter.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  })

  return JSON.parse(completion.choices[0].message.content)
}
```

---

## DATABASE SCHEMA CHANGES

### New Tables to Create

```sql
-- Project videos table
CREATE TABLE project_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,
  video_url TEXT NOT NULL, -- Tella/Arcade embed URL
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project domains table
CREATE TABLE project_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  cloudflare_zone_id TEXT,
  ssl_status TEXT DEFAULT 'pending', -- pending, active, error
  is_active BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio audits table
CREATE TABLE portfolio_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table (for PRO tier)
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL, -- 'free', 'pro'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active', -- active, canceled, expired
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_project_videos_user ON project_videos(user_id);
CREATE INDEX idx_project_domains_user ON project_domains(user_id);
CREATE INDEX idx_portfolio_audits_user ON portfolio_audits(user_id);
CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
```

---

## FILE MIGRATION CHECKLIST

### Files to Create (New)
- [ ] `/src/app/dashboard/page.tsx` - Unified dashboard
- [ ] `/src/app/settings/page.tsx` - Account settings
- [ ] `/src/app/settings/domains/page.tsx` - Domain management
- [ ] `/src/app/settings/ai-audit/page.tsx` - AI audit
- [ ] `/src/app/settings/github/page.tsx` - GitHub settings
- [ ] `/src/app/settings/billing/page.tsx` - Billing
- [ ] `/src/features/projects/components/ProjectCard.tsx` - Enhanced card
- [ ] `/src/features/projects/components/AddProjectCard.tsx` - Add project
- [ ] `/src/features/projects/components/ProjectGrid.tsx` - Grid layout
- [ ] `/src/features/projects/components/ScriptEditorModal.tsx` - Modal
- [ ] `/src/features/projects/actions.ts` - Project server actions
- [ ] `/src/features/domains/` - New feature module
- [ ] `/src/features/ai-audit/` - New feature module
- [ ] `/src/components/ui/pro-badge.tsx` - PRO badge component
- [ ] `/src/components/layout/SettingsLayout.tsx` - Settings layout
- [ ] `/src/components/layout/DashboardLayout.tsx` - Dashboard layout
- [ ] `/src/lib/ai/portfolio-analyzer.ts` - AI audit logic

### Files to Modify (Existing)
- [ ] `/src/app/page.tsx` - Add redirect to /dashboard if authenticated
- [ ] `/src/components/layout/Navigation.tsx` - Update nav links
- [ ] `/src/features/narrative-storyboarder/components/StoryboardForm.tsx` - Make reusable

### Files to Deprecate (Keep for backward compat, but hide from nav)
- [ ] `/src/app/repositories/page.tsx` - Move logic to dashboard
- [ ] `/src/app/storyboard/page.tsx` - Move to modal

---

## VISUAL DESIGN SPECIFICATIONS

### Button Hierarchy

```
PRIMARY CTAs (State-Dependent)
├─ "Convert README" (NEW state)
│  └─ Size: lg (h-12) | Color: green-600 | Width: full | Icon: ✨
├─ "Record Video" (SCRIPT_READY state)
│  └─ Size: lg (h-12) | Color: blue-600 | Width: full | Icon: 🎥
├─ "Deploy to Domain" (VIDEO_READY state)
│  └─ Size: lg (h-12) | Color: amber-to-orange gradient | Width: full | Icon: 🌐 + PRO badge
└─ "View Portfolio" (DEPLOYED state)
   └─ Size: lg (h-12) | Color: outline | Width: full | Icon: 👁️

SECONDARY ACTIONS (Dropdown Menu)
└─ Size: sm | Variant: ghost | Icon: ⋯ (three dots)

TERTIARY ACTIONS (Text Links)
└─ Size: sm | Variant: link | Color: muted-foreground
```

### Color Palette

```
STATE COLORS
├─ New Project: green-600 (#16a34a)
├─ Script Ready: blue-600 (#2563eb)
├─ Video Ready: amber-500 to orange-600 gradient
├─ Deployed: neutral with green checkmark
└─ PRO Features: gold gradient (amber-500 to orange-600)

STATUS INDICATORS
├─ Complete: green-500 with checkmark ✓
├─ Pending: gray-400 with circle ○
└─ Error: red-500 with X ✗
```

### Card Layout

```
┌──────────────────────────────────────┐
│ 📦 Project Name          [Featured]  │  ← Header with badges
├──────────────────────────────────────┤
│ ⭐ 234  🍴 45  👥 12 users           │  ← GitHub stats
├──────────────────────────────────────┤
│ Top Impact Metrics:                  │  ← Impact preview
│ • 89 bugs fixed                      │
│ • 12 features delivered              │
│ • 500+ users                         │
├──────────────────────────────────────┤
│ Status:                              │  ← Progress indicators
│ [✓] Script  [✓] Video  [○] Domain   │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │  🎥 RECORD VIDEO DEMO (PRIMARY)  │ │  ← State-dependent CTA
│ └──────────────────────────────────┘ │
│             [⋯ More]                 │  ← Secondary dropdown
└──────────────────────────────────────┘

Dimensions:
- Min height: 300px
- Max width: 400px (in grid)
- Padding: 24px
- Border radius: 12px
- Border: 1px solid muted
- Hover: Lift effect (shadow-lg)
```

---

## DEPLOYMENT STRATEGY

### Phase 1 Rollout (Week 1-2)
1. Create dashboard route (can coexist with old routes)
2. Update navigation to include dashboard link
3. Test with subset of users
4. Monitor for bugs/feedback

### Phase 2 Rollout (Week 3)
1. Deploy PRO badge UI
2. Create domain settings page (even if backend not ready)
3. Show "(Coming Soon)" for domain purchases

### Phase 3 Rollout (Week 4-5)
1. Deploy AI audit feature
2. Integrate billing (Stripe)
3. Enable domain purchases

### Deprecation Plan
- Keep `/repositories` and `/storyboard` routes for 1 month
- Add deprecation notices redirecting to dashboard
- Remove old routes after migration complete

---

## SUCCESS METRICS

### Phase 1 (Dashboard)
- [ ] 80% of users land on /dashboard after login
- [ ] Average time to first "Convert README" click < 30s
- [ ] Project card actions CTR > 40%

### Phase 2 (PRO)
- [ ] "Buy Domain" button visible on 100% of video-ready projects
- [ ] Domain settings page views > 20% of active users
- [ ] PRO upgrade intent (clicked domain CTA) > 10%

### Phase 3 (AI Audit)
- [ ] 30% of users run at least one audit
- [ ] Audit insights lead to 50% of users updating READMEs
- [ ] Correlation between audit score and PRO upgrades

---

## TESTING CHECKLIST

### Functional Tests
- [ ] Can add new project from dashboard
- [ ] Can delete project from card dropdown
- [ ] "Convert README" triggers script generation modal
- [ ] Script modal auto-fetches README from GitHub
- [ ] "Record Video" opens instructions/Tella link
- [ ] "Buy Domain" shows PRO upgrade if free tier
- [ ] Domain settings page loads without errors
- [ ] AI audit generates valid JSON report
- [ ] All navigation links work (dashboard, portfolio, settings)

### Visual Tests
- [ ] Primary CTA is clearly largest button on card
- [ ] PRO badge shows on domain features
- [ ] Status indicators update correctly
- [ ] Cards display properly in grid (mobile + desktop)
- [ ] Modals are responsive

### Performance Tests
- [ ] Dashboard loads in < 2s with 10 projects
- [ ] Script generation completes in < 15s
- [ ] AI audit completes in < 30s
- [ ] No layout shift when cards load

---

## ROLLBACK PLAN

If critical issues arise:
1. **Immediate**: Revert navigation to show old routes
2. **Short-term**: Add feature flag to toggle dashboard vs old UI
3. **Long-term**: Fix issues in staging before re-deploy

Feature Flag Example:
```typescript
const useDashboard = process.env.NEXT_PUBLIC_USE_NEW_DASHBOARD === 'true'

if (useDashboard) {
  return <DashboardPage />
} else {
  return <LegacyRepositoriesPage />
}
```

---

End of Refactoring Plan
