/**
 * Pulse Metrics Card
 * Displays velocity and uptime metrics for a project
 */

'use client'

import { useEffect, useState } from 'react'
import { Activity, Zap, Globe, TrendingUp, Calendar, RefreshCw } from 'lucide-react'
import type { PulseMetrics } from '../types'
import { VelocityBadge } from './VelocityBadge'
import { UptimeBadge } from './UptimeBadge'
import { VelocityHeatmap } from './VelocityHeatmap'
import { ProjectTimelineForm } from './ProjectTimelineForm'
import { getTrendIcon } from '../utils/velocity-calculator'
import { getTimelineDescription, getPlanningInsight } from '../utils/timeline-calculator'

interface PulseMetricsCardProps {
  repositoryUrl: string
}

export function PulseMetricsCard({ repositoryUrl }: PulseMetricsCardProps) {
  const [metrics, setMetrics] = useState<PulseMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pulse/${encodeURIComponent(repositoryUrl)}`)
      const data = await response.json()

      if (data.success) {
        setMetrics(data.data)
        setError(null)
      } else {
        setError(data.error || 'Failed to load pulse metrics')
      }
    } catch (err) {
      setError('Failed to fetch pulse metrics')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      // Clear cache first
      await fetch('/api/pulse/clear-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryUrl }),
      })
      // Then reload metrics
      await loadMetrics()
    } catch (err) {
      setError('Failed to refresh metrics')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [repositoryUrl])

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
          <h3 className="text-xl font-semibold">Project Pulse</h3>
        </div>
        <p className="text-sm text-muted-foreground">Calculating metrics...</p>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="glass-card p-6 rounded-xl border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Project Pulse</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {error || 'Metrics not available'}
        </p>
      </div>
    )
  }

  const { velocity, uptime, sprint_signature, lifecycle, timeline } = metrics.metrics

  return (
    <div className="glass-card p-6 rounded-xl border border-border space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold">Project Pulse</h3>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* Show custom timeline status if defined, otherwise lifecycle */}
          {timeline?.user_defined ? (
            <div className="text-right">
              <div className="text-2xl">⚡️</div>
              <div className="text-xs text-muted-foreground">
                {timeline.project_end_date ? 'Completed' : 'Ongoing'}
              </div>
            </div>
          ) : lifecycle ? (
            <div className="text-right">
              <div className="text-2xl">{lifecycle.emoji}</div>
              <div className="text-xs text-muted-foreground">{lifecycle.status}</div>
            </div>
          ) : null}
          <span className="text-xs text-muted-foreground">
            {metrics.verification_badge}
          </span>
        </div>
      </div>

      {/* Lifecycle Status Banner - Only show if user hasn't defined custom timeline */}
      {lifecycle && !timeline?.user_defined && (
        <div className="bg-background/50 p-4 rounded-lg border border-border/50">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{lifecycle.emoji}</span>
            <div>
              <h4 className="font-semibold mb-1">{lifecycle.status}</h4>
              <p className="text-sm text-muted-foreground">{lifecycle.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{lifecycle.reasoning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sprint Signature (Peak Velocity) */}
      {sprint_signature && (
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <span className="font-medium">Sprint Signature</span>
            </div>
            <span className="text-sm font-semibold text-orange-400">
              {sprint_signature.label}
            </span>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4 rounded-lg border border-orange-500/30">
            <p className="text-sm text-muted-foreground mb-3">
              Peak velocity during the core build phase
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Peak Score</p>
                <p className="text-2xl font-bold text-orange-400">
                  {sprint_signature.velocity_score}/10
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sprint Duration</p>
                <p className="text-2xl font-bold">{sprint_signature.duration_days}d</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Commits</p>
                <p className="text-2xl font-bold">{sprint_signature.commits}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg/Day</p>
                <p className="text-2xl font-bold">{sprint_signature.avg_commits_per_day}</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <p>
                Built: {new Date(sprint_signature.start_date).toLocaleDateString()} → {new Date(sprint_signature.end_date).toLocaleDateString()}
              </p>
              <p className="mt-1">
                {sprint_signature.total_additions.toLocaleString()} additions, {sprint_signature.total_deletions.toLocaleString()} deletions
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
            <p className="text-xs text-blue-400">
              💡 <strong>Why this matters:</strong> This captures your peak productivity during the actual build,
              regardless of current maintenance status. A {sprint_signature.duration_days}-day intense sprint
              proves high-velocity execution.
            </p>
          </div>
        </div>
      )}

      {/* Project Timeline Section */}
      <div className="space-y-4 pt-6 border-t border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          <span className="font-medium">Project Timeline</span>
        </div>

        {/* Timeline Form */}
        <ProjectTimelineForm repositoryUrl={repositoryUrl} onSave={loadMetrics} />

        {/* Timeline Metrics (if user-defined) */}
        {timeline && timeline.user_defined && (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 rounded-lg border border-purple-500/30">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Duration</p>
                <p className="text-2xl font-bold text-purple-400">
                  {timeline.total_duration_days}d
                </p>
              </div>
              {sprint_signature && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Coding Phase</p>
                  <p className="text-2xl font-bold">{sprint_signature.duration_days}d</p>
                </div>
              )}
              {timeline.planning_overhead && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Planning Ratio</p>
                  <p className="text-2xl font-bold">{timeline.planning_overhead}x</p>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground mb-2">
              <p>{getTimelineDescription(timeline)}</p>
            </div>

            {timeline.planning_overhead && (
              <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/30">
                <p className="text-xs text-purple-400">{getPlanningInsight(timeline.planning_overhead)}</p>
              </div>
            )}
          </div>
        )}

        {/* Explanation for non-user-defined */}
        {timeline && !timeline.user_defined && (
          <div className="bg-background/50 p-3 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground">
              📅 Timeline auto-detected from commits. Set custom dates above to include planning time.
            </p>
          </div>
        )}
      </div>

      {/* Current Velocity Section */}
      <div className="space-y-4 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-medium">Recent Activity (30d)</span>
          </div>
          <VelocityBadge score={velocity.score} label={velocity.label} />
        </div>

        <p className="text-xs text-muted-foreground">
          Current maintenance activity. Low velocity is expected for stable projects.
        </p>

        {/* Velocity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Score</p>
            <p className="text-2xl font-bold">{velocity.score}/10</p>
          </div>
          <div className="bg-background/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Commits (30d)</p>
            <p className="text-2xl font-bold">{velocity.raw_data.commits_30d}</p>
          </div>
          <div className="bg-background/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Avg/Day</p>
            <p className="text-2xl font-bold">{velocity.raw_data.avg_commits_per_day}</p>
          </div>
          <div className="bg-background/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Trend</p>
            <p className="text-2xl">{getTrendIcon(velocity.trend)}</p>
          </div>
        </div>

        {/* Code Changes */}
        <div className="bg-background/50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Lines Changed (30d)</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-400">+{velocity.raw_data.total_additions.toLocaleString()}</span>
                <span className="text-red-400">-{velocity.raw_data.total_deletions.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500"
                  style={{
                    width: `${(velocity.raw_data.total_additions / velocity.raw_data.net_lines_changed) * 100}%`,
                  }}
                />
                <div
                  className="bg-red-500"
                  style={{
                    width: `${(velocity.raw_data.total_deletions / velocity.raw_data.net_lines_changed) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Net</p>
              <p className="font-semibold">{velocity.raw_data.net_lines_changed.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <VelocityHeatmap repositoryUrl={repositoryUrl} />
      </div>

      {/* Uptime Section */}
      {uptime && (
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" />
              <span className="font-medium">Uptime Status</span>
            </div>
            <UptimeBadge status={uptime.current_status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-background/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Uptime</p>
              <p className="text-2xl font-bold">{uptime.uptime_percentage}%</p>
            </div>
            <div className="bg-background/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Avg Latency</p>
              <p className="text-2xl font-bold">{uptime.avg_latency}</p>
            </div>
            <div className="bg-background/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Last Check</p>
              <p className="text-sm font-medium">
                {new Date(uptime.last_verified).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
        Last updated: {new Date(metrics.last_updated).toLocaleString()}
      </div>
    </div>
  )
}
