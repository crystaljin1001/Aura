'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getProjectScripts } from '../actions'
import type { Project } from '../types'
import { isUserJourneyScript, isTechnicalArchitectureScript, isLegacyScript } from '@/features/narrative-storyboarder/types'
import type { NarrativeScript, ScriptType } from '@/features/narrative-storyboarder/types'

interface ViewScriptModalProps {
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

export function ViewScriptModal({ project, isOpen, onClose }: ViewScriptModalProps) {
  const [scripts, setScripts] = useState<DBScript[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [selectedScriptType, setSelectedScriptType] = useState<ScriptType | 'legacy' | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadScripts()
    }
  }, [isOpen, project.repository])

  async function loadScripts() {
    setIsLoading(true)
    try {
      const data = await getProjectScripts(project.repository)
      console.log('[ViewScriptModal] Loaded scripts for', project.repository, ':', data)
      console.log('[ViewScriptModal] Number of scripts:', data.length)
      data.forEach((script, i) => {
        console.log(`  Script ${i + 1}:`, {
          type: script.script_type || 'legacy',
          repoUrl: script.repository_url,
          fields: Object.keys(script.generated_script)
        })
      })
      setScripts(data)

      // Auto-select first non-legacy script (prefer User Journey, then Technical Architecture)
      if (data.length > 0) {
        const userJourney = data.find(s => s.script_type === 'user_journey')
        const technical = data.find(s => s.script_type === 'technical_architecture')

        if (userJourney) {
          setSelectedScriptType('user_journey')
          console.log('[ViewScriptModal] Auto-selected script type: user_journey')
        } else if (technical) {
          setSelectedScriptType('technical_architecture')
          console.log('[ViewScriptModal] Auto-selected script type: technical_architecture')
        }
      }
    } catch (error) {
      console.error('Error loading scripts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedScript = scripts.find(s =>
    s.script_type === selectedScriptType || (!s.script_type && selectedScriptType === 'legacy')
  )

  function handleCopyScript() {
    if (!selectedScript || !selectedScript.generated_script) return

    const generatedScript = selectedScript.generated_script
    let fullScript = ''

    if (isUserJourneyScript(generatedScript)) {
      fullScript = `# ${selectedScript.project_name} - User Journey Demo Script

## 💥 CHAPTER 1: THE FRICTION (45-60 seconds)
${generatedScript.friction}

## 🧠 CHAPTER 2: THE SOCIAL BRAIN (60-75 seconds)
${generatedScript.socialBrain}

## 💎 CHAPTER 3: THE DISCOVERY (45-60 seconds)
${generatedScript.discovery}

## 🛡️ CHAPTER 4: THE RESOLUTION (30-45 seconds)
${generatedScript.resolution}
`
    } else if (isTechnicalArchitectureScript(generatedScript)) {
      fullScript = `# ${selectedScript.project_name} - Technical Architecture Demo Script

## 🌍 CHAPTER I: THE CONTEXT (45-60 seconds)
${generatedScript.context}

## 🔐 CHAPTER II: THE LOGIC GATE (75-90 seconds)
${generatedScript.logicGate}

## ⚙️ CHAPTER III: THE EXECUTION (60-75 seconds)
${generatedScript.execution}

## 🏰 CHAPTER IV: THE MOAT (45-60 seconds)
${generatedScript.moat}
`
    } else if (isLegacyScript(generatedScript)) {
      fullScript = `# ${selectedScript.project_name} - Video Demo Script

## CONTEXT (30-45 seconds)
${generatedScript.context}

## PROBLEM (30-45 seconds)
${generatedScript.problem}

## PROCESS (60-90 seconds)
${generatedScript.process}

## OUTCOME (30-45 seconds)
${generatedScript.outcome}
`
    }

    navigator.clipboard.writeText(fullScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Helper component for rendering script sections
  function ScriptSection({ title, content }: { title: string; content: string }) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-semibold text-foreground mb-2">{title}</h4>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">{content}</p>
      </div>
    )
  }

  // Get unique script types for tabs (exclude legacy scripts)
  const userJourneyScript = scripts.find(s => s.script_type === 'user_journey')
  const technicalScript = scripts.find(s => s.script_type === 'technical_architecture')
  // Don't show legacy scripts in tabs
  // const legacyScript = scripts.find(s => !s.script_type && isLegacyScript(s.generated_script))

  const hasMultipleScripts = (userJourneyScript && technicalScript) || scripts.filter(s => s.script_type).length > 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Video Scripts</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading scripts...
          </div>
        ) : scripts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No scripts found for this project.
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

            {/* Selected Script Display */}
            {selectedScript && (
              <>
                {/* Project Name & Info */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {selectedScript.project_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generated on {new Date(selectedScript.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Script Sections - Render based on type */}
                {isUserJourneyScript(selectedScript.generated_script) ? (
                  <div className="space-y-6">
                    <ScriptSection
                      title="💥 CHAPTER 1: THE FRICTION (45-60 seconds)"
                      content={selectedScript.generated_script.friction}
                    />
                    <ScriptSection
                      title="🧠 CHAPTER 2: THE SOCIAL BRAIN (60-75 seconds)"
                      content={selectedScript.generated_script.socialBrain}
                    />
                    <ScriptSection
                      title="💎 CHAPTER 3: THE DISCOVERY (45-60 seconds)"
                      content={selectedScript.generated_script.discovery}
                    />
                    <ScriptSection
                      title="🛡️ CHAPTER 4: THE RESOLUTION (30-45 seconds)"
                      content={selectedScript.generated_script.resolution}
                    />
                  </div>
                ) : isTechnicalArchitectureScript(selectedScript.generated_script) ? (
                  <div className="space-y-6">
                    <ScriptSection
                      title="🌍 CHAPTER I: THE CONTEXT (45-60 seconds)"
                      content={selectedScript.generated_script.context}
                    />
                    <ScriptSection
                      title="🔐 CHAPTER II: THE LOGIC GATE (75-90 seconds)"
                      content={selectedScript.generated_script.logicGate}
                    />
                    <ScriptSection
                      title="⚙️ CHAPTER III: THE EXECUTION (60-75 seconds)"
                      content={selectedScript.generated_script.execution}
                    />
                    <ScriptSection
                      title="🏰 CHAPTER IV: THE MOAT (45-60 seconds)"
                      content={selectedScript.generated_script.moat}
                    />
                  </div>
                ) : isLegacyScript(selectedScript.generated_script) ? (
                  <div className="space-y-6">
                    <ScriptSection
                      title="CONTEXT (30-45 seconds)"
                      content={selectedScript.generated_script.context}
                    />
                    <ScriptSection
                      title="PROBLEM (30-45 seconds)"
                      content={selectedScript.generated_script.problem}
                    />
                    <ScriptSection
                      title="PROCESS (60-90 seconds)"
                      content={selectedScript.generated_script.process}
                    />
                    <ScriptSection
                      title="OUTCOME (30-45 seconds)"
                      content={selectedScript.generated_script.outcome}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>Script format not recognized.</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleCopyScript}
                    variant="default"
                    className="flex-1"
                    disabled={!selectedScript.generated_script}
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
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
