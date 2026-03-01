/**
 * Communication & Impact Split View - Ideation Page
 * Route: /ideation/communication-impact
 *
 * Shows Architecture Demo video + Logic Map side-by-side
 * Evidence for "Communication & Impact" spider chart pillar
 */

'use client'

import { Header } from '@/components/layout/Header'
import { Video, Brain, MessageSquare } from 'lucide-react'
import { DecisionTreeNode } from '@/features/portfolio/components/DecisionTreeNode'
import type { TechDecisionNode } from '@/features/portfolio/types/logic-map'

// Mock Logic Map Data
const mockDecisions: TechDecisionNode[] = [
  {
    technology: 'Data Security',
    problem: 'My target users are M&A lawyers and financial workers. Their data is highly sensitive and needs to be 100% secure.',
    alternativesConsidered: [
      {
        name: 'I can ask the user to run my app locally.',
        pros: [],
        cons: [],
        whyRejected: 'It\'s not flexible and it has long latency." Running heavy multi-agent "Social Brain" reasoning (Creator, Skeptic, and Optimizer) requires significant local compute that most standard legal workstations lack, leading to a poor user experience.',
      },
      {
        name: 'I can ask the user to use a standard public SaaS multi-tenant environment.',
        pros: [],
        cons: [],
        whyRejected: 'It\'s not good enough. In high-stakes M&A, data co-mingling is a deal-breaker. A standard public cloud approach lacks the "Privacy Airlock" and isolated environment necessary to guarantee that sensitive contract data never leaves a secure, dedicated perimeter.',
      },
    ],
    chosenSolution: {
      name: 'Run it on private cloud.',
      rationale: 'It\'s both secure, flexible, and fast. A private cloud (such as a VPC) allows for Institutional-Grade Isolation while providing the elastic GPU compute needed to run Quorum\'s adversarial agents in under 45 seconds. It enables the Human-in-the-Loop PII Workbench to de-identify data before it even reaches the inference layer.',
      tradeoffsAccepted: ['Higher infrastructure costs', 'More complex deployment'],
    },
  },
]

export default function CommunicationImpactPage() {
  return (
    <>
      <Header showBackButton backHref="/hiring-demo" backLabel="Back to Hiring Demo" />
      <main className="min-h-screen bg-background py-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">
                Communication & Impact Evidence
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6">
              Communication & Impact
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Split view showing verbal (Architecture Demo) and written (Logic Map) communication clarity.
            </p>
          </div>

          {/* Split View */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Left: Architecture Demo Video */}
            <div className="glass-card p-6 rounded-xl border border-purple-500/30 bg-purple-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Video className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-foreground">Architecture Demo</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                90-second technical walkthrough showing system design clarity and verbal communication skills.
              </p>

              {/* Video Player Mockup */}
              <div className="aspect-video bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg relative flex items-center justify-center mb-4">
                <div className="absolute inset-4 border border-white/20 rounded-lg p-4 bg-[#0a0a0a]/80 backdrop-blur">
                  <svg width="100%" height="100%" viewBox="0 0 200 140">
                    {/* Architecture diagram mockup */}
                    <rect x="10" y="20" width="40" height="30" rx="4" fill="rgba(139, 92, 246, 0.3)" stroke="rgba(139, 92, 246, 0.8)" strokeWidth="2" />
                    <rect x="80" y="20" width="40" height="30" rx="4" fill="rgba(59, 130, 246, 0.3)" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="2" />
                    <rect x="150" y="20" width="40" height="30" rx="4" fill="rgba(16, 185, 129, 0.3)" stroke="rgba(16, 185, 129, 0.8)" strokeWidth="2" />
                    <rect x="45" y="80" width="110" height="40" rx="4" fill="rgba(245, 158, 11, 0.3)" stroke="rgba(245, 158, 11, 0.8)" strokeWidth="2" />
                    <line x1="30" y1="50" x2="30" y2="80" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" />
                    <line x1="100" y1="50" x2="100" y2="80" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" />
                    <line x1="170" y1="50" x2="170" y2="80" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" />
                  </svg>
                </div>
                {/* Play Button */}
                <button className="absolute inset-0 flex items-center justify-center group hover:bg-black/20 transition-colors">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
                  </div>
                </button>
              </div>

              {/* Video Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Clarity Score</span>
                  <span className="text-lg font-bold text-purple-400">8.5/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Technical Depth</span>
                  <span className="text-lg font-bold text-purple-400">9.0/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium text-foreground">1:30 / 1:30</span>
                </div>
              </div>
            </div>

            {/* Right: Logic Map */}
            <div className="glass-card p-6 rounded-xl border border-purple-500/30 bg-purple-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-foreground">Logic Map</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Decision tree documenting architectural trade-offs and rejection rationales.
              </p>

              {/* Actual Decision Tree Component */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-4">
                  Each tree shows: <strong>The Challenge</strong> (problem) → <strong>Pivot / Alternative</strong> (rejected alternatives with "Why NOT?") → <strong>Chosen Solution</strong> (chosen solution). Click nodes to expand details.
                </p>
                {mockDecisions.map((decision, index) => (
                  <DecisionTreeNode
                    key={index}
                    decision={decision}
                    index={index}
                    allDecisions={mockDecisions}
                    repositoryUrl=""
                  />
                ))}
              </div>

              {/* Logic Map Metrics */}
              <div className="space-y-3 pt-6 border-t border-purple-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trade-off Clarity</span>
                  <span className="text-lg font-bold text-purple-400">9.2/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Decisions Documented</span>
                  <span className="text-lg font-bold text-purple-400">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rejection Rationales</span>
                  <span className="text-lg font-bold text-purple-400">2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Score */}
          <div className="glass-card p-8 rounded-xl border border-border">
            <h2 className="text-2xl font-bold mb-6 text-center">Combined Communication & Impact Score</h2>
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-purple-400 mb-2">8.5/10</div>
                <p className="text-muted-foreground">Overall Communication Clarity</p>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Verbal Communication (Demo)</span>
                    <span className="text-sm font-bold text-purple-400">70%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Written Communication (Logic Map)</span>
                    <span className="text-sm font-bold text-purple-400">30%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Analysis */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="glass-card-glow p-8 rounded-2xl border border-purple-500/30 bg-purple-500/5">
            <h2 className="text-2xl font-bold mb-4">AI Context</h2>
            <p className="text-muted-foreground">
              <strong className="text-purple-400">Strong Technical Communicator:</strong> Demonstrates excellent
              clarity in both verbal (8.5/10 demo) and written (9.2/10 logic map) formats. Architecture demo shows
              ability to explain complex systems concisely, while logic map reveals deep trade-off reasoning with
              14 rejection rationales documented. Ideal for roles requiring cross-team collaboration and
              architectural documentation.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
