'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, RefreshCw, Edit, ExternalLink, Loader2 } from 'lucide-react'
import type { HeroCommit } from '../types'

interface HeroCommitModalProps {
  isOpen: boolean
  onClose: () => void
  heroCommit: HeroCommit | null
  onAccept: (commit: HeroCommit) => void
  onFindAnother: () => void
  onPasteOwn: (commitUrl: string) => void
  isLoading?: boolean
  isFindingAnother?: boolean
}

export function HeroCommitModal({
  isOpen,
  onClose,
  heroCommit,
  onAccept,
  onFindAnother,
  onPasteOwn,
  isLoading = false,
  isFindingAnother = false,
}: HeroCommitModalProps) {
  const [showPasteInput, setShowPasteInput] = useState(false)
  const [customCommitUrl, setCustomCommitUrl] = useState('')
  const [showDetails, setShowDetails] = useState(false)

  function handlePasteOwn() {
    if (customCommitUrl.trim()) {
      onPasteOwn(customCommitUrl.trim())
      setCustomCommitUrl('')
      setShowPasteInput(false)
    }
  }

  function handleAccept() {
    if (heroCommit) {
      onAccept(heroCommit)
    }
  }

  if (!heroCommit && !isFindingAnother) {
    return null
  }

  const confidenceColor = heroCommit ? {
    high: 'bg-green-500/10 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    low: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  }[heroCommit.confidence] : ''

  const confidenceLabel = heroCommit ? {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  }[heroCommit.confidence] : ''

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Aura identified a Hero Commit!
          </DialogTitle>
        </DialogHeader>

        {isFindingAnother ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-4" />
            <p className="text-gray-400">Analyzing your commits...</p>
          </div>
        ) : heroCommit ? (
          <div className="space-y-4">
            {/* Commit Message */}
            <div>
              <p className="text-sm text-gray-400 mb-1">Commit {heroCommit.sha.substring(0, 7)}</p>
              <p className="font-medium text-white text-lg">{heroCommit.message}</p>
            </div>

            {/* Confidence Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${confidenceColor}`}>
                {confidenceLabel}
              </span>
              <span className="text-xs text-gray-400">
                {heroCommit.stats.filesChanged} files • +{heroCommit.stats.insertions} -{heroCommit.stats.deletions}
              </span>
            </div>

            {/* AI Reasoning */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-sm font-medium text-gray-300 mb-2">Why this commit?</p>
              <p className="text-sm text-gray-400">{heroCommit.reasoning}</p>
            </div>

            {/* Show Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              {showDetails ? 'Hide' : 'Show'} technical details
              <span className="transform transition-transform" style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>

            {/* Details Panel */}
            {showDetails && (
              <div className="space-y-3 pl-4 border-l-2 border-slate-700">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">Key Files Modified:</p>
                  <ul className="space-y-1">
                    {heroCommit.keyFiles.slice(0, 8).map((file, idx) => (
                      <li key={idx} className="text-sm text-gray-300 font-mono">
                        • {file}
                      </li>
                    ))}
                    {heroCommit.keyFiles.length > 8 && (
                      <li className="text-sm text-gray-400">
                        + {heroCommit.keyFiles.length - 8} more files
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Author & Date:</p>
                  <p className="text-sm text-gray-300">
                    {heroCommit.author} • {new Date(heroCommit.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <a
                  href={heroCommit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  View full diff on GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Paste Own Commit Input */}
            {showPasteInput && (
              <div className="space-y-2 pt-2">
                <label className="text-sm text-gray-400">
                  Paste GitHub commit URL:
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={customCommitUrl}
                    onChange={(e) => setCustomCommitUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo/commit/..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handlePasteOwn}
                    disabled={!customCommitUrl.trim() || isLoading}
                  >
                    Use
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPasteInput(false)
                      setCustomCommitUrl('')
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!showPasteInput && (
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={handleAccept}
                  disabled={isLoading}
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  ✅ Use this Commit & Continue to Studio Mode
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={onFindAnother}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Find another
                  </Button>

                  <Button
                    onClick={() => setShowPasteInput(true)}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Paste my own
                  </Button>
                </div>

                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full"
                >
                  Skip for now
                </Button>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              This commit will be featured in <strong>Chapter III: The Execution</strong> of your demo script.
              <br />
              You can change this later in Studio Mode.
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
