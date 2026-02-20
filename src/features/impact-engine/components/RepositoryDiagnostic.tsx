'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { checkRepositories } from '../api/diagnostic-actions'
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Lock } from 'lucide-react'

interface RepoCheck {
  repository: string
  existsInDb: boolean
  githubStatus: 'success' | 'not_found' | 'unauthorized' | 'error'
  githubMessage?: string
  actualName?: string
  isPrivate?: boolean
  stars?: number
}

export function RepositoryDiagnostic() {
  const [results, setResults] = useState<RepoCheck[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runDiagnostic() {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await checkRepositories()

      if (response.success && response.data) {
        setResults(response.data)
      } else {
        setError(response.error || 'Failed to run diagnostic')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  function getStatusIcon(status: RepoCheck['githubStatus']) {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'not_found':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'unauthorized':
        return <Lock className="w-5 h-5 text-amber-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto glass-card p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground tracking-tight mb-1">
          Repository Diagnostic
        </h2>
        <p className="text-sm text-muted-foreground">
          Check if your repositories exist on GitHub and your token has access
        </p>
      </div>

      <Button
        onClick={runDiagnostic}
        disabled={isLoading}
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Checking...' : 'Run Diagnostic'}
      </Button>

      {error && (
        <div className="mt-6 p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {results && results.length === 0 && (
        <div className="mt-6 p-4 rounded-lg border border-border bg-muted/50">
          <p className="text-sm text-muted-foreground">
            No repositories found. Add some repositories first.
          </p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((result) => (
            <div
              key={result.repository}
              className="p-4 rounded-lg border border-border bg-background/50"
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(result.githubStatus)}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-medium text-foreground mb-1">
                    {result.repository}
                  </p>
                  {result.githubMessage && (
                    <p className="text-sm text-muted-foreground">
                      {result.githubMessage}
                    </p>
                  )}
                  {result.actualName && result.actualName !== result.repository && (
                    <p className="text-xs text-amber-400 mt-2">
                      ⚠️ Name mismatch: Database has "{result.repository}" but GitHub has "{result.actualName}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
            <h3 className="text-sm font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total:</span>{' '}
                <span className="font-medium">{results.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">✅ Success:</span>{' '}
                <span className="font-medium text-green-500">
                  {results.filter((r) => r.githubStatus === 'success').length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">❌ Not Found:</span>{' '}
                <span className="font-medium text-red-500">
                  {results.filter((r) => r.githubStatus === 'not_found').length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">🔒 Access Denied:</span>{' '}
                <span className="font-medium text-amber-500">
                  {results.filter((r) => r.githubStatus === 'unauthorized').length}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          {results.some((r) => r.githubStatus !== 'success') && (
            <div className="mt-4 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
              <h3 className="text-sm font-semibold text-blue-400 mb-2">What to do:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                {results.some((r) => r.githubStatus === 'not_found') && (
                  <li>• For "Not Found" repos: Check spelling, verify they exist on GitHub, or remove them</li>
                )}
                {results.some((r) => r.githubStatus === 'unauthorized') && (
                  <li>• For "Access Denied" repos: Make sure your token has `repo` scope for private repos</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
