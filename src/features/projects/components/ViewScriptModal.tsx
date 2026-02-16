'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getProjectScript } from '../actions'
import type { Project } from '../types'

interface ViewScriptModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

interface NarrativeScript {
  id: string
  project_name: string
  repository_url: string
  script_sections: {
    context: string
    problem: string
    process: string
    outcome: string
  }
  created_at: string
}

export function ViewScriptModal({ project, isOpen, onClose }: ViewScriptModalProps) {
  const [script, setScript] = useState<NarrativeScript | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadScript()
    }
  }, [isOpen, project.repository])

  async function loadScript() {
    setIsLoading(true)
    try {
      const data = await getProjectScript(project.repository)
      setScript(data)
    } catch (error) {
      console.error('Error loading script:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopyScript() {
    if (!script) return

    const fullScript = `# ${script.project_name} - Video Demo Script

## CONTEXT (30-45 seconds)
${script.script_sections.context}

## PROBLEM (30-45 seconds)
${script.script_sections.problem}

## PROCESS (60-90 seconds)
${script.script_sections.process}

## OUTCOME (30-45 seconds)
${script.script_sections.outcome}
`

    navigator.clipboard.writeText(fullScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Video Script</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading script...
          </div>
        ) : !script ? (
          <div className="py-8 text-center text-muted-foreground">
            No script found for this project.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Name */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {script.project_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Generated on {new Date(script.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Script Sections */}
            <div className="space-y-6">
              <ScriptSection
                title="CONTEXT (30-45 seconds)"
                content={script.script_sections.context}
              />
              <ScriptSection
                title="PROBLEM (30-45 seconds)"
                content={script.script_sections.problem}
              />
              <ScriptSection
                title="PROCESS (60-90 seconds)"
                content={script.script_sections.process}
              />
              <ScriptSection
                title="OUTCOME (30-45 seconds)"
                content={script.script_sections.outcome}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleCopyScript}
                variant="default"
                className="flex-1"
              >
                {copied ? '✓ Copied!' : '📋 Copy Script'}
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>

            {/* Recording Tips */}
            <div className="bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-blue-200 mb-2">
                💡 Ready to record?
              </h4>
              <p className="text-sm text-blue-300 mb-3">
                Use this script with Tella or Arcade to create your video demo:
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.tella.tv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Open Tella →
                </a>
                <a
                  href="https://www.arcade.software"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Open Arcade →
                </a>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ScriptSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm text-blue-400 uppercase tracking-wide">
        {title}
      </h4>
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  )
}
