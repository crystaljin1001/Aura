/**
 * Technical Decisions Section
 *
 * Shows "Why I chose X" explanations for each technology
 */

import { ChevronRight } from 'lucide-react'
import type { TechDecision } from '../types'

interface TechnicalDecisionsSectionProps {
  decisions: TechDecision[]
  techStack?: string[]
}

export function TechnicalDecisionsSection({
  decisions,
  techStack,
}: TechnicalDecisionsSectionProps) {
  if (decisions.length === 0 && (!techStack || techStack.length === 0)) {
    return null
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
        🧠 Technical Decisions
      </h2>

      <div className="space-y-4">
        {/* Decisions with reasoning */}
        {decisions.map((decision, i) => (
          <DecisionCard key={i} decision={decision} />
        ))}

        {/* Tech stack without reasoning (if any) */}
        {techStack && techStack.length > 0 && (
          <div className="glass-card-glow p-6 rounded-2xl border border-border">
            <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
              Additional Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack
                .filter(tech => !decisions.some(d => d.technology.toLowerCase() === tech.toLowerCase()))
                .map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-muted border border-border rounded-lg text-sm text-foreground font-medium"
                  >
                    {tech}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Decision Card                                                      */
/* ------------------------------------------------------------------ */

interface DecisionCardProps {
  decision: TechDecision
}

function DecisionCard({ decision }: DecisionCardProps) {
  return (
    <div className="glass-card-glow p-6 rounded-2xl border border-border hover:border-blue-500/50 transition-all group">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <ChevronRight className="w-6 h-6 text-blue-400 group-hover:translate-x-1 transition-transform" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Why {decision.technology}?
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {decision.reason}
          </p>
        </div>
      </div>
    </div>
  )
}
