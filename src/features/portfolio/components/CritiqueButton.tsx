'use client'

/**
 * Critique Button Component
 *
 * Triggers the Criticize Agent to analyze a repository
 * Displays architectural debt, production gaps, and narrative gaps
 */

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { criticizeRepository } from '../api/criticize-agent'
import { saveCritique } from '../api/critique-actions'
import type { CritiqueResult } from '../api/criticize-agent'
import type { TechnicalJourney } from '../types'

interface CritiqueButtonProps {
  repositoryUrl: string
  technicalJourney?: TechnicalJourney | null
  onCritiqueComplete?: (critique: CritiqueResult) => void
}

export function CritiqueButton({
  repositoryUrl,
  technicalJourney,
  onCritiqueComplete,
}: CritiqueButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [critique, setCritique] = useState<CritiqueResult | null>(null)
  const [error, setError] = useState<string>('')
  const [showResults, setShowResults] = useState(false)

  async function handleAnalyze() {
    setIsAnalyzing(true)
    setError('')
    setCritique(null)

    try {
      // Call the criticize agent
      const result = await criticizeRepository(repositoryUrl, technicalJourney || undefined)

      if (result.success && result.data) {
        setCritique(result.data)
        setShowResults(true)

        // Save to database
        await saveCritique(repositoryUrl, result.data)

        // Notify parent
        onCritiqueComplete?.(result.data)
      } else {
        setError(result.error || 'Failed to analyze repository')
      }
    } catch (err) {
      console.error('Critique error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze repository')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Trigger Button */}
      <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">🤖 AI Code Review (Red Team)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Get an honest critique of your code: architectural debt, production gaps, and narrative
              gaps. This helps you write better technical stories.
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              variant="outline"
              className="border-red-500/30 hover:bg-red-500/10 text-red-300"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing... (using Claude Opus)
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Run AI Critique
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {showResults && critique && (
        <div className="space-y-6">
          {/* Architectural Debt */}
          {critique.architecturalDebt.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                Architectural Debt ({critique.architecturalDebt.length})
              </h4>
              <div className="space-y-3">
                {critique.architecturalDebt.map((debt, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${
                      debt.severity === 'high'
                        ? 'bg-red-500/5 border-red-500/30'
                        : debt.severity === 'medium'
                        ? 'bg-orange-500/5 border-orange-500/30'
                        : 'bg-yellow-500/5 border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          debt.severity === 'high'
                            ? 'bg-red-500/20 text-red-300'
                            : debt.severity === 'medium'
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {debt.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-foreground mb-2">{debt.issue}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="text-xs text-blue-400">Evidence:</span> {debt.evidence}
                    </p>
                    <p className="text-sm text-green-400">
                      <span className="text-xs">Suggestion:</span> {debt.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Production Gaps */}
          {critique.productionGaps.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Production Gaps ({critique.productionGaps.length})
              </h4>
              <div className="space-y-3">
                {critique.productionGaps.map((gap, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-red-500/5 border-red-500/30">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-red-500/20 text-red-300">
                        {gap.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-foreground mb-2">{gap.gap}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="text-xs text-orange-400">Impact:</span> {gap.impact}
                    </p>
                    <p className="text-sm text-green-400">
                      <span className="text-xs">Quick Fix:</span> {gap.quickFix}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Narrative Gaps */}
          {critique.narrativeGaps.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                Narrative Gaps ({critique.narrativeGaps.length})
              </h4>
              <div className="space-y-3">
                {critique.narrativeGaps.map((gap, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/30">
                    <p className="font-medium text-foreground mb-2">{gap.critique}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="text-xs text-blue-400">Missing:</span> {gap.missingContext}
                    </p>
                    <p className="text-sm text-green-400">
                      <span className="text-xs">Ask yourself:</span> {gap.suggestedPrompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Issues Found */}
          {critique.architecturalDebt.length === 0 &&
            critique.productionGaps.length === 0 &&
            critique.narrativeGaps.length === 0 && (
              <div className="p-6 bg-green-500/5 border border-green-500/30 rounded-lg text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Looking Great! 🎉</h3>
                <p className="text-sm text-muted-foreground">
                  No critical issues found. Your project structure and narrative are solid.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  )
}
