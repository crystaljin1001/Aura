/**
 * Hiring Dashboard Mockup
 * Futuristic dark-mode UI for AI-powered candidate screening
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Play, Calendar, Github, ExternalLink, Star, Sparkles } from 'lucide-react'
import type { Candidate } from '../types'

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Alex Chen',
    rank: 1,
    title: '', // Not shown anymore
    avatarColor: '#10b981',
    aiRanking: '🏆 **Archetype:** The Product Visionary\n\n🟢 **Superpower:** Exceptional product & business sense (9.9/10) shows rare ability to translate user needs into technical solutions. Strong AI fluency (8.5/10) with heavy Cursor usage and GitHub Copilot integration for rapid prototyping.\n\n✓ **Well-Rounded:** Strong quality & scalability (7.9/10) with excellent documentation and technical storytelling. Primary growth area: expanding test coverage across projects.',
    spiderMap: [
      { label: 'Product & Business Sense', value: 9.9 },
      { label: 'Communication & Impact', value: 7.0 },
      { label: 'Quality & Scalability', value: 7.9 },
      { label: 'Velocity & Focus', value: 6.0 },
      { label: 'AI Fluency', value: 8.5 },
    ],
    githubUrl: 'github.com/alexchen',
    portfolioUrl: 'alexchen.dev',
  },
  {
    id: '2',
    name: 'Jordan Martinez',
    rank: 2,
    title: '',
    avatarColor: '#3b82f6',
    aiRanking: '🏆 **Archetype:** The Storyteller Engineer\n\n🟢 **Superpower:** Outstanding communication & impact (8.5/10) with exceptional ability to explain complex systems clearly. Solid product sense (8.0/10) ensures features align with user needs. Good AI fluency (7.5/10) with ChatGPT integration for documentation.\n\n⚠️ **Trade-off:** Moderate quality/scalability (7.2/10) - less exposure to production-grade infrastructure patterns.',
    spiderMap: [
      { label: 'Product & Business Sense', value: 8.0 },
      { label: 'Communication & Impact', value: 8.5 },
      { label: 'Quality & Scalability', value: 7.2 },
      { label: 'Velocity & Focus', value: 7.2 },
      { label: 'AI Fluency', value: 7.5 },
    ],
    githubUrl: 'github.com/jmartinez',
    portfolioUrl: 'jordanm.io',
  },
  {
    id: '3',
    name: 'Taylor Kim',
    rank: 3,
    title: '',
    avatarColor: '#8b5cf6',
    aiRanking: '🏆 **Archetype:** The Quality Guardian\n\n🟢 **Superpower:** Exceptional quality/scalability (8.6/10) with production-grade error handling, defensive coding patterns, and strong infrastructure knowledge. Systems stay reliable under load.\n\n⚠️ **Trade-off:** Lower development velocity (5.5/10), communication impact (6.0/10), and AI fluency (5.0/10) - prefers manual code review over AI-assisted workflows.',
    spiderMap: [
      { label: 'Product & Business Sense', value: 7.5 },
      { label: 'Communication & Impact', value: 6.0 },
      { label: 'Quality & Scalability', value: 8.6 },
      { label: 'Velocity & Focus', value: 5.5 },
      { label: 'AI Fluency', value: 5.0 },
    ],
    githubUrl: 'github.com/tkim',
    portfolioUrl: 'taylorkim.dev',
  },
  {
    id: '4',
    name: 'Sam Rodriguez',
    rank: 4,
    title: '',
    avatarColor: '#f59e0b',
    aiRanking: '🏆 **Archetype:** The Frontend Specialist\n\n🟢 **Superpower:** Strong product sense (8.3/10), communication (7.8/10), and exceptional AI fluency (9.2/10) - leverages v0, Cursor, and GitHub Copilot for rapid UI prototyping. Good velocity (7.0/10) ensures consistent feature delivery.\n\n⚠️ **Trade-off:** Limited quality/scalability experience (5.6/10) - frontend-focused skillset may struggle with backend architecture and distributed systems.',
    spiderMap: [
      { label: 'Product & Business Sense', value: 8.3 },
      { label: 'Communication & Impact', value: 7.8 },
      { label: 'Quality & Scalability', value: 5.6 },
      { label: 'Velocity & Focus', value: 7.0 },
      { label: 'AI Fluency', value: 9.2 },
    ],
    githubUrl: 'github.com/srodriguez',
    portfolioUrl: 'samr.design',
  },
  {
    id: '5',
    name: 'Casey Morgan',
    rank: 5,
    title: '',
    avatarColor: '#ec4899',
    aiRanking: '🏆 **Archetype:** The Infrastructure Expert\n\n🟢 **Superpower:** Best-in-class quality/scalability (8.8/10) with deep knowledge of distributed systems, caching strategies, production-grade error handling, and high-throughput architectures. Exceptional AI fluency (9.8/10) - builds agentic systems with RAG pipelines and LLM-integrated CI/CD.\n\n⚠️ **Trade-off:** Weakest product intuition (6.2/10) and communication (5.8/10) in this pool - better suited for backend/infrastructure roles than product engineering.',
    spiderMap: [
      { label: 'Product & Business Sense', value: 6.2 },
      { label: 'Communication & Impact', value: 5.8 },
      { label: 'Quality & Scalability', value: 8.8 },
      { label: 'Velocity & Focus', value: 6.5 },
      { label: 'AI Fluency', value: 9.8 },
    ],
    githubUrl: 'github.com/cmorgan',
    portfolioUrl: 'caseym.dev',
  },
]

function CompactBuilderProfile({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const size = 360
  const center = size / 2
  const maxRadius = 100

  // Define evidence pages for each pillar
  const evidencePages: Record<string, { url: string }> = {
    'Product & Business Sense': { url: '#user-journey-demo' }, // Scroll to video on same page
    'Communication & Impact': { url: '/ideation/communication-impact' },
    'Quality & Scalability': { url: '/ideation/quality-scalability' },
    'Velocity & Focus': { url: '/ideation/velocity-focus' },
    'AI Fluency': { url: '/ideation/ai-fluency' },
  }

  const handlePillarClick = (label: string) => {
    const evidence = evidencePages[label]
    if (!evidence) return

    // For local anchors, scroll smoothly
    if (evidence.url.startsWith('#')) {
      const element = document.getElementById(evidence.url.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // For actual pages, navigate
      window.location.href = evidence.url
    }
  }

  // Calculate polygon points
  const points = data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
    const radius = (d.value / 10) * maxRadius
    const x = center + radius * Math.cos(angle)
    const y = center + radius * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="relative">
      <svg width={size} height={size}>
        {/* Grid circles */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, idx) => (
          <polygon
            key={`grid-${idx}`}
            points={data.map((_, i) => {
              const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
              const x = center + maxRadius * scale * Math.cos(angle)
              const y = center + maxRadius * scale * Math.sin(angle)
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke={scale === 1.0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"}
            strokeWidth={scale === 1.0 ? "2" : "1"}
          />
        ))}

        {/* Axis lines */}
        {data.map((_, i) => {
          const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
          const x = center + maxRadius * Math.cos(angle)
          const y = center + maxRadius * Math.sin(angle)
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          )
        })}

        {/* Data polygon with glow */}
        <defs>
          <filter id="glow-compact">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.polygon
          points={points}
          fill={`${color}20`}
          stroke={color}
          strokeWidth="2"
          filter="url(#glow-compact)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
          const radius = (d.value / 10) * maxRadius
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          return (
            <motion.circle
              key={`point-${i}`}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              filter="url(#glow-compact)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            />
          )
        })}

        {/* Labels and values */}
        {data.map((d, i) => {
          const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
          // Adjust label distance for visual balance based on angular position
          // Index 0: Product & Business Sense (top)
          // Index 1: Communication & Impact (upper right)
          // Index 2: Quality & Scalability (lower right)
          // Index 3: Velocity & Focus (lower left)
          // Index 4: AI Fluency (upper left)
          let labelRadius = maxRadius + 45
          if (i === 0) labelRadius = maxRadius + 45 // top - aligned with sides
          if (i === 2) labelRadius = maxRadius + 42 // lower right - closer
          if (i === 3) labelRadius = maxRadius + 42 // lower left - closer
          const x = center + labelRadius * Math.cos(angle)
          const y = center + labelRadius * Math.sin(angle)

          // Split label at "&" for multi-line display
          const labelParts = d.label.split(' & ')

          return (
            <g
              key={`label-${i}`}
              onClick={() => handlePillarClick(d.label)}
              style={{ cursor: 'pointer' }}
              className="group"
            >
              {/* Clickable border/background */}
              <rect
                x={x - 38}
                y={y - 18}
                width="76"
                height="36"
                rx="8"
                fill="rgba(59, 130, 246, 0.05)"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="1"
                className="group-hover:fill-blue-500/20 group-hover:stroke-blue-400 transition-all"
              />

              {labelParts.length === 2 ? (
                <>
                  <text
                    x={x}
                    y={y - 9}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(147, 197, 253, 0.9)"
                    fontSize="7"
                    fontWeight="600"
                    fontFamily="system-ui"
                    className="group-hover:fill-blue-300 transition-colors"
                  >
                    {labelParts[0]}
                  </text>
                  <text
                    x={x}
                    y={y - 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(147, 197, 253, 0.9)"
                    fontSize="7"
                    fontWeight="600"
                    fontFamily="system-ui"
                    className="group-hover:fill-blue-300 transition-colors"
                  >
                    & {labelParts[1]}
                  </text>
                </>
              ) : (
                <text
                  x={x}
                  y={y - 7}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(147, 197, 253, 0.9)"
                  fontSize="7"
                  fontWeight="600"
                  fontFamily="system-ui"
                  className="group-hover:fill-blue-300 transition-colors"
                >
                  {d.label}
                </text>
              )}
              <text
                x={x}
                y={y + 9}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize="12"
                fontWeight="700"
                fontFamily="system-ui"
              >
                {d.value}
              </text>
            </g>
          )
        })}

      </svg>
    </div>
  )
}

function CandidateCard({
  candidate,
  isSelected,
  onClick
}: {
  candidate: Candidate;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-white/5 border-white/20'
          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: candidate.rank * 0.1 }}
    >
      <div className="flex items-start gap-3 mb-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
            style={{ backgroundColor: `${candidate.avatarColor}20`, color: candidate.avatarColor }}
          >
            {candidate.rank}
          </div>
        </div>

        {/* Name only */}
        <div className="flex-1 min-w-0 flex items-center h-10">
          <h3 className="text-base font-semibold text-white truncate">
            {candidate.name}
          </h3>
        </div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-3 text-xs">
        <a
          href={`https://${candidate.githubUrl}`}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Github className="w-3 h-3" />
          <span className="truncate max-w-[80px]">{candidate.githubUrl.split('/')[1]}</span>
        </a>
        <a
          href={`https://${candidate.portfolioUrl}`}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3 h-3" />
          <span className="truncate max-w-[80px]">{candidate.portfolioUrl}</span>
        </a>
      </div>
    </motion.div>
  )
}

export function HiringDashboardMockup() {
  const [selectedCandidateId, setSelectedCandidateId] = React.useState('1')
  const selectedCandidate = mockCandidates.find(c => c.id === selectedCandidateId) || mockCandidates[0]

  return (
    <div className="w-full h-full bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex h-[800px]">
        {/* Left Sidebar - Candidate List */}
        <div className="w-[400px] border-r border-white/10 bg-[#0f0f0f] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#0f0f0f] border-b border-white/10 p-6 z-10">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold text-white">
                Top 5 AI-Ranked Candidates
              </h2>
            </div>
            <p className="text-sm text-white/50">Product Engineers</p>
          </div>

          {/* Candidate List */}
          <div className="p-4 space-y-3">
            {mockCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelected={candidate.id === selectedCandidateId}
                onClick={() => setSelectedCandidateId(candidate.id)}
              />
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Selected Candidate Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl"
                style={{
                  backgroundColor: `${selectedCandidate.avatarColor}20`,
                  color: selectedCandidate.avatarColor,
                }}
              >
                {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {selectedCandidate.name}
                </h1>
                <p className="text-white/60">{selectedCandidate.title}</p>
              </div>
              <div className="ml-auto">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: `${selectedCandidate.avatarColor}10`,
                    borderColor: `${selectedCandidate.avatarColor}30`,
                    borderWidth: '1px'
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: selectedCandidate.avatarColor }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: selectedCandidate.avatarColor }}
                  >
                    #{selectedCandidate.rank} Match
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Card: Spider Chart + AI Ranking */}
            <motion.div
              className="bg-white/[0.02] border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-8">
                {/* Left: Compact Spider Chart */}
                <div className="flex-shrink-0">
                  <CompactBuilderProfile
                    data={selectedCandidate.spiderMap}
                    color={selectedCandidate.avatarColor}
                  />
                </div>

                {/* Right: AI Evaluation */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-400">AI Evaluation</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedCandidate.aiRanking.split('\n\n').map((section, idx) => {
                      // Parse section: extract emoji, bold label, and text
                      const match = section.match(/^(🏆|🟢|⚠️)\s+\*\*([^:]+):\*\*\s+(.+)$/s)
                      if (!match) return null

                      const [, emoji, label, text] = match

                      return (
                        <div key={idx} className="flex gap-3">
                          <span className="text-xl flex-shrink-0">{emoji}</span>
                          <div>
                            <span className="font-semibold text-white">{label}:</span>
                            <span className="text-white/80 ml-2">{text}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Video Players */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Product Demo Video */}
              <motion.div
                id="user-journey-demo"
                className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden scroll-mt-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-pink-400" />
                    <h3 className="font-semibold text-white">User Journey Demo</h3>
                  </div>
                  <p className="text-xs text-white/50 mt-1">0:00 / 1:30 • Product & Business Sense Evidence</p>
                </div>
                <div className="aspect-video bg-gradient-to-br from-pink-500/10 to-purple-500/10 relative flex items-center justify-center">
                  {/* Mockup UI */}
                  <div className="absolute inset-4 border border-white/20 rounded-lg p-4 bg-[#0a0a0a]/80 backdrop-blur">
                    <div className="space-y-2">
                      <div className="h-2 bg-white/20 rounded w-3/4" />
                      <div className="h-2 bg-white/20 rounded w-1/2" />
                      <div className="h-16 bg-white/10 rounded mt-4" />
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="h-12 bg-white/10 rounded" />
                        <div className="h-12 bg-white/10 rounded" />
                        <div className="h-12 bg-white/10 rounded" />
                      </div>
                    </div>
                  </div>
                  {/* Play Button Overlay */}
                  <button className="absolute inset-0 flex items-center justify-center group hover:bg-black/20 transition-colors">
                    <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </button>
                </div>
              </motion.div>

              {/* Architecture Walkthrough Video */}
              <motion.div
                className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-blue-400" />
                    <h3 className="font-semibold text-white">Architecture Walkthrough</h3>
                  </div>
                  <p className="text-xs text-white/50 mt-1">0:00 / 1:30</p>
                </div>
                <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-cyan-500/10 relative flex items-center justify-center">
                  {/* Mockup Diagram */}
                  <div className="absolute inset-4 border border-white/20 rounded-lg p-4 bg-[#0a0a0a]/80 backdrop-blur">
                    <svg width="100%" height="100%" viewBox="0 0 200 140">
                      {/* Simple architecture diagram */}
                      <rect x="10" y="20" width="40" height="30" rx="4" fill="rgba(59, 130, 246, 0.3)" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="2" />
                      <rect x="80" y="20" width="40" height="30" rx="4" fill="rgba(139, 92, 246, 0.3)" stroke="rgba(139, 92, 246, 0.8)" strokeWidth="2" />
                      <rect x="150" y="20" width="40" height="30" rx="4" fill="rgba(16, 185, 129, 0.3)" stroke="rgba(16, 185, 129, 0.8)" strokeWidth="2" />
                      <rect x="45" y="80" width="110" height="40" rx="4" fill="rgba(245, 158, 11, 0.3)" stroke="rgba(245, 158, 11, 0.8)" strokeWidth="2" />

                      {/* Connection lines */}
                      <line x1="30" y1="50" x2="30" y2="80" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" />
                      <line x1="100" y1="50" x2="100" y2="80" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" />
                      <line x1="170" y1="50" x2="170" y2="80" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" />
                    </svg>
                  </div>
                  {/* Play Button Overlay */}
                  <button className="absolute inset-0 flex items-center justify-center group hover:bg-black/20 transition-colors">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Schedule Call Button */}
            <motion.button
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/30 transition-all"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Calendar className="w-6 h-6" />
              Schedule Intro Call
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
