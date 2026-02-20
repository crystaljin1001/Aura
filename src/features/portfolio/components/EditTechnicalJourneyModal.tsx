'use client'

/**
 * Edit Technical Journey Modal
 *
 * Modal that opens the Technical Journey form for editing existing journeys
 */

import { X } from 'lucide-react'
import { TechnicalJourneyForm } from './TechnicalJourneyForm'
import type { TechnicalJourney } from '../types'

interface EditTechnicalJourneyModalProps {
  repositoryUrl: string
  initialData: TechnicalJourney
  isOpen: boolean
  onClose: () => void
}

export function EditTechnicalJourneyModal({
  repositoryUrl,
  initialData,
  isOpen,
  onClose,
}: EditTechnicalJourneyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border bg-background/95 backdrop-blur-sm">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Edit Technical Journey
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update your project story
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <TechnicalJourneyForm
            repositoryUrl={repositoryUrl}
            initialData={initialData}
            onSaved={onClose}
          />
        </div>
      </div>
    </div>
  )
}
