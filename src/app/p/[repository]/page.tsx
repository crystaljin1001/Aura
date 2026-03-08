/**
 * Public Portfolio Case Study
 * Route: /p/[owner-repo]
 *
 * Clean, recruiter-friendly view. No auth required.
 * Shows: video, description, metrics, architecture diagram, trade-off decision tree, pivot points.
 * Hides: all internal tools, edit buttons, integrity score, code review, "Why This Matters".
 */

import type { PageProps } from '@/types'
import { getPublicProjectData } from '@/features/portfolio/api/public-actions'
import { ImpactCard } from '@/features/impact-engine/components/ImpactCard'
import { ArchitectureDiagramSection } from '@/features/portfolio/components/ArchitectureDiagramSection'
import { DecisionTreeNode } from '@/features/portfolio/components/DecisionTreeNode'
import { PivotPointCard } from '@/features/portfolio/components/PivotPointCard'
import { getEmbeddableVideoUrl, getVideoType } from '@/lib/utils/video'
import { Star, GitFork, Github, ExternalLink, Play, Brain, GitBranch } from 'lucide-react'
import Link from 'next/link'

export default async function PublicCaseStudyPage({ params }: PageProps) {
  const resolvedParams = await params
  const repositoryParam = resolvedParams.repository as string

  const result = await getPublicProjectData(repositoryParam)

  if (!result.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-3">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">{result.error}</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 underline">
            View Portfolio
          </Link>
        </div>
      </div>
    )
  }

  const p = result.data
  const embedUrl = p.videoUrl ? getEmbeddableVideoUrl(p.videoUrl) : null
  const videoType = p.videoUrl ? getVideoType(p.videoUrl) : null
  const derivedThumb = p.thumbnailUrl ?? (p.videoUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
    ? `https://img.youtube.com/vi/${p.videoUrl!.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)![1]}/maxresdefault.jpg`
    : null)

  const { decisionNodes, pivotPoints } = p.logicMap

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors">
          ← Portfolio
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-mono">{p.repositoryUrl}</span>
          <a
            href={`https://github.com/${p.repositoryUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pb-24">

        {/* ── Hero ── */}
        <section className="pt-16 pb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
            {p.language && (
              <span className="px-2 py-0.5 rounded border border-border bg-secondary/50 font-mono text-xs">
                {p.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              {p.stars}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3.5 h-3.5 text-blue-400" />
              {p.forks}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            {p.repo}
          </h1>

          {p.description && (
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
              {p.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <a
              href={`https://github.com/${p.repositoryUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              <Github className="w-4 h-4" />
              View Code
            </a>
            {p.websiteUrl && (
              <a
                href={p.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
          </div>
        </section>

        {/* ── Video ── */}
        {(embedUrl || derivedThumb || p.videoUrl) && (
          <section className="mb-16">
            {embedUrl && (videoType === 'youtube' || videoType === 'vimeo') ? (
              <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-black aspect-video">
                <iframe
                  src={embedUrl}
                  title={`${p.repo} demo`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : derivedThumb && p.videoUrl ? (
              <a
                href={p.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block w-full rounded-2xl overflow-hidden border border-border group aspect-video"
              >
                <img src={derivedThumb} alt={`${p.repo} demo`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/55 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                </div>
              </a>
            ) : null}
          </section>
        )}

        {/* ── Impact Metrics ── */}
        {p.metrics.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">Measurable Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {p.metrics.map((metric) => (
                <ImpactCard key={metric.id} metric={metric} variant="detailed" />
              ))}
            </div>
          </section>
        )}

        {/* ── Architecture Diagram ── */}
        {p.architectureDiagram && (
          <section className="mb-16">
            <ArchitectureDiagramSection
              diagram={{
                mermaidCode: p.architectureDiagram.mermaidCode,
                type: p.architectureDiagram.type as 'flowchart' | 'sequence' | 'class' | 'architecture',
              }}
              projectName={p.repo}
            />
          </section>
        )}

        {/* ── Logic Map: Decision Tree ── */}
        {decisionNodes.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-foreground">Technical Decision Tree</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              Each tree shows: <strong>The Challenge</strong> → <strong>Alternatives Considered</strong> (with Why NOT?) → <strong>Chosen Solution</strong>.
            </p>
            <div className="space-y-16">
              {decisionNodes.map((decision, index) => (
                <DecisionTreeNode
                  key={index}
                  decision={decision}
                  index={index}
                  allDecisions={decisionNodes}
                  repositoryUrl={p.repositoryUrl}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Logic Map: Pivot Points ── */}
        {pivotPoints.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <GitBranch className="w-5 h-5 text-purple-400" />
              <h2 className="text-2xl font-bold text-foreground">Critical Pivots</h2>
            </div>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/30 via-purple-500/20 to-transparent" />
              <div className="space-y-8">
                {pivotPoints
                  .sort((a, b) => {
                    if (a.pivotDate && b.pivotDate) {
                      return new Date(a.pivotDate).getTime() - new Date(b.pivotDate).getTime()
                    }
                    return (a.sequenceOrder || 0) - (b.sequenceOrder || 0)
                  })
                  .map((pivot, index) => (
                    <PivotPointCard key={pivot.id || index} pivot={pivot} index={index} />
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Footer CTA ── */}
        <section className="glass-card-glow p-10 rounded-2xl border border-border text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Interested in this work?</h2>
          <p className="text-muted-foreground mb-6">
            Review the full source code on GitHub or explore the rest of the portfolio.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={`https://github.com/${p.repositoryUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary/50 transition-colors"
            >
              Full Portfolio
            </Link>
          </div>
        </section>

      </main>
    </div>
  )
}
