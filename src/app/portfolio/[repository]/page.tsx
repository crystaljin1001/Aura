/**
 * Case Study Page
 * Dynamic route: /portfolio/[owner]-[repo]
 *
 * Displays full case study view with:
 * - Hero section with video/screenshot
 * - Product Health Score
 * - AI Context Blocks
 * - Impact Metrics
 * - Architecture Diagram
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

export default async function CaseStudyPage({ params }: PageProps) {
  // Get authenticated user
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Await params (Next.js 15 requirement)
  const resolvedParams = await params

  // Parse repository from params (format: owner-repo)
  const repositoryParam = resolvedParams.repository
  const repositoryUrl = repositoryParam.replace('-', '/') // Replace first hyphen with slash

  // Fetch case study data
  const result = await getCaseStudyData(repositoryUrl)

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Case Study Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            {result.error || 'This project case study could not be loaded.'}
          </p>
          <a
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  const project = result.data

  console.log('📊 Case Study Debug:', {
    repository: repositoryUrl,
    hasMetrics: project.metrics.length > 0,
    impactDataCached: project.impactDataCached,
    nonZeroMetrics: project.metrics.filter(m => m.value > 0).length,
    healthScore: project.healthScore.score,
    hasDescription: !!project.description,
    hasContextBlock: !!project.contextBlock,
  })

  // Fetch user's GitHub token
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
  let contextBlock = project.contextBlock
  if (!contextBlock && project.metrics.length > 0) {
    // Only generate if we have impact metrics (real data)
    try {
      // Import README fetcher dynamically
      const { fetchGitHubReadme } = await import('@/features/portfolio/api/github-readme')

      // Fetch actual README from GitHub
      const readmeContent = await fetchGitHubReadme(project.owner, project.repo, githubToken || undefined)

      if (readmeContent && readmeContent.length > 100) {
        console.log('✅ Fetched README, generating context blocks...')

        const contextResult = await generateContextBlock(
          project.repo,
          project.description || 'A software project',
          readmeContent,
          project.techStack,
          repositoryUrl
        )

        if (contextResult.success && contextResult.data) {
          contextBlock = contextResult.data
          console.log('✅ Context blocks generated successfully')
        } else {
          console.error('❌ Context block generation failed:', contextResult.error)
        }
      } else {
        console.warn('⚠️ README too short or not found, skipping context block generation')
      }
    } catch (error) {
      console.error('❌ Error generating context blocks:', error)
    }
  }

  // Generate architecture diagram on demand
  let architectureDiagram = project.architectureDiagram
  if (!architectureDiagram && project.metrics.length > 0) {
    try {
      const { fetchGitHubReadme } = await import('@/features/portfolio/api/github-readme')
      const readmeContent = await fetchGitHubReadme(project.owner, project.repo, githubToken || undefined)

      if (readmeContent && readmeContent.length > 100) {
        console.log('✅ Fetched README, generating architecture diagram...')

        const diagramResult = await generateArchitectureDiagram(
          project.repo,
          project.description || 'A software project',
          readmeContent,
          project.techStack,
          githubToken || undefined
        )

        if (diagramResult.success && diagramResult.data) {
          architectureDiagram = diagramResult.data
          console.log('✅ Architecture diagram generated successfully')
        } else {
          console.error('❌ Architecture diagram generation failed:', diagramResult.error)
        }
      }
    } catch (error) {
      console.error('❌ Error generating architecture diagram:', error)
    }
  }

  const nonZeroMetrics = project.metrics.filter((m) => m.value > 0)

  return (
    <>
      <Header showBackButton backHref="/dashboard" backLabel="Back to Dashboard" />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <HeroSection project={project} />

      {/* CTA: Write Technical Journey (if doesn't exist) */}
      {!project.technicalJourney && (
        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="glass-card-glow p-8 rounded-2xl border border-blue-500/30 bg-blue-500/5">
            <div className="flex items-start gap-4">
              <div className="text-4xl">✨</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Tell Your Technical Story
                </h3>
                <p className="text-muted-foreground mb-4">
                  Make this project stand out by sharing your journey: What problem did you solve?
                  How did you approach it? What challenges did you overcome?
                </p>
                <a
                  href={`/dashboard?edit=${repositoryUrl}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Write Technical Journey
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Technical Journey (if exists) */}
      {project.technicalJourney && (
        <TechnicalJourneySectionWithEdit
          repositoryUrl={repositoryUrl}
          journey={project.technicalJourney}
          canEdit={true} // User can edit their own projects
        />
      )}

      {/* Technical Decisions (if exists) */}
      {project.technicalJourney?.techDecisions && project.technicalJourney.techDecisions.length > 0 && (
        <TechnicalDecisionsSection
          decisions={project.technicalJourney.techDecisions}
          techStack={project.techStack}
        />
      )}

      {/* Professional Project Assessment */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <ProfessionalProjectAssessment
          completeness={project.completeness}
          repositoryUrl={repositoryUrl}
        />
      </section>

      {/* AI Critique / Red Team Analysis */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <CritiqueButton
          repositoryUrl={repositoryUrl}
          technicalJourney={project.technicalJourney}
        />
      </section>

      {/* Data Status Message (when impact data is missing) */}
      {!project.impactDataCached ? (
        <section className="max-w-4xl mx-auto px-6 py-8">
          <div className="glass-card-glow p-8 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-4">
              <div className="text-4xl">ℹ️</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Impact Data Not Available Yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  This project doesn&apos;t have cached impact metrics from GitHub. To see
                  Impact Metrics and Architecture Diagrams, you need to:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
                  <li>Go to the <a href="/repositories" className="text-blue-400 hover:underline">Repositories page</a></li>
                  <li>Add your GitHub Personal Access Token</li>
                  <li>Wait for impact metrics to be calculated (refreshes every 24 hours)</li>
                </ol>
                <div className="flex gap-3">
                  <a
                    href="/repositories"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                  >
                    Configure GitHub Token
                  </a>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-glass-hover rounded-lg font-medium transition-colors"
                  >
                    Back to Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : nonZeroMetrics.length === 0 ? (
        <section className="max-w-4xl mx-auto px-6 py-8">
          <div className="glass-card-glow p-8 rounded-2xl border border-blue-500/30 bg-blue-500/5">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🌱</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Early Stage Project
                </h3>
                <p className="text-muted-foreground mb-4">
                  This is a new project without public GitHub activity yet (0 stars, 0 forks, 0 watchers).
                  Impact metrics will appear as your project gains traction.
                </p>
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> Focus on building your Technical Journey and showcasing your
                  engineering decisions to make this project stand out even without public metrics.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Context Blocks (Legacy - if available) */}
      {contextBlock && (
        <ContextBlockSection contextBlock={contextBlock} />
      )}

      {/* Impact Metrics Section */}
      {nonZeroMetrics.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Measurable Impact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nonZeroMetrics.map((metric) => (
              <ImpactCard key={metric.id} metric={metric} variant="detailed" />
            ))}
          </div>
        </section>
      )}

      {/* Architecture Diagram (if available) */}
      {architectureDiagram && (
        <ArchitectureDiagramSection
          diagram={architectureDiagram}
          projectName={project.repo}
        />
      )}

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="glass-card-glow p-12 rounded-2xl border border-border text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Explore the Code
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Dive into the implementation, review the architecture, and see the impact this project has made.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`https://github.com/${project.repositoryUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-semibold hover:bg-foreground/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-glass-hover transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit Live Site
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
    </>
  )
}
