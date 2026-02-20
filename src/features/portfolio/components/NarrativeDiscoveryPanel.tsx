'use client'

/**
 * Narrative Discovery Panel
 *
 * Displays "Strengths You Might Have Missed" with "Add to Journey" functionality
 * Helps users discover qualities identified by AI that they didn't highlight
 */

import { useState } from 'react'
import { Lightbulb, Plus, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { NarrativeDiscovery } from '../api/validation-loop'

interface NarrativeDiscoveryPanelProps {
  discoveries: NarrativeDiscovery[]
  onAddToJourney?: (discovery: NarrativeDiscovery) => void
  className?: string
}

export function NarrativeDiscoveryPanel({
  discoveries,
  onAddToJourney,
  className = '',
}: NarrativeDiscoveryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (discoveries.length === 0) {
    return null
  }

  // Sort by priority
  const sortedDiscoveries = [...discoveries].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className={`max-w-7xl mx-auto px-6 ${className}`}>
      <div className="glass-card-glow p-6 md:p-8 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-amber-500/5">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center shadow-lg shadow-yellow-500/25">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Strengths You Might Have Missed
              </h3>
              <p className="text-sm text-muted-foreground">
                {discoveries.length} {discoveries.length === 1 ? 'quality' : 'qualities'} identified by technical assessment
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Our AI analysis found these standout qualities in your project that you haven&apos;t highlighted in your technical journey. Consider adding them to make your narrative more complete.
            </p>

            {sortedDiscoveries.map((discovery, index) => (
              <DiscoveryCard
                key={index}
                discovery={discovery}
                onAdd={onAddToJourney}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Discovery Card                                                    */
/* ------------------------------------------------------------------ */

interface DiscoveryCardProps {
  discovery: NarrativeDiscovery
  onAdd?: (discovery: NarrativeDiscovery) => void
}

function DiscoveryCard({ discovery, onAdd }: DiscoveryCardProps) {
  const [isAdded, setIsAdded] = useState(false)

  const handleAdd = () => {
    setIsAdded(true)
    onAdd?.(discovery)

    // Reset after 2 seconds
    setTimeout(() => setIsAdded(false), 2000)
  }

  const priorityColor = {
    high: 'border-red-500/30 bg-red-500/5',
    medium: 'border-orange-500/30 bg-orange-500/5',
    low: 'border-yellow-500/30 bg-yellow-500/5',
  }

  const priorityBadge = {
    high: 'bg-red-500/20 text-red-300',
    medium: 'bg-orange-500/20 text-orange-300',
    low: 'bg-yellow-500/20 text-yellow-300',
  }

  return (
    <div className={`p-4 rounded-lg border ${priorityColor[discovery.priority]} transition-all hover:border-opacity-50`}>
      {/* Priority badge */}
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityBadge[discovery.priority]}`}>
          {discovery.priority.toUpperCase()} PRIORITY
        </span>
      </div>

      {/* Standout quality */}
      <h4 className="font-semibold text-foreground mb-2 leading-relaxed">
        {discovery.standoutQuality}
      </h4>

      {/* Evidence */}
      {discovery.evidence && (
        <p className="text-xs text-muted-foreground mb-3 italic">
          {discovery.evidence}
        </p>
      )}

      {/* Suggested addition */}
      <p className="text-sm text-muted-foreground mb-4 bg-background/50 p-3 rounded border border-border">
        <span className="font-medium text-yellow-400">Suggestion:</span> {discovery.suggestedAddition}
      </p>

      {/* Action button */}
      <Button
        onClick={handleAdd}
        disabled={isAdded}
        size="sm"
        variant="outline"
        className="w-full border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-300"
      >
        {isAdded ? (
          <>
            <span className="mr-2">✓</span>
            Added to your notes
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add to Technical Journey
          </>
        )}
      </Button>
    </div>
  )
}
