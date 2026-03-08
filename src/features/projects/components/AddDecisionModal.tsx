'use client'

import { AddDecisionForm } from '@/features/portfolio/components/AddDecisionForm'
import type { Project } from '../types'

interface AddDecisionModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export function AddDecisionModal({ project, isOpen, onClose }: AddDecisionModalProps) {
  if (!isOpen) return null
  return (
    <AddDecisionForm
      repositoryUrl={project.repository}
      existingDecisions={[]}
      onSuccess={onClose}
      autoOpen
    />
  )
}
