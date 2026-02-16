import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProjectsWithStatus } from '@/features/projects/actions'
import { ProjectGrid } from '@/features/projects/components/ProjectGrid'
import { ProjectCard } from '@/features/projects/components/ProjectCard'
import { AddProjectCard } from '@/features/projects/components/AddProjectCard'
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
                  href="/portfolio"
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
          <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
          <p className="text-muted-foreground">
            Transform your GitHub repos into portfolio pieces with video demos
          </p>
        </div>

        {/* Project Grid */}
        <ProjectGrid>
          <AddProjectCard />
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ProjectGrid>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-12 mt-8">
            <p className="text-lg text-muted-foreground mb-4">
              No projects yet. Add your first GitHub repository to get started!
            </p>
            <p className="text-sm text-muted-foreground">
              Click the "Add GitHub Project" card above to begin.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
