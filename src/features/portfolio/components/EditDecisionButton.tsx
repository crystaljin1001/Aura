/**
 * Edit Decision Button - Opens form with pre-filled data
 */

'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { EditDecisionForm } from './EditDecisionForm'
import type { TechDecisionNode } from '../types/logic-map'

interface EditDecisionButtonProps {
  decision: TechDecisionNode
  decisionIndex: number
  repositoryUrl: string
  allDecisions: TechDecisionNode[]
}

export function EditDecisionButton({ decision, decisionIndex, repositoryUrl, allDecisions }: EditDecisionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-2 right-2 p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-colors"
        title="Edit this decision"
      >
        <Pencil className="w-4 h-4 text-blue-400" />
      </button>

      {isOpen && (
        <EditDecisionForm
          decision={decision}
          decisionIndex={decisionIndex}
          repositoryUrl={repositoryUrl}
          allDecisions={allDecisions}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
