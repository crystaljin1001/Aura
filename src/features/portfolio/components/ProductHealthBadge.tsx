/**
 * Product Health Score Badge
 *
 * Displays the calculated health score with glassmorphism effect
 */

import { Activity } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ProductHealthScore } from '../types'
import { getHealthScoreColors } from '../utils/health-score'

interface ProductHealthBadgeProps {
  healthScore: ProductHealthScore
  variant?: 'compact' | 'detailed'
  className?: string
}

export function ProductHealthBadge({
  healthScore,
  variant = 'compact',
  className,
}: ProductHealthBadgeProps) {
  const colors = getHealthScoreColors(healthScore.color)

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-xl',
          colors.bg,
          colors.text,
          colors.border,
          'shadow-lg',
          colors.glow,
          className
        )}
      >
        <Activity className="w-4 h-4" />
        <span className="font-semibold text-sm">
          Health Score: {healthScore.score}/100
        </span>
        <span className={cn('font-bold text-base', colors.text)}>
          {healthScore.grade}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'p-6 rounded-2xl border backdrop-blur-xl',
        colors.bg,
        colors.border,
        'shadow-lg',
        colors.glow,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className={cn('w-5 h-5', colors.text)} />
          <h3 className={cn('font-semibold text-lg', colors.text)}>
            Product Health Score
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-3xl font-bold', colors.text)}>
            {healthScore.score}
          </span>
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Grade Badge */}
      <div className="flex items-center justify-center mb-6">
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center border-2',
            colors.bg,
            colors.border,
            'shadow-xl',
            colors.glow
          )}
        >
          <span className={cn('text-3xl font-bold', colors.text)}>
            {healthScore.grade}
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <HealthMetricBar
          label="Issues Resolved"
          value={healthScore.breakdown.issuesResolved}
          max={25}
          color={healthScore.color}
        />
        <HealthMetricBar
          label="Performance"
          value={healthScore.breakdown.performance}
          max={20}
          color={healthScore.color}
        />
        <HealthMetricBar
          label="Code Quality"
          value={healthScore.breakdown.quality}
          max={20}
          color={healthScore.color}
        />
        <HealthMetricBar
          label="Features"
          value={healthScore.breakdown.features}
          max={20}
          color={healthScore.color}
        />
        <HealthMetricBar
          label="Adoption"
          value={healthScore.breakdown.adoption}
          max={15}
          color={healthScore.color}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Health Metric Bar                                                 */
/* ------------------------------------------------------------------ */

interface HealthMetricBarProps {
  label: string
  value: number
  max: number
  color: ProductHealthScore['color']
}

function HealthMetricBar({ label, value, max, color }: HealthMetricBarProps) {
  const percentage = (value / max) * 100
  const colors = getHealthScoreColors(color)

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-medium', colors.text)}>
          {value}/{max}
        </span>
      </div>
      <div className="h-2 bg-background/50 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', colors.bg)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
