/**
 * Velocity Calculator
 * Calculates project velocity score based on commit frequency and intensity
 */

import type { CommitData, VelocityMetrics } from '../types'
import { calculateDaysActive, calculateComplexityFactor } from './github-commit-analyzer'

/**
 * Calculate velocity score (0-10 scale)
 * Formula: Velocity = (Total Commits × Complexity Factor) / Days Active
 */
export function calculateVelocityScore(
  commits: CommitData[],
  windowDays: number = 30
): VelocityMetrics {
  // Filter out boilerplate commits for more accurate velocity
  const realCommits = commits.filter(c => !c.is_likely_boilerplate)

  // Calculate raw metrics
  const totalCommits = realCommits.length
  const totalAdditions = realCommits.reduce((sum, c) => sum + c.additions, 0)
  const totalDeletions = realCommits.reduce((sum, c) => sum + c.deletions, 0)
  const netLinesChanged = totalAdditions + totalDeletions

  // Calculate days active
  const daysActive = calculateDaysActive(realCommits)
  const avgCommitsPerDay = daysActive > 0 ? totalCommits / daysActive : 0

  // Calculate complexity factor
  const complexityFactor = calculateComplexityFactor(
    totalAdditions,
    totalDeletions,
    totalCommits
  )

  // Calculate velocity score
  let rawVelocity = daysActive > 0
    ? (totalCommits * complexityFactor) / daysActive
    : 0

  // Normalize to 0-10 scale
  // Reference: 2+ commits/day with moderate complexity = score of 7-8
  const velocityScore = Math.min(10, rawVelocity * 2)

  // Determine label
  let label: VelocityMetrics['label']
  if (velocityScore >= 8) {
    label = 'Very High Velocity'
  } else if (velocityScore >= 6) {
    label = 'High Velocity'
  } else if (velocityScore >= 3) {
    label = 'Medium Velocity'
  } else {
    label = 'Low Velocity'
  }

  // Calculate trend (compare first half vs second half of window)
  const midpoint = Math.floor(commits.length / 2)
  const firstHalf = commits.slice(0, midpoint)
  const secondHalf = commits.slice(midpoint)

  const firstHalfCommitsPerDay = calculateDaysActive(firstHalf) > 0
    ? firstHalf.length / calculateDaysActive(firstHalf)
    : 0

  const secondHalfCommitsPerDay = calculateDaysActive(secondHalf) > 0
    ? secondHalf.length / calculateDaysActive(secondHalf)
    : 0

  let trend: VelocityMetrics['trend']
  if (secondHalfCommitsPerDay > firstHalfCommitsPerDay * 1.2) {
    trend = 'increasing'
  } else if (secondHalfCommitsPerDay < firstHalfCommitsPerDay * 0.8) {
    trend = 'decreasing'
  } else {
    trend = 'stable'
  }

  return {
    score: Math.round(velocityScore * 10) / 10,
    label,
    trend,
    raw_data: {
      commits_30d: totalCommits,
      avg_commits_per_day: Math.round(avgCommitsPerDay * 10) / 10,
      total_additions: totalAdditions,
      total_deletions: totalDeletions,
      net_lines_changed: netLinesChanged,
      days_active: daysActive,
      complexity_factor: Math.round(complexityFactor * 100) / 100,
    },
  }
}

/**
 * Get velocity badge color based on score
 */
export function getVelocityBadgeColor(score: number): string {
  if (score >= 8) return 'bg-green-500'
  if (score >= 6) return 'bg-blue-500'
  if (score >= 3) return 'bg-yellow-500'
  return 'bg-gray-500'
}

/**
 * Get trend icon based on trend
 */
export function getTrendIcon(trend: VelocityMetrics['trend']): string {
  switch (trend) {
    case 'increasing':
      return '📈'
    case 'decreasing':
      return '📉'
    case 'stable':
      return '➡️'
  }
}
