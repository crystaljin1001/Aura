/**
 * AI-Generated Context Blocks
 *
 * Displays 3-sentence pattern: Problem Context, Your Solution, Impact Delivered
 */

import { AlertCircle, Lightbulb, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ContextBlock } from '../types'

interface ContextBlockSectionProps {
  contextBlock: ContextBlock
}

export function ContextBlockSection({ contextBlock }: ContextBlockSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
        The Story Behind the Code
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Problem Context */}
        <ContextCard
          icon={<AlertCircle className="w-6 h-6" />}
          title="Problem Context"
          content={contextBlock.problem}
          color="red"
        />

        {/* Your Solution */}
        <ContextCard
          icon={<Lightbulb className="w-6 h-6" />}
          title="Your Solution"
          content={contextBlock.solution}
          color="blue"
        />

        {/* Impact Delivered */}
        <ContextCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Impact Delivered"
          content={contextBlock.impact}
          color="green"
        />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Context Card                                                       */
/* ------------------------------------------------------------------ */

interface ContextCardProps {
  icon: React.ReactNode
  title: string
  content: string
  color: 'red' | 'blue' | 'green'
}

function ContextCard({ icon, title, content, color }: ContextCardProps) {
  const colorClasses = getColorClasses(color)

  return (
    <div className="glass-card-glow p-6 rounded-2xl border border-border hover:border-border/80 transition-all group">
      {/* Icon Header */}
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
        colorClasses.bg,
        colorClasses.text,
        'shadow-lg',
        colorClasses.glow
      )}>
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-foreground mb-3">
        {title}
      </h3>

      {/* Content */}
      <p className="text-muted-foreground leading-relaxed">
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

function getColorClasses(color: 'red' | 'blue' | 'green') {
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
    case 'green':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/25',
        accent: 'bg-gradient-to-r from-emerald-500 to-green-500',
      }
  }
}
