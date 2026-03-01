/**
 * Agent Detail Panel
 * Shows detailed information about each specialist agent
 */

'use client'

import { Video, Brain, Shield, Zap, Sparkles, Target } from 'lucide-react'

const agentDetails = [
  {
    icon: Video,
    name: 'Video Agent',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    description: "Analyzes product demo videos for 'Aha!' moments and business impact",
    responsibilities: [
      'Detects product highlights and key features',
      'Identifies business value propositions',
      'Measures demo clarity and structure',
      'Extracts user flow patterns',
    ],
    dataSource: '90s Video Demo',
    output: 'Product narrative quality score',
  },
  {
    icon: Brain,
    name: 'Logic Agent',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Validates architectural trade-offs and rejection rationales',
    responsibilities: [
      'Verifies technical decision consistency',
      'Analyzes architectural trade-off documentation',
      'Validates "Why Not" rejection rationales',
      'Measures decision tree completeness',
    ],
    dataSource: 'Logic Map',
    output: 'Architectural clarity score',
  },
  {
    icon: Shield,
    name: 'Quality Agent',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: "Scans code diffs for 'Unhappy Path' patterns and error handling",
    responsibilities: [
      'Detects error handling patterns',
      'Analyzes edge case coverage',
      'Validates input validation logic',
      'Measures defensive coding practices',
    ],
    dataSource: 'GitHub Diffs',
    output: 'Code robustness score',
  },
  {
    icon: Zap,
    name: 'Flow Agent',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'Measures atomic intent and filters out AI-generated boilerplate',
    responsibilities: [
      'Calculates commit atomicity',
      'Detects AI-generated code patterns',
      'Analyzes commit message quality',
      'Measures refactoring vs feature work',
    ],
    dataSource: 'GitHub Commits',
    output: 'Development intent score',
  },
  {
    icon: Sparkles,
    name: 'AI Fluency Agent',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'Detects AI tool usage, agentic architecture, and modern LLM-assisted workflows',
    responsibilities: [
      'Identifies AI coding tools (Cursor, Copilot, v0)',
      'Detects RAG pipelines and agentic systems',
      'Analyzes LLM-integrated CI/CD workflows',
      'Measures repository metadata for AI patterns',
    ],
    dataSource: 'GitHub Code',
    output: 'AI Fluency score',
  },
]

export function AgentDetailPanel() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Specialist Agent Architecture
        </h2>
        <p className="text-white/60 max-w-3xl mx-auto">
          Five independent agents analyze different aspects of your builder profile,
          feeding deterministic scores into the Scoring Engine for weighted aggregation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agentDetails.map((agent) => {
          const Icon = agent.icon
          return (
            <div
              key={agent.name}
              className={`glass-card p-6 rounded-xl border ${agent.borderColor} ${agent.bgColor} hover:scale-105 transition-transform duration-300`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${agent.bgColor} ${agent.borderColor} border`}>
                  <Icon className={`w-6 h-6 ${agent.color}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${agent.color}`}>
                    {agent.name}
                  </h3>
                  <p className="text-xs text-white/50">
                    Source: {agent.dataSource}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/70 mb-4">{agent.description}</p>

              {/* Responsibilities */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-white/50 mb-2">
                  Key Responsibilities:
                </p>
                <ul className="space-y-1.5">
                  {agent.responsibilities.map((resp, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-white/60 flex items-start gap-2"
                    >
                      <span className={agent.color}>•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Output */}
              <div className={`mt-4 pt-4 border-t ${agent.borderColor}`}>
                <p className="text-xs font-semibold text-white/50 mb-1">
                  Output:
                </p>
                <p className={`text-sm font-medium ${agent.color}`}>
                  {agent.output}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Scoring Engine Info */}
      <div className="glass-card p-8 rounded-xl border border-purple-500/30 bg-purple-500/10 mt-12">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Target className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-purple-400 mb-3">
              Scoring Engine
            </h3>
            <p className="text-white/70 mb-4">
              The final synthesis layer that aggregates all agent outputs using a
              transparent, deterministic scoring algorithm. No black-box AI - just
              pure math.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-white/80 mb-2">
                  Role-Based Weighting:
                </p>
                <p className="text-xs text-white/50 mb-3">
                  Weights adjust dynamically based on the target role
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-400 mb-1">Product Engineer:</p>
                    <ul className="text-xs text-white/60 space-y-0.5">
                      <li>Video: 25%, Logic: 20%, Quality: 20%, Flow: 15%, AI: 20%</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-400 mb-1">Infrastructure/Backend:</p>
                    <ul className="text-xs text-white/60 space-y-0.5">
                      <li>Video: 10%, Logic: 25%, Quality: 35%, Flow: 15%, AI: 15%</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-pink-400 mb-1">Startup Engineer:</p>
                    <ul className="text-xs text-white/60 space-y-0.5">
                      <li>Video: 20%, Logic: 15%, Quality: 15%, Flow: 25%, AI: 25%</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80 mb-2">
                  Output Format:
                </p>
                <ul className="text-sm text-white/60 space-y-1">
                  <li>• Spider Map (5 dimensions)</li>
                  <li>• Overall Builder Score (0-100)</li>
                  <li>• Grade (A-F)</li>
                  <li>• Builder Persona Classification</li>
                </ul>
                <p className="text-xs text-white/50 mt-3">
                  Hiring managers can customize weights for their specific needs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
