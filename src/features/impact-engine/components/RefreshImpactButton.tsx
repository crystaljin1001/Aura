'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { getImpactData } from '../api/actions'
import { getUserRepositories } from '../api/repository-actions'

export function RefreshImpactButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<string>('')

  async function handleRefresh() {
    startTransition(async () => {
      try {
        setStatus('Fetching repositories...')

        // Get all user repositories
        const reposResult = await getUserRepositories()
        if (!reposResult.success || !reposResult.data) {
          setStatus('❌ Failed to fetch repositories')
          setTimeout(() => setStatus(''), 3000)
          return
        }

        setStatus(`Calculating impact for ${reposResult.data.length} repositories...`)

        // Force refresh impact data (bypasses 24h cache)
        const impactResult = await getImpactData(reposResult.data, true)

        if (impactResult.success) {
          setStatus('✅ Impact data refreshed successfully!')
          setTimeout(() => {
            setStatus('')
            router.refresh()
          }, 1500)
        } else {
          setStatus(`❌ ${impactResult.error || 'Failed to refresh impact data'}`)
          setTimeout(() => setStatus(''), 3000)
        }
      } catch (error) {
        setStatus(`❌ ${error instanceof Error ? error.message : 'Failed to refresh'}`)
        setTimeout(() => setStatus(''), 3000)
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleRefresh}
        disabled={isPending}
        size="sm"
        variant="outline"
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
        {isPending ? 'Refreshing...' : 'Refresh Impact Data'}
      </Button>
      {status && (
        <span className="text-sm text-muted-foreground animate-in fade-in">
          {status}
        </span>
      )}
    </div>
  )
}
