/**
 * Architecture Page
 * Displays the Aura backend orchestration diagram and agent details
 */

import { Header } from '@/components/layout/Header'
import { OrchestrationDiagram, AgentDetailPanel } from '@/features/orchestration-diagram'

export default function ArchitecturePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-4">
              <span className="text-blue-400 text-sm font-medium">
                🏗️ Backend Architecture
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6">
              Orchestration Map
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A visual breakdown of how Aura processes your GitHub activity, Logic Map,
              and Video Demo through specialized agents to generate your Builder Profile.
            </p>
          </div>

          {/* Interactive Diagram */}
          <div className="mb-12">
            <OrchestrationDiagram />
          </div>

          {/* How It Works */}
          <div className="glass-card p-8 rounded-xl border border-border mb-12">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl mb-3">📥</div>
                <h3 className="text-lg font-semibold mb-2 text-blue-400">
                  1. Input Collection
                </h3>
                <p className="text-sm text-muted-foreground">
                  Three data sources feed into the system: your GitHub activity (commits, PRs, issues),
                  your Logic Map (architectural decisions), and your 90s Video Demo (product walkthrough).
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-lg font-semibold mb-2 text-cyan-400">
                  2. Agent Processing
                </h3>
                <p className="text-sm text-muted-foreground">
                  Five specialist agents independently analyze different aspects: Video moments,
                  Logic validation, Code quality, Commit flow, and AI Fluency patterns. Each produces
                  a deterministic score.
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold mb-2 text-purple-400">
                  3. Score Synthesis
                </h3>
                <p className="text-sm text-muted-foreground">
                  The Scoring Engine aggregates all agent scores using transparent weighted formulas
                  (no black-box AI) to produce your final Builder Profile Spider Map.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Details */}
        <section className="max-w-7xl mx-auto px-6">
          <AgentDetailPanel />
        </section>

        {/* Why This Architecture */}
        <section className="max-w-7xl mx-auto px-6 mt-16">
          <div className="glass-card p-8 rounded-xl border border-border">
            <h2 className="text-2xl font-bold mb-4">Why This Architecture?</h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Separation of Concerns</h3>
                  <p className="text-sm">
                    Each agent has a single responsibility, making the system modular, testable,
                    and easy to extend. Adding a new analysis dimension is as simple as adding a new agent.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📐</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Deterministic Scoring</h3>
                  <p className="text-sm">
                    No black-box AI in the final scoring. The Scoring Engine uses transparent,
                    auditable formulas. You can trace exactly how your score was calculated.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Parallel Processing</h3>
                  <p className="text-sm">
                    All five agents run independently and can be parallelized for faster processing.
                    No sequential bottlenecks.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Signal vs Noise</h3>
                  <p className="text-sm">
                    Agents actively filter out AI-generated boilerplate, initial commits, and other
                    low-signal patterns. Only meaningful work counts toward your profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 mt-16 text-center">
          <div className="glass-card-glow p-12 rounded-2xl border border-blue-500/30 bg-blue-500/5">
            <h2 className="text-3xl font-bold mb-4">Ready to Generate Your Profile?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect your GitHub, create your Logic Map, and upload your Video Demo
              to see this orchestration in action.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/dashboard"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                Go to Dashboard
              </a>
              <a
                href="/repositories"
                className="px-6 py-3 border border-border hover:bg-glass-hover rounded-lg font-semibold transition-colors"
              >
                Connect GitHub
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
