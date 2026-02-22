/**
 * Timeline Calculator
 * Calculates project duration and planning overhead based on user-defined dates
 */

import type { ProjectTimeline, CommitData, SprintSignature } from '../types'

interface TimelineInput {
  project_start_date: string | null
  project_end_date: string | null
  commits: CommitData[]
  sprint_signature: SprintSignature | null
}

/**
 * Calculate project timeline metrics
 * Combines user-defined dates with commit data to show full project duration
 */
export function calculateProjectTimeline(input: TimelineInput): ProjectTimeline | null {
  const { project_start_date, project_end_date, commits, sprint_signature } = input

  // If no user-defined dates and no commits, return null
  if (!project_start_date && commits.length === 0) {
    return null
  }

  // Determine actual start date (user-defined or first commit)
  const startDate = project_start_date
    ? new Date(project_start_date)
    : commits.length > 0
    ? new Date(Math.min(...commits.map(c => new Date(c.date).getTime())))
    : null

  if (!startDate) return null

  // Determine end date (user-defined, or now if ongoing)
  const endDate = project_end_date ? new Date(project_end_date) : new Date()

  // Calculate total duration in days
  const totalDurationMs = endDate.getTime() - startDate.getTime()
  const totalDurationDays = Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24))

  // Calculate planning overhead if we have sprint signature
  let planningOverhead: number | null = null
  if (sprint_signature && sprint_signature.duration_days > 0) {
    // Planning overhead = total_time / coding_time
    // e.g., 30 days total / 7 days coding = 4.3x (73% planning, 27% coding)
    planningOverhead = Math.round((totalDurationDays / sprint_signature.duration_days) * 10) / 10
  }

  return {
    project_start_date: startDate.toISOString(),
    project_end_date: project_end_date || null,
    total_duration_days: totalDurationDays,
    planning_overhead: planningOverhead,
    user_defined: !!project_start_date, // True if user manually set start date
  }
}

/**
 * Get timeline description for display
 */
export function getTimelineDescription(timeline: ProjectTimeline): string {
  if (!timeline.user_defined) {
    return 'Auto-detected from first commit'
  }

  const { total_duration_days, planning_overhead, project_end_date } = timeline

  if (!project_end_date) {
    return `${total_duration_days} days in progress (ongoing)`
  }

  if (planning_overhead && planning_overhead > 1) {
    const codingPercent = Math.round((1 / planning_overhead) * 100)
    const planningPercent = 100 - codingPercent
    return `${total_duration_days} days total (${planningPercent}% planning, ${codingPercent}% coding)`
  }

  return `${total_duration_days} days from start to completion`
}

/**
 * Get planning insights based on overhead ratio
 */
export function getPlanningInsight(planningOverhead: number | null): string | null {
  if (!planningOverhead) return null

  if (planningOverhead >= 4) {
    return '🎯 Thoughtful approach - significant planning before execution'
  }

  if (planningOverhead >= 2) {
    return '⚖️ Balanced - good mix of planning and coding'
  }

  if (planningOverhead >= 1.2) {
    return '⚡️ Efficient - minimal planning overhead'
  }

  return '🚀 Sprint-focused - jumped straight into coding'
}
