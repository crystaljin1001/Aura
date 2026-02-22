/**
 * User Portfolio Landing Page
 * Route: /u/username
 *
 * Displays user's public portfolio with all their projects
 * This is the shareable link for recruiters/HR
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PageProps } from '@/types'
import { Header } from '@/components/layout/Header'
import { PortfolioGrid } from '@/features/portfolio/components/PortfolioGrid'
import { getUserProjects } from '@/features/portfolio/api/actions'

interface UsernamePageProps extends PageProps {
  params: Promise<{ username: string }>
}

export default async function UserPortfolioPage({ params }: UsernamePageProps) {
  const supabase = await createClient()
  const resolvedParams = await params
  const username = resolvedParams.username

  // For MVP, just check if current user matches the username
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    redirect('/auth')
  }

  // Extract username from email (before @)
  const currentUsername = currentUser.email?.split('@')[0] || ''

  if (currentUsername !== username) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Portfolio Not Found</h1>
            <p className="text-muted-foreground mb-8">
              This user portfolio does not exist or is not public yet.
            </p>
            <a
              href="/dashboard"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </>
    )
  }

  // Fetch user's projects
  const projectsResult = await getUserProjects(currentUser.id)
  const projects = projectsResult.success && projectsResult.data ? projectsResult.data : []

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              {username}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Portfolio of Projects
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-muted-foreground">
                {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              </span>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <PortfolioGrid projects={projects} username={username} />
        </section>
      </main>
    </>
  )
}
