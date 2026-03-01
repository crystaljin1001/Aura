/**
 * Quality & Scalability Summary - Ideation Page
 * Route: /ideation/quality-scalability
 *
 * Aggregated project assessment summary across all projects
 * Evidence for "Quality & Scalability" spider chart pillar
 */

'use client'

import { Header } from '@/components/layout/Header'
import { Shield, CheckCircle2, Circle, Sparkles } from 'lucide-react'

// Mock project assessments
const mockProjects = [
  {
    name: 'Quorum',
    tech: 'Next.js • TypeScript • Supabase',
    repositoryUrl: 'crystaljin/quorum',
    overallScore: 73,
    readiness: {
      label: 'Production Ready',
      description: 'Well-documented project ready for professional showcase',
      color: 'text-blue-400',
    },
    categories: [
      {
        name: 'Documentation',
        score: 100,
        items: [
          { name: 'Project Description', present: true },
          { name: 'Comprehensive README', present: true },
        ],
      },
      {
        name: 'Code Quality',
        score: 33,
        items: [
          { name: 'Type Safety (TypeScript)', present: true },
          { name: 'Environment Configuration', present: false },
          { name: 'Test Coverage', present: false },
        ],
      },
      {
        name: 'Production Readiness',
        score: 33,
        items: [
          { name: 'Live Deployment', present: false },
          { name: 'License', present: false },
          { name: 'Repository Configuration', present: true },
        ],
      },
      {
        name: 'Technical Storytelling',
        score: 100,
        items: [
          { name: 'Technical Journey', present: true },
          { name: 'Technology Decisions', present: true },
        ],
      },
    ],
    strengths: [
      'Well-documented with clear project overview',
      'Excellent technical storytelling and context',
    ],
    improvements: [
      'Deploy to production (Vercel, Railway, AWS, etc.)',
      'Add .env.example to document required environment variables',
    ],
  },
  {
    name: 'Portfolio Platform',
    tech: 'Next.js • React • Tailwind',
    repositoryUrl: 'crystaljin/aura',
    overallScore: 85,
    readiness: {
      label: 'Production Ready',
      description: 'High-quality codebase with excellent scalability patterns',
      color: 'text-green-400',
    },
    categories: [
      {
        name: 'Documentation',
        score: 100,
        items: [
          { name: 'Project Description', present: true },
          { name: 'Comprehensive README', present: true },
        ],
      },
      {
        name: 'Code Quality',
        score: 67,
        items: [
          { name: 'Type Safety (TypeScript)', present: true },
          { name: 'Environment Configuration', present: true },
          { name: 'Test Coverage', present: false },
        ],
      },
      {
        name: 'Production Readiness',
        score: 67,
        items: [
          { name: 'Live Deployment', present: true },
          { name: 'License', present: false },
          { name: 'Repository Configuration', present: true },
        ],
      },
      {
        name: 'Technical Storytelling',
        score: 100,
        items: [
          { name: 'Technical Journey', present: true },
          { name: 'Technology Decisions', present: true },
        ],
      },
    ],
    strengths: [
      'TypeScript strict mode with comprehensive type safety',
      'Clean architecture with feature-based structure',
      'Deployed to production with CI/CD',
    ],
    improvements: [
      'Add unit tests for critical components',
      'Add open source license file',
    ],
  },
]

export default function QualityScalabilityPage() {
  // Calculate aggregated metrics
  const avgScore = Math.round(
    mockProjects.reduce((sum, p) => sum + p.overallScore, 0) / mockProjects.length
  )
  const totalProjects = mockProjects.length

  return (
    <>
      <Header showBackButton backHref="/hiring-demo" backLabel="Back to Hiring Demo" />
      <main className="min-h-screen bg-background py-16">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-4">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">
                Quality & Scalability Evidence
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6">
              Project Assessment Summary
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional evaluation of technical depth and production readiness across all projects.
            </p>
          </div>

          {/* Aggregated Summary */}
          <div className="glass-card-glow p-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 mb-12">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Aggregated Quality Score</h2>
                <p className="text-sm text-muted-foreground">
                  Average assessment across {totalProjects} portfolio projects
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-blue-400 mb-1">{avgScore}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Average Score
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-blue-500/20">
              <div>
                <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
                  Overall Strengths
                </h3>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Strong documentation across all projects (100% avg)</span>
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Excellent technical storytelling with decision rationales</span>
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>TypeScript usage for type safety</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                  Growth Opportunities
                </h3>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-400 mt-1">→</span>
                    <span>Increase test coverage across projects</span>
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-400 mt-1">→</span>
                    <span>Deploy more projects to production environments</span>
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-400 mt-1">→</span>
                    <span>Add open source licenses and contribution guidelines</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Individual Project Assessments */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Individual Project Assessments</h2>

            {mockProjects.map((project, index) => (
              <div key={index} className="glass-card p-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.tech}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Professional evaluation of technical depth and production readiness
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold mb-1">{project.overallScore}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Overall Score
                    </div>
                  </div>
                </div>

                {/* Readiness Level */}
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className={`text-2xl ${project.readiness.color}`}>●</div>
                  <div>
                    <div className="font-semibold">{project.readiness.label}</div>
                    <div className="text-sm text-muted-foreground">{project.readiness.description}</div>
                  </div>
                </div>

                {/* Category Scores */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Category Breakdown
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.categories.map((category) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm font-bold">{Math.round(category.score)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              category.score >= 80
                                ? 'bg-green-500'
                                : category.score >= 50
                                ? 'bg-amber-500'
                                : 'bg-gray-500'
                            }`}
                            style={{ width: `${category.score}%` }}
                          />
                        </div>
                        <div className="space-y-1">
                          {category.items.map((item) => (
                            <div key={item.name} className="flex items-center gap-2 text-xs">
                              {item.present ? (
                                <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                              ) : (
                                <Circle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className={item.present ? 'text-foreground' : 'text-muted-foreground'}>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  {project.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {project.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {project.improvements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                        Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {project.improvements.map((improvement, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-amber-400 mt-1">→</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* AI Technical Assessment Placeholder */}
                <div className="border-t border-border pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">Get a detailed technical assessment</span>
                    </div>
                    <button
                      className="px-4 py-2 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Technical Assessment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Context */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="glass-card-glow p-8 rounded-2xl border border-blue-500/30 bg-blue-500/5">
            <h2 className="text-2xl font-bold mb-4">AI Context</h2>
            <p className="text-muted-foreground">
              <strong className="text-blue-400">Quality-Focused Builder:</strong> Maintains high standards across portfolio
              with an average assessment score of {avgScore}/100. Strong emphasis on documentation (100% avg) and technical
              storytelling, demonstrating ability to communicate architectural decisions clearly. TypeScript usage shows
              commitment to type safety. Primary growth opportunities include expanding test coverage, deploying more projects
              to production environments, and adding open source licenses. Projects show production-ready potential with
              clear pathways to professional showcase quality.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
