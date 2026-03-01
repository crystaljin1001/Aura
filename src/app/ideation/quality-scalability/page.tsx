/**
 * Quality & Scalability Summary - Ideation Page
 * Route: /ideation/quality-scalability
 *
 * Aggregated project assessment summary across all projects
 * Evidence for "Quality & Scalability" spider chart pillar
 */

import { Header } from '@/components/layout/Header'
import { Shield, AlertTriangle, Scale, CheckCircle2 } from 'lucide-react'

export default function QualityScalabilityPage() {
  return (
    <>
      <Header showBackButton backHref="/hiring-demo" backLabel="Back to Hiring Demo" />
      <main className="min-h-screen bg-background py-16">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 mb-12">
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
              Aggregated view of production-readiness patterns, error handling, and scalability across all projects.
            </p>
          </div>

          {/* Overall Quality Score */}
          <div className="glass-card-glow p-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 mb-12">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-blue-400 mb-2">7.6/10</div>
              <p className="text-lg text-muted-foreground">Overall Quality & Scalability Score</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid md:grid-cols-4 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">8.2</div>
                <p className="text-sm text-muted-foreground">Error Handling</p>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">7.5</div>
                <p className="text-sm text-muted-foreground">Scalability Patterns</p>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">6.8</div>
                <p className="text-sm text-muted-foreground">Edge Case Coverage</p>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">7.9</div>
                <p className="text-sm text-muted-foreground">Production Readiness</p>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '79%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Error Handling Analysis */}
          <div className="glass-card p-8 rounded-xl border border-border mb-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-foreground">Error Handling Patterns</h2>
            </div>

            <div className="space-y-6">
              {/* Strengths */}
              <div>
                <h3 className="font-semibold text-green-400 mb-3">✓ Strengths</h3>
                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Try-Catch Blocks</p>
                        <p className="text-sm text-muted-foreground">
                          Consistent error boundary usage across 85% of async operations
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Input Validation</p>
                        <p className="text-sm text-muted-foreground">
                          Zod schemas used for all API endpoints and form submissions
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Error Logging</p>
                        <p className="text-sm text-muted-foreground">
                          Structured logging with context (user ID, request ID) in 78% of errors
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 className="font-semibold text-red-400 mb-3">⚠ Areas for Improvement</h3>
                <div className="space-y-3">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Network Retry Logic</p>
                        <p className="text-sm text-muted-foreground">
                          Only 40% of API calls have exponential backoff retry mechanisms
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Error Recovery</p>
                        <p className="text-sm text-muted-foreground">
                          Limited automatic recovery strategies; mostly relies on user retry
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scalability Patterns */}
          <div className="glass-card p-8 rounded-xl border border-border mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-foreground">Scalability Patterns</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Detected Patterns */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Detected Patterns</h3>
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">Database Indexing</span>
                      <span className="text-xs font-bold text-green-400">Good</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Indexes on foreign keys and query columns</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">Caching Strategy</span>
                      <span className="text-xs font-bold text-green-400">Good</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Redis cache for frequently accessed data</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">Pagination</span>
                      <span className="text-xs font-bold text-green-400">Good</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Cursor-based pagination for large datasets</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">Load Balancing</span>
                      <span className="text-xs font-bold text-yellow-400">Moderate</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Basic round-robin, no sticky sessions</p>
                  </div>
                </div>
              </div>

              {/* Missing Patterns */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Opportunities</h3>
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">CDN Usage</span>
                      <span className="text-xs font-bold text-red-400">Missing</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Static assets served from origin</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">Database Sharding</span>
                      <span className="text-xs font-bold text-red-400">Missing</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Single database instance</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">Message Queue</span>
                      <span className="text-xs font-bold text-red-400">Missing</span>
                    </div>
                    <p className="text-xs text-muted-foreground">No async job processing</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">Rate Limiting</span>
                      <span className="text-xs font-bold text-yellow-400">Partial</span>
                    </div>
                    <p className="text-xs text-muted-foreground">API rate limiting but no DDoS protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Per-Project Breakdown */}
          <div className="glass-card p-8 rounded-xl border border-border">
            <h2 className="text-2xl font-bold mb-6">Project-Level Assessment</h2>
            <div className="space-y-6">
              {/* Project 1 */}
              <div className="border-b border-border pb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">E-Commerce Platform</h3>
                    <p className="text-sm text-muted-foreground">Next.js • TypeScript • Stripe</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">8.2/10</div>
                    <p className="text-xs text-muted-foreground">Quality Score</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">8.5</div>
                    <p className="text-xs text-muted-foreground">Error Handling</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">8.0</div>
                    <p className="text-xs text-muted-foreground">Scalability</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">7.8</div>
                    <p className="text-xs text-muted-foreground">Edge Cases</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">8.5</div>
                    <p className="text-xs text-muted-foreground">Prod Ready</p>
                  </div>
                </div>
              </div>

              {/* Project 2 */}
              <div className="border-b border-border pb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Real-Time Chat App</h3>
                    <p className="text-sm text-muted-foreground">React • WebSockets • Redis</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">7.2/10</div>
                    <p className="text-xs text-muted-foreground">Quality Score</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">7.8</div>
                    <p className="text-xs text-muted-foreground">Error Handling</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">7.2</div>
                    <p className="text-xs text-muted-foreground">Scalability</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">6.5</div>
                    <p className="text-xs text-muted-foreground">Edge Cases</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">7.2</div>
                    <p className="text-xs text-muted-foreground">Prod Ready</p>
                  </div>
                </div>
              </div>

              {/* Project 3 */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">API Gateway Service</h3>
                    <p className="text-sm text-muted-foreground">Node.js • GraphQL • PostgreSQL</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">7.5/10</div>
                    <p className="text-xs text-muted-foreground">Quality Score</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">8.2</div>
                    <p className="text-xs text-muted-foreground">Error Handling</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">7.3</div>
                    <p className="text-xs text-muted-foreground">Scalability</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">6.2</div>
                    <p className="text-xs text-muted-foreground">Edge Cases</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">8.2</div>
                    <p className="text-xs text-muted-foreground">Prod Ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Analysis */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="glass-card-glow p-8 rounded-2xl border border-blue-500/30 bg-blue-500/5">
            <h2 className="text-2xl font-bold mb-4">AI Context</h2>
            <p className="text-muted-foreground">
              <strong className="text-blue-400">Production-Grade Engineer:</strong> Strong foundation in error
              handling (8.2/10) with consistent try-catch blocks and Zod validation. Good scalability patterns with
              Redis caching and database indexing. Primary growth areas: network retry logic (40% coverage) and
              advanced scalability patterns (CDN, sharding, message queues). Well-suited for production environments
              with room to grow into senior infrastructure roles.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
