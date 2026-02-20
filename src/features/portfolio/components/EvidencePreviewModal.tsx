'use client'

/**
 * Evidence Preview Modal
 *
 * Displays code snippets from GitHub with syntax highlighting
 * Used to preview evidence links inline without leaving the page
 */

import { useState, useEffect } from 'react'
import { X, ExternalLink, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { parseGitHubPermalink } from '@/lib/github/permalink-generator'

interface EvidencePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  githubUrl: string
  title?: string
}

interface CodeSnippet {
  code: string
  language: string
  filePath: string
  startLine: number
}

export function EvidencePreviewModal({
  isOpen,
  onClose,
  githubUrl,
  title = 'Code Evidence',
}: EvidencePreviewModalProps) {
  const [snippet, setSnippet] = useState<CodeSnippet | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && githubUrl) {
      fetchCodeSnippet()
    }
  }, [isOpen, githubUrl])

  async function fetchCodeSnippet() {
    setIsLoading(true)
    setError(null)

    try {
      // Parse the GitHub URL
      const parsed = parseGitHubPermalink(githubUrl)
      if (!parsed) {
        setError('Invalid GitHub URL')
        setIsLoading(false)
        return
      }

      const { owner, repo, branch, filePath, startLine } = parsed

      // Fetch raw file content from GitHub
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch || 'main'}/${filePath}`
      const response = await fetch(rawUrl)

      if (!response.ok) {
        setError('Failed to fetch code from GitHub')
        setIsLoading(false)
        return
      }

      const content = await response.text()
      const lines = content.split('\n')

      // Extract snippet with context (10 lines before and after)
      const contextLines = 10
      const start = Math.max(0, (startLine || 1) - 1 - contextLines)
      const end = Math.min(lines.length, (startLine || 1) + contextLines)
      const snippetLines = lines.slice(start, end)

      // Detect language from file extension
      const ext = filePath.split('.').pop() || ''
      const language = getLanguageFromExtension(ext)

      setSnippet({
        code: snippetLines.join('\n'),
        language,
        filePath,
        startLine: start + 1,
      })
    } catch (err) {
      console.error('Error fetching code snippet:', err)
      setError('Failed to load code snippet')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          {snippet && !isLoading && !error && (
            <div className="space-y-3">
              {/* File path header */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono">{snippet.filePath}</span>
                  <span className="text-xs">Line {snippet.startLine}</span>
                </div>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in GitHub
                </a>
              </div>

              {/* Code display with basic syntax highlighting */}
              <div className="relative">
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                  <code className={`language-${snippet.language} text-sm`}>
                    {snippet.code}
                  </code>
                </pre>
              </div>

              {/* Info footer */}
              <div className="text-xs text-muted-foreground text-center">
                Showing ~20 lines of context. Click "Open in GitHub" to see full file.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Get programming language from file extension
 */
function getLanguageFromExtension(ext: string): string {
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
    rb: 'ruby',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    md: 'markdown',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    css: 'css',
    scss: 'scss',
    html: 'html',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
  }

  return languageMap[ext.toLowerCase()] || 'text'
}
