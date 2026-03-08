'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MermaidPreview } from '@/components/ui/mermaid-preview'
import { generateAndSaveArchitectureDiagram, getArchitectureDiagram } from '../actions'
import type { Project } from '../types'

interface ArchitectureDiagramModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onOpenDecisionForm?: () => void
}

export function ArchitectureDiagramModal({ project, isOpen, onClose, onOpenDecisionForm }: ArchitectureDiagramModalProps) {
  const [architectureDiagram, setArchitectureDiagram] = useState<{ mermaidCode: string; type: string } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [instruction, setInstruction] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  // Load existing diagram when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDiagram()
    }
  }, [isOpen, project.id])

  const loadDiagram = async () => {
    const diagram = await getArchitectureDiagram(project.id)
    if (diagram) {
      setArchitectureDiagram(diagram)
      setIsSaved(true) // Existing diagrams are already saved
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setIsSaved(false) // Mark as unsaved when regenerating

    try {
      const result = await generateAndSaveArchitectureDiagram(project.id, instruction || undefined)

      if (result.success && result.data) {
        setArchitectureDiagram(result.data)
        setInstruction('') // Clear instruction after successful generation
        // Note: Don't auto-save here, user needs to explicitly save
      } else {
        setError(result.error || 'Failed to generate diagram')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleConfirm = () => {
    setIsSaved(true)
  }

  const handleClose = () => {
    // Warn if user has unsaved instructions
    if (instruction.trim()) {
      const confirmed = window.confirm(
        'You have unsaved diagram instructions. Close without regenerating?'
      )
      if (!confirmed) return
    }

    setInstruction('')
    setError(null)
    setIsSaved(false) // Reset saved state when closing
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Architecture Diagram</DialogTitle>
          <DialogDescription>
            Generate or update your project&apos;s architecture diagram for video reference
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generation Section */}
          {!architectureDiagram && !isGenerating && (
            <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Generate an AI-powered architecture diagram to help visualize your project structure during video recording.
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✨ Generate Architecture Diagram
              </button>
              {error && (
                <p className="mt-3 text-sm text-red-400">{error}</p>
              )}
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-sm text-muted-foreground">
                Analyzing repository structure and generating diagram...
              </p>
            </div>
          )}

          {/* Diagram Display & Regeneration */}
          {architectureDiagram && (
            <div className="space-y-4">
              <MermaidPreview mermaidCode={architectureDiagram.mermaidCode} />

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isGenerating) {
                        handleGenerate()
                      }
                    }}
                    placeholder="Missing something? Tell AI to update it..."
                    className="flex-1 px-4 py-2 text-sm bg-gray-800 border border-gray-600 text-gray-100 placeholder:text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isGenerating}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {isGenerating ? '⏳ Generating...' : '🔄 Regenerate'}
                  </button>
                </div>
                {instruction && (
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Press Enter or click Regenerate to update the diagram
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
              </div>

              {/* CTA: Add Technical Decisions (only show after save) */}
              {isSaved && (
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🌳</div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        Next: Add Your Technical Decisions
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Explain your architectural trade-offs with decision trees. Show what alternatives you considered and why you chose this approach.
                      </p>
                      <button
                        onClick={() => {
                          handleClose()
                          onOpenDecisionForm?.()
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <span>Add Decision Trees</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            {architectureDiagram && !isSaved && (
              <button
                onClick={handleConfirm}
                className="px-6 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                ✓ Looks Good - Continue
              </button>
            )}
            {architectureDiagram && isSaved && (
              <button
                onClick={handleClose}
                className="px-6 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            )}
            {!architectureDiagram && (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
