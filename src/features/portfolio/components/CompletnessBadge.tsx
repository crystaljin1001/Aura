/**
 * Completeness Badge
 *
 * Shows project completeness percentage with color-coded category
 */

import { cn } from '@/utils/cn'

interface CompletnessBadgeProps {
  completed: number
  total: number
  percentage: number
  category: 'getting-started' | 'in-progress' | 'complete'
  variant?: 'default' | 'compact'
  className?: string
}

export function CompletnessBadge({
  completed,
  total,
  percentage,
  category,
  variant = 'default',
  className,
}: CompletnessBadgeProps) {
  const colorClasses = {
    'getting-started': {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
    },
    'in-progress': {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
    },
    'complete': {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
    },
  }

  const colors = colorClasses[category]

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
          colors.bg,
          colors.border,
          colors.text,
          className
        )}
      >
        <span className="font-semibold">{percentage}%</span>
        <span className="text-muted-foreground">complete</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border',
        colors.bg,
        colors.border,
        colors.text,
        className
      )}
    >
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-sm font-semibold">
        {completed}/{total} Complete
      </span>
    </div>
  )
}
