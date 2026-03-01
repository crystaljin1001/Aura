/**
 * Dual-Pulse Card
 * Displays both Velocity and Engineering Rigor scores prominently
 */

'use client'

import { useState, useEffect } from 'react'
import { Zap, Shield, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import type { VelocityMetrics } from '@/features/pulse-engine/types'
import type { EngineeringRigorMetrics } from '../types'

interface DualPulseCardProps {
  repositoryUrl: string
  velocityMetrics?: VelocityMetrics
  rigorMetrics?: EngineeringRigorMetrics
}

export function DualPulseCard({
  repositoryUrl,
  velocityMetrics,
  rigorMetrics,
}: DualPulseCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const [velocity, setVelocity] = useState<VelocityMetrics | null>(
    velocityMetrics || null
  )
  const [rigor, setRigor] = useState<EngineeringRigorMetrics | null>(
    rigorMetrics || null
  )

  useEffect(() => {
    if (!velocity || !rigor) {
      loadMetrics()
    }
  }, [repositoryUrl])

  const loadMetrics = async () => {
    try {
      setLoading(true)

      // Fetch velocity if not provided
      if (!velocity) {
        const velResponse = await fetch(
          `/api/pulse/${encodeURIComponent(repositoryUrl)}`
        )
        const velData = await velResponse.json()
        if (velData.success) {
          setVelocity(velData.data.metrics.velocity)
        }
      }

      // Fetch engineering rigor if not provided
      if (!rigor) {
        const rigorResponse = await fetch(
          `/api/engineering-rigor/${encodeURIComponent(repositoryUrl)}`
        )
        const rigorData = await rigorResponse.json()
        if (rigorData.success) {
          setRigor(rigorData.data)
        }
      }
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)

      // Force refresh both metrics
      await Promise.all([
        fetch(`/api/pulse/${encodeURIComponent(repositoryUrl)}?refresh=true`),
        fetch(
          `/api/engineering-rigor/${encodeURIComponent(repositoryUrl)}?refresh=true`
        ),
      ])

      await loadMetrics()
    } catch (error) {
      console.error('Error refreshing metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !velocity && !rigor) {
    return (
      <div className="glass-card p-8 rounded-xl border border-border">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="text-lg text-muted-foreground">
            Analyzing repository...
          </span>
        </div>
      </div>
    )
  }

  if (!velocity || !rigor) {
    return (
      <div className="glass-card p-8 rounded-xl border border-border">
        <p className="text-center text-muted-foreground">
          Metrics not available for this repository
        </p>
      </div>
    )
  }

  // Get velocity badge properties
  const velocityBadge = getVelocityBadge(velocity.score)
  const rigorBadge = getRigorBadge(rigor.overall_score)

  return (
    <div className="glass-card rounded-xl border border-border overflow-hidden">
      {/* Header with Dual-Pulse Scores */}
      <div className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8">
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh metrics"
        >
          <RefreshCw
            className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`}
          />
        </button>

        <h2 className="text-2xl font-bold mb-8 text-center">Project Pulse</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Velocity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Velocity</h3>
                <p className="text-xs text-muted-foreground">The Speed</p>
              </div>
            </div>

            {/* Big Score */}
            <div className="relative">
              <div className="text-7xl font-black bg-gradient-to-br from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {velocity.score}
                <span className="text-4xl">/10</span>
              </div>
              <div
                className={`inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full text-sm font-semibold ${velocityBadge.color}`}
              >
                {velocityBadge.emoji} {velocityBadge.label}
              </div>
            </div>

            {/* Key Signal */}
            <div className="bg-black/20 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Key Signal</p>
              <p className="font-semibold">
                {velocity.raw_data.avg_commits_per_day} Commits/Day
              </p>
            </div>

            {/* AI Context */}
            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
              <p className="text-xs text-blue-400">
                <strong>AI Context:</strong>{' '}
                {getVelocityAIContext(velocity.score, velocity.label)}
              </p>
            </div>
          </div>

          {/* Right: Engineering Rigor */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Engineering Rigor</h3>
                <p className="text-xs text-muted-foreground">The Quality</p>
              </div>
            </div>

            {/* Big Score */}
            <div className="relative">
              <div className="text-7xl font-black bg-gradient-to-br from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {rigor.overall_score}
                <span className="text-4xl">/10</span>
              </div>
              <div
                className={`inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full text-sm font-semibold ${rigorBadge.color}`}
              >
                {rigorBadge.emoji} {rigor.badge}
              </div>
            </div>

            {/* Key Signal */}
            <div className="bg-black/20 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Key Signals</p>
              <p className="font-semibold">{rigor.key_signals.join(' | ')}</p>
            </div>

            {/* AI Context */}
            <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
              <p className="text-xs text-green-400">
                <strong>AI Context:</strong> {rigor.ai_context}
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-6 flex items-center justify-center gap-2 p-3 hover:bg-white/5 rounded-lg transition-colors"
        >
          <span className="text-sm font-medium">
            {showDetails ? 'Hide' : 'View'} Detailed Breakdown
          </span>
          {showDetails ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Detailed Breakdown (Collapsible) */}
      {showDetails && (
        <div className="p-8 space-y-8 border-t border-border">
          {/* Velocity Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Velocity Breakdown
            </h3>

            {/* Calculation Rationale */}
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
              <p className="text-sm font-semibold mb-2 text-blue-400">
                📐 Calculation Rationale
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Step 1: Calculate Days Active</p>
                  <p>
                    Duration from first commit to last commit = <strong>{velocity.raw_data.days_active} days</strong>
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    (Project span: earliest to most recent commit date)
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-1">Step 2: Calculate Complexity Factor</p>
                  <p>
                    Avg lines per commit: ({velocity.raw_data.total_additions.toLocaleString()} + {velocity.raw_data.total_deletions.toLocaleString()}) / {velocity.raw_data.commits_30d} = <strong>{Math.round((velocity.raw_data.total_additions + velocity.raw_data.total_deletions) / velocity.raw_data.commits_30d)} lines/commit</strong>
                  </p>
                  <p className="mt-1">
                    Complexity factor (log-scaled): <strong>{velocity.raw_data.complexity_factor}</strong>
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    (0.6 = small, 1.0 = moderate, 1.4+ = substantial changes)
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-1">Step 3: Calculate Velocity</p>
                  <p>
                    Formula: (Commits × Complexity) / Days Active
                  </p>
                  <p className="mt-1">
                    ({velocity.raw_data.commits_30d} × {velocity.raw_data.complexity_factor}) / {velocity.raw_data.days_active} = <strong>{((velocity.raw_data.commits_30d * velocity.raw_data.complexity_factor) / velocity.raw_data.days_active).toFixed(2)} raw velocity</strong>
                  </p>
                  <p className="mt-1">
                    Normalized to 0-10 scale: <strong className="text-yellow-400">{velocity.score}/10</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricBox
                label="Commits (30d)"
                value={velocity.raw_data.commits_30d.toString()}
              />
              <MetricBox
                label="Avg/Day"
                value={velocity.raw_data.avg_commits_per_day.toString()}
              />
              <MetricBox
                label="Additions"
                value={velocity.raw_data.total_additions.toLocaleString()}
                color="text-green-400"
              />
              <MetricBox
                label="Deletions"
                value={velocity.raw_data.total_deletions.toLocaleString()}
                color="text-red-400"
              />
            </div>
          </div>

          {/* Engineering Rigor Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Engineering Rigor Breakdown
            </h3>

            {/* Calculation Rationale */}
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
              <p className="text-sm font-semibold mb-2 text-green-400">
                📐 Calculation Rationale
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  <strong>Overall Score:</strong> Sum of 5 dimensions (max 10 points)
                </p>
                <p className="mt-2">
                  <strong>Calculation:</strong>
                </p>
                <ul className="ml-4 space-y-0.5">
                  <li>• Tooling Intent: {rigor.breakdown.tooling.score}/2 pts</li>
                  <li>• CI/CD Infrastructure: {rigor.breakdown.infrastructure.score}/3 pts</li>
                  <li>• Testing Ratio: {rigor.breakdown.testing.score}/2.5 pts</li>
                  <li>• Refactor Signal: {rigor.breakdown.refactoring.score}/1.5 pts</li>
                  <li>• Documentation: {rigor.breakdown.documentation.score}/1 pt</li>
                </ul>
                <p className="mt-2">
                  <strong>Total:</strong> {rigor.overall_score}/10 → Grade: {rigor.grade}
                </p>
                <p className="mt-2 text-xs">
                  Each dimension evaluates specific quality signals from your repository's structure, workflows, commits, and documentation.
                </p>
              </div>
            </div>

            {/* Dimension Scores */}
            <div className="space-y-3">
              <ScoreBar
                label="Tooling Intent"
                score={rigor.breakdown.tooling.score}
                max={2}
                description={`${rigor.breakdown.tooling.config_files_found.length} config files`}
              />
              <ScoreBar
                label="CI/CD Infrastructure"
                score={rigor.breakdown.infrastructure.score}
                max={3}
                description={rigor.breakdown.infrastructure.workflow_complexity}
              />
              <ScoreBar
                label="Testing Ratio"
                score={rigor.breakdown.testing.score}
                max={2.5}
                description={`${Math.round(rigor.breakdown.testing.testing_ratio * 100)}% coverage`}
              />
              <ScoreBar
                label="Refactor Signal"
                score={rigor.breakdown.refactoring.score}
                max={1.5}
                description={rigor.breakdown.refactoring.category !== 'Balanced' ? rigor.breakdown.refactoring.category : undefined}
              />
              <ScoreBar
                label="Documentation"
                score={rigor.breakdown.documentation.score}
                max={1}
                description={`${rigor.breakdown.documentation.section_count} sections`}
              />
            </div>

            {/* Improvements */}
            {rigor.improvements.length > 0 && (
              <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
                <p className="text-sm font-semibold mb-2 text-orange-400">
                  Suggested Improvements:
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {rigor.improvements.map((improvement, i) => (
                    <li key={i}>• {improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components
function MetricBox({
  label,
  value,
  color = 'text-foreground',
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="bg-background/50 p-3 rounded-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function ScoreBar({
  label,
  score,
  max,
  description,
}: {
  label: string
  score: number
  max: number
  description?: string
}) {
  const percentage = (score / max) * 100

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {score.toFixed(1)}/{max}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  )
}

// Helper Functions
function getVelocityBadge(score: number) {
  if (score >= 8)
    return { label: 'Intense Sprint', emoji: '🔥', color: 'bg-red-500/20 text-red-400' }
  if (score >= 6)
    return { label: 'High Velocity', emoji: '⚡', color: 'bg-yellow-500/20 text-yellow-400' }
  if (score >= 3)
    return { label: 'Steady Progress', emoji: '🚀', color: 'bg-blue-500/20 text-blue-400' }
  return { label: 'Maintenance Mode', emoji: '🔧', color: 'bg-gray-500/20 text-gray-400' }
}

function getRigorBadge(score: number) {
  if (score >= 8.5)
    return { emoji: '🏆', color: 'bg-green-500/20 text-green-400' }
  if (score >= 7)
    return { emoji: '✨', color: 'bg-emerald-500/20 text-emerald-400' }
  if (score >= 5)
    return { emoji: '🔨', color: 'bg-blue-500/20 text-blue-400' }
  return { emoji: '🌱', color: 'bg-gray-500/20 text-gray-400' }
}

function getVelocityAIContext(score: number, label: string): string {
  if (score >= 8) {
    return 'High execution momentum, ideal for rapid prototyping and feature delivery.'
  } else if (score >= 6) {
    return 'Strong development pace with consistent commit activity.'
  } else if (score >= 3) {
    return 'Moderate activity, suitable for incremental improvements.'
  } else {
    return 'Low recent activity, project may be in stable/maintenance phase.'
  }
}
