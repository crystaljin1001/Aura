/**
 * Hiring Dashboard Demo Page
 * Showcases the AI-powered candidate screening interface
 */

import { Header } from '@/components/layout/Header'
import { HiringDashboardMockup } from '@/features/hiring-dashboard'

export default function HiringDemoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
              <span className="text-purple-400 text-sm font-medium">
                🎯 For Hiring Managers
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6">
              AI-Powered Hiring Dashboard
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              This is what the future of technical hiring looks like. AI ranks candidates
              by analyzing their Builder Profiles, giving you instant insights into
              technical fit, product thinking, and code quality.
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="mb-12">
            <HiringDashboardMockup />
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="glass-card p-6 rounded-xl border border-border">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold mb-2">AI-Ranked Candidates</h3>
              <p className="text-sm text-muted-foreground">
                Machine learning analyzes 5 dimensions of technical ability and
                ranks candidates with explainable reasoning for each position.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-border">
              <div className="text-4xl mb-3">🎥</div>
              <h3 className="text-lg font-semibold mb-2">Two 90-Second Demos</h3>
              <p className="text-sm text-muted-foreground">
                Watch candidates explain their projects through a User Journey Demo
                and an Architecture Demo. No resume parsing needed.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-border">
              <div className="text-4xl mb-3">🕸️</div>
              <h3 className="text-lg font-semibold mb-2">Spider Map at a Glance</h3>
              <p className="text-sm text-muted-foreground">
                Instantly visualize technical strengths across Product & Business Sense,
                Communication & Impact, Quality & Scalability, Velocity & Focus, and AI Fluency.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="space-y-8">
            <div className="glass-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Candidates Build Their Aura Profile</h3>
                  <p className="text-muted-foreground mb-3">
                    Engineers connect their GitHub, create a Logic Map of architectural decisions,
                    and record two 90-second demos. No resume writing needed.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• GitHub activity analyzed for AI fluency, code quality, and velocity</li>
                    <li>• Logic Map evaluated for trade-off reasoning ability</li>
                    <li>• 90-second User Journey Demo scored for product thinking and communication</li>
                    <li>• 90-second Architecture Demo scored for architecture design</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI Agents Analyze 5 Dimensions</h3>
                  <p className="text-muted-foreground mb-3">
                    Five specialist agents independently score different aspects of technical ability:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-pink-400">•</span>
                      <div>
                        <strong className="text-pink-400">Product Agent</strong>
                        <span className="text-muted-foreground"> - Business sense & user-facing feature delivery</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <div>
                        <strong className="text-purple-400">Communication Agent</strong>
                        <span className="text-muted-foreground"> - Narrative clarity & architectural documentation</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <strong className="text-blue-400">Quality/Scalability Agent</strong>
                        <span className="text-muted-foreground"> - Error handling, infrastructure patterns & production readiness</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <div>
                        <strong className="text-yellow-400">Velocity Agent</strong>
                        <span className="text-muted-foreground"> - Commit quality, atomicity & shipping speed</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <div>
                        <strong className="text-green-400">AI Fluency Agent</strong>
                        <span className="text-muted-foreground"> - AI tool usage (Cursor, Copilot, v0) & agentic architecture</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Get Ranked Candidates with Explanations</h3>
                  <p className="text-muted-foreground mb-3">
                    The dashboard shows top candidates ranked by fit, with AI-generated explanations
                    for why each person is ranked where they are. No black-box scoring.
                  </p>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-sm">
                    <p className="text-green-400 font-semibold mb-1">Example AI Ranking:</p>
                    <p className="text-muted-foreground italic">
                      "Perfect fit: 5+ years scaling distributed systems, active OSS contributor,
                      stellar Logic Map clarity, and production-grade error handling patterns."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-7xl mx-auto px-6 mt-16">
          <div className="glass-card-glow p-12 rounded-2xl border border-purple-500/30 bg-purple-500/5">
            <h2 className="text-3xl font-bold text-center mb-8">Why This Changes Hiring</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-400">For Hiring Managers</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 text-xl">✓</span>
                    <span>Skip resume screening - see real code and demos instead</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 text-xl">✓</span>
                    <span>Explainable AI rankings (not a black box)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 text-xl">✓</span>
                    <span>Reduce time-to-hire by 60%</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 text-xl">✓</span>
                    <span>Focus on top 5 matches, not 500 applications</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-400">For Candidates</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 text-xl">✓</span>
                    <span>Show your work, not just your words</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 text-xl">✓</span>
                    <span>Stand out with video demos and architecture clarity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 text-xl">✓</span>
                    <span>Get matched with roles that fit your actual skills</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 text-xl">✓</span>
                    <span>No more generic cover letters</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-muted-foreground mb-8">
            This dashboard is built on Aura's Builder Profile platform.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/architecture"
              className="px-6 py-3 border border-border hover:bg-glass-hover rounded-lg font-semibold transition-colors"
            >
              View Architecture
            </a>
            <a
              href="/dashboard"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Create Your Profile
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
