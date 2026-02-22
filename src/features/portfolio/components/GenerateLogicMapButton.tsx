/**
 * Generate Logic Map Button
 * Triggers AI extraction of decision trees and pivot points
 */

'use client'

import { useState } from 'react'
import { Brain, Loader2, Sparkles } from 'lucide-react'
import { generateLogicMapFromProject } from '../api/logic-map-actions'

interface GenerateLogicMapButtonProps {
  repositoryUrl: string
  onGenerated?: () => void
}

export function GenerateLogicMapButton({
  repositoryUrl,
  onGenerated,
}: GenerateLogicMapButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await generateLogicMapFromProject(repositoryUrl)

      if (result.success) {
        setSuccess(true)
        onGenerated?.()

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Failed to generate Logic Map')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-purple-500/50 disabled:to-blue-500/50 rounded-lg text-sm font-medium transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing project...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Logic Map with AI
          </>
        )}
      </button>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded flex items-center gap-2">
          <Brain className="w-3 h-3" />
          Logic Map generated! Scroll down to view.
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        AI will analyze your project and extract "Why NOT X?" reasoning from your technical decisions
      </p>
    </div>
  )
}
