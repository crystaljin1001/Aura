'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addRepository } from '../actions'

export function AddProjectCard() {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  if (!isAdding) {
    return (
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] p-6">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">Add New Project</h3>
          <p className="text-muted-foreground mb-6 text-center text-sm">
            Turn your GitHub repo into a portfolio piece
          </p>
          <Button
            size="lg"
            onClick={() => setIsAdding(true)}
            className="bg-green-600 hover:bg-green-700 h-12"
          >
            + Add GitHub Project
          </Button>
        </CardContent>
      </Card>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!repoUrl.trim()) {
      setError('Please enter a repository URL')
      return
    }

    startTransition(async () => {
      try {
        await addRepository(repoUrl)
        setSuccessMessage('Repository added! AI is analyzing...')
        setRepoUrl('')

        // Wait a moment to show success message, then close and refresh
        setTimeout(() => {
          setIsAdding(false)
          setSuccessMessage('')
          router.refresh()
        }, 1500)
      } catch (err) {
        // Provide specific error messages
        const message = err instanceof Error ? err.message : 'Failed to add repository'

        if (message.includes('already added')) {
          setError('This repository is already in your portfolio')
        } else if (message.includes('Maximum 10')) {
          setError('You\'ve reached the maximum of 10 repositories. Delete one to add more.')
        } else if (message.includes('Invalid')) {
          setError('Invalid repository URL. Use format: owner/repo or full GitHub URL')
        } else {
          setError(message)
        }
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Add GitHub Repository</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              AI will analyze your repository and suggest content automatically
            </p>
          </div>

          <div>
            <Input
              type="text"
              placeholder="owner/repo or https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isPending}
              className="mb-2"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {successMessage && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span className="animate-pulse">✓</span>
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? 'Adding...' : 'Add Project'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAdding(false)
                setRepoUrl('')
                setError('')
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
