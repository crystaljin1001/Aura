'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MermaidPreview } from '@/components/ui/mermaid-preview'
import { AddDecisionForm } from '@/features/portfolio/components/AddDecisionForm'
import { StoryboardForm } from '@/features/narrative-storyboarder/components/StoryboardForm'
import { generateAndSaveArchitectureDiagram, getArchitectureDiagram } from '../actions'
import { getEnhancedDecisions } from '@/features/portfolio/api/logic-map-actions'
import type { TechDecisionNode } from '@/features/portfolio/types/logic-map'
import type { Project } from '../types'

type Step = 'diagram' | 'decision' | 'script'

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: 'diagram', label: 'Architecture', icon: '📊' },
  { id: 'decision', label: 'Decision Tree', icon: '🌳' },
  { id: 'script', label: 'Generate Script', icon: '✨' },
]

interface DemoFlowModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export function DemoFlowModal({ project, isOpen, onClose }: DemoFlowModalProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('diagram')

  // Diagram step state
  const [architectureDiagram, setArchitectureDiagram] = useState<{ mermaidCode: string; type: string } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [diagramError, setDiagramError] = useState<string | null>(null)
  const [instruction, setInstruction] = useState('')
  const [_diagramSaved, setDiagramSaved] = useState(false)

  // Decision step state
  const [existingDecisions, setExistingDecisions] = useState<TechDecisionNode[]>([])
  const [decisionSaved, setDecisionSaved] = useState(false)
  const [decisionsCount, setDecisionsCount] = useState(0)
  const [addingNew, setAddingNew] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Reset to first step whenever modal opens
      setCurrentStep('diagram')
      setDiagramSaved(false)
      setDecisionSaved(false)
      setDecisionsCount(0)
      setAddingNew(false)
      loadDiagram()
      loadDecisions()
    }
  }, [isOpen])

  const loadDecisions = async () => {
    const result = await getEnhancedDecisions(project.repository)
    if (result.success && result.data) {
      setExistingDecisions(result.data)
      setDecisionsCount(result.data.length)
    }
  }

  const loadDiagram = async () => {
    const diagram = await getArchitectureDiagram(project.id)
    if (diagram) {
      setArchitectureDiagram(diagram)
      setDiagramSaved(true)
    }
  }

  const handleGenerateDiagram = async () => {
    setIsGenerating(true)
    setDiagramError(null)
    setDiagramSaved(false)
    try {
      const result = await generateAndSaveArchitectureDiagram(project.id, instruction || undefined)
      if (result.success && result.data) {
        setArchitectureDiagram(result.data)
        setInstruction('')
      } else {
        setDiagramError(result.error || 'Failed to generate diagram')
      }
    } catch (err) {
      setDiagramError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    setInstruction('')
    setDiagramError(null)
    onClose()
  }

  const handleScriptComplete = () => {
    handleClose()
    router.refresh()
  }

  const stepIndex = STEPS.findIndex(s => s.id === currentStep)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prepare for Demo</DialogTitle>
          <DialogDescription>
            Build your demo assets step by step — all without leaving your dashboard.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Only allow going back, or to completed steps
                  if (i <= stepIndex) setCurrentStep(step.id)
                }}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  currentStep === step.id
                    ? 'bg-purple-600 text-white'
                    : i < stepIndex
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-default',
                ].join(' ')}
              >
                <span>{step.icon}</span>
                <span>{step.label}</span>
                {i < stepIndex && <span className="text-green-400 ml-0.5">✓</span>}
              </button>
              {i < STEPS.length - 1 && (
                <span className="text-gray-600">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Architecture Diagram */}
        {currentStep === 'diagram' && (
          <div className="space-y-6">
            {!architectureDiagram && !isGenerating && (
              <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Generate an AI-powered architecture diagram to visualize your project structure.
                </p>
                <button
                  onClick={handleGenerateDiagram}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  ✨ Generate Architecture Diagram
                </button>
                {diagramError && <p className="mt-3 text-sm text-red-400">{diagramError}</p>}
              </div>
            )}

            {isGenerating && (
              <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4" />
                <p className="text-sm text-muted-foreground">Analyzing repository structure and generating diagram...</p>
              </div>
            )}

            {architectureDiagram && (
              <div className="space-y-4">
                <MermaidPreview mermaidCode={architectureDiagram.mermaidCode} />

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={instruction}
                    onChange={e => setInstruction(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !isGenerating) handleGenerateDiagram() }}
                    placeholder="Missing something? Tell AI to update it..."
                    className="flex-1 px-4 py-2 text-sm bg-gray-800 border border-gray-600 text-gray-100 placeholder:text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isGenerating}
                  />
                  <button
                    onClick={handleGenerateDiagram}
                    disabled={isGenerating}
                    className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {isGenerating ? '⏳ Generating...' : '🔄 Regenerate'}
                  </button>
                </div>
                {diagramError && <p className="text-sm text-red-400">{diagramError}</p>}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <button
                onClick={() => setCurrentStep('decision')}
                className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
              >
                Skip this step →
              </button>
              {architectureDiagram && (
                <button
                  onClick={() => { setDiagramSaved(true); setCurrentStep('decision') }}
                  className="px-6 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  Looks Good — Next: Decision Tree →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Decision Tree */}
        {currentStep === 'decision' && (
          <div className="space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Decision Trees</span>
                {decisionsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                    {decisionsCount} saved
                  </span>
                )}
              </div>
              {!addingNew && (
                <button
                  onClick={() => { setDecisionSaved(false); setAddingNew(true) }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  <span>+</span>
                  <span>Add Category</span>
                </button>
              )}
            </div>

            {/* Existing decisions list */}
            {existingDecisions.length > 0 && (
              <div className="space-y-2">
                {existingDecisions.map((decision, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-900/30 px-4 py-3">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{decision.technology}</p>
                      <p className="text-xs text-muted-foreground truncate">{decision.problem}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Chose: <span className="text-green-400">{decision.chosenSolution.name}</span>
                        {decision.alternativesConsidered.length > 0 && (
                          <span> · {decision.alternativesConsidered.length} alternative{decision.alternativesConsidered.length > 1 ? 's' : ''} considered</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New decision form or saved confirmation */}
            {addingNew && !decisionSaved && (
              <div className="rounded-lg border border-gray-700 bg-gray-900/20 p-4">
                <AddDecisionForm
                  repositoryUrl={project.repository}
                  existingDecisions={existingDecisions}
                  onSuccess={() => { setAddingNew(false) }}
                  onSaved={() => {
                    setDecisionSaved(true)
                    setDecisionsCount(c => c + 1)
                    loadDecisions()
                  }}
                  inline
                />
              </div>
            )}

            {decisionSaved && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3 flex items-center gap-3">
                <span className="text-green-400 text-lg">✅</span>
                <p className="text-sm text-green-400 font-medium">Category saved!</p>
              </div>
            )}

            {/* Empty state */}
            {existingDecisions.length === 0 && !addingNew && (
              <div className="rounded-lg border border-dashed border-gray-700 p-6 text-center">
                <p className="text-sm text-muted-foreground">No decision trees yet. Click &quot;+ Add Category&quot; to document your technical choices.</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <button
                onClick={() => setCurrentStep('diagram')}
                className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep('script')}
                className="px-6 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                Next: Generate Script →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generate Script */}
        {currentStep === 'script' && (
          <div className="space-y-4">
            <div className="flex justify-start pt-0 pb-2">
              <button
                onClick={() => setCurrentStep('decision')}
                className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
              >
                ← Back
              </button>
            </div>
            <StoryboardForm
              preSelectedRepo={project.repository}
              projectId={project.id}
              onComplete={handleScriptComplete}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
