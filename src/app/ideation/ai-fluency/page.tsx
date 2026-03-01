/**
 * AI Fluency Categories - Ideation Page
 * Route: /ideation/ai-fluency
 *
 * Three-tier AI fluency assessment showing modern AI-assisted development
 * Evidence for "AI Fluency" spider chart pillar
 */

import { Header } from '@/components/layout/Header'
import { Sparkles, Zap, Workflow, Network } from 'lucide-react'

export default function AIFluencyPage() {
  return (
    <>
      <Header showBackButton backHref="/hiring-demo" backLabel="Back to Hiring Demo" />
      <main className="min-h-screen bg-background py-16">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">
                AI Fluency Evidence
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6">
              AI Fluency Categories
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three-tier assessment of AI-assisted development practices, from basic tool usage to agentic architecture.
            </p>
          </div>

          {/* Overall AI Fluency Score */}
          <div className="glass-card-glow p-8 rounded-2xl border border-green-500/30 bg-green-500/5 mb-12">
            <div className="text-center">
              <div className="text-6xl font-bold text-green-400 mb-2">8.5/10</div>
              <p className="text-lg text-muted-foreground mb-6">Overall AI Fluency Score</p>
              <div className="max-w-2xl mx-auto">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Tier 1: Vibe Coding & Velocity */}
          <div className="glass-card p-8 rounded-xl border border-green-500/30 bg-green-500/5 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 p-3 bg-green-500/20 border border-green-500/40 rounded-lg">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">Tier 1: Vibe Coding & Velocity</h2>
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-sm font-bold text-green-300">
                    High
                  </span>
                </div>
                <p className="text-muted-foreground mb-6">
                  AI-assisted code generation tools for rapid prototyping and feature development
                </p>
              </div>
            </div>

            {/* Detection Signals */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#7B68EE]/20 border border-[#7B68EE]/40 rounded-lg flex items-center justify-center">
                      <span className="text-lg">✨</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Cursor AI</h3>
                      <p className="text-xs text-muted-foreground">AI-first code editor</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-400">Detected</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-white/70">.cursorrules file found in repository</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-white/70">AI-generated code patterns in commit diffs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-white/70">Rapid feature velocity (3.2 features/week)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/40 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">GitHub Copilot</h3>
                      <p className="text-xs text-muted-foreground">AI pair programmer</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-400">Detected</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-white/70">Copilot suggestions accepted: 68% of time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-white/70">Boilerplate generation patterns detected</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/40 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⚡</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">v0.dev</h3>
                      <p className="text-xs text-muted-foreground">UI generation</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-400">Detected</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-white/70">Vercel v0 component patterns found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-white/70">Rapid UI prototyping (12 components in 2 days)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 2: Workflow Automation */}
          <div className="glass-card p-8 rounded-xl border border-green-500/30 bg-green-500/5 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 p-3 bg-green-500/20 border border-green-500/40 rounded-lg">
                <Workflow className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">Tier 2: Workflow Automation & Testing</h2>
                  <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-sm font-bold text-yellow-300">
                    Medium
                  </span>
                </div>
                <p className="text-muted-foreground mb-6">
                  LLM-integrated CI/CD pipelines and automated testing workflows
                </p>
              </div>
            </div>

            {/* Detection Signals */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">GitHub Actions with AI</h3>
                    <p className="text-xs text-muted-foreground">Automated code review and testing</p>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">Partial</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-white/70">AI-powered PR review comments detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">~</span>
                    <span className="text-white/70">Manual test generation (not yet automated)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">Documentation Generation</h3>
                    <p className="text-xs text-muted-foreground">Automated README and API docs</p>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">Partial</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-white/70">AI-generated JSDoc comments found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">~</span>
                    <span className="text-white/70">README partially AI-assisted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 3: Agentic Architecture */}
          <div className="glass-card p-8 rounded-xl border border-green-500/30 bg-green-500/5">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 p-3 bg-green-500/20 border border-green-500/40 rounded-lg">
                <Network className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">Tier 3: Agentic Architecture</h2>
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-sm font-bold text-red-300">
                    Low
                  </span>
                </div>
                <p className="text-muted-foreground mb-6">
                  Building AI agent systems with RAG pipelines, LangChain, and multi-agent orchestration
                </p>
              </div>
            </div>

            {/* Detection Signals */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">RAG Pipelines</h3>
                    <p className="text-xs text-muted-foreground">Retrieval-Augmented Generation systems</p>
                  </div>
                  <span className="text-lg font-bold text-red-400">Not Detected</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">✗</span>
                    <span className="text-white/50">No vector database usage found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">✗</span>
                    <span className="text-white/50">No embedding model integrations</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">LangChain / LlamaIndex</h3>
                    <p className="text-xs text-muted-foreground">Agent orchestration frameworks</p>
                  </div>
                  <span className="text-lg font-bold text-red-400">Not Detected</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">✗</span>
                    <span className="text-white/50">No LangChain dependencies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">✗</span>
                    <span className="text-white/50">No multi-agent systems built</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Analysis */}
        <section className="max-w-5xl mx-auto px-6 mt-12">
          <div className="glass-card-glow p-8 rounded-2xl border border-green-500/30 bg-green-500/5">
            <h2 className="text-2xl font-bold mb-4">AI Context</h2>
            <p className="text-muted-foreground">
              <strong className="text-green-400">Proficient AI Tool User:</strong> Strong foundation in Tier 1 AI
              coding tools (Cursor, Copilot, v0) with 68% acceptance rate and rapid prototyping velocity. Moderate
              Tier 2 adoption with AI-assisted documentation and PR reviews. Tier 3 agentic architecture not yet
              explored—opportunity for growth in RAG pipelines and multi-agent systems. Excellent fit for modern
              product development teams leveraging AI for velocity.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
