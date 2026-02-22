'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getUserRepositories } from '../api/repository-actions'

export function DebugRepositoryInfo() {
  const [repos, setRepos] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleDebug() {
    setIsLoading(true)
    try {
      const result = await getUserRepositories()
      if (result.success && result.data) {
        const repoList = result.data.map(r => `${r.owner}/${r.repo}`).join('\n')
        setRepos(repoList)
      } else {
        setRepos(`Error: ${result.error}`)
      }
    } catch (error) {
      setRepos(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Debug: Repositories in Database</h3>
      <Button onClick={handleDebug} disabled={isLoading} size="sm">
        {isLoading ? 'Loading...' : 'Show Repositories'}
      </Button>
      {repos && (
        <pre className="mt-4 p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto">
          {repos}
        </pre>
      )}
      <p className="mt-4 text-sm text-muted-foreground">
        These are the exact repository paths stored in your database.
        They must match exactly with GitHub (case-sensitive).
      </p>
    </div>
  )
}
