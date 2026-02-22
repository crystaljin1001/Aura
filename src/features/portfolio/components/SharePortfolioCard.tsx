/**
 * Share Portfolio Card
 * Displays the user's portfolio URL with copy and visit buttons
 */

'use client'

import { useState } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SharePortfolioCardProps {
  userEmail: string
}

export function SharePortfolioCard({ userEmail }: SharePortfolioCardProps) {
  const [copied, setCopied] = useState(false)

  // Extract username from email (before @)
  const username = userEmail.split('@')[0]

  // Build portfolio URL (use window.location.origin for dynamic domain)
  const portfolioUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/u/${username}`
    : `/u/${username}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="mb-8 glass-card p-6 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <span>🔗</span>
            Your Portfolio Link
          </h3>
          <p className="text-sm text-muted-foreground mb-3 md:mb-0">
            Share this link with recruiters and on your resume
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Portfolio URL Display */}
          <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border">
            <code className="text-sm text-foreground">
              {portfolioUrl}
            </code>
          </div>

          {/* Copy Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>

          {/* Visit Button */}
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            asChild
          >
            <a href={`/u/${username}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Visit
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
