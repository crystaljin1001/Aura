'use client'

/**
 * Technical Journey Section with Edit Button
 *
 * Wraps TechnicalJourneySection and adds edit functionality for the owner
 */

import { useState } from 'react'
import { Edit } from 'lucide-react'
import { TechnicalJourneySection } from './TechnicalJourneySection'
import { EditTechnicalJourneyModal } from './EditTechnicalJourneyModal'
import type { TechnicalJourney } from '../types'

interface TechnicalJourneySectionWithEditProps {
  repositoryUrl: string
  journey: TechnicalJourney
  canEdit: boolean
}

export function TechnicalJourneySectionWithEdit({
  repositoryUrl,
  journey,
  canEdit,
}: TechnicalJourneySectionWithEditProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  return (
    <>
      <div className="relative">
        {/* Edit Button (top-right of section) */}
        {canEdit && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Journey
            </button>
          </div>
        )}

        {/* Technical Journey Display */}
        <TechnicalJourneySection journey={journey} />
      </div>

      {/* Edit Modal */}
      {canEdit && (
        <EditTechnicalJourneyModal
          repositoryUrl={repositoryUrl}
          initialData={journey}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  )
}
