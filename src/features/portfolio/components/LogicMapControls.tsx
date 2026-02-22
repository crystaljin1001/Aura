/**
 * Logic Map Controls - Client Component Wrapper
 * Provides controls for adding/managing Logic Map decisions
 */

'use client'

import { useRouter } from 'next/navigation'
import { AddDecisionForm } from './AddDecisionForm'
import type { TechDecisionNode } from '../types/logic-map'

interface LogicMapControlsProps {
  repositoryUrl: string
  existingDecisions: TechDecisionNode[]
}

export function LogicMapControls({ repositoryUrl, existingDecisions }: LogicMapControlsProps) {
  const router = useRouter()

  const handleSuccess = () => {
    // Refresh the page to show new decision
    router.refresh()
  }

  return (
    <div className="flex justify-center">
      <AddDecisionForm
        repositoryUrl={repositoryUrl}
        existingDecisions={existingDecisions}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
