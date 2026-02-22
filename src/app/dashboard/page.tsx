import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProjectsWithStatus } from '@/features/projects/actions'
import { ProjectGrid } from '@/features/projects/components/ProjectGrid'
import { ProjectCard } from '@/features/projects/components/ProjectCard'
import { AddProjectCard } from '@/features/projects/components/AddProjectCard'
import { RefreshImpactButton } from '@/features/impact-engine/components/RefreshImpactButton'
import { TechnicalJourneyModalWrapper } from '@/features/portfolio/components/TechnicalJourneyModalWrapper'
import { NextStepsGuidance } from '@/features/projects/components/NextStepsGuidance'
import { SharePortfolioCard } from '@/features/portfolio/components/SharePortfolioCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const projects = await getUserProjectsWithStatus()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold">
                Aura
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Portfolio
                </Link>
                <Link
                  href="/settings"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Settings
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
              <p className="text-muted-foreground">
                Transform your GitHub repos into portfolio pieces with video demos
              </p>
            </div>
            <RefreshImpactButton />
          </div>
        </div>

        {/* Share Portfolio */}
        {projects.length > 0 && <SharePortfolioCard userEmail={user.email || ''} />}

        {/* Next Steps Guidance */}
        <NextStepsGuidance projects={projects} />

        {/* Project Grid */}
        <ProjectGrid>
          <AddProjectCard />
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ProjectGrid>

        {/* Empty State - First Time Onboarding */}
        {projects.length === 0 && (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="glass-card p-8 md:p-12 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Profile Setup Complete!</h2>
                <p className="text-muted-foreground">
                  Now let&apos;s showcase your work by building your portfolio
                </p>
              </div>

              <div className="space-y-6 text-left mb-8">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Add Your GitHub Projects</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect repositories you want to showcase. Click the &quot;Add GitHub Project&quot; card above to get started.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-muted-foreground">Write Your Technical Journey</h3>
                    <p className="text-sm text-muted-foreground">
                      Tell the story behind your project: the problem, your approach, challenges, and outcomes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-muted-foreground">Generate Demo Scripts</h3>
                    <p className="text-sm text-muted-foreground">
                      Create narration scripts for your project demos to make recording easier.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-muted-foreground">Record & Upload Videos</h3>
                    <p className="text-sm text-muted-foreground">
                      Capture video demos showing your projects in action to bring your portfolio to life.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Your portfolio will be live at{' '}
                  <Link href="/" className="text-blue-400 hover:text-blue-300 font-medium">
                    your portfolio page
                  </Link>
                  {' '}once you add projects
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Technical Journey Modal */}
      <Suspense fallback={null}>
        <TechnicalJourneyModalWrapper />
      </Suspense>
    </div>
  )
}
