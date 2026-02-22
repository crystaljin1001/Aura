/**
 * User Project Case Study Page
 * Route: /u/username/project-name
 *
 * Shows the full case study for a specific project
 * This is the shareable link for individual projects
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PageProps } from '@/types'
import { getCaseStudyData, generateContextBlock, generateArchitectureDiagram } from '@/features/portfolio/api/actions'
import { decryptToken } from '@/lib/encryption/crypto'
import { Header } from '@/components/layout/Header'
import { HeroSection } from '@/features/portfolio/components/HeroSection'
import { ContextBlockSection } from '@/features/portfolio/components/ContextBlockSection'
import { ArchitectureDiagramSection } from '@/features/portfolio/components/ArchitectureDiagramSection'
import { ImpactCard } from '@/features/impact-engine/components/ImpactCard'
import { TechnicalJourneySectionWithEdit } from '@/features/portfolio/components/TechnicalJourneySectionWithEdit'
import { TechnicalDecisionsSection } from '@/features/portfolio/components/TechnicalDecisionsSection'
import { ProfessionalProjectAssessment } from '@/features/portfolio/components/ProfessionalProjectAssessment'
import { CritiqueButton } from '@/features/portfolio/components/CritiqueButton'

interface ProjectPageProps extends PageProps {
  params: Promise<{ username: string; project: string }>
}

export default async function ProjectCaseStudyPage({ params }: ProjectPageProps) {
  const supabase = await createClient()
  const resolvedParams = await params
  const username = resolvedParams.username
  const projectName = resolvedParams.project

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // For MVP, verify username matches current user
  const currentUsername = user.email?.split('@')[0] || ''
  if (currentUsername !== username) {
    return (
      <>
        <Header showBackButton backHref={`/u/${username}`} backLabel="Back to Portfolio" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-8">
              This project does not exist or is not accessible.
            </p>
            <a href="/dashboard" className="text-blue-400 hover:text-blue-300 underline">
              Go to Dashboard
            </a>
          </div>
        </div>
      </>
    )
  }

  // Find the repository URL from the project name
  // Need to look up the repo in user_repositories table
  const { data: repos } = await supabase
    .from('user_repositories')
    .select('repo_owner, repo_name')
    .eq('user_id', user.id)

  const matchingRepo = repos?.find(
    (r) => r.repo_name.toLowerCase() === projectName.toLowerCase()
  )

  if (!matchingRepo) {
    return (
      <>
        <Header showBackButton backHref={`/u/${username}`} backLabel="Back to Portfolio" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-8">
              Could not find project "{projectName}" in your portfolio.
            </p>
            <a href={`/u/${username}`} className="text-blue-400 hover:text-blue-300 underline">
              Back to Portfolio
            </a>
          </div>
        </div>
      </>
    )
  }

  const repositoryUrl = `${matchingRepo.repo_owner}/${matchingRepo.repo_name}`

  // Fetch case study data (reuse existing logic)
  const result = await getCaseStudyData(repositoryUrl)

  if (!result.success || !result.data) {
    return (
      <>
        <Header showBackButton backHref={`/u/${username}`} backLabel="Back to Portfolio" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Case Study Not Found</h1>
            <p className="text-muted-foreground mb-8">
              {result.error || 'This project case study could not be loaded.'}
            </p>
            <a href={`/u/${username}`} className="text-blue-400 hover:text-blue-300 underline">
              Back to Portfolio
            </a>
          </div>
        </div>
      </>
    )
  }

  const project = result.data

  // Fetch GitHub token
  let githubToken: string | null = null
  const { data: tokenData } = await supabase
    .from('github_tokens')
    .select('encrypted_token, encryption_iv')
    .eq('user_id', user.id)
    .single()

  if (tokenData?.encrypted_token && tokenData?.encryption_iv) {
    try {
      githubToken = await decryptToken({
        encrypted: tokenData.encrypted_token,
        iv: tokenData.encryption_iv,
      })
    } catch (error) {
      console.error('Failed to decrypt GitHub token:', error)
    }
  }

  // Generate context block if not exists
  if (!project.contextBlock && githubToken) {
    try {
      const contextResult = await generateContextBlock(repositoryUrl, githubToken)
      if (contextResult.success && contextResult.data) {
        project.contextBlock = contextResult.data
      }
    } catch (error) {
      console.error('❌ Error generating context block:', error)
    }
  }

  // Generate architecture diagram if not exists
  if (!project.architectureDiagram && githubToken) {
    try {
      const diagramResult = await generateArchitectureDiagram(repositoryUrl, githubToken)
      if (diagramResult.success && diagramResult.data) {
        project.architectureDiagram = diagramResult.data
      }
    } catch (error) {
      console.error('❌ Error generating architecture diagram:', error)
    }
  }

  const nonZeroMetrics = project.metrics.filter((m) => m.value > 0)

  return (
    <>
      <Header showBackButton backHref={`/u/${username}`} backLabel="Back to Portfolio" />
      <main className="min-h-screen bg-background">
        <HeroSection project={project} />

        {!project.impactDataCached ? (
          <section className="max-w-4xl mx-auto px-6 py-8">
            <div className="glass-card p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Impact Data Not Available Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up your GitHub token in the dashboard to calculate impact metrics for this project.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : nonZeroMetrics.length === 0 ? (
          <section className="max-w-4xl mx-auto px-6 py-8">
            <div className="glass-card p-6 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Early Stage Project</h3>
                  <p className="text-sm text-muted-foreground">
                    This project is just getting started. Impact metrics will appear as the project grows with stars, forks, and contributions.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {project.contextBlock && <ContextBlockSection contextBlock={project.contextBlock} />}
        {nonZeroMetrics.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 py-12">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Impact Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nonZeroMetrics.map((metric) => (
                <ImpactCard key={metric.type} metric={metric} />
              ))}
            </div>
          </section>
        )}

        {project.technicalJourney && (
          <TechnicalJourneySectionWithEdit
            repositoryUrl={repositoryUrl}
            journey={project.technicalJourney}
          />
        )}

        {project.technicalJourney?.techDecisions && project.technicalJourney.techDecisions.length > 0 && (
          <TechnicalDecisionsSection decisions={project.technicalJourney.techDecisions} />
        )}

        {project.architectureDiagram && (
          <ArchitectureDiagramSection diagram={project.architectureDiagram} />
        )}

        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex justify-center">
            <CritiqueButton repositoryUrl={repositoryUrl} />
          </div>
        </section>

        <ProfessionalProjectAssessment repositoryUrl={repositoryUrl} />

        {project.websiteUrl && (
          <section className="max-w-4xl mx-auto px-6 py-12 text-center">
            <div className="glass-card p-8 rounded-2xl border border-blue-500/30">
              <h3 className="text-2xl font-bold text-foreground mb-4">Visit Live Site</h3>
              <p className="text-muted-foreground mb-6">
                Experience the project in action
              </p>
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit Live Site
              </a>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
