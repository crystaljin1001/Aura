'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, RefreshCw, Edit, ExternalLink, X } from 'lucide-react'
import type { HeroCommit } from '../types'

interface HeroCommitSuggestionProps {
  heroCommit: HeroCommit
  onAccept: () => void
  onFindAnother: () => void
  onPasteOwn: () => void
  onDismiss: () => void
  isLoading?: boolean
}

export function HeroCommitSuggestion({
  heroCommit,
  onAccept,
  onFindAnother,
  onPasteOwn,
  onDismiss,
  isLoading = false,
}: HeroCommitSuggestionProps) {
  const [showDetails, setShowDetails] = useState(false)

  const confidenceColor = {
    high: 'bg-green-500/10 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    low: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  }[heroCommit.confidence]

  const confidenceLabel = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  }[heroCommit.confidence]

  return (
    <Card className="border-blue-500/30 bg-blue-900/10">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-400">
              Aura identified a Hero Commit!
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-300 transition-colors"
            title="Dismiss suggestion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Commit Message */}
          <div>
            <p className="text-sm text-gray-400 mb-1">Commit {heroCommit.sha.substring(0, 7)}</p>
            <p className="font-medium text-white">{heroCommit.message}</p>
          </div>

          {/* Confidence Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${confidenceColor}`}>
              {confidenceLabel}
            </span>
            <span className="text-xs text-gray-400">
              {heroCommit.stats.filesChanged} files • +{heroCommit.stats.insertions} -{heroCommit.stats.deletions}
            </span>
          </div>

          {/* AI Reasoning */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-gray-300">{heroCommit.reasoning}</p>
          </div>

          {/* Show Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            {showDetails ? 'Hide' : 'Show'} details
            <span className="transform transition-transform" style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▼
            </span>
          </button>

          {/* Details Panel */}
          {showDetails && (
            <div className="space-y-3 pl-4 border-l-2 border-slate-700">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Key Files Modified:</p>
                <ul className="space-y-1">
                  {heroCommit.keyFiles.slice(0, 5).map((file, idx) => (
                    <li key={idx} className="text-sm text-gray-300 font-mono">
                      • {file}
                    </li>
                  ))}
                  {heroCommit.keyFiles.length > 5 && (
                    <li className="text-sm text-gray-400">
                      + {heroCommit.keyFiles.length - 5} more files
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Author & Date:</p>
                <p className="text-sm text-gray-300">
                  {heroCommit.author} • {new Date(heroCommit.date).toLocaleDateString()}
                </p>
              </div>

              <a
                href={heroCommit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                View on GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={onAccept}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              ✅ Use this Commit
            </Button>

            <Button
              onClick={onFindAnother}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Find another
            </Button>

            <Button
              onClick={onPasteOwn}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              I'll paste my own link
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            This commit will be featured in Chapter III: The Execution. You can change this later in Studio Mode.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
