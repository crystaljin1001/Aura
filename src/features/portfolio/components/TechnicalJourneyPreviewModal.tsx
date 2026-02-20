'use client'

/**
 * Technical Journey Preview Modal
 *
 * Shows a preview of how the technical journey will look on the case study page
 */

import { X } from 'lucide-react'
import { TechnicalJourneySection } from './TechnicalJourneySection'
import { TechnicalDecisionsSection } from './TechnicalDecisionsSection'
import type { TechnicalJourney } from '../types'

interface TechnicalJourneyPreviewModalProps {
  journey: TechnicalJourney
  techStack?: string[]
  isOpen: boolean
  onClose: () => void
}

export function TechnicalJourneyPreviewModal({
  journey,
  techStack,
  isOpen,
  onClose,
}: TechnicalJourneyPreviewModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-7xl my-8 bg-background rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border bg-background/95 backdrop-blur-sm">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Preview Technical Journey
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              This is how your story will appear on the case study page
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="bg-background">
          {/* Technical Journey */}
          <TechnicalJourneySection journey={journey} />

          {/* Technical Decisions */}
          {journey.techDecisions && journey.techDecisions.length > 0 && (
            <TechnicalDecisionsSection
              decisions={journey.techDecisions}
              techStack={techStack}
            />
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-center p-6 border-t border-border bg-background/95 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}
