/**
 * Planned Improvements Section
 *
 * Public display of project improvements with status tracking
 * Shows professional maturity: "I know what needs improvement"
 * Roadmap-style presentation with priorities and status
 */

import { Target, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface PlannedImprovement {
  id: string
  area: string // "Testing Coverage"
  currentState: string // "Manual testing only"
  plannedAction: string // "Add Vitest + Playwright"
  rationale: string // "To enable CI/CD confidence"
  priority: 'p0' | 'p1' | 'p2'
  status: 'planned' | 'in_progress' | 'completed'
  completedAt?: Date
}

interface PlannedImprovementsSectionProps {
  improvements: PlannedImprovement[]
}

export function PlannedImprovementsSection({ improvements }: PlannedImprovementsSectionProps) {
  if (improvements.length === 0) {
    return null
  }

  // Sort by priority (p0 > p1 > p2) and status (in_progress > planned > completed)
  const sortedImprovements = [...improvements].sort((a, b) => {
    // First by status
    const statusOrder = { in_progress: 0, planned: 1, completed: 2 }
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff

    // Then by priority
    const priorityOrder = { p0: 0, p1: 1, p2: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const inProgress = improvements.filter(i => i.status === 'in_progress').length
  const completed = improvements.filter(i => i.status === 'completed').length
  const planned = improvements.filter(i => i.status === 'planned').length

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          🎯 Planned Improvements
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          I believe in continuous improvement. Here&apos;s what I&apos;m working on next to make this project production-ready.
        </p>

        {/* Status summary */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <StatusPill
            icon={<Clock className="w-4 h-4" />}
            label="In Progress"
            count={inProgress}
            color="blue"
          />
          <StatusPill
            icon={<Circle className="w-4 h-4" />}
            label="Planned"
            count={planned}
            color="gray"
          />
          <StatusPill
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Completed"
            count={completed}
            color="green"
          />
        </div>
      </div>

      {/* Improvements list */}
      <div className="space-y-4">
        {sortedImprovements.map((improvement) => (
          <ImprovementCard key={improvement.id} improvement={improvement} />
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Status Pill                                                       */
/* ------------------------------------------------------------------ */

interface StatusPillProps {
  icon: React.ReactNode
  label: string
  count: number
  color: 'blue' | 'gray' | 'green'
}

function StatusPill({ icon, label, count, color }: StatusPillProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
  }

  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm', colorClasses[color])}>
      {icon}
      <span>
        {count} {label}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Improvement Card                                                  */
/* ------------------------------------------------------------------ */

interface ImprovementCardProps {
  improvement: PlannedImprovement
}

function ImprovementCard({ improvement }: ImprovementCardProps) {
  const statusConfig = {
    planned: {
      icon: <Circle className="w-5 h-5" />,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/5',
      borderColor: 'border-gray-500/20',
      label: 'Planned',
    },
    in_progress: {
      icon: <Clock className="w-5 h-5 animate-pulse" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/5',
      borderColor: 'border-blue-500/30',
      label: 'In Progress',
    },
    completed: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/5',
      borderColor: 'border-green-500/30',
      label: 'Completed',
    },
  }

  const priorityConfig = {
    p0: {
      label: 'Critical',
      color: 'bg-red-500/20 text-red-300',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    p1: {
      label: 'High',
      color: 'bg-orange-500/20 text-orange-300',
      icon: <Target className="w-3 h-3" />,
    },
    p2: {
      label: 'Medium',
      color: 'bg-yellow-500/20 text-yellow-300',
      icon: <Circle className="w-3 h-3" />,
    },
  }

  const status = statusConfig[improvement.status]
  const priority = priorityConfig[improvement.priority]

  return (
    <div
      className={cn(
        'glass-card-glow p-6 rounded-xl border transition-all hover:border-opacity-60',
        status.borderColor,
        status.bgColor
      )}
    >
      <div className="flex items-start gap-4">
        {/* Status icon */}
        <div className={cn('flex-shrink-0 mt-1', status.color)}>
          {status.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header: Area + Priority + Status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-foreground">{improvement.area}</h3>
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1', priority.color)}>
                {priority.icon}
                {priority.label}
              </span>
            </div>
            <span className={cn('text-xs font-medium px-2 py-1 rounded', status.color, status.bgColor)}>
              {status.label}
            </span>
          </div>

          {/* Current State */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground font-medium mb-1">Current State:</p>
            <p className="text-sm text-muted-foreground italic">{improvement.currentState}</p>
          </div>

          {/* Planned Action */}
          <div className="mb-3">
            <p className="text-xs text-emerald-400 font-medium mb-1">Planned Action:</p>
            <p className="text-sm text-foreground font-medium">{improvement.plannedAction}</p>
          </div>

          {/* Rationale */}
          <div className="mb-3">
            <p className="text-xs text-blue-400 font-medium mb-1">Why:</p>
            <p className="text-sm text-muted-foreground">{improvement.rationale}</p>
          </div>

          {/* Completed date */}
          {improvement.status === 'completed' && improvement.completedAt && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-green-400">
                ✓ Completed on {new Date(improvement.completedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
