/**
 * Technical Journey Display Section - Enhanced with Evidence Links
 *
 * Shows the user-written technical story on the case study page
 * Now includes architectural tradeoffs and tech decisions with evidence links
 */

import { Lightbulb, Target, Wrench, Trophy, BookOpen, Cpu, ExternalLink, GitBranch } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { TechnicalJourney } from '../types'

interface TechnicalJourneySectionProps {
  journey: TechnicalJourney
}

export function TechnicalJourneySection({ journey }: TechnicalJourneySectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
        📖 The Technical Journey
      </h2>

      <div className="space-y-8">
        {/* Problem Statement */}
        <JourneyCard
          icon={<Target className="w-6 h-6" />}
          title="The Problem"
          content={journey.problemStatement}
          color="red"
        />

        {/* Technical Approach */}
        <JourneyCard
          icon={<Wrench className="w-6 h-6" />}
          title="My Approach"
          content={journey.technicalApproach}
          color="blue"
        />

        {/* NEW: Architectural Trade-offs */}
        {journey.architecturalTradeoffs && journey.architecturalTradeoffs.length > 0 && (
          <div className="glass-card-glow p-6 md:p-8 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <GitBranch className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Engineering Trade-offs
              </h3>
            </div>
            <div className="space-y-4">
              {journey.architecturalTradeoffs.map((tradeoff, i) => (
                <div key={i} className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-purple-400 mb-1 font-medium">{tradeoff.decision}</p>
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Chose: <span className="text-purple-300">{tradeoff.chosen}</span>
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tradeoff.rationale}
                      </p>
                    </div>
                  </div>
                  {tradeoff.evidenceLink && (
                    <a
                      href={tradeoff.evidenceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Evidence
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENHANCED: Tech Decisions with Trade-offs */}
        {journey.techDecisions && journey.techDecisions.length > 0 && (
          <div className="glass-card-glow p-6 md:p-8 rounded-2xl border border-cyan-500/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Cpu className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Technical Decisions
              </h3>
            </div>
            <div className="space-y-4">
              {journey.techDecisions.map((decision, i) => (
                <div key={i} className="p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-base font-bold text-cyan-300">{decision.technology}</h4>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {decision.reason}
                  </p>

                  {/* Alternatives Considered */}
                  {decision.alternativesConsidered && decision.alternativesConsidered.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-cyan-400 font-medium mb-1">Alternatives Considered:</p>
                      <div className="flex flex-wrap gap-2">
                        {decision.alternativesConsidered.map((alt, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-cyan-500/10 text-cyan-300 rounded text-xs"
                          >
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trade-offs */}
                  {decision.tradeoffs && (
                    <div className="space-y-2 mb-3">
                      {decision.tradeoffs.benefits && decision.tradeoffs.benefits.length > 0 && (
                        <div>
                          <p className="text-xs text-green-400 font-medium mb-1">Benefits:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {decision.tradeoffs.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-400">✓</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {decision.tradeoffs.drawbacks && decision.tradeoffs.drawbacks.length > 0 && (
                        <div>
                          <p className="text-xs text-orange-400 font-medium mb-1">Drawbacks:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {decision.tradeoffs.drawbacks.map((drawback, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-orange-400">✗</span>
                                <span>{drawback}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Evidence Link */}
                  {decision.evidenceLink && (
                    <a
                      href={decision.evidenceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Code
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Challenges (if provided) */}
        {journey.keyChallenges && (
          <JourneyCard
            icon={<Lightbulb className="w-6 h-6" />}
            title="Key Challenges"
            content={journey.keyChallenges}
            color="amber"
          />
        )}

        {/* Outcome (if provided) */}
        {journey.outcome && (
          <JourneyCard
            icon={<Trophy className="w-6 h-6" />}
            title="Outcome"
            content={journey.outcome}
            color="green"
          />
        )}

        {/* Key Learnings (if provided) */}
        {journey.learnings && journey.learnings.length > 0 && (
          <div className="glass-card-glow p-6 md:p-8 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                What I Learned
              </h3>
            </div>
            <ul className="space-y-3">
              {journey.learnings.map((learning, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-purple-400 font-bold flex-shrink-0">•</span>
                  <span className="text-muted-foreground leading-relaxed">{learning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Journey Card                                                       */
/* ------------------------------------------------------------------ */

interface JourneyCardProps {
  icon: React.ReactNode
  title: string
  content: string
  color: 'red' | 'blue' | 'amber' | 'green'
}

function JourneyCard({ icon, title, content, color }: JourneyCardProps) {
  const colorClasses = getColorClasses(color)

  return (
    <div className="glass-card-glow p-6 md:p-8 rounded-2xl border border-border hover:border-border/80 transition-all group">
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          colorClasses.bg,
          colorClasses.text,
          'shadow-lg',
          colorClasses.glow
        )}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          {title}
        </h3>
      </div>

      {/* Content */}
      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {content}
      </p>

      {/* Bottom Accent Line */}
      <div className={cn(
        'mt-6 h-1 rounded-full',
        colorClasses.accent,
        'opacity-0 group-hover:opacity-100 transition-opacity'
      )} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getColorClasses(color: 'red' | 'blue' | 'amber' | 'green') {
  switch (color) {
    case 'red':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        glow: 'shadow-red-500/25',
        accent: 'bg-gradient-to-r from-red-500 to-orange-500',
      }
    case 'blue':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/25',
        accent: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      }
    case 'amber':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        glow: 'shadow-amber-500/25',
        accent: 'bg-gradient-to-r from-amber-500 to-orange-500',
      }
    case 'green':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/25',
        accent: 'bg-gradient-to-r from-emerald-500 to-green-500',
      }
  }
}
