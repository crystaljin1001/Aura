/**
 * Code Snippet Preview - Shows code from GitHub evidence links
 * Displays code directly under decision nodes as proof
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Code, Loader2, AlertCircle } from 'lucide-react'
import { fetchGitHubCode, type CodeSnippet } from '../api/fetch-github-code'

interface CodeSnippetPreviewProps {
  githubUrl: string
  title?: string
}

export function CodeSnippetPreview({ githubUrl, title = 'Code Evidence' }: CodeSnippetPreviewProps) {
  const [snippet, setSnippet] = useState<CodeSnippet | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isExpanded && !snippet && !error) {
      fetchCode()
    }
  }, [isExpanded])

  const fetchCode = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchGitHubCode(githubUrl)

      if (result.success && result.data) {
        setSnippet(result.data)
      } else {
        setError(result.error || 'Failed to fetch code')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 border border-blue-500/30 rounded-lg overflow-hidden bg-blue-500/5">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-blue-400">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-blue-500/20">
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading code...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex items-start gap-2 py-4 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Failed to load code</p>
                    <p className="text-xs text-muted-foreground mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Code Display */}
              {snippet && (
                <div className="mt-4">
                  {/* File info */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Lines {snippet.startLine}-{snippet.endLine}
                    </span>
                    <a
                      href={snippet.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View full file
                    </a>
                  </div>

                  {/* Code block */}
                  <div className="relative rounded-lg overflow-hidden bg-gray-950 border border-gray-800">
                    <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
                      <code className="text-gray-300 font-mono">
                        {snippet.code.split('\n').map((line, i) => (
                          <div key={i} className="flex">
                            <span className="inline-block w-10 text-right text-gray-600 select-none mr-4">
                              {snippet.startLine + i}
                            </span>
                            <span>{line}</span>
                          </div>
                        ))}
                      </code>
                    </pre>
                  </div>

                  {/* Proof badge */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Verified code evidence - AI agents can verify this implementation</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
