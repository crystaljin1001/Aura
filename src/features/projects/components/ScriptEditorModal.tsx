'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StoryboardForm } from '@/features/narrative-storyboarder/components/StoryboardForm'
import type { Project } from '../types'

interface ScriptEditorModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export function ScriptEditorModal({ project, isOpen, onClose }: ScriptEditorModalProps) {
  const router = useRouter()

  function handleComplete() {
    onClose()
    // Refresh the dashboard to show updated project status
    router.refresh()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Video Script</DialogTitle>
        </DialogHeader>

        <StoryboardForm
          preSelectedRepo={project.repository}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  )
}
