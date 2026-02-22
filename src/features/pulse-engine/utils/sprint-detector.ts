/**
 * Sprint Detector
 * Identifies the "build phase" of a project with highest commit density
 * This is the "Sprint Signature" - the actual construction velocity
 */

import type { CommitData } from '../types'

export interface SprintWindow {
  start_date: string // ISO date
  end_date: string // ISO date
  duration_days: number
  commits: number
  velocity_score: number // 0-10 scale for this sprint
  total_additions: number
  total_deletions: number
  avg_commits_per_day: number
  is_peak_velocity: boolean // Is this the highest velocity period?
}

/**
 * Find the highest velocity sprint window
 * Uses a sliding window approach to find the period of most intense development
 */
export function detectSprintWindow(
  commits: CommitData[],
  windowSize: number = 14 // Default: 14-day sprint
): SprintWindow | null {
  console.log(`🎯 Sprint Detection Start: ${commits.length} commits`)

  if (commits.length === 0) {
    console.log('❌ No commits to analyze')
    return null
  }

  // Filter out boilerplate commits for sprint detection
  const validCommits = commits.filter(c => !c.is_likely_boilerplate)
  console.log(`✅ After filtering boilerplate: ${validCommits.length} valid commits`)

  if (validCommits.length === 0) {
    console.log('❌ All commits were boilerplate')
    return null
  }

  // Sort commits by date (oldest first)
  const sortedCommits = [...validCommits].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // If project is too short, just analyze the whole thing
  if (sortedCommits.length < 5) {
    console.log(`⚠️ Only ${sortedCommits.length} commits, analyzing all`)
    const result = analyzeWindow(sortedCommits, windowSize)
    console.log(`📊 Result for all commits:`, result ? {
      velocity: result.velocity_score,
      commits: result.commits,
      days: result.duration_days
    } : 'null')
    return result
  }

  // Try different window sizes to find the "sprint"
  const windowSizes = [7, 10, 14, 21, 30] // Week, 10 days, 2 weeks, 3 weeks, month
  let bestSprint: SprintWindow | null = null
  let highestVelocity = 0
  let windowsChecked = 0
  let windowsWithEnoughCommits = 0

  for (const size of windowSizes) {
    // Slide the window across the commit history
    for (let i = 0; i <= sortedCommits.length - 1; i++) {
      const windowStart = new Date(sortedCommits[i].date)
      const windowEnd = new Date(windowStart)
      windowEnd.setDate(windowEnd.getDate() + size)

      // Get commits within this window
      const windowCommits = sortedCommits.filter(c => {
        const commitDate = new Date(c.date)
        return commitDate >= windowStart && commitDate <= windowEnd
      })

      windowsChecked++

      if (windowCommits.length < 3) continue // Need at least 3 commits for a sprint

      windowsWithEnoughCommits++
      const sprint = analyzeWindow(windowCommits, size)

      if (sprint && sprint.velocity_score > highestVelocity) {
        highestVelocity = sprint.velocity_score
        bestSprint = sprint
      }
    }
  }

  console.log(`🔍 Checked ${windowsChecked} windows, ${windowsWithEnoughCommits} had 3+ commits`)
  console.log(`🏆 Best sprint found:`, bestSprint ? {
    velocity: bestSprint.velocity_score,
    commits: bestSprint.commits,
    days: bestSprint.duration_days
  } : 'NONE')

  if (bestSprint) {
    bestSprint.is_peak_velocity = true
  }

  return bestSprint
}

/**
 * Analyze a specific window of commits
 */
function analyzeWindow(commits: CommitData[], windowDays: number): SprintWindow {
  if (commits.length === 0) {
    return {
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
      duration_days: 0,
      commits: 0,
      velocity_score: 0,
      total_additions: 0,
      total_deletions: 0,
      avg_commits_per_day: 0,
      is_peak_velocity: false,
    }
  }

  const startDate = new Date(commits[0].date)
  const endDate = new Date(commits[commits.length - 1].date)
  const actualDays = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  )

  // Calculate stats
  const totalCommits = commits.length
  const totalAdditions = commits.reduce((sum, c) => sum + c.additions, 0)
  const totalDeletions = commits.reduce((sum, c) => sum + c.deletions, 0)
  const avgCommitsPerDay = totalCommits / actualDays

  // Calculate velocity score for this window
  // High intensity sprint: 3+ commits/day with substantial changes
  const intensityFactor = Math.min(2.0, avgCommitsPerDay / 2) // Peaks at 4+ commits/day
  const complexityFactor = Math.min(
    2.0,
    Math.log10((totalAdditions + totalDeletions) / totalCommits + 1) / 2.7
  )

  const velocityScore = Math.min(10, intensityFactor * complexityFactor * 5)

  return {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    duration_days: actualDays,
    commits: totalCommits,
    velocity_score: Math.round(velocityScore * 10) / 10,
    total_additions: totalAdditions,
    total_deletions: totalDeletions,
    avg_commits_per_day: Math.round(avgCommitsPerDay * 10) / 10,
    is_peak_velocity: false,
  }
}

/**
 * Determine project lifecycle status
 */
export interface ProjectLifecycleStatus {
  status: 'Active Development' | 'Maintenance Mode' | 'Stable/Production' | 'Archived'
  emoji: '⚡️' | '🔧' | '✅' | '📦'
  description: string
  reasoning: string
}

export function determineLifecycleStatus(
  recentCommits7d: number,
  recentCommits30d: number,
  isLive: boolean,
  daysSinceLastCommit: number,
  userDefinedOngoing?: boolean // User explicitly marked as ongoing
): ProjectLifecycleStatus {
  // If user explicitly marked as ongoing, prioritize that
  if (userDefinedOngoing === true) {
    if (recentCommits7d >= 5) {
      return {
        status: 'Active Development',
        emoji: '⚡️',
        description: 'Under active development',
        reasoning: `${recentCommits7d} commits in the last 7 days`,
      }
    }

    // Ongoing but low activity
    return {
      status: 'Active Development',
      emoji: '⚡️',
      description: 'Under active development',
      reasoning: 'Marked as ongoing by developer',
    }
  }

  // Active Development: High recent activity
  if (recentCommits7d >= 5) {
    return {
      status: 'Active Development',
      emoji: '⚡️',
      description: 'Under active development',
      reasoning: `${recentCommits7d} commits in the last 7 days`,
    }
  }

  // Maintenance Mode: Occasional commits, project is live
  if (recentCommits30d >= 1 && isLive) {
    return {
      status: 'Maintenance Mode',
      emoji: '🔧',
      description: 'Live and maintained',
      reasoning: `${recentCommits30d} commits in the last 30 days, currently deployed`,
    }
  }

  // Stable/Production: No recent commits but live and working
  if (recentCommits30d === 0 && isLive && daysSinceLastCommit <= 90) {
    return {
      status: 'Stable/Production',
      emoji: '✅',
      description: 'Production-ready and stable',
      reasoning: 'Live deployment with no recent changes needed (shows maturity)',
    }
  }

  // Archived: No recent activity and not live
  if (daysSinceLastCommit > 90) {
    return {
      status: 'Archived',
      emoji: '📦',
      description: 'Completed/Archived',
      reasoning: `Last commit ${daysSinceLastCommit} days ago`,
    }
  }

  // Default: Stable but not deployed
  return {
    status: 'Stable/Production',
    emoji: '✅',
    description: 'Completed project',
    reasoning: 'Build phase complete',
  }
}

/**
 * Calculate days since last commit
 */
export function daysSinceLastCommit(commits: CommitData[]): number {
  if (commits.length === 0) return 999

  const sortedCommits = [...commits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const lastCommitDate = new Date(sortedCommits[0].date)
  const now = new Date()
  const diffMs = now.getTime() - lastCommitDate.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Get sprint label based on velocity
 */
export function getSprintLabel(velocity: number): string {
  if (velocity >= 9) return '🔥 Intense Sprint'
  if (velocity >= 7) return '⚡️ Fast Sprint'
  if (velocity >= 5) return '🚀 Solid Sprint'
  if (velocity >= 3) return '📈 Steady Build'
  return '🔨 Incremental Build'
}
