/**
 * Pulse Engine Types
 * Tracks project velocity (development speed) and uptime (live status)
 */

export interface VelocityMetrics {
  score: number // 0-10 scale
  label: 'Low Velocity' | 'Medium Velocity' | 'High Velocity' | 'Very High Velocity'
  trend: 'increasing' | 'stable' | 'decreasing'
  raw_data: {
    commits_30d: number
    avg_commits_per_day: number
    total_additions: number
    total_deletions: number
    net_lines_changed: number
    days_active: number
    complexity_factor: number
  }
}

export interface UptimeMetrics {
  current_status: 'Live' | 'Offline' | 'Unknown'
  uptime_percentage: number // 0-100
  avg_latency: string // e.g., "240ms"
  last_verified: string // ISO timestamp
  checks_successful: number
  checks_total: number
}

export interface SprintSignature {
  start_date: string // ISO date when build phase started
  end_date: string // ISO date when build phase ended
  duration_days: number
  commits: number
  velocity_score: number // Peak velocity during sprint
  total_additions: number
  total_deletions: number
  avg_commits_per_day: number
  label: string // e.g., "🔥 Intense Sprint"
}

export interface ProjectLifecycle {
  status: 'Active Development' | 'Maintenance Mode' | 'Stable/Production' | 'Archived'
  emoji: '⚡️' | '🔧' | '✅' | '📦'
  description: string
  reasoning: string
  days_since_last_commit: number
}

export interface ProjectTimeline {
  project_start_date: string | null // User-defined project start (includes planning time)
  project_end_date: string | null // User-defined completion date (null if ongoing)
  total_duration_days: number | null // Calendar days from start to end/now
  planning_overhead: number | null // Ratio: total_duration / sprint_duration (shows planning time)
  user_defined: boolean // True if user manually set dates
}

export interface PulseMetrics {
  project_id: string
  repository_url: string
  metrics: {
    velocity: VelocityMetrics
    uptime: UptimeMetrics | null
    sprint_signature: SprintSignature | null // Peak build velocity (coding intensity)
    lifecycle: ProjectLifecycle // Current project status
    timeline: ProjectTimeline | null // Optional user-defined project boundaries
  }
  verification_badge: string
  last_updated: string
}

export interface CommitData {
  sha: string
  date: string
  additions: number
  deletions: number
  total_changes: number
  message: string
  is_likely_boilerplate: boolean
}

export interface VelocityHeatmapData {
  date: string
  commits: number
  additions: number
  deletions: number
  intensity: number // 0-10 scale for visual heatmap
}
