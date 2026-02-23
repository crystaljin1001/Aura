'use client'

/**
 * Edit Script Text Modal
 * Allows manual editing of generated script text chapter by chapter
 */

import { useEffect, useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getProjectScripts } from '../actions'
import { updateScript } from '@/features/narrative-storyboarder/api/actions'
import type { Project } from '../types'
import {
  isUserJourneyScript,
  isTechnicalArchitectureScript,
  isLegacyScript,
  type NarrativeScript,
  type ScriptType,
  type UserJourneyScript,
  type TechnicalArchitectureScript,
  type LegacyNarrativeScript,
} from '@/features/narrative-storyboarder/types'

interface EditScriptTextModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

interface DBScript {
  id: string
  project_name: string
  repository_url: string
  generated_script: NarrativeScript
  script_type?: ScriptType
  created_at: string
}

export function EditScriptTextModal({ project, isOpen, onClose }: EditScriptTextModalProps) {
  const [scripts, setScripts] = useState<DBScript[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedScriptType, setSelectedScriptType] = useState<ScriptType | 'legacy' | null>(null)

  // Editable state for each chapter
  const [editedScript, setEditedScript] = useState<NarrativeScript | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadScripts()
    }
  }, [isOpen, project.repository])

  async function loadScripts() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProjectScripts(project.repository)
      console.log('[EditScriptTextModal] Loaded scripts for', project.repository, ':', data)
      console.log('[EditScriptTextModal] Number of scripts:', data.length)
      data.forEach((script, i) => {
        console.log(`  Script ${i + 1}:`, {
          type: script.script_type || 'legacy',
          repoUrl: script.repository_url,
          fields: Object.keys(script.generated_script)
        })
      })

      if (data && data.length > 0) {
        setScripts(data)

        // Auto-select first non-legacy script (prefer User Journey, then Technical Architecture)
        const userJourney = data.find(s => s.script_type === 'user_journey')
        const technical = data.find(s => s.script_type === 'technical_architecture')

        if (userJourney) {
          setSelectedScriptType('user_journey')
          setEditedScript(userJourney.generated_script)
          console.log('[EditScriptTextModal] Auto-selected script type: user_journey')
        } else if (technical) {
          setSelectedScriptType('technical_architecture')
          setEditedScript(technical.generated_script)
          console.log('[EditScriptTextModal] Auto-selected script type: technical_architecture')
        } else {
          setError('No scripts found for this project')
        }
      } else {
        setError('No scripts found for this project')
      }
    } catch (err) {
      console.error('Error loading scripts:', err)
      setError('Failed to load scripts')
    } finally {
      setIsLoading(false)
    }
  }

  // Update edited script when selection changes
  useEffect(() => {
    const script = scripts.find(s =>
      s.script_type === selectedScriptType || (!s.script_type && selectedScriptType === 'legacy')
    )
    if (script) {
      setEditedScript(script.generated_script)
    }
  }, [selectedScriptType, scripts])

  const selectedScript = scripts.find(s =>
    s.script_type === selectedScriptType || (!s.script_type && selectedScriptType === 'legacy')
  )

  function handleSave() {
    if (!editedScript || !selectedScript) return

    startTransition(async () => {
      try {
        // Pass the original script_type from the database (could be undefined for legacy)
        const scriptType = selectedScript.script_type as ScriptType | undefined
        const result = await updateScript(project.repository, editedScript, scriptType)
        if (result.success) {
          onClose()
          // Reload scripts to see updates (optional - depends on if parent refreshes)
        } else {
          setError(result.error || 'Failed to save changes')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save changes')
      }
    })
  }

  function updateChapter(field: string, value: string) {
    if (!editedScript) return
    setEditedScript({
      ...editedScript,
      [field]: value,
    })
  }

  // Get unique script types for tabs (exclude legacy scripts)
  const userJourneyScript = scripts.find(s => s.script_type === 'user_journey')
  const technicalScript = scripts.find(s => s.script_type === 'technical_architecture')
  // Don't show legacy scripts in tabs
  // const legacyScript = scripts.find(s => !s.script_type && isLegacyScript(s.generated_script))

  const hasMultipleScripts = (userJourneyScript && technicalScript) || scripts.filter(s => s.script_type).length > 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Script Text</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading scripts...
          </div>
        ) : scripts.length === 0 || !editedScript ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>{error || 'No scripts found for this project.'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Script Type Tabs - Only show if multiple scripts exist */}
            {hasMultipleScripts && (
              <div className="flex gap-2 border-b border-border pb-2">
                {userJourneyScript && (
                  <button
                    onClick={() => setSelectedScriptType('user_journey')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                      selectedScriptType === 'user_journey'
                        ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    📖 User Journey
                  </button>
                )}
                {technicalScript && (
                  <button
                    onClick={() => setSelectedScriptType('technical_architecture')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                      selectedScriptType === 'technical_architecture'
                        ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    🏗️ Technical Architecture
                  </button>
                )}
              </div>
            )}

            {/* Project Name */}
            {selectedScript && (
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {selectedScript.project_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Edit the generated script text below. Changes will be saved to your project.
                </p>
              </div>
            )}

            {/* Editing Form */}
            <div className="space-y-6">
              {isUserJourneyScript(editedScript) ? (
                <>
                  <EditableChapter
                    title="💥 CHAPTER 1: THE FRICTION (45-60 seconds)"
                    value={editedScript.friction}
                    onChange={(val) => updateChapter('friction', val)}
                  />
                  <EditableChapter
                    title="🧠 CHAPTER 2: THE SOCIAL BRAIN (60-75 seconds)"
                    value={editedScript.socialBrain}
                    onChange={(val) => updateChapter('socialBrain', val)}
                  />
                  <EditableChapter
                    title="💎 CHAPTER 3: THE DISCOVERY (45-60 seconds)"
                    value={editedScript.discovery}
                    onChange={(val) => updateChapter('discovery', val)}
                  />
                  <EditableChapter
                    title="🛡️ CHAPTER 4: THE RESOLUTION (30-45 seconds)"
                    value={editedScript.resolution}
                    onChange={(val) => updateChapter('resolution', val)}
                  />
                </>
              ) : isTechnicalArchitectureScript(editedScript) ? (
                <>
                  <EditableChapter
                    title="🌍 CHAPTER I: THE CONTEXT (45-60 seconds)"
                    value={editedScript.context}
                    onChange={(val) => updateChapter('context', val)}
                  />
                  <EditableChapter
                    title="🔐 CHAPTER II: THE LOGIC GATE (75-90 seconds)"
                    value={editedScript.logicGate}
                    onChange={(val) => updateChapter('logicGate', val)}
                  />
                  <EditableChapter
                    title="⚙️ CHAPTER III: THE EXECUTION (60-75 seconds)"
                    value={editedScript.execution}
                    onChange={(val) => updateChapter('execution', val)}
                  />
                  <EditableChapter
                    title="🏰 CHAPTER IV: THE MOAT (45-60 seconds)"
                    value={editedScript.moat}
                    onChange={(val) => updateChapter('moat', val)}
                  />
                </>
              ) : isLegacyScript(editedScript) ? (
                <>
                  <EditableChapter
                    title="CONTEXT (30-45 seconds)"
                    value={editedScript.context}
                    onChange={(val) => updateChapter('context', val)}
                  />
                  <EditableChapter
                    title="PROBLEM (30-45 seconds)"
                    value={editedScript.problem}
                    onChange={(val) => updateChapter('problem', val)}
                  />
                  <EditableChapter
                    title="PROCESS (60-90 seconds)"
                    value={editedScript.process}
                    onChange={(val) => updateChapter('process', val)}
                  />
                  <EditableChapter
                    title="OUTCOME (30-45 seconds)"
                    value={editedScript.outcome}
                    onChange={(val) => updateChapter('outcome', val)}
                  />
                </>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Script format not recognized.</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleSave}
                variant="default"
                className="flex-1"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : '💾 Save Changes'}
              </Button>
              <Button onClick={onClose} variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Editable Chapter Component
 */
function EditableChapter({
  title,
  value,
  onChange,
}: {
  title: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block font-semibold text-sm text-foreground">{title}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-mono text-sm"
        placeholder="Enter script text..."
      />
      <p className="text-xs text-muted-foreground">
        {value.length} characters • Include visual cues in [brackets] for transitions
      </p>
    </div>
  )
}
