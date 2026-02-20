/**
 * Project Completeness Checklist
 *
 * Shows what exists in a project (no grades, just facts)
 * Replaces the "Health Score" badge
 */

import { CheckCircle, Circle, Lightbulb } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ProjectCompleteness } from '../types'
import { getCompletenessStats, getImprovementSuggestions } from '../utils/completeness-checker'

interface ProjectCompletenessChecklistProps {
  completeness: ProjectCompleteness
  variant?: 'compact' | 'detailed'
  className?: string
}

export function ProjectCompletenessChecklist({
  completeness,
  variant = 'detailed',
  className,
}: ProjectCompletenessChecklistProps) {
  const stats = getCompletenessStats(completeness)
  const suggestions = getImprovementSuggestions(completeness)

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-xl',
          'bg-blue-500/10 text-blue-400 border-blue-500/30',
          'shadow-lg shadow-blue-500/25',
          className
        )}
      >
        <CheckCircle className="w-4 h-4" />
        <span className="font-semibold text-sm">
          {stats.completed}/{stats.total} Complete
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'p-6 rounded-2xl border backdrop-blur-xl',
        'bg-background/50 border-border',
        'shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground">
            Project Completeness
          </h3>
          <span className="text-2xl font-bold text-blue-400">
            {stats.percentage}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {stats.completed} of {stats.total} quality indicators present
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-6">
        {/* Documentation */}
        <ChecklistSection
          title="📚 Documentation"
          items={[
            {
              label: 'Has description',
              checked: completeness.documentation.hasDescription,
            },
            {
              label: 'README > 500 chars',
              checked: !!(completeness.documentation.readmeLength && completeness.documentation.readmeLength >= 500),
              note: completeness.documentation.readmeLength
                ? `${completeness.documentation.readmeLength} characters`
                : undefined,
              optional: true,
            },
          ]}
        />

        {/* Code Quality */}
        <ChecklistSection
          title="🔧 Code Quality"
          items={[
            {
              label: 'Uses TypeScript',
              checked: completeness.codeQuality.hasTypeScript,
            },
            {
              label: 'Has .env.example',
              checked: completeness.codeQuality.hasEnvExample,
            },
            {
              label: 'Has tests',
              checked: completeness.codeQuality.hasTests,
              optional: true,
              note: 'Optional for personal projects',
            },
          ]}
        />

        {/* Production Readiness */}
        <ChecklistSection
          title="🚀 Production"
          items={[
            {
              label: 'Deployed somewhere',
              checked: completeness.production.isDeployed,
            },
            {
              label: 'Has LICENSE',
              checked: completeness.production.hasLicense,
              optional: true,
            },
            {
              label: 'Has .gitignore',
              checked: completeness.production.hasGitignore,
            },
          ]}
        />

        {/* Story (Most Important!) */}
        <ChecklistSection
          title="⭐ Technical Story"
          items={[
            {
              label: 'Wrote technical journey',
              checked: completeness.story.hasTechnicalJourney,
              important: true,
            },
            {
              label: 'Explained tech decisions',
              checked: completeness.story.hasTechDecisions,
              important: true,
            },
          ]}
        />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-2">
                Suggestions to Improve
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {suggestions.slice(0, 3).map((suggestion, i) => (
                  <li key={i}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Checklist Section                                                 */
/* ------------------------------------------------------------------ */

interface ChecklistSectionProps {
  title: string
  items: {
    label: string
    checked: boolean
    optional?: boolean
    important?: boolean
    note?: string
  }[]
}

function ChecklistSection({ title, items }: ChecklistSectionProps) {
  return (
    <div>
      <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
        {title}
      </h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {item.checked ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  'text-sm',
                  item.checked ? 'text-foreground' : 'text-muted-foreground',
                  item.important && !item.checked && 'font-semibold'
                )}
              >
                {item.label}
                {item.optional && (
                  <span className="text-xs text-muted-foreground ml-2">(optional)</span>
                )}
              </span>
              {item.note && (
                <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
