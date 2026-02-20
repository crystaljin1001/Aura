/**
 * Product Health Score Calculator
 *
 * Calculates a 0-100 health score based on impact metrics:
 * - Issues Resolved (25 points max)
 * - Performance Optimizations (20 points max)
 * - Code Quality (20 points max)
 * - Features Delivered (20 points max)
 * - User Adoption (15 points max)
 */

import type { ImpactMetric } from '@/types'
import type { ProductHealthScore } from '../types'

interface ScoreWeights {
  issuesResolved: number
  performance: number
  quality: number
  features: number
  adoption: number
}

const MAX_WEIGHTS: ScoreWeights = {
  issuesResolved: 25,
  performance: 20,
  quality: 20,
  features: 20,
  adoption: 15,
}

/**
 * Normalize a metric value to a 0-1 scale using logarithmic scaling
 * This prevents extremely high values from dominating the score
 */
function normalizeValue(value: number, maxReference: number = 100): number {
  if (value <= 0) return 0
  if (value >= maxReference) return 1

  // Logarithmic scaling for better distribution
  return Math.log(value + 1) / Math.log(maxReference + 1)
}

/**
 * Calculate product health score from impact metrics
 */
export function calculateHealthScore(metrics: ImpactMetric[]): ProductHealthScore {
  // Extract metric values by type
  const issuesResolved = metrics.find(m => m.type === 'issues_resolved')?.value || 0
  const performance = metrics.find(m => m.type === 'performance')?.value || 0
  const quality = metrics.find(m => m.type === 'quality')?.value || 0
  const features = metrics.find(m => m.type === 'features')?.value || 0
  const adoption = metrics.find(m => m.type === 'users')?.value || 0

  // Normalize each metric (0-1 scale)
  const normalizedIssues = normalizeValue(issuesResolved, 50)
  const normalizedPerformance = normalizeValue(performance, 30)
  const normalizedQuality = normalizeValue(quality, 40)
  const normalizedFeatures = normalizeValue(features, 30)
  const normalizedAdoption = normalizeValue(adoption, 1000)

  // Calculate weighted scores
  const breakdown = {
    issuesResolved: Math.round(normalizedIssues * MAX_WEIGHTS.issuesResolved),
    performance: Math.round(normalizedPerformance * MAX_WEIGHTS.performance),
    quality: Math.round(normalizedQuality * MAX_WEIGHTS.quality),
    features: Math.round(normalizedFeatures * MAX_WEIGHTS.features),
    adoption: Math.round(normalizedAdoption * MAX_WEIGHTS.adoption),
  }

  // Total score (0-100)
  const score = Math.min(
    100,
    breakdown.issuesResolved +
    breakdown.performance +
    breakdown.quality +
    breakdown.features +
    breakdown.adoption
  )

  // Determine grade and color
  let grade: ProductHealthScore['grade']
  let color: ProductHealthScore['color']

  if (score >= 90) {
    grade = 'A'
    color = 'green'
  } else if (score >= 80) {
    grade = 'B'
    color = 'green'
  } else if (score >= 70) {
    grade = 'C'
    color = 'yellow'
  } else if (score >= 60) {
    grade = 'D'
    color = 'yellow'
  } else {
    grade = 'F'
    color = 'red'
  }

  return {
    score,
    grade,
    color,
    breakdown,
  }
}

/**
 * Get color classes for health score badge
 */
export function getHealthScoreColors(color: ProductHealthScore['color']): {
  bg: string
  text: string
  border: string
  glow: string
} {
  switch (color) {
    case 'green':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/25',
      }
    case 'yellow':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'shadow-amber-500/25',
      }
    case 'red':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        glow: 'shadow-red-500/25',
      }
  }
}
