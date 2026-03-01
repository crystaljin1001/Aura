/**
 * Velocity and Focus Summary - Ideation Page
 * Route: /ideation/velocity-focus
 *
 * Aggregated view of Velocity & Focus across all projects
 * Evidence for "Velocity & Focus" spider chart pillar
 */

import { Header } from '@/components/layout/Header'
import { Zap, Target } from 'lucide-react'

export default function VelocityFocusSummaryPage() {
  return (
    <>
      <Header showBackButton backHref="/hiring-demo" backLabel="Back to Hiring Demo" />
      <main className="min-h-screen bg-background py-16">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-4">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">
                Velocity & Focus Evidence
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6">
              Velocity and Focus Summary
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Aggregated commit pattern analysis across all projects, showing development velocity and atomic intent.
            </p>
          </div>

          {/* Combined Spider Chart Score */}
          <div className="glass-card-glow p-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">Velocity & Focus</h2>
              <p className="text-muted-foreground">Spider Chart Score</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="text-7xl font-bold mb-2">
                  <span className="text-yellow-400">6.0</span>
                  <span className="text-yellow-400/50">/10</span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-sm font-semibold text-foreground mb-4">How this score is calculated:</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-muted-foreground">Velocity (Speed)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-yellow-400">3.9</span>
                      <span className="text-muted-foreground">× 70%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-muted-foreground">Atomic Focus (Precision)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-400">8.5</span>
                      <span className="text-muted-foreground">× 30%</span>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span className="text-foreground">Combined Score</span>
                    <span className="text-yellow-400">6.0/10</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * Velocity weighted 70% as it directly impacts shipping speed. Focus weighted 30% as quality indicator.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="glass-card p-8 rounded-xl border border-border mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Score Breakdown</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Velocity */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Velocity</h3>
                    <p className="text-sm text-muted-foreground">The Speed</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-6xl font-bold mb-2">
                    <span className="text-yellow-400">3.9</span>
                    <span className="text-yellow-400/50">/10</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
                    <span className="text-sm">🚀 Steady Progress</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Key Signal</p>
                  <p className="text-lg font-semibold text-foreground">1.7 Commits/Day</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    <strong className="text-blue-400">AI Context:</strong> Moderate activity, suitable for
                    incremental improvements. Peak velocity of 22 commits/5d shows sprint capability.
                  </p>
                </div>
              </div>

              {/* Engineering Rigor (Focus/Atomicity) */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Atomic Focus</h3>
                    <p className="text-sm text-muted-foreground">The Precision</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-6xl font-bold mb-2">
                    <span className="text-green-400">8.5</span>
                    <span className="text-green-400/50">/10</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full">
                    <span className="text-sm">✨ High Quality</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Key Signal</p>
                  <p className="text-lg font-semibold text-foreground">85% Atomic Intent</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-300">
                    <strong className="text-green-400">AI Context:</strong> Excellent commit atomicity.
                    Each commit serves a single purpose with clear intent. Strong signal of disciplined development.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Per-Project Breakdown */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Project Breakdown</h2>

            {/* Project 1 */}
            <div className="glass-card p-8 rounded-xl border border-border">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-1">E-Commerce Platform</h3>
                <p className="text-sm text-muted-foreground">Next.js • TypeScript • Stripe</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Velocity */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Velocity</h4>
                      <p className="text-xs text-muted-foreground">The Speed</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-5xl font-bold mb-2">
                      <span className="text-yellow-400">3.9</span>
                      <span className="text-yellow-400/50">/10</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-xs">
                      🚀 Steady Progress
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Key Signal</p>
                    <p className="font-semibold text-foreground">1.7 Commits/Day</p>
                  </div>

                  <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300">
                      <strong className="text-blue-400">AI Context:</strong> Moderate activity, suitable for incremental improvements.
                    </p>
                  </div>
                </div>

                {/* Atomic Focus */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Atomic Focus</h4>
                      <p className="text-xs text-muted-foreground">The Precision</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-5xl font-bold mb-2">
                      <span className="text-green-400">8.5</span>
                      <span className="text-green-400/50">/10</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full text-xs">
                      ✨ High Quality
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Key Signal</p>
                    <p className="font-semibold text-foreground">85% Atomic Intent</p>
                  </div>

                  <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-xs text-green-300">
                      <strong className="text-green-400">AI Context:</strong> Excellent commit atomicity with clear intent.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="glass-card p-8 rounded-xl border border-border">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-1">Real-Time Chat App</h3>
                <p className="text-sm text-muted-foreground">React • WebSockets • Redis</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Velocity */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Velocity</h4>
                      <p className="text-xs text-muted-foreground">The Speed</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-5xl font-bold mb-2">
                      <span className="text-yellow-400">7.2</span>
                      <span className="text-yellow-400/50">/10</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-xs">
                      ⚡ Active Development
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Key Signal</p>
                    <p className="font-semibold text-foreground">2.3 Commits/Day</p>
                  </div>

                  <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300">
                      <strong className="text-blue-400">AI Context:</strong> High activity with strong sprint capability.
                    </p>
                  </div>
                </div>

                {/* Atomic Focus */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Atomic Focus</h4>
                      <p className="text-xs text-muted-foreground">The Precision</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-5xl font-bold mb-2">
                      <span className="text-green-400">9.2</span>
                      <span className="text-green-400/50">/10</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full text-xs">
                      🏆 Exceptional
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Key Signal</p>
                    <p className="font-semibold text-foreground">92% Atomic Intent</p>
                  </div>

                  <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-xs text-green-300">
                      <strong className="text-green-400">AI Context:</strong> Near-perfect commit discipline. Each commit tells a story.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="glass-card p-8 rounded-xl border border-border">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-1">API Gateway Service</h3>
                <p className="text-sm text-muted-foreground">Node.js • GraphQL • PostgreSQL</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Velocity */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Velocity</h4>
                      <p className="text-xs text-muted-foreground">The Speed</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-5xl font-bold mb-2">
                      <span className="text-yellow-400">5.8</span>
                      <span className="text-yellow-400/50">/10</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-xs">
                      🔧 Maintenance Mode
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Key Signal</p>
                    <p className="font-semibold text-foreground">1.4 Commits/Day</p>
                  </div>

                  <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300">
                      <strong className="text-blue-400">AI Context:</strong> Stable project with steady maintenance work.
                    </p>
                  </div>
                </div>

                {/* Atomic Focus */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Atomic Focus</h4>
                      <p className="text-xs text-muted-foreground">The Precision</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-5xl font-bold mb-2">
                      <span className="text-green-400">7.8</span>
                      <span className="text-green-400/50">/10</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full text-xs">
                      ✅ Good Quality
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Key Signal</p>
                    <p className="font-semibold text-foreground">78% Atomic Intent</p>
                  </div>

                  <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-xs text-green-300">
                      <strong className="text-green-400">AI Context:</strong> Solid commit quality with focused changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Analysis */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="glass-card-glow p-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
            <h2 className="text-2xl font-bold mb-4">AI Context</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-yellow-400">Steady Progress Developer:</strong> Maintains consistent velocity
              across projects with strong atomic intent (85%+ on average). Peak velocity of 22 commits/5d shows ability
              to sprint when needed, while sustained 1.7 commits/day demonstrates reliable long-term productivity.
              Suitable for both iterative development and feature sprints.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Based on 365 days of commit history across 3 active projects</span>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
